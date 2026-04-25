import "server-only";
import NodeCache from "node-cache";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface CacheStore {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T, ttlSeconds: number): void;
  del(key: string): void;
  has(key: string): boolean;
}

// ─── node-cache implementation ────────────────────────────────────────────────

// Cap at 500 entries to prevent unbounded memory growth.
// Each graph response for a large repo can be several MB — 500 entries puts
// a ceiling of roughly 500MB worst-case before keys get evicted.
const MAX_KEYS = 500;

class NodeCacheStore implements CacheStore {
  private store: NodeCache;

  constructor() {
    this.store = new NodeCache({ useClones: false, maxKeys: MAX_KEYS });
  }

  get<T>(key: string): T | undefined {
    return this.store.get<T>(key);
  }

  set<T>(key: string, value: T, ttlSeconds: number): void {
    this.store.set(key, value, ttlSeconds);
  }

  del(key: string): void {
    this.store.del(key);
  }

  has(key: string): boolean {
    return this.store.has(key);
  }
}

export const cache: CacheStore = new NodeCacheStore();

// ─── TTLs ────────────────────────────────────────────────────────────────────

export const TTL_TREE = 3_600;      // 1 hour
export const TTL_FILE = 86_400;     // 24 hours
export const TTL_PARSED = 86_400;
export const TTL_GRAPH = 86_400;

// ─── Key builders ─────────────────────────────────────────────────────────────
// Use \x00 as separator — never valid in a GitHub owner, repo name, SHA, or
// file path, so collisions between e.g. owner="a:b" and owner="a",repo="b"
// are impossible.

const SEP = "\x00";

export const treeKey = (owner: string, repo: string, sha: string) =>
  `tree${SEP}${owner}${SEP}${repo}${SEP}${sha}`;

export const fileKey = (owner: string, repo: string, sha: string, filePath: string) =>
  `file${SEP}${owner}${SEP}${repo}${SEP}${sha}${SEP}${filePath}`;

export const parsedKey = (owner: string, repo: string, sha: string) =>
  `parsed${SEP}${owner}${SEP}${repo}${SEP}${sha}`;

export const graphKey = (owner: string, repo: string, sha: string) =>
  `graph${SEP}${owner}${SEP}${repo}${SEP}${sha}`;
