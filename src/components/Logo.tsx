interface Props {
  size?: "sm" | "md";
}

export function Logo({ size = "md" }: Props) {
  const fontSize = size === "sm" ? "13px" : "15px";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <svg width="28" height="12" viewBox="0 0 28 12" fill="none" aria-hidden>
        <line x1="5" y1="6" x2="13" y2="6" stroke="var(--accent)" strokeWidth="1" />
        <line x1="15" y1="6" x2="22" y2="6" stroke="var(--accent)" strokeWidth="1" />
        <circle cx="5" cy="6" r="2.5" fill="var(--accent)" />
        <circle cx="14" cy="6" r="2" fill="var(--accent)" />
        <circle cx="23" cy="6" r="1.5" fill="var(--accent)" />
      </svg>
      <span style={{ fontSize, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>
        <span style={{ fontWeight: 400 }}>graph</span>
        <span style={{ fontWeight: 600 }}>hub</span>
      </span>
    </div>
  );
}
