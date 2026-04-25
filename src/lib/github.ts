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

function authHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return token
    ? { Authorization: `Bearer ${token}`, "User-Agent": "graphhub" }
    : { "User-Agent": "graphhub" };
}

async function ghFetch(url: string): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(url, { headers: authHeaders(), next: { revalidate: 0 } });
  } catch {
    throw new GithubError("GitHub unreachable", "unreachable");
  }

  if (res.status === 404)
    throw new GithubError("Not found", "not_found");

  if (res.status === 403 || res.status === 429) {
    const reset = res.headers.get("x-ratelimit-reset");
    const retryAfter = reset
      ? Math.max(0, Number(reset) - Math.floor(Date.now() / 1000))
      : 60;
    throw new GithubError("Rate limited", "rate_limited", retryAfter);
  }

  if (!res.ok)
    throw new GithubError(`GitHub error ${res.status}`, "unknown");

  return res;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getLatestSHA(owner: string, repo: string): Promise<string> {
  const res = await ghFetch(`${BASE}/repos/${owner}/${repo}/commits/HEAD`);
  const data = await res.json();
  return data.sha as string;
}

export async function getRepoMeta(owner: string, repo: string): Promise<RepoMeta> {
  const [metaRes, shaRes] = await Promise.all([
    ghFetch(`${BASE}/repos/${owner}/${repo}`),
    ghFetch(`${BASE}/repos/${owner}/${repo}/commits/HEAD`),
  ]);
  const [meta, commit] = await Promise.all([metaRes.json(), shaRes.json()]);
  return {
    sha: commit.sha as string,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data.tree as any[])
    .filter((item) => item.type === "blob")
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
  const raw = Buffer.from(data.content as string, "base64").toString("utf-8");
  return { content: raw, language: detectLanguage(filePath) ?? "unknown" };
}

const BATCH_SIZE = 10;

export async function getFileContentsBatch(
  owner: string,
  repo: string,
  paths: string[],
  sha: string
): Promise<{ files: RawFile[]; failed: string[] }> {
  const files: RawFile[] = [];
  const failed: string[] = [];

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
      }
    });
  }

  return { files, failed };
}
