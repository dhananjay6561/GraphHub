import { NextRequest, NextResponse } from "next/server";
import { getLatestSHA, GithubError } from "@/lib/github";
import { cache, graphKey, TTL_GRAPH } from "@/lib/cache";
import { buildGraph } from "@/lib/graph/buildGraph";
import { validateParams } from "@/lib/validate";
import { getParsedData } from "@/lib/pipeline";
import type { GraphResponse, ApiError } from "@/types";

type Params = { params: { owner: string; repo: string } };

// In-flight deduplication: concurrent cold-cache requests for the same repo
// share one Promise instead of each firing independent GitHub API calls.
const inFlight = new Map<string, Promise<GraphResponse>>();

export async function GET(_req: NextRequest, { params }: Params) {
  const { owner, repo } = params;
  const invalid = validateParams(owner, repo);
  if (invalid) return invalid;

  try {
    const sha = await getLatestSHA(owner, repo);
    const key = graphKey(owner, repo, sha);

    const cached = cache.get<GraphResponse>(key);
    if (cached) return NextResponse.json(cached);

    const flightKey = `${owner}/${repo}@${sha}`;
    let promise = inFlight.get(flightKey);

    if (!promise) {
      promise = buildResponse(owner, repo, sha, key).finally(() =>
        inFlight.delete(flightKey)
      );
      inFlight.set(flightKey, promise);
    }

    const response = await promise;
    return NextResponse.json(response);
  } catch (err) {
    if (err instanceof GithubError) {
      const body: ApiError = { error: err.code, ...(err.retryAfter ? { retryAfter: err.retryAfter } : {}) };
      const status = err.code === "not_found" ? 404 : err.code === "rate_limited" ? 429 : 502;
      return NextResponse.json(body, { status });
    }
    console.error("[graphhub] /api/graph error", err);
    return NextResponse.json({ error: "internal" } satisfies ApiError, { status: 500 });
  }
}

async function buildResponse(
  owner: string,
  repo: string,
  sha: string,
  cacheKey: string
): Promise<GraphResponse> {
  const parsed = await getParsedData(owner, repo, sha);
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

  cache.set(cacheKey, response, TTL_GRAPH);
  return response;
}
