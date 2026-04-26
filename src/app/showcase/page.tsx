import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionAnchor({ id, label }: { id: string; label: string }) {
  return (
    <p
      id={id}
      className="text-[11px] font-semibold tracking-[0.1em] mb-5"
      style={{ color: "var(--text-tertiary)" }}
    >
      {label}
    </p>
  );
}

function Divider() {
  return <div className="h-px my-14 md:my-20" style={{ background: "var(--border)" }} />;
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[15px] leading-[1.75] space-y-4 max-w-2xl"
      style={{ color: "var(--text-secondary)" }}
    >
      {children}
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-[22px] md:text-[26px] font-semibold mb-5"
      style={{ color: "var(--text-primary)", lineHeight: "1.25" }}
    >
      {children}
    </h2>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code
      className="font-mono text-[13px] px-1.5 py-0.5 rounded"
      style={{
        background: "var(--bg-tertiary)",
        color: "var(--text-secondary)",
        border: "1px solid var(--border)",
      }}
    >
      {children}
    </code>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg border-l-2 px-5 py-4 my-6 text-[14px] leading-relaxed"
      style={{
        borderColor: "var(--accent)",
        background: "var(--accent-subtle)",
        color: "var(--text-secondary)",
      }}
    >
      {children}
    </div>
  );
}

function DiagramBlock({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl border overflow-x-auto my-6"
      style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
    >
      <pre
        className="font-mono text-[12px] md:text-[13px] leading-[1.8] p-5 md:p-6 whitespace-pre"
        style={{ color: "var(--text-secondary)" }}
      >
        {children}
      </pre>
    </div>
  );
}

