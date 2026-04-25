import { NextRequest, NextResponse } from "next/server";
import { getLatestSHA, getFileTree, GithubError } from "@/lib/github";
import { cache, treeKey, TTL_TREE } from "@/lib/cache";
import { shouldIncludeFile } from "@/lib/utils";
import { validateParams } from "@/lib/validate";
import type { TreeResponse, ApiError } from "@/types";

type Params = { params: { owner: string; repo: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const { owner, repo } = params;
  const invalid = validateParams(owner, repo);
  if (invalid) return invalid;

  try {
    const sha = await getLatestSHA(owner, repo);
    const key = treeKey(owner, repo, sha);

    const cached = cache.get<TreeResponse>(key);
    if (cached) return NextResponse.json(cached);

    const rawItems = await getFileTree(owner, repo, sha);
    const files = rawItems.filter(shouldIncludeFile);

    const response: TreeResponse = {
      sha,
      files,
      totalFiles: rawItems.length,
      filteredCount: files.length,
    };

    cache.set(key, response, TTL_TREE);
    return NextResponse.json(response);
  } catch (err) {
    if (err instanceof GithubError) {
      const body: ApiError = { error: err.code, ...(err.retryAfter ? { retryAfter: err.retryAfter } : {}) };
      const status = err.code === "not_found" ? 404 : err.code === "rate_limited" ? 429 : 502;
      return NextResponse.json(body, { status });
    }
    console.error("[graphhub] /api/tree error", err);
    return NextResponse.json({ error: "internal" } satisfies ApiError, { status: 500 });
  }
}
