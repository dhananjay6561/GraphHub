"use client";
import { Search, ExternalLink, Settings } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProgressBar } from "@/components/ProgressBar";
import type { GraphStatus, GraphData } from "@/types";

interface Props {
  owner: string;
  repo: string;
  status: GraphStatus;
  graphData: GraphData | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function Topbar({
  owner,
  repo,
  status,
  graphData,
  searchQuery,
  onSearchChange,
}: Props) {
  const stats =
    graphData && status === "ready"
      ? { nodeCount: graphData.nodes.length, edgeCount: graphData.edges.length }
      : undefined;

  return (
    <header
      className="h-12 flex items-center gap-4 px-4 shrink-0 border-b"
      style={{ background: "var(--bg-primary)", borderColor: "var(--border)" }}
    >
      {/* Left — logo + repo */}
      <div className="flex items-center gap-3 shrink-0">
        <Logo size="sm" />
        <div className="w-px h-4 shrink-0" style={{ background: "var(--border)" }} />
        <div className="flex items-center gap-1">
          <span className="font-mono text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            {owner} /
          </span>
          <span className="font-mono text-[13px]" style={{ color: "var(--text-secondary)" }}>
            {repo}
          </span>
          <a
            href={`https://github.com/${owner}/${repo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors duration-150"
            aria-label="Open on GitHub"
          >
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Center — status */}
      <div className="flex-1 flex items-center justify-center">
        <ProgressBar status={status} stats={stats} />
      </div>

      {/* Right — search + controls */}
      <div className="flex items-center gap-2 shrink-0">
        <SearchInput value={searchQuery} onChange={onSearchChange} />
        <div className="w-px h-4 shrink-0" style={{ background: "var(--border)" }} />
        <ThemeToggle />
        <button
          className="flex items-center justify-center w-7 h-7 rounded-md transition-colors duration-150 hover:bg-[var(--bg-tertiary)]"
          style={{ color: "var(--text-tertiary)" }}
          aria-label="Settings"
        >
          <Settings size={14} />
        </button>
      </div>
    </header>
  );
}

function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (q: string) => void;
}) {
  return (
    <label
      className="flex items-center gap-2 px-2.5 h-7 border border-[var(--border)] rounded-md bg-[var(--bg-secondary)] transition-colors duration-150 focus-within:border-[var(--accent)]"
      style={{ width: "200px" }}
    >
      <Search size={12} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
      <input
        type="text"
        placeholder="Search nodes..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-[var(--text-tertiary)]"
        style={{ color: "var(--text-primary)" }}
      />
    </label>
  );
}
