"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft, Copy, Check } from "lucide-react";

// ─── Data ──────────────────────────────────────────────────────────────────

const BRAND_COLORS = [
  { name: "Accent", hex: "#8aab96", use: "Primary CTA, highlights, active states" },
  { name: "Accent Hover", hex: "#9bbaa6", use: "Hover state for accent elements" },
];

const NODE_COLORS = [
  { name: "Folder", hex: "#7c7c8a", use: "Directory / module nodes" },
  { name: "File", hex: "#8b9dc4", use: "Source file nodes" },
  { name: "Function", hex: "#8aab96", use: "Callable unit nodes" },
  { name: "Class", hex: "#c4a96e", use: "Object / struct definition nodes" },
  { name: "External", hex: "#8a7a9b", use: "Out-of-repo import nodes" },
];

const SURFACE_COLORS = [
  { name: "Surface 0", hex: "#fafaf9", use: "Page background (light)" },
  { name: "Surface 1", hex: "#f4f4f2", use: "Cards, sidebars (light)" },
  { name: "Surface 2", hex: "#eeede9", use: "Hover, selected states (light)" },
];

const SURFACE_DARK_COLORS = [
  { name: "Surface 0", hex: "#0c0c0e", use: "Page background (dark)" },
  { name: "Surface 1", hex: "#111114", use: "Cards, sidebars (dark)" },
  { name: "Surface 2", hex: "#18181c", use: "Hover, selected states (dark)" },
];

const TEXT_COLORS = [
  { name: "Text Primary", hex: "#1a1a18", use: "Headings, labels (light)" },
  { name: "Text Secondary", hex: "#6b6a65", use: "Body text, descriptions (light)" },
  { name: "Text Tertiary", hex: "#a09f9a", use: "Captions, placeholders (light)" },
];

const LOGO_USAGE_DOS = [
  "Use on light (#fafaf9) or dark (#0c0c0e) backgrounds",
  "Maintain clear space equal to the mark's height on all sides",
  "Use the full wordmark where space permits",
];

const LOGO_USAGE_DONTS = [
  "Don't recolor, rotate, or distort the mark",
  "Don't apply drop shadows or outer glows",
  "Don't place on busy or low-contrast backgrounds",
  "Don't use the wordmark below 100px wide",
];

// ─── Components ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[11px] font-semibold tracking-[0.1em] mb-6"
      style={{ color: "var(--text-tertiary)" }}
    >
      {children}
    </p>
  );
}

function Divider() {
  return <div className="h-px my-16" style={{ background: "var(--border)" }} />;
}

function ColorSwatch({ name, hex, use }: { name: string; hex: string; use: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(hex).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [hex]);

  return (
    <button
      onClick={copy}
      className="group flex flex-col rounded-lg overflow-hidden border text-left transition-all duration-150 hover:shadow-md cursor-pointer w-full"
      style={{ borderColor: "var(--border)" }}
      aria-label={`Copy ${name} color ${hex}`}
    >
      <div
        className="h-16 w-full flex items-end justify-end p-2 transition-opacity duration-150"
        style={{ background: hex }}
      >
        <span
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 w-6 h-6 rounded flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.25)" }}
        >
          {copied
            ? <Check size={12} color="#fff" />
            : <Copy size={12} color="#fff" />}
        </span>
      </div>
      <div className="px-3 py-2.5" style={{ background: "var(--bg-secondary)" }}>
        <p className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
          {name}
        </p>
        <p className="text-[12px] font-mono mt-0.5" style={{ color: "var(--text-tertiary)" }}>
          {copied ? "Copied!" : hex}
        </p>
        <p className="text-[11px] mt-1.5 leading-snug" style={{ color: "var(--text-tertiary)" }}>
          {use}
        </p>
      </div>
    </button>
  );
}

function ColorGroup({
  title,
  colors,
}: {
  title: string;
  colors: { name: string; hex: string; use: string }[];
}) {
  return (
    <div>
      <p className="text-[12px] font-medium mb-3" style={{ color: "var(--text-secondary)" }}>
        {title}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {colors.map((c) => (
          <ColorSwatch key={c.name + c.hex} {...c} />
        ))}
      </div>
    </div>
  );
}

function NodeDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block w-3 h-3 rounded-full shrink-0"
      style={{ background: color }}
    />
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function BrandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>

      {/* Header */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between border-b px-8 h-14 shrink-0"
        style={{ background: "var(--bg-primary)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[13px] transition-colors duration-150 hover:text-[var(--text-primary)]"
            style={{ color: "var(--text-tertiary)" }}
            aria-label="Back to home"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            graphhub
          </Link>
          <span className="text-[var(--border)]">/</span>
          <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
            brand
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* Content */}
      <main id="main" className="flex-1 w-full max-w-4xl mx-auto px-6 sm:px-8 py-16">

        {/* Hero */}
        <div className="mb-16">
          <Logo size="md" />
          <h1
            className="mt-8 font-semibold"
            style={{ fontSize: "36px", lineHeight: "1.15", color: "var(--text-primary)" }}
          >
            Brand Guidelines
          </h1>
          <p
            className="mt-4 max-w-lg"
            style={{ fontSize: "16px", lineHeight: "1.65", color: "var(--text-secondary)" }}
          >
            The visual language, color system, and usage rules for GraphHub.
            These guidelines keep the brand consistent across every surface.
          </p>
        </div>

        {/* The Mark */}
        <section aria-labelledby="section-mark">
          <SectionLabel><span id="section-mark">THE MARK</span></SectionLabel>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* Light surface */}
            <div
              className="rounded-xl border flex items-center justify-center p-10"
              style={{ background: "#fafaf9", borderColor: "#e2e0da" }}
            >
              <div style={{ "--accent": "#8aab96", "--text-primary": "#1a1a18" } as React.CSSProperties}>
                <Logo size="md" />
              </div>
            </div>
            {/* Dark surface */}
            <div
              className="rounded-xl flex items-center justify-center p-10"
              style={{ background: "#0c0c0e", border: "1px solid #24242a" }}
            >
              <div style={{ "--accent": "#8aab96", "--text-primary": "#f0efe9" } as React.CSSProperties}>
                <Logo size="md" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className="rounded-lg border p-5"
              style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
            >
              <p className="text-[12px] font-semibold mb-3" style={{ color: "var(--accent)" }}>
                DO
              </p>
              <ul className="flex flex-col gap-2">
                {LOGO_USAGE_DOS.map((d) => (
                  <li
                    key={d}
                    className="flex items-start gap-2 text-[13px] leading-snug"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span className="mt-0.5 shrink-0" style={{ color: "var(--accent)" }}>✓</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="rounded-lg border p-5"
              style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
            >
              <p className="text-[12px] font-semibold mb-3 text-red-500">
                DON&apos;T
              </p>
              <ul className="flex flex-col gap-2">
                {LOGO_USAGE_DONTS.map((d) => (
                  <li
                    key={d}
                    className="flex items-start gap-2 text-[13px] leading-snug"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span className="mt-0.5 shrink-0 text-red-400">✗</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <Divider />

        {/* Color System */}
        <section aria-labelledby="section-colors">
          <SectionLabel><span id="section-colors">COLOR SYSTEM</span></SectionLabel>
          <p
            className="text-[13px] mb-8 -mt-2"
            style={{ color: "var(--text-tertiary)" }}
          >
            Click any swatch to copy its hex value.
          </p>

          <div className="flex flex-col gap-10">
            <ColorGroup title="Brand" colors={BRAND_COLORS} />
            <ColorGroup title="Graph Nodes" colors={NODE_COLORS} />
            <ColorGroup title="Surfaces — Light" colors={SURFACE_COLORS} />
            <ColorGroup title="Surfaces — Dark" colors={SURFACE_DARK_COLORS} />
            <ColorGroup title="Text — Light" colors={TEXT_COLORS} />
          </div>
        </section>

        <Divider />

        {/* Typography */}
        <section aria-labelledby="section-type">
          <SectionLabel><span id="section-type">TYPOGRAPHY</span></SectionLabel>

          <div className="flex flex-col gap-8">
            {/* Geist Sans */}
            <div
              className="rounded-xl border p-8"
              style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
            >
              <p className="text-[11px] font-mono tracking-widest mb-6" style={{ color: "var(--text-tertiary)" }}>
                GEIST SANS — UI & HEADINGS
              </p>

              <p
                className="font-semibold mb-2"
                style={{ fontSize: "40px", lineHeight: "1.15", color: "var(--text-primary)" }}
              >
                Aa
              </p>
              <p
                className="mb-6"
                style={{ fontSize: "15px", lineHeight: "1.6", color: "var(--text-tertiary)" }}
              >
                ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                abcdefghijklmnopqrstuvwxyz · 0123456789
              </p>

              <div className="flex flex-col gap-4 border-t pt-6" style={{ borderColor: "var(--border)" }}>
                <div>
                  <span className="text-[11px] font-mono" style={{ color: "var(--text-tertiary)" }}>40px / semibold / lh 1.2</span>
                  <p className="font-semibold mt-1" style={{ fontSize: "40px", lineHeight: "1.2", color: "var(--text-primary)" }}>
                    Visualize any codebase
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-mono" style={{ color: "var(--text-tertiary)" }}>16px / regular / lh 1.65</span>
                  <p className="mt-1" style={{ fontSize: "16px", lineHeight: "1.65", color: "var(--text-secondary)" }}>
                    Replace github.com with graphhub.dev in any repo URL and explore its
                    codebase as a living, interactive knowledge graph.
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-mono" style={{ color: "var(--text-tertiary)" }}>12px / semibold / tracking 0.08em / uppercase</span>
                  <p
                    className="mt-1 font-semibold uppercase tracking-[0.08em]"
                    style={{ fontSize: "12px", color: "var(--text-tertiary)" }}
                  >
                    Node Types · Connections · Statistics
                  </p>
                </div>
              </div>
            </div>

            {/* Geist Mono */}
            <div
              className="rounded-xl border p-8"
              style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
            >
              <p className="text-[11px] font-mono tracking-widest mb-6" style={{ color: "var(--text-tertiary)" }}>
                GEIST MONO — CODE & LABELS
              </p>

              <p
                className="font-mono font-bold mb-2"
                style={{ fontSize: "40px", lineHeight: "1.15", color: "var(--text-primary)" }}
              >
                Aa
              </p>
              <p
                className="font-mono mb-6"
                style={{ fontSize: "14px", lineHeight: "1.6", color: "var(--text-tertiary)" }}
              >
                ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                abcdefghijklmnopqrstuvwxyz · 0123456789 · ./:;
              </p>

              <div className="flex flex-col gap-4 border-t pt-6" style={{ borderColor: "var(--border)" }}>
                <div>
                  <span className="text-[11px] font-mono" style={{ color: "var(--text-tertiary)" }}>16px / regular — URL input</span>
                  <p className="font-mono mt-1" style={{ fontSize: "16px", color: "var(--text-primary)" }}>
                    https://github.com/owner/repo
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-mono" style={{ color: "var(--text-tertiary)" }}>13px / regular — node labels</span>
                  <p className="font-mono mt-1" style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                    parseGithubUrl · buildGraph · createSimulation
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-mono" style={{ color: "var(--text-tertiary)" }}>12px / regular — stats</span>
                  <p className="font-mono mt-1" style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                    · 1,842 nodes · 3,219 edges
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Divider />

        {/* Graph Vocabulary */}
        <section aria-labelledby="section-graph">
          <SectionLabel><span id="section-graph">GRAPH VOCABULARY</span></SectionLabel>
          <p
            className="text-[13px] mb-8 -mt-2"
            style={{ color: "var(--text-tertiary)" }}
          >
            Every node type has a fixed color. Colors are consistent across light and dark mode.
          </p>

          <div
            className="rounded-xl border divide-y overflow-hidden"
            style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
          >
            {[
              { color: "#7c7c8a", type: "Folder", desc: "A directory or module. The largest structural unit in the graph." },
              { color: "#8b9dc4", type: "File", desc: "A source code file. Groups the functions and classes it defines." },
              { color: "#8aab96", type: "Function", desc: "Any callable unit — function, method, arrow function, or closure." },
              { color: "#c4a96e", type: "Class", desc: "An object blueprint, struct, or interface definition." },
              { color: "#8a7a9b", type: "External", desc: "An import that resolves outside the repository boundary." },
            ].map(({ color, type, desc }) => (
              <div
                key={type}
                className="flex items-start gap-4 px-5 py-4"
                style={{ borderColor: "var(--border)" }}
              >
                <NodeDot color={color} />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium" style={{ color: "var(--text-primary)" }}>
                    {type}
                  </p>
                  <p className="text-[13px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    {desc}
                  </p>
                </div>
                <span
                  className="font-mono text-[12px] shrink-0"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {color}
                </span>
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* Voice & Tone */}
        <section aria-labelledby="section-voice">
          <SectionLabel><span id="section-voice">VOICE & TONE</span></SectionLabel>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { trait: "Technical", note: "We write for developers. Precision matters more than simplicity." },
              { trait: "Minimal", note: "One clear sentence beats three vague ones. Cut until it bleeds." },
              { trait: "Honest", note: "We state what the tool does. No 10× claims, no hype." },
            ].map(({ trait, note }) => (
              <div
                key={trait}
                className="rounded-lg border p-5"
                style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
              >
                <p className="text-[15px] font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  {trait}
                </p>
                <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {note}
                </p>
              </div>
            ))}
          </div>

          <div
            className="rounded-xl border divide-y overflow-hidden"
            style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
          >
            {[
              { good: "Visualize any GitHub repo as an interactive graph", bad: "Unlock the power of your codebase with AI-driven insights" },
              { good: "Replace github.com → graphhub.dev", bad: "Get started in seconds with our revolutionary platform" },
              { good: "1,842 nodes · 3,219 edges", bad: "Thousands of connections discovered automatically!" },
            ].map(({ good, bad }) => (
              <div key={good} className="grid grid-cols-2 divide-x" style={{ borderColor: "var(--border)" }}>
                <div className="px-5 py-3.5 flex items-start gap-2">
                  <span className="text-[12px] mt-0.5 shrink-0" style={{ color: "var(--accent)" }}>✓</span>
                  <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>{good}</p>
                </div>
                <div className="px-5 py-3.5 flex items-start gap-2">
                  <span className="text-[12px] mt-0.5 shrink-0 text-red-400">✗</span>
                  <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>{bad}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer
        className="flex items-center justify-between border-t text-[12px] px-8 py-6"
        style={{ borderColor: "var(--border)", color: "var(--text-tertiary)" }}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>GraphHub</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
        <span>
          Made with{" "}
          <span style={{ color: "var(--accent)" }}>♥</span>
          {" "}by Dhananjay
        </span>
      </footer>
    </div>
  );
}
