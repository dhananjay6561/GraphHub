"use client";

import { useState, useMemo } from "react";
import type { GraphNode } from "@/types";

export function useSearch(nodes: GraphNode[]) {
  const [query, setQuery] = useState("");

  const matchingIds = useMemo<Set<string> | null>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return new Set(
      nodes
        .filter((n) => n.label.toLowerCase().includes(q) || n.path.toLowerCase().includes(q))
        .map((n) => n.id)
    );
  }, [query, nodes]);

  return { query, setQuery, matchingIds };
}
