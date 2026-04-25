import { NextRequest, NextResponse } from "next/server";
import { getLatestSHA, getFileContentsBatch, getFileTree, GithubError } from "@/lib/github";
import { cache, parsedKey, fileKey, treeKey, TTL_PARSED, TTL_FILE, TTL_TREE } from "@/lib/cache";
import { shouldIncludeFile } from "@/lib/utils";
import { parseAll } from "@/lib/parser";
import type { ParseResponse, ApiError } from "@/types";

type Params = { params: { owner: string; repo: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const { owner, repo } = params;

  try {
    const sha = await getLatestSHA(owner, repo);
    const key = parsedKey(owner, repo, sha);

    const cached = cache.get<ParseResponse>(key);
    if (cached) return NextResponse.json(cached);

    // fetch tree (use cache if available)
    let files: { path: string; size: number }[];
    const treeCached = cache.get<{ files: { path: string; size: number }[] }>(treeKey(owner, repo, sha));
    if (treeCached) {
      files = treeCached.files;
    } else {
      const rawItems = await getFileTree(owner, repo, sha);
      files = rawItems.filter(shouldIncludeFile);
      cache.set(treeKey(owner, repo, sha), { sha, files, totalFiles: rawItems.length, filteredCount: files.length }, TTL_TREE);
    }

    const paths = files.map((f) => f.path);

    // split into cached vs uncached file contents
    const cachedFiles: { path: string; content: string }[] = [];
    const uncachedPaths: string[] = [];

    for (const p of paths) {
      const hit = cache.get<{ path: string; content: string }>(fileKey(owner, repo, sha, p));
      if (hit) {
        cachedFiles.push(hit);
      } else {
        uncachedPaths.push(p);
      }
    }

    const { files: fetched, failed } = await getFileContentsBatch(owner, repo, uncachedPaths, sha);
    for (const f of fetched) {
      cache.set(fileKey(owner, repo, sha, f.path), f, TTL_FILE);
    }

    const allFiles = [...cachedFiles, ...fetched];
    const { parsed, errors } = parseAll(allFiles);

    const stats = {
      totalFiles: parsed.length,
      totalFunctions: parsed.reduce((n, f) => n + f.functions.length, 0),
      totalClasses: parsed.reduce((n, f) => n + f.classes.length, 0),
      totalImports: parsed.reduce((n, f) => n + f.imports.length, 0),
      languages: parsed.reduce<Record<string, number>>((acc, f) => {
        acc[f.language] = (acc[f.language] ?? 0) + 1;
        return acc;
      }, {}),
    };

    const parseErrors = [
      ...errors,
      ...failed.map((p) => ({ path: p, error: "fetch_failed" })),
    ];

    const response: ParseResponse = { files: parsed, parseErrors, stats };
    cache.set(key, response, TTL_PARSED);
    return NextResponse.json(response);
  } catch (err) {
    if (err instanceof GithubError) {
      const body: ApiError = { error: err.code, ...(err.retryAfter ? { retryAfter: err.retryAfter } : {}) };
      const status = err.code === "not_found" ? 404 : err.code === "rate_limited" ? 429 : 502;
      return NextResponse.json(body, { status });
    }
    return NextResponse.json({ error: "internal", message: String(err) }, { status: 500 });
  }
}
