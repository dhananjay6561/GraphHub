import NodeCache from "node-cache";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface CacheStore {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T, ttlSeconds: number): void;
  del(key: string): void;
  has(key: string): boolean;
}

// ─── node-cache implementation ────────────────────────────────────────────────

class NodeCacheStore implements CacheStore {
  private store: NodeCache;

  constructor() {
    this.store = new NodeCache({ useClones: false });
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

export const treeKey = (owner: string, repo: string, sha: string) =>
  `tree:${owner}:${repo}:${sha}`;

export const fileKey = (owner: string, repo: string, sha: string, filePath: string) =>
  `file:${owner}:${repo}:${sha}:${filePath}`;

export const parsedKey = (owner: string, repo: string, sha: string) =>
  `parsed:${owner}:${repo}:${sha}`;

export const graphKey = (owner: string, repo: string, sha: string) =>
  `graph:${owner}:${repo}:${sha}`;
