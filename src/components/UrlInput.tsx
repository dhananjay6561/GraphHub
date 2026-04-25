"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

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

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = parseGithubUrl(value);
    if (!parsed) {
      setError("Enter a valid GitHub URL or owner/repo");
      return;
    }
    setError("");
    router.push(`/${parsed.owner}/${parsed.repo}`);
  }

  return (
    <div className="w-full flex flex-col gap-2">
      <form onSubmit={handleSubmit} className="flex w-full" style={{ height: "44px" }}>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError("");
          }}
          placeholder="https://github.com/owner/repo"
          className="flex-1 font-mono text-[13px] px-4 outline-none transition-colors duration-150 bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] border border-[var(--border)] focus:border-[var(--accent)] border-r-0 rounded-l-md h-full"
        />
        <button
          type="submit"
          className="px-5 text-[13px] font-medium shrink-0 transition-colors duration-150 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg-primary)] border border-[var(--accent)] rounded-r-md h-full"
        >
          Visualize
        </button>
      </form>

      {error && (
        <p className="text-[12px] font-mono text-red-400">{error}</p>
      )}

      <p className="text-[12px] font-mono text-[var(--text-tertiary)]">
        or just replace github.com → graphhub.dev in your browser
      </p>
    </div>
  );
}
