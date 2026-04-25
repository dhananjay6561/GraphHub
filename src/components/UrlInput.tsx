"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

function parseGithubUrl(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim().replace(/\.git$/, "");

  // full URL: https://github.com/owner/repo[/anything]
  const urlMatch = trimmed.match(/github\.com\/([^/]+)\/([^/?\s]+)/);
  if (urlMatch) return { owner: urlMatch[1], repo: urlMatch[2] };

  // bare: owner/repo
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
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3 w-full max-w-xl">
      <input
        type="text"
        value={value}
        onChange={(e) => { setValue(e.target.value); setError(""); }}
        placeholder="https://github.com/owner/repo"
        className="w-full border border-slate-600 bg-slate-900 text-slate-100 px-4 py-2 rounded text-sm outline-none focus:border-indigo-500"
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button
        type="submit"
        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm"
      >
        Visualize
      </button>
    </form>
  );
}
