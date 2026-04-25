import "server-only";
import { getLatestSHA, getFileTree, getFileContentsBatch } from "./github";
import { cache, treeKey, fileKey, parsedKey, TTL_TREE, TTL_FILE, TTL_PARSED } from "./cache";
import { shouldIncludeFile } from "./utils";
import { parseAll } from "./parser";
import type { ParseResponse } from "@/types";

/**
 * Full tree → files → parse pipeline with cache at each layer.
 * Both /api/parse and /api/graph call this instead of duplicating the logic.
 */
export async function getParsedData(
  owner: string,
  repo: string,
  sha: string
): Promise<ParseResponse> {
  const key = parsedKey(owner, repo, sha);
  const cached = cache.get<ParseResponse>(key);
  if (cached) return cached;

  // ── Tree ──────────────────────────────────────────────────────────────────

  let treeFiles: { path: string; size: number }[];
  const treeCached = cache.get<{ files: { path: string; size: number }[] }>(
    treeKey(owner, repo, sha)
  );
  if (treeCached) {
    treeFiles = treeCached.files;
  } else {
    const rawItems = await getFileTree(owner, repo, sha);
    treeFiles = rawItems.filter(shouldIncludeFile);
    cache.set(
      treeKey(owner, repo, sha),
      { sha, files: treeFiles, totalFiles: rawItems.length, filteredCount: treeFiles.length },
      TTL_TREE
    );
  }

  // ── File contents ─────────────────────────────────────────────────────────

  const cachedFiles: { path: string; content: string }[] = [];
  const uncachedPaths: string[] = [];

  for (const f of treeFiles) {
    const hit = cache.get<{ path: string; content: string }>(
      fileKey(owner, repo, sha, f.path)
    );
    if (hit) cachedFiles.push(hit);
    else uncachedPaths.push(f.path);
  }

  const { files: fetched, failed } = await getFileContentsBatch(
    owner,
    repo,
    uncachedPaths,
    sha
  );
  for (const f of fetched) {
    cache.set(fileKey(owner, repo, sha, f.path), f, TTL_FILE);
  }

  // ── Parse ─────────────────────────────────────────────────────────────────

  const { parsed, errors } = parseAll([...cachedFiles, ...fetched]);

  const result: ParseResponse = {
    files: parsed,
    parseErrors: [
      ...errors,
      ...failed.map((p) => ({ path: p, error: "fetch_failed" })),
    ],
    stats: {
      totalFiles: parsed.length,
      totalFunctions: parsed.reduce((n, f) => n + f.functions.length, 0),
      totalClasses: parsed.reduce((n, f) => n + f.classes.length, 0),
      totalImports: parsed.reduce((n, f) => n + f.imports.length, 0),
      languages: parsed.reduce<Record<string, number>>((acc, f) => {
        acc[f.language] = (acc[f.language] ?? 0) + 1;
        return acc;
      }, {}),
    },
  };

  cache.set(key, result, TTL_PARSED);
  return result;
}
