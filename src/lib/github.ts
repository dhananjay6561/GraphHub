import "server-only";
import type { Language, RepoMeta, RawFile } from "@/types";
import { detectLanguage } from "./utils";

// ─── Error ────────────────────────────────────────────────────────────────────

export class GithubError extends Error {
  constructor(
    message: string,
    public code: "not_found" | "rate_limited" | "unreachable" | "unknown",
    public retryAfter?: number
  ) {
    super(message);
    this.name = "GithubError";
  }
}

// ─── Internals ────────────────────────────────────────────────────────────────

const BASE = "https://api.github.com";

function getTokens(): string[] {
  return [
    process.env.GITHUB_TOKEN,
    process.env.GITHUB_TOKEN_2,
  ].filter((t): t is string => typeof t === "string" && t.length > 0);
}

async function ghFetch(url: string): Promise<Response> {
  const tokens = getTokens();

  // Try each token in order, moving to the next on rate limit
  for (let i = 0; i < Math.max(tokens.length, 1); i++) {
    const token = tokens[i];
    const headers: HeadersInit = token
      ? { Authorization: `Bearer ${token}`, "User-Agent": "graphhub" }
      : { "User-Agent": "graphhub" };

    let res: Response;
    try {
      res = await fetch(url, { headers, next: { revalidate: 0 } });
    } catch {
      throw new GithubError("GitHub unreachable", "unreachable");
    }

    if (res.status === 404) throw new GithubError("Not found", "not_found");

    if (res.status === 403 || res.status === 429) {
      // Try the next token if available
      if (i < tokens.length - 1) continue;
      const reset = res.headers.get("x-ratelimit-reset");
      const retryAfter = reset
        ? Math.max(0, Number(reset) - Math.floor(Date.now() / 1000))
        : 60;
      throw new GithubError("Rate limited", "rate_limited", retryAfter);
    }

    if (!res.ok) throw new GithubError(`GitHub error ${res.status}`, "unknown");

    return res;
  }

  throw new GithubError("No tokens available", "unknown");
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getLatestSHA(owner: string, repo: string): Promise<string> {
  const res = await ghFetch(`${BASE}/repos/${owner}/${repo}/commits/HEAD`);
  const data = await res.json();
  const sha = typeof data?.sha === "string" ? data.sha : null;
  if (!sha) throw new GithubError("Could not resolve HEAD sha", "unknown");
  return sha;
}

export async function getRepoMeta(owner: string, repo: string): Promise<RepoMeta> {
  const [metaRes, shaRes] = await Promise.all([
    ghFetch(`${BASE}/repos/${owner}/${repo}`),
    ghFetch(`${BASE}/repos/${owner}/${repo}/commits/HEAD`),
  ]);
  const [meta, commit] = await Promise.all([metaRes.json(), shaRes.json()]);
  const sha = typeof commit?.sha === "string" ? commit.sha : null;
  if (!sha) throw new GithubError("Could not resolve HEAD sha", "unknown");
  return {
    sha,
    defaultBranch: meta.default_branch as string,
    stars: meta.stargazers_count as number,
    language: meta.language as string | null,
  };
}

export async function getFileTree(
  owner: string,
  repo: string,
  sha: string
): Promise<{ path: string; size: number }[]> {
  const res = await ghFetch(
    `${BASE}/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`
  );
  const data = await res.json();
  if (!Array.isArray(data?.tree)) {
    // truncated flag means tree exceeded GitHub's 100k-entry limit — partial result
    if (data?.truncated) {
      console.warn(`[graphhub] tree truncated for ${owner}/${repo}`);
    } else {
      throw new GithubError("Unexpected tree response from GitHub", "unknown");
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data.tree ?? []) as any[])
    .filter((item) => item?.type === "blob")
    .map((item) => ({ path: item.path as string, size: (item.size ?? 0) as number }));
}

// ─── GraphQL file fetching ────────────────────────────────────────────────────
// Uses the GraphQL API which has a separate 5000-point/hr quota from REST.
// Batches all files into a single query using field aliases — far more efficient
// than one REST request per file.

const GRAPHQL_URL = "https://api.github.com/graphql";
const GRAPHQL_BATCH = 80; // aliases per query, well within GitHub's complexity limit

async function ghGraphQL(query: string): Promise<unknown> {
  const tokens = getTokens();

  for (let i = 0; i < Math.max(tokens.length, 1); i++) {
    const token = tokens[i];
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "User-Agent": "graphhub",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    let res: Response;
    try {
      res = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ query }),
        next: { revalidate: 0 },
      });
    } catch {
      throw new GithubError("GitHub unreachable", "unreachable");
    }

    if (res.status === 403 || res.status === 429) {
      if (i < tokens.length - 1) continue;
      const reset = res.headers.get("x-ratelimit-reset");
      const retryAfter = reset
        ? Math.max(0, Number(reset) - Math.floor(Date.now() / 1000))
        : 60;
      throw new GithubError("Rate limited", "rate_limited", retryAfter);
    }

    if (!res.ok) throw new GithubError(`GitHub GraphQL error ${res.status}`, "unknown");

    const json = await res.json() as { data?: unknown; errors?: { type?: string; message: string }[] };

    if (json.errors?.length) {
      const first = json.errors[0];
      if (first.type === "RATE_LIMITED") {
        if (i < tokens.length - 1) continue;
        throw new GithubError("Rate limited", "rate_limited");
      }
      throw new GithubError(first.message, "unknown");
    }

    return json.data;
  }

  throw new GithubError("No tokens available", "unknown");
}

export async function getFileContentsBatch(
  owner: string,
  repo: string,
  paths: string[],
  sha: string
): Promise<{ files: RawFile[]; failed: string[]; rateLimited: boolean }> {
  const files: RawFile[] = [];
  const failed: string[] = [];

  for (let i = 0; i < paths.length; i += GRAPHQL_BATCH) {
    const batch = paths.slice(i, i + GRAPHQL_BATCH);

    // Build a query with one alias per file: f0, f1, ...
    const aliases = batch
      .map((p, idx) => {
        const expr = `${sha}:${p}`.replace(/\\/g, "/").replace(/"/g, '\\"');
        return `f${idx}: object(expression: "${expr}") { ... on Blob { text isBinary } }`;
      })
      .join("\n    ");

    const query = `{ repository(owner: "${owner}", name: "${repo}") { ${aliases} } }`;

    let data: Record<string, { text: string | null; isBinary: boolean } | null>;
    try {
      const result = await ghGraphQL(query) as { repository: Record<string, unknown> };
      data = result.repository as typeof data;
    } catch (err) {
      if (err instanceof GithubError && err.code === "rate_limited") {
        failed.push(...batch);
        return { files, failed, rateLimited: true };
      }
      // Non-rate-limit error — mark batch as failed and continue
      failed.push(...batch);
      continue;
    }

    batch.forEach((p, idx) => {
      const blob = data[`f${idx}`];
      if (!blob || blob.isBinary || blob.text == null) {
        failed.push(p);
      } else {
        files.push({ path: p, content: blob.text, language: detectLanguage(p) ?? "unknown" });
      }
    });
  }

  return { files, failed, rateLimited: false };
}
