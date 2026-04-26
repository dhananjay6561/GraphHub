"use client";
import { Search, ExternalLink, Menu } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProgressBar } from "@/components/ProgressBar";
import type { GraphStatus, GraphData } from "@/types";
import React from "react";

interface Props {
  owner: string;
  repo: string;
  status: GraphStatus;
  graphData: GraphData | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchRef?: React.Ref<HTMLInputElement>;
  onMenuClick?: () => void;
}

export function Topbar({
  owner,
  repo,
  status,
  graphData,
  searchQuery,
  onSearchChange,
  searchRef,
  onMenuClick,
}: Props) {
  const stats =
    graphData && status === "ready"
      ? { nodeCount: graphData.nodes.length, edgeCount: graphData.edges.length }
      : undefined;

  return (
    <header
      className="h-12 flex items-center gap-2 sm:gap-4 px-3 sm:px-4 shrink-0 border-b"
      style={{ background: "var(--bg-primary)", borderColor: "var(--border)" }}
    >
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="md:hidden flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-150 hover:bg-[var(--bg-tertiary)] cursor-pointer shrink-0"
        style={{ color: "var(--text-secondary)" }}
        aria-label="Open sidebar"
      >
        <Menu size={16} />
      </button>

      {/* Left — logo + repo */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
        <Logo size="sm" />
        <div className="hidden sm:block w-px h-4 shrink-0" style={{ background: "var(--border)" }} />
        <div className="flex items-center gap-1 min-w-0">
          <span className="hidden sm:inline font-mono text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            {owner} /
          </span>
          <span className="font-mono text-[13px] truncate max-w-[120px] sm:max-w-none" style={{ color: "var(--text-secondary)" }}>
            {repo}
          </span>
          <a
            href={`https://github.com/${owner}/${repo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 shrink-0 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors duration-150"
            aria-label="Open on GitHub"
          >
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Center — status */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <ProgressBar status={status} stats={stats} />
      </div>

      {/* Right — search + controls */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden md:flex">
          <SearchInput value={searchQuery} onChange={onSearchChange} inputRef={searchRef} />
        </div>
        <div className="hidden md:block w-px h-4 shrink-0" style={{ background: "var(--border)" }} />
        <ThemeToggle />
      </div>
    </header>
  );
}

function SearchInput({
  value,
  onChange,
  inputRef,
}: {
  value: string;
  onChange: (q: string) => void;
  inputRef?: React.Ref<HTMLInputElement>;
}) {
  return (
    <label
      className="flex items-center gap-2 px-2.5 h-8 border border-[var(--border)] rounded-md bg-[var(--bg-secondary)] transition-colors duration-150 focus-within:border-[var(--accent)] cursor-text"
      style={{ width: "200px" }}
    >
      <Search size={12} aria-hidden="true" style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
      <input
        ref={inputRef}
        type="text"
        placeholder="Search nodes… ⌘K"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-[var(--text-tertiary)]"
        style={{ color: "var(--text-primary)" }}
        aria-label="Search graph nodes"
      />
    </label>
  );
}
