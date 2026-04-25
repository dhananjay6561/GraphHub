import { NextRequest, NextResponse } from "next/server";
import { getLatestSHA, getFileContentsBatch, getFileTree, GithubError } from "@/lib/github";
import { cache, graphKey, parsedKey, fileKey, treeKey, TTL_GRAPH, TTL_PARSED, TTL_FILE, TTL_TREE } from "@/lib/cache";
import { shouldIncludeFile } from "@/lib/utils";
import { parseAll } from "@/lib/parser";
import { buildGraph } from "@/lib/graph/buildGraph";
import { validateParams } from "@/lib/validate";
import type { GraphResponse, ParseResponse, ApiError } from "@/types";

type Params = { params: { owner: string; repo: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const { owner, repo } = params;
  const invalid = validateParams(owner, repo);
  if (invalid) return invalid;

  try {
    const sha = await getLatestSHA(owner, repo);
    const key = graphKey(owner, repo, sha);

    const cached = cache.get<GraphResponse>(key);
    if (cached) return NextResponse.json(cached);

    // reuse parsed cache if available
    let parsed: ParseResponse | undefined = cache.get<ParseResponse>(parsedKey(owner, repo, sha));

    if (!parsed) {
      // fetch tree
      let treeFiles: { path: string; size: number }[];
      const treeCached = cache.get<{ files: { path: string; size: number }[] }>(treeKey(owner, repo, sha));
      if (treeCached) {
        treeFiles = treeCached.files;
      } else {
        const rawItems = await getFileTree(owner, repo, sha);
        treeFiles = rawItems.filter(shouldIncludeFile);
        cache.set(treeKey(owner, repo, sha), { sha, files: treeFiles, totalFiles: rawItems.length, filteredCount: treeFiles.length }, TTL_TREE);
      }

      const paths = treeFiles.map((f) => f.path);

      const cachedFiles: { path: string; content: string }[] = [];
      const uncachedPaths: string[] = [];
      for (const p of paths) {
        const hit = cache.get<{ path: string; content: string }>(fileKey(owner, repo, sha, p));
        if (hit) cachedFiles.push(hit);
        else uncachedPaths.push(p);
      }

      const { files: fetched, failed } = await getFileContentsBatch(owner, repo, uncachedPaths, sha);
      for (const f of fetched) cache.set(fileKey(owner, repo, sha, f.path), f, TTL_FILE);

      const allFiles = [...cachedFiles, ...fetched];
      const { parsed: parsedFiles, errors } = parseAll(allFiles);

      const stats = {
        totalFiles: parsedFiles.length,
        totalFunctions: parsedFiles.reduce((n, f) => n + f.functions.length, 0),
        totalClasses: parsedFiles.reduce((n, f) => n + f.classes.length, 0),
        totalImports: parsedFiles.reduce((n, f) => n + f.imports.length, 0),
        languages: parsedFiles.reduce<Record<string, number>>((acc, f) => {
          acc[f.language] = (acc[f.language] ?? 0) + 1;
          return acc;
        }, {}),
      };

      parsed = {
        files: parsedFiles,
        parseErrors: [...errors, ...failed.map((p) => ({ path: p, error: "fetch_failed" }))],
        stats,
      };
      cache.set(parsedKey(owner, repo, sha), parsed, TTL_PARSED);
    }

    const graph = buildGraph(parsed.files);

    const response: GraphResponse = {
      graph,
      meta: {
        owner,
        repo,
        sha,
        nodeCount: graph.nodes.length,
        edgeCount: graph.edges.length,
        clusterCount: Object.keys(graph.clusters).length,
        cachedAt: new Date().toISOString(),
      },
    };

    cache.set(key, response, TTL_GRAPH);
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
