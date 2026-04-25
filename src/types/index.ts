// ─── Parsers ─────────────────────────────────────────────────────────────────

export type Language =
  | "javascript"
  | "typescript"
  | "python"
  | "go"
  | "java"
  | "rust"
  | "cpp"
  | "c"
  | "csharp"
  | "ruby"
  | "php"
  | "unknown";

export interface ResolvedImport {
  raw: string;
  resolved: string | null;
  external: boolean;
}

export interface FunctionDef {
  name: string;
  line: number;
  exported: boolean;
}

export interface ClassDef {
  name: string;
  line: number;
  exported: boolean;
  methods: string[];
}

export interface ParsedFile {
  path: string;
  language: Language;
  imports: ResolvedImport[];
  exports: string[];
  functions: FunctionDef[];
  classes: ClassDef[];
}

// ─── Graph ───────────────────────────────────────────────────────────────────

export type NodeType = "folder" | "file" | "function" | "class";
export type EdgeType = "import" | "export" | "contains";

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  path: string;
  language?: Language;
  cluster: string;
  parentId?: string;
  connections: number;
  // added by d3 simulation
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: EdgeType;
  external?: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  clusters: Record<string, string[]>;
}

// ─── GitHub ──────────────────────────────────────────────────────────────────

export type GithubErrorCode =
  | "not_found"
  | "rate_limited"
  | "unreachable"
  | "unknown";

export interface RawFile {
  path: string;
  content: string;
  language: Language;
}

export interface RepoMeta {
  sha: string;
  defaultBranch: string;
  stars: number;
  language: string | null;
}

export interface TreeFile {
  path: string;
  size: number;
}

// ─── API responses ───────────────────────────────────────────────────────────

export interface TreeResponse {
  sha: string;
  files: TreeFile[];
  totalFiles: number;
  filteredCount: number;
}

export interface FilesResponse {
  files: RawFile[];
  failed: string[];
}

export interface ParseResponse {
  files: ParsedFile[];
  parseErrors: { path: string; error: string }[];
  stats: {
    totalFiles: number;
    totalFunctions: number;
    totalClasses: number;
    totalImports: number;
    languages: Record<string, number>;
  };
}

export interface GraphResponse {
  graph: GraphData;
  meta: {
    owner: string;
    repo: string;
    sha: string;
    nodeCount: number;
    edgeCount: number;
    clusterCount: number;
    cachedAt: string;
  };
}

export interface ApiError {
  error: GithubErrorCode | "parse_error" | "internal";
  message?: string;
  retryAfter?: number;
}

// ─── Client ──────────────────────────────────────────────────────────────────

export type GraphStatus =
  | "idle"
  | "loading"
  | "simulating"
  | "ready"
  | "error";
