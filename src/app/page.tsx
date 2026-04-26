import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UrlInput } from "@/components/UrlInput";
import { ExampleRepos } from "@/components/ExampleRepos";
import { FeatureHints } from "@/components/FeatureHints";

export default function Home() {
  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between border-b px-4 sm:px-8 h-14"
        style={{ background: "var(--bg-primary)", borderColor: "var(--border)" }}
      >
        <Logo />
        <div className="flex items-center gap-1">
          <a
            href="https://github.com/dhananjay6561/GraphHub"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-7 h-7 rounded-md transition-colors duration-150 hover:bg-[var(--bg-tertiary)]"
            style={{ color: "var(--text-secondary)" }}
            aria-label="View on GitHub"
          >
            {/* GitHub mark */}
            <svg height="14" width="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
          <ThemeToggle />
        </div>
      </header>

      {/* Main */}
      <main
        id="main"
        className="flex-1 flex items-start justify-center px-4 pt-12 sm:pt-20 md:pt-24"
      >
        <div className="w-full max-w-[680px] flex flex-col items-center text-center">
          {/* Eyebrow badge */}
          <div
            className="animate-fadeup inline-flex items-center rounded-full text-[12px] border"
            style={{
              animationDelay: "0ms",
              background: "var(--accent-subtle)",
              color: "var(--accent)",
              borderColor: "rgba(138, 171, 150, 0.3)",
              padding: "4px 12px",
            }}
          >
            Open source · Free forever
          </div>

          {/* Headline */}
          <h1
            className="animate-fadeup font-medium text-center text-[26px] sm:text-[34px] md:text-[40px] mt-5"
            style={{
              animationDelay: "60ms",
              lineHeight: "1.2",
              color: "var(--text-primary)",
              maxWidth: "560px",
            }}
          >
            Visualize any GitHub repo as an interactive knowledge graph
          </h1>

          {/* Subheadline */}
          <p
            className="animate-fadeup mt-4"
            style={{
              animationDelay: "120ms",
              fontSize: "15px",
              lineHeight: "1.7",
              color: "var(--text-secondary)",
              maxWidth: "480px",
            }}
          >
            Replace github.com with graphhub.dev in any repo URL and explore its
            codebase as a living, interactive graph.
          </p>

          {/* URL input */}
          <div
            className="animate-fadeup w-full"
            style={{ animationDelay: "180ms", marginTop: "40px" }}
          >
            <UrlInput />
          </div>

          {/* Examples */}
          <div
            className="animate-fadeup w-full"
            style={{ animationDelay: "240ms", marginTop: "32px" }}
          >
            <ExampleRepos />
          </div>

          {/* Feature hints */}
          <div
            className="animate-fadeup w-full"
            style={{ animationDelay: "320ms", marginTop: "64px" }}
          >
            <FeatureHints />
          </div>

          {/* Recruiter / Engineer CTA */}
          <div
            className="animate-fadeup w-full"
            style={{ animationDelay: "420ms", marginTop: "40px" }}
          >
            <Link
              href="/showcase"
              className="group flex items-center justify-between w-full rounded-xl border px-5 py-4 transition-all duration-150 hover:bg-[var(--bg-secondary)] hover:border-[var(--border-strong)]"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="text-left">
                <p className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
                  Recruiter or engineer? This one&apos;s for you.
                </p>
                <p className="text-[12px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                  Architecture, design decisions, tradeoffs, and everything behind the build
                </p>
              </div>
              <ArrowUpRight
                size={16}
                aria-hidden="true"
                className="shrink-0 ml-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                style={{ color: "var(--accent)" }}
              />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t text-[12px] px-4 sm:px-8 py-5"
        style={{ borderColor: "var(--border)", color: "var(--text-tertiary)" }}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>GraphHub</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/branding" className="transition-colors duration-150 hover:text-[var(--text-secondary)]">
            Brand
          </Link>
          <span>
            Made with <span style={{ color: "var(--accent)" }}>♥</span> by Dhananjay
          </span>
        </div>
      </footer>
    </div>
  );
}
