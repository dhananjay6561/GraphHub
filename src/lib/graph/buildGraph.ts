import type { ParsedFile, GraphNode, GraphEdge, GraphData } from "@/types";
import { topLevelFolder } from "@/lib/utils";

export function buildGraph(parsedFiles: ParsedFile[]): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>(); // dedupe key: source|target|type
  const clusters: Record<string, string[]> = {};
  const externalNodes = new Map<string, GraphNode>(); // pkg name → node

  // ── Folder nodes ──────────────────────────────────────────────────────────

  const folders = new Set(parsedFiles.map((f) => topLevelFolder(f.path)));
  for (const folder of folders) {
    const id = `folder:${folder}`;
    nodes.push({
      id,
      type: "folder",
      label: folder,
      path: folder,
      cluster: folder,
      connections: 0,
    });
    clusters[folder] = [];
  }

  // ── File + symbol nodes ───────────────────────────────────────────────────

  const fileIdMap = new Map<string, string>(); // path → nodeId

  for (const file of parsedFiles) {
    const cluster = topLevelFolder(file.path);
    const fileId = `file:${file.path}`;
    fileIdMap.set(file.path, fileId);

    nodes.push({
      id: fileId,
      type: "file",
      label: file.path.split("/").pop() ?? file.path,
      path: file.path,
      language: file.language,
      cluster,
      connections: 0,
    });

    clusters[cluster]?.push(fileId);

    // contains edges + symbol nodes
    for (const fn of file.functions) {
      const fnId = `fn:${file.path}:${fn.name}`;
      nodes.push({
        id: fnId,
        type: "function",
        label: fn.name,
        path: file.path,
        language: file.language,
        cluster,
        parentId: fileId,
        connections: 0,
      });
      addEdge(edges, edgeSet, fileId, fnId, "contains");
    }

    for (const cls of file.classes) {
      const clsId = `cls:${file.path}:${cls.name}`;
      nodes.push({
        id: clsId,
        type: "class",
        label: cls.name,
        path: file.path,
        language: file.language,
        cluster,
        parentId: fileId,
        connections: 0,
      });
      addEdge(edges, edgeSet, fileId, clsId, "contains");
    }
  }

  // Build a fast id→node map for O(1) connection increments
  const nodeById = new Map<string, GraphNode>(nodes.map((n) => [n.id, n]));

  // ── Import edges ──────────────────────────────────────────────────────────

  for (const file of parsedFiles) {
    const sourceId = fileIdMap.get(file.path);
    if (!sourceId) continue;

    for (const imp of file.imports) {
      if (imp.external) {
        // normalize package name (first segment, strip @ scope prefix quirk)
        const pkg = imp.raw.startsWith("@")
          ? imp.raw.split("/").slice(0, 2).join("/")
          : imp.raw.split("/")[0];

        if (!externalNodes.has(pkg)) {
          const extId = `external:${pkg}`;
          const extNode: GraphNode = {
            id: extId,
            type: "file",
            label: pkg,
            path: pkg,
            cluster: "external",
            connections: 0,
          };
          externalNodes.set(pkg, extNode);
          nodeById.set(extId, extNode);
        }

        const extId = `external:${pkg}`;
        addEdge(edges, edgeSet, sourceId, extId, "import", true);
        bump(nodeById, sourceId);
      } else if (imp.resolved) {
        const targetId = fileIdMap.get(imp.resolved);
        if (targetId) {
          addEdge(edges, edgeSet, sourceId, targetId, "import");
          bump(nodeById, sourceId);
          bump(nodeById, targetId);
        }
      }
    }
  }

  // add external folder node + all external file nodes
  if (externalNodes.size > 0) {
    nodes.push({
      id: "folder:external",
      type: "folder",
      label: "external",
      path: "external",
      cluster: "external",
      connections: 0,
    });
    clusters["external"] = [];
    for (const extNode of externalNodes.values()) {
      nodes.push(extNode);
      clusters["external"].push(extNode.id);
    }
  }

  return { nodes, edges, clusters };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function addEdge(
  edges: GraphEdge[],
  edgeSet: Set<string>,
  source: string,
  target: string,
  type: GraphEdge["type"],
  external?: boolean
) {
  const key = `${source}|${target}|${type}`;
  if (edgeSet.has(key)) return;
  edgeSet.add(key);
  edges.push({ source, target, type, ...(external ? { external } : {}) });
}

function bump(nodeById: Map<string, GraphNode>, id: string) {
  const node = nodeById.get(id);
  if (node) node.connections++;
}
