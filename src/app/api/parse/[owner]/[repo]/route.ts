import { NextRequest, NextResponse } from "next/server";
import { getLatestSHA, GithubError } from "@/lib/github";
import { validateParams } from "@/lib/validate";
import { getParsedData } from "@/lib/pipeline";
import type { ApiError } from "@/types";

type Params = { params: { owner: string; repo: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const { owner, repo } = params;
  const invalid = validateParams(owner, repo);
  if (invalid) return invalid;

  try {
    const sha = await getLatestSHA(owner, repo);
    const result = await getParsedData(owner, repo, sha);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof GithubError) {
      const body: ApiError = { error: err.code, ...(err.retryAfter ? { retryAfter: err.retryAfter } : {}) };
      const status = err.code === "not_found" ? 404 : err.code === "rate_limited" ? 429 : 502;
      return NextResponse.json(body, { status });
    }
    console.error("[graphhub] /api/parse error", err);
    return NextResponse.json({ error: "internal" } satisfies ApiError, { status: 500 });
  }
}
