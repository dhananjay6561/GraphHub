"use client";
import { useRouter } from "next/navigation";

const EXAMPLES = [
  { label: "vercel/next.js", path: "vercel/next.js" },
  { label: "facebook/react", path: "facebook/react" },
  { label: "torvalds/linux", path: "torvalds/linux" },
];

export function ExampleRepos() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center gap-3">
      <p
        className="text-[12px] font-mono"
        style={{ color: "var(--text-tertiary)" }}
      >
        Try an example
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.path}
            onClick={() => router.push(`/${ex.path}`)}
            className="px-[14px] py-[6px] text-[12px] font-mono rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-tertiary)] transition-colors duration-150 cursor-pointer"
          >
            {ex.label}
          </button>
        ))}
      </div>
    </div>
  );
}
