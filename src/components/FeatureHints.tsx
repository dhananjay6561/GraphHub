import { Zap, Globe, Database } from "lucide-react";

const HINTS = [
  { Icon: Zap, label: "Zero setup", desc: "Paste a URL, get a graph instantly" },
  { Icon: Globe, label: "Any language", desc: "JS, TS, Python, Go, Java and more" },
  { Icon: Database, label: "No cap on size", desc: "Handles repos of any scale" },
] as const;

export function FeatureHints() {
  return (
    <div className="flex flex-col sm:flex-row w-full" style={{ borderColor: "var(--border)" }}>
      {HINTS.map(({ Icon, label, desc }, i) => (
        <div
          key={label}
          className={[
            "flex sm:flex-col flex-1 items-center gap-3 sm:gap-1.5",
            "px-4 sm:px-6 py-3 sm:py-2 text-left sm:text-center",
            i > 0 ? "border-t sm:border-t-0 sm:border-l" : "",
          ].join(" ")}
          style={{ borderColor: "var(--border)" }}
        >
          <Icon size={16} aria-hidden="true" className="shrink-0" style={{ color: "var(--text-tertiary)" }} />
          <div className="sm:text-center">
            <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>{label}</p>
            <p className="text-[12px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>{desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
