"use client";

import { useState, useEffect, useRef, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Clock, ArrowRight } from "lucide-react";
import { loadRecent, formatRelativeTime, type RecentRepo } from "@/lib/recent";

function parseGithubUrl(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim().replace(/\.git$/, "");
  const urlMatch = trimmed.match(/github\.com\/([^/]+)\/([^/?\s]+)/);
  if (urlMatch) return { owner: urlMatch[1], repo: urlMatch[2] };
  const bareMatch = trimmed.match(/^([^/\s]+)\/([^/\s]+)$/);
  if (bareMatch) return { owner: bareMatch[1], repo: bareMatch[2] };
  return null;
}

export function UrlInput() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<RecentRepo[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = value.trim()
    ? recent.filter((r) =>
        r.path.toLowerCase().includes(value.trim().toLowerCase())
      )
    : recent;

  const handleFocus = useCallback(() => {
    setRecent(loadRecent());
    setOpen(true);
    setActiveIdx(-1);
  }, []);

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setActiveIdx(-1);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  function navigate(path: string) {
    const parsed = parseGithubUrl(path);
    if (!parsed) return;
    setOpen(false);
    setActiveIdx(-1);
    router.push(`/${parsed.owner}/${parsed.repo}`);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const target =
      activeIdx >= 0 && filtered[activeIdx]
        ? filtered[activeIdx].path
        : value;
    const parsed = parseGithubUrl(target);
    if (!parsed) {
      setError("Enter a valid GitHub URL or owner/repo");
      return;
    }
    setError("");
    navigate(`${parsed.owner}/${parsed.repo}`);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIdx(-1);
    } else if (e.key === "Tab" && filtered.length > 0) {
      // Tab fills the top suggestion
      e.preventDefault();
      setValue(filtered[0].path);
      setActiveIdx(0);
    }
  }

  return (
    <div ref={containerRef} className="w-full flex flex-col gap-2 relative">
      <form onSubmit={handleSubmit} className="flex w-full" style={{ height: "48px" }}>
        <input
          ref={inputRef}
          type="url"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError("");
            setActiveIdx(-1);
            if (!open) setOpen(true);
          }}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder="https://github.com/owner/repo"
          className="flex-1 font-mono text-[16px] px-4 outline-none transition-colors duration-150 bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] border border-[var(--border)] focus:border-[var(--accent)] border-r-0 rounded-l-md h-full"
          aria-label="GitHub repository URL"
          aria-autocomplete="list"
          aria-expanded={open && filtered.length > 0}
          role="combobox"
        />
        <button
          type="submit"
          className="px-5 text-[13px] font-medium shrink-0 transition-colors duration-150 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg-primary)] border border-[var(--accent)] rounded-r-md h-full cursor-pointer"
        >
          Visualize
        </button>
      </form>

      {/* Recent searches dropdown */}
      {open && filtered.length > 0 && (
        <div
          className="absolute top-[52px] left-0 right-0 z-20 rounded-lg border overflow-hidden shadow-lg"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border)",
            boxShadow: "var(--shadow-lg)",
          }}
          role="listbox"
          aria-label="Recent repositories"
        >
          <div
            className="px-3 py-2 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <span
              className="text-[10px] font-semibold tracking-[0.08em]"
              style={{ color: "var(--text-tertiary)" }}
            >
              RECENT
            </span>
          </div>
          {filtered.map((item, i) => (
            <button
              key={item.path}
              role="option"
              aria-selected={i === activeIdx}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors duration-100 cursor-pointer"
              style={{
                background:
                  i === activeIdx
                    ? "var(--bg-tertiary)"
                    : "transparent",
              }}
              onMouseEnter={() => setActiveIdx(i)}
            >
              <Clock
                size={12}
                aria-hidden="true"
                style={{ color: "var(--text-tertiary)", flexShrink: 0 }}
              />
              <span
                className="flex-1 font-mono text-[13px] truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {item.path}
              </span>
              <span
                className="text-[11px] font-mono shrink-0"
                style={{ color: "var(--text-tertiary)" }}
              >
                {formatRelativeTime(item.visitedAt)}
              </span>
              <ArrowRight
                size={12}
                aria-hidden="true"
                style={{ color: "var(--text-tertiary)", flexShrink: 0 }}
              />
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="text-[12px] font-mono text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <p className="text-[12px] font-mono" style={{ color: "var(--text-tertiary)" }}>
        or just replace github.com → graphhub.dev in your browser
      </p>
    </div>
  );
}
