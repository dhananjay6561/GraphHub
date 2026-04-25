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

export async function getFileContent(
  owner: string,
  repo: string,
  filePath: string,
  sha?: string
): Promise<{ content: string; language: Language }> {
  const ref = sha ? `?ref=${sha}` : "";
  const res = await ghFetch(
    `${BASE}/repos/${owner}/${repo}/contents/${filePath}${ref}`
  );
  const data = await res.json();
  // GitHub returns null content + download_url for files >1MB
  if (!data?.content || typeof data.content !== "string") {
    throw new GithubError(`File too large or binary: ${filePath}`, "unknown");
  }
  const raw = Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf-8");
  return { content: raw, language: detectLanguage(filePath) ?? "unknown" };
}

const BATCH_SIZE = 10;

export async function getFileContentsBatch(
  owner: string,
  repo: string,
  paths: string[],
  sha: string
): Promise<{ files: RawFile[]; failed: string[]; rateLimited: boolean }> {
  const files: RawFile[] = [];
  const failed: string[] = [];
  let rateLimited = false;

  for (let i = 0; i < paths.length; i += BATCH_SIZE) {
    const batch = paths.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((p) => getFileContent(owner, repo, p, sha))
    );
    results.forEach((result, idx) => {
      if (result.status === "fulfilled") {
        files.push({ path: batch[idx], ...result.value });
      } else {
        failed.push(batch[idx]);
        if (
          result.reason instanceof GithubError &&
          result.reason.code === "rate_limited"
        ) {
          rateLimited = true;
        }
      }
    });

    // Stop batching immediately if we know we're rate-limited
    if (rateLimited) break;
  }

  return { files, failed, rateLimited };
}
