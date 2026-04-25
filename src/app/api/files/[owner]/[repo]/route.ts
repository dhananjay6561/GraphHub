import { NextRequest, NextResponse } from "next/server";
import { getFileContentsBatch, GithubError } from "@/lib/github";
import { cache, fileKey, TTL_FILE } from "@/lib/cache";
import { validateParams } from "@/lib/validate";
import type { RawFile, FilesResponse, ApiError } from "@/types";

const MAX_PATHS = 2_000;

type Params = { params: { owner: string; repo: string } };

export async function POST(req: NextRequest, { params }: Params) {
  const { owner, repo } = params;
  const invalid = validateParams(owner, repo);
  if (invalid) return invalid;

  let body: { paths: string[]; sha: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "internal", message: "invalid json" }, { status: 400 });
  }

  const { paths, sha } = body;
  if (!Array.isArray(paths) || !sha || typeof sha !== "string") {
    return NextResponse.json({ error: "internal", message: "paths and sha required" }, { status: 400 });
  }
  if (paths.length > MAX_PATHS) {
    return NextResponse.json({ error: "internal", message: `too many paths (max ${MAX_PATHS})` }, { status: 400 });
  }
  // drop any non-string entries silently
  const safePaths = paths.filter((p): p is string => typeof p === "string");

  try {
    const cached: RawFile[] = [];
    const uncached: string[] = [];

    for (const p of safePaths) {
      const hit = cache.get<RawFile>(fileKey(owner, repo, sha, p));
      if (hit) {
        cached.push(hit);
      } else {
        uncached.push(p);
      }
    }

    const { files: fetched, failed } = await getFileContentsBatch(owner, repo, uncached, sha as string);

    for (const file of fetched) {
      cache.set(fileKey(owner, repo, sha, file.path), file, TTL_FILE);
    }

    const response: FilesResponse = {
      files: [...cached, ...fetched],
      failed,
    };

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