function TradeoffCard({
  title,
  pros,
  cons,
  decision,
}: {
  title: string;
  pros: string[];
  cons: string[];
  decision: string;
}) {
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: "var(--border)" }}
    >
      <div
        className="px-5 py-3 border-b"
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
      >
        <p className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>
          {title}
        </p>
      </div>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="px-5 py-4">
          <p
            className="text-[11px] font-semibold tracking-[0.08em] mb-3"
            style={{ color: "var(--accent)" }}
          >
            CHOSE THIS
          </p>
          <ul className="space-y-1.5">
            {pros.map((p) => (
              <li
                key={p}
                className="flex items-start gap-2 text-[13px]"
                style={{ color: "var(--text-secondary)" }}
              >
                <span className="mt-0.5 shrink-0" style={{ color: "var(--accent)" }}>+</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="px-5 py-4">
          <p
            className="text-[11px] font-semibold tracking-[0.08em] mb-3"
            style={{ color: "var(--text-tertiary)" }}
          >
            ACCEPTED THIS COST
          </p>
          <ul className="space-y-1.5">
            {cons.map((c) => (
              <li
                key={c}
                className="flex items-start gap-2 text-[13px]"
                style={{ color: "var(--text-tertiary)" }}
              >
                <span className="mt-0.5 shrink-0">−</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div
        className="px-5 py-3 border-t"
        style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)" }}
      >
        <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
          <span style={{ color: "var(--text-secondary)" }}>Why: </span>
          {decision}
        </p>
      </div>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div
      className="rounded-xl border px-5 py-4 text-center"
      style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
    >
      <p
        className="text-[28px] font-semibold font-mono"
        style={{ color: "var(--text-primary)", lineHeight: "1" }}
      >
        {value}
      </p>
      <p className="text-[12px] mt-1.5" style={{ color: "var(--text-tertiary)" }}>
        {label}
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ShowcasePage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>

      {/* Header */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between border-b px-4 sm:px-8 h-14 shrink-0"
        style={{ background: "var(--bg-primary)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[13px] transition-colors duration-150 hover:text-[var(--text-primary)]"
            style={{ color: "var(--text-tertiary)" }}
          >
            <ArrowLeft size={14} aria-hidden="true" />
            graphhub
          </Link>
          <span style={{ color: "var(--border)" }}>/</span>
          <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
            engineering
          </span>
        </div>
        <ThemeToggle />
      </header>

      <main id="main" className="w-full max-w-3xl mx-auto px-4 sm:px-8 py-16 md:py-24">

        {/* Hero */}
        <div className="mb-16">
          <div
            className="inline-flex items-center rounded-full text-[12px] border mb-6 px-3 py-1"
            style={{
              background: "var(--accent-subtle)",
              color: "var(--accent)",
              borderColor: "rgba(138, 171, 150, 0.3)",
            }}
          >
            Engineering Case Study
          </div>
          <h1
            className="font-semibold mb-5"
            style={{ fontSize: "clamp(28px, 5vw, 40px)", lineHeight: "1.15", color: "var(--text-primary)" }}
          >
            How GraphHub was built
          </h1>
          <p
            className="text-[16px] leading-[1.7] max-w-xl"
            style={{ color: "var(--text-secondary)" }}
          >
            A walkthrough of the architecture, design decisions, and engineering tradeoffs behind
            an interactive codebase graph visualizer — from GitHub API to canvas pixels.
          </p>

          {/* Quick nav */}
          <div className="flex flex-wrap gap-2 mt-8">
            {[
              ["#problem", "The Problem"],
              ["#architecture", "Architecture"],
              ["#frontend", "Frontend"],
              ["#backend", "Backend"],
              ["#design", "Design System"],
              ["#tradeoffs", "Tradeoffs"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="text-[12px] px-3 py-1.5 rounded-full border transition-colors duration-150 hover:border-[var(--border-strong)] hover:bg-[var(--bg-secondary)]"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-16">
          <StatCard value="3" label="cache layers" />
          <StatCard value="4" label="parsed languages" />
          <StatCard value="60fps" label="canvas render" />
          <StatCard value="0ms" label="warm start" />
        </div>

        {/* ── The Problem ────────────────────────────────────────────────────── */}
        <section id="problem">
          <SectionAnchor id="problem-label" label="01 — THE PROBLEM" />
          <H2>Reading code is not the same as understanding it</H2>
          <Prose>
            <p>
              Every developer has opened an unfamiliar repo and spent the first hour clicking
              through folders trying to build a mental model of the structure. GitHub&apos;s file
              tree forces you to navigate linearly. Search requires you to already know what
              you&apos;re looking for. Neither gives you the shape of the codebase.
            </p>
            <p>
              GraphHub solves this by treating a repository as a graph problem. Folders, files,
              functions, and classes become nodes; imports and containment relationships become
              edges. The result is a living map you can explore rather than a hierarchy you
              navigate.
            </p>
            <p>
              The constraint we set ourselves: no setup, no tokens, no configuration. Paste a URL
              — or just swap <Mono>github.com</Mono> for <Mono>graphhub.dev</Mono> — and the
              graph appears within seconds.
            </p>
          </Prose>
        </section>

        <Divider />

        {/* ── Architecture ───────────────────────────────────────────────────── */}
        <section id="architecture">
          <SectionAnchor id="architecture-label" label="02 — ARCHITECTURE" />
          <H2>End-to-end in one request</H2>
          <Prose>
            <p>
              The entire pipeline — from GitHub API to rendered graph — is triggered by a single
              GET to <Mono>/api/graph/:owner/:repo</Mono>. The response is a serialised
              graph that the client can simulate and render without further API calls.
            </p>
          </Prose>

          <DiagramBlock>{`Browser
  │
  └─ GET /api/graph/:owner/:repo
       │
       ├─ getLatestSHA()        ← one GitHub API call to get commit SHA
       │    │
       │    └─ SHA unchanged?   ← check server cache (node-cache, 24hr TTL)
       │         └─ HIT  ──────────────────────────────────────→ return cached
       │         └─ MISS ↓
       │
       ├─ getFileTree()         ← GitHub Trees API (recursive)
       │    └─ filter to source files only (size < 500KB, known extension)
       │
       ├─ getFileContentsBatch()  ← parallel fetch, 10 at a time
       │    └─ per-file cache check (fileKey = sha + path, 24hr TTL)
       │
       ├─ parseAll()            ← AST-based extraction per language
       │    └─ imports, functions, classes, exports → ParsedFile[]
       │
       └─ buildGraph()          ← nodes + edges + cluster assignments
            │
            ├─ cache.set(graphKey, ..., 24hr)
            └─ return { graph, meta }`}</DiagramBlock>

          <Prose>
            <p>
              Three things keep this fast on repeat visits. The server cache is keyed by SHA,
              so it&apos;s safe to hold for 24 hours — the graph only changes when the repo
              changes. The HTTP response carries <Mono>Cache-Control: s-maxage=3600,
              stale-while-revalidate=86400</Mono>, so CDN and browser caches serve it without
              hitting the origin. And the client stores the graph in <Mono>localStorage</Mono>
              for 30 minutes, so navigating back to a repo you&apos;ve already visited is
              instantaneous — zero network, zero loading state.
            </p>
          </Prose>
        </section>

        <Divider />

        {/* ── Frontend ───────────────────────────────────────────────────────── */}
        <section id="frontend">
          <SectionAnchor id="frontend-label" label="03 — FRONTEND ENGINEERING" />
          <H2>Canvas, not DOM</H2>
          <Prose>
            <p>
              The graph renders to a <Mono>&lt;canvas&gt;</Mono> element, not SVG or DOM nodes.
              At 500+ nodes, DOM-based graph libraries start dropping frames because the
              browser is reconciling thousands of elements per tick. A canvas is a pixel buffer
              — drawing 2,000 circles and lines per frame takes roughly 2ms, well within the
              16ms frame budget for 60fps.
            </p>
            <p>
              The tradeoff is real: no native hover states, no CSS transitions, no devtools
              inspection of individual nodes. We compensate with a <Mono>d3-quadtree</Mono> for
              O(log n) hit-testing, manual highlight state tracked in refs, and keyboard
              navigation with <Mono>tabIndex=0</Mono> on the canvas element.
            </p>
          </Prose>

          <Callout>
            Progressive detail rendering: at zoom level <Mono>k &lt; 0.3</Mono>, only folder
            nodes render. At <Mono>k &lt; 0.7</Mono>, functions and classes are hidden. Labels
            appear only above <Mono>k = 0.6</Mono>. The user always sees a readable graph
            regardless of zoom level.
          </Callout>

          <Prose>
            <p>
              The render loop is a standard <Mono>requestAnimationFrame</Mono> tick. It reads
              node positions from the D3 simulation&apos;s mutable node array, runs the quadtree
              update, draws edges then nodes then labels (painter&apos;s algorithm), and
              schedules the next frame only if the simulation is still active. When the simulation
              cools (<Mono>alpha &lt; 0.001</Mono>), the loop stops entirely. Interaction
              events (hover, select, drag, zoom) call <Mono>requestRedraw()</Mono> which
              re-enters the loop for exactly one frame — the canvas only repaints when something
              changes.
            </p>
          </Prose>

          <h3
            className="text-[17px] font-semibold mt-10 mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Force simulation physics
          </h3>
          <Prose>
            <p>
              D3&apos;s force simulation runs in-process on the client. The physics are tuned
              per node type to produce a visual hierarchy that matches the code structure:
            </p>
          </Prose>

          <DiagramBlock>{`Node type    Charge      Collision radius   Role in layout
─────────────────────────────────────────────────────────
folder       −1,400      130px              Structural anchors
file         −800        42px               Cluster around folders
function     −500        32px               Dense fill within files
class        −500        32px               Same as function

Edge type    Distance    Strength
──────────────────────────────────────
contains     120px       0.45
import       180px       0.20`}</DiagramBlock>

          <Prose>
            <p>
              Folders carry a strong negative charge so they push each other to opposite ends
              of the canvas. Files are attracted to their parent folders via <Mono>contains</Mono>
              edges but repel each other enough to remain distinct. Functions and classes are
              lightly repelled — they cluster within their file&apos;s gravity well.
            </p>
            <p>
              A custom cluster force pulls file nodes toward the centroid of their cluster on
              every tick, reinforcing the grouping without hard constraints. Node dragging pins
              a node&apos;s <Mono>fx/fy</Mono> coordinates and reheats the simulation; releasing
              unpins and lets it settle.
            </p>
          </Prose>

          <h3
            className="text-[17px] font-semibold mt-10 mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Three-layer caching
          </h3>
          <DiagramBlock>{`Layer          Where        TTL        Miss cost
────────────────────────────────────────────────────────────
Client         localStorage  30 min     falls to layer 2
HTTP           CDN/browser   1 hr SWR   falls to layer 3
Server         node-cache    24 hr      re-runs full pipeline

server cache: max 500 entries, SHA-keyed (auto-invalidates on push)
in-flight dedup: concurrent cold-cache requests share one Promise`}</DiagramBlock>
        </section>

        <Divider />

        {/* ── Backend ────────────────────────────────────────────────────────── */}
        <section id="backend">
          <SectionAnchor id="backend-label" label="04 — BACKEND ENGINEERING" />
          <H2>Parsing without tokens</H2>
          <Prose>
            <p>
              The parsing pipeline extracts structure from source files without executing them
              or requiring a language server. For each file, a language-specific parser reads
              the raw text and produces a <Mono>ParsedFile</Mono> containing imports,
              functions, classes, and exports.
            </p>
            <p>
              We parse JavaScript, TypeScript, Python, and Go with reasonable accuracy across
              common patterns. The parser intentionally handles the 90% case well rather than
              attempting perfect coverage — edge cases like deeply dynamic imports or
              metaprogramming produce no nodes rather than wrong ones.
            </p>
          </Prose>

          <DiagramBlock>{`ParsedFile {
  path:      string
  language:  "javascript" | "typescript" | "python" | "go" | ...
  imports:   ResolvedImport[]   ← raw string + resolved path + external flag
  exports:   string[]
  functions: FunctionDef[]      ← name, line, exported flag
  classes:   ClassDef[]         ← name, line, methods[]
}`}</DiagramBlock>

          <Prose>
            <p>
              Import resolution is the most complex part. A relative import like{" "}
              <Mono>../../utils/parse</Mono> needs to resolve to an actual file path in the
              tree. We do this without a file system by normalising the path relative to the
              importing file, then checking whether a matching path exists in the tree
              (with and without extension). External imports (packages, not relative paths) get
              their own node type rather than resolving.
            </p>
          </Prose>

          <h3
            className="text-[17px] font-semibold mt-10 mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Rate limit handling
          </h3>
          <Prose>
            <p>
              The GitHub public API allows 60 unauthenticated requests per hour. Fetching a
              large repo can burn through this quickly. We handle it in two ways: the server
              cache means most requests never touch GitHub at all, and{" "}
              <Mono>getFileContentsBatch</Mono> sends files in parallel batches of 10,
              detecting <Mono>429</Mono> responses and surfacing a typed{" "}
              <Mono>rate_limited</Mono> error with a <Mono>retryAfter</Mono> timestamp rather
              than silently returning a partial graph.
            </p>
          </Prose>
        </section>

        <Divider />

        {/* ── Design ─────────────────────────────────────────────────────────── */}
        <section id="design">
          <SectionAnchor id="design-label" label="05 — DESIGN SYSTEM" />
          <H2>Decisions behind the visuals</H2>

          <h3
            className="text-[17px] font-semibold mb-3 mt-2"
            style={{ color: "var(--text-primary)" }}
          >
            Warm neutrals, not pure black
          </h3>
          <Prose>
            <p>
              Pure <Mono>#000000</Mono> backgrounds feel harsh on a developer tool used for
              hours at a time. We use <Mono>#0c0c0e</Mono> (dark) and <Mono>#fafaf9</Mono>{" "}
              (light) — fractionally warm grays that read like paper. The text and background
              values carry a very slight warm tint so they sit in the same colour temperature,
              preventing the eye-strain that comes from pure cool-on-warm contrast.
            </p>
          </Prose>

          <h3
            className="text-[17px] font-semibold mb-3 mt-8"
            style={{ color: "var(--text-primary)" }}
          >
            CSS custom properties, not Tailwind classes
          </h3>
          <Prose>
            <p>
              All colours are defined as CSS custom properties on <Mono>:root</Mono> and
              overridden on <Mono>.dark</Mono>. This means theme switching is one{" "}
              <Mono>classList.toggle</Mono> and a 200ms CSS transition — no JavaScript
              recalculation, no class name juggling per component. The graph canvas reads colour
              values at draw time via <Mono>getComputedStyle</Mono>, so it automatically
              inherits the active theme.
            </p>
            <p>
              An inline <Mono>&lt;script&gt;</Mono> in the document head reads{" "}
              <Mono>localStorage</Mono> and sets <Mono>.dark</Mono> before first paint,
              preventing the flash of wrong theme that most dark-mode implementations suffer from.
            </p>
          </Prose>

          <h3
            className="text-[17px] font-semibold mb-3 mt-8"
            style={{ color: "var(--text-primary)" }}
          >
            Graph node colours
          </h3>
          <Prose>
            <p>
              Each node type has a fixed colour chosen for three properties simultaneously:
              distinguishability from other node types, readability against both the light and
              dark backgrounds, and coherence with the warm neutral palette.
            </p>
          </Prose>

          <div
            className="rounded-xl border overflow-hidden my-6 divide-y"
            style={{ borderColor: "var(--border)" }}
          >
            {[
              { color: "#7c7c8a", dark: "#9696a6", type: "Folder", hex: "#7c7c8a / #9696a6", note: "Warm blue-gray. Anchors without competing with content." },
              { color: "#8b9dc4", dark: "#a2b8d8", type: "File", hex: "#8b9dc4 / #a2b8d8", note: "Desaturated blue. Readable at small radii." },
              { color: "#8aab96", dark: "#9ec4ae", type: "Function", hex: "#8aab96 / #9ec4ae", note: "Same hue as the brand accent. Functions are the primary unit." },
              { color: "#c4a96e", dark: "#d4bc82", type: "Class", hex: "#c4a96e / #d4bc82", note: "Warm amber. Distinct from the greens and blues." },
            ].map(({ color, type, hex, note }) => (
              <div
                key={type}
                className="flex items-center gap-4 px-5 py-3.5"
                style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: color }}
                />
                <span className="text-[13px] font-medium w-20 shrink-0" style={{ color: "var(--text-primary)" }}>
                  {type}
                </span>
                <span className="font-mono text-[11px] w-32 shrink-0" style={{ color: "var(--text-tertiary)" }}>
                  {hex}
                </span>
                <span className="text-[12px] hidden sm:block" style={{ color: "var(--text-tertiary)" }}>
                  {note}
                </span>
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* ── Tradeoffs ──────────────────────────────────────────────────────── */}
        <section id="tradeoffs">
          <SectionAnchor id="tradeoffs-label" label="06 — TRADEOFFS" />
          <H2>Every decision has a cost</H2>
          <Prose>
            <p>
              These were the four decisions with the highest impact. Each one was a genuine
              fork in the road with real costs on both sides.
            </p>
          </Prose>

          <div className="flex flex-col gap-4 mt-8">
            <TradeoffCard
              title="Canvas rendering over SVG"
              pros={[
                "Handles 10,000+ nodes at 60fps",
                "Single DOM element regardless of graph size",
                "Full control over render order and blending",
              ]}
              cons={[
                "No native accessibility (mitigated: ARIA + keyboard nav)",
                "No CSS hover states (mitigated: quadtree hit-testing)",
                "Harder to debug (no devtools element inspection)",
              ]}
              decision="SVG starts dropping frames above ~500 nodes. The canvas path is more complex to build but it's the only one that scales."
            />

            <TradeoffCard
              title="Client-side force simulation"
              pros={[
                "Node dragging and pinning work without a round-trip",
                "No need to serialise live simulation state",
                "Users can explore at their own pace after the graph loads",
              ]}
              cons={[
                "Cold start takes 2–5s for large repos while simulation settles",
                "Layout differs between visits (simulation is non-deterministic)",
              ]}
              decision="Server-side simulation would add significant API complexity and still require a client-side re-hydration pass. The localStorage cache eliminates the cold-start cost on warm visits."
            />

            <TradeoffCard
              title="In-process node-cache over Redis"
              pros={[
                "Zero network latency — reads are memory lookups",
                "No external dependency, no infrastructure cost",
                "500-key cap prevents unbounded memory growth",
              ]}
              cons={[
                "Lost on server restart or cold start",
                "Not shared between multiple instances",
              ]}
              decision="For this workload, restarts are infrequent. The HTTP Cache-Control layer covers cold starts via CDN. Adding Redis would be premature optimisation that complicates deployment."
            />

            <TradeoffCard
              title="SHA-keyed cache invalidation"
              pros={[
                "Cache is always correct — stale data is impossible by design",
                "Safe to cache aggressively (24hr server, 1hr HTTP, 30min client)",
                "No background refresh jobs needed",
              ]}
              cons={[
                "One GitHub API call per request to get the latest SHA",
                "Slight overhead (~40–80ms) even on full cache hits",
              ]}
              decision="The alternative — time-based expiry — would occasionally serve a graph that doesn't match the current repo state. Correctness is worth the extra round-trip."
            />
          </div>
        </section>

        <Divider />

        {/* ── What we cut ────────────────────────────────────────────────────── */}
        <section>
          <SectionAnchor id="cuts-label" label="07 — INTENTIONAL CUTS" />
          <H2>What we chose not to build</H2>
          <Prose>
            <p>
              Scope discipline is part of engineering. These features were considered and
              deliberately left out of v1:
            </p>
          </Prose>

          <div
            className="rounded-xl border divide-y mt-6 overflow-hidden"
            style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
          >
            {[
              {
                feature: "WebGL rendering",
                reason: "Canvas handles current scale comfortably. WebGL introduces shader complexity and a ~30KB runtime for no user-visible benefit at &lt;50k nodes.",
              },
              {
                feature: "Commit diff view",
                reason: "Showing structural changes across commits requires diffing two full graphs and a meaningful visual vocabulary for additions, removals, and moves.",
              },
              {
                feature: "Authentication / saved graphs",
                reason: "State storage adds session management, a database, and auth infrastructure. The URL is already the save state — shareable without a login.",
              },
              {
                feature: "Server-side layout",
                reason: "Pre-computing node positions on the server would require serialising simulation state and sending x/y for every node. Client-side simulation stays interactive.",
              },
              {
                feature: "Real-time collaboration",
                reason: "Multiplayer cursor presence and shared selection require WebSockets, conflict resolution, and a presence server. Not a v1 problem.",
              },
            ].map(({ feature, reason }) => (
              <div key={feature} className="px-5 py-4" style={{ borderColor: "var(--border)" }}>
                <p className="text-[14px] font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                  {feature}
                </p>
                <p
                  className="text-[13px] leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                  dangerouslySetInnerHTML={{ __html: reason }}
                />
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* ── Try it ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-[16px] font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              See it in action
            </p>
            <p className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
              Try it on any public GitHub repository.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-medium transition-colors duration-150"
              style={{
                background: "var(--accent)",
                color: "var(--bg-primary)",
              }}
            >
              Try GraphHub
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
            <Link
              href="/branding"
              className="text-[13px] px-4 py-2.5 rounded-lg border transition-colors duration-150 hover:bg-[var(--bg-secondary)]"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
            >
              Brand guidelines
            </Link>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer
        className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t text-[12px] px-4 sm:px-8 py-5 mt-8"
        style={{ borderColor: "var(--border)", color: "var(--text-tertiary)" }}
      >
        <div className="flex items-center gap-2">
          <Logo size="sm" />
          <span>© {new Date().getFullYear()}</span>
        </div>
        <span>
          Made with <span style={{ color: "var(--accent)" }}>♥</span> by Dhananjay
        </span>
      </footer>
    </div>
  );
}
