import { Zap, Globe, Database } from "lucide-react";

const HINTS = [
  { Icon: Zap, label: "Zero setup", desc: "Paste a URL, get a graph instantly" },
  { Icon: Globe, label: "Any language", desc: "JS, TS, Python, Go, Java and more" },
  { Icon: Database, label: "No cap on size", desc: "Handles repos of any scale" },
] as const;

export function FeatureHints() {
  return (
    <div className="flex items-start w-full">
      {HINTS.map(({ Icon, label, desc }, i) => (
        <div
          key={label}
          className="flex flex-1 flex-col items-center gap-1.5 px-6 py-2 text-center"
          style={{
            borderLeft: i > 0 ? "1px solid var(--border)" : undefined,
          }}
        >
          <Icon size={16} style={{ color: "var(--text-tertiary)" }} />
          <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
            {label}
          </p>
          <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            {desc}
          </p>
        </div>
      ))}
    </div>
  );
}
