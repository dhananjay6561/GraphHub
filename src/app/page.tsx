import { UrlInput } from "@/components/UrlInput";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0F172A] px-4">
      {/* Background grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Glow blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/4 top-1/4 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-1/4 bottom-1/3 h-[300px] w-[300px] rounded-full bg-emerald-500/8 blur-[100px]"
      />

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-10 text-center">
        {/* Badge */}
        <div className="flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#22d3ee]" />
          Developer tool · Open source
        </div>

        {/* Heading */}
        <div className="space-y-4">
          <h1 className="font-mono-heading text-5xl font-bold tracking-tight text-white sm:text-6xl">
            Graph<span className="text-indigo-400">Hub</span>
          </h1>
          <p className="text-lg leading-relaxed text-slate-400 sm:text-xl">
            Replace{" "}
            <code className="rounded-md bg-slate-800 px-2 py-0.5 text-sm font-mono text-slate-300">
              github.com
            </code>{" "}
            with{" "}
            <code className="rounded-md bg-indigo-900/60 px-2 py-0.5 text-sm font-mono text-indigo-300">
              graphhub.dev
            </code>{" "}
            in any repo URL to instantly explore it as a knowledge graph.
          </p>
        </div>

        {/* URL Input */}
        <UrlInput />

        {/* Example links */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-slate-500 uppercase tracking-widest">try an example</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: "vercel/next.js", path: "vercel/next.js" },
              { label: "facebook/react", path: "facebook/react" },
              { label: "microsoft/vscode", path: "microsoft/vscode" },
            ].map((ex) => (
              <a
                key={ex.path}
                href={`/${ex.path}`}
                className="rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs text-slate-400 transition-colors duration-200 hover:border-indigo-500/50 hover:bg-indigo-900/30 hover:text-indigo-300 cursor-pointer"
              >
                {ex.label}
              </a>
            ))}
          </div>
        </div>

        {/* Feature grid */}
        <div className="mt-4 grid w-full grid-cols-3 gap-3">
          {[
            { icon: "⬡", label: "Force graph", desc: "D3 physics simulation" },
            { icon: "◈", label: "Multi-language", desc: "JS · TS · Python · Go" },
            { icon: "⬡", label: "SHA-cached", desc: "Instant on repeat visits" },
          ].map((f) => (
            <div
              key={f.label}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-left"
            >
              <span className="text-lg text-indigo-400 select-none" aria-hidden>{f.icon}</span>
              <p className="mt-2 text-xs font-semibold text-slate-200 font-mono-heading">{f.label}</p>
              <p className="mt-0.5 text-xs text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 left-0 right-0 text-center text-xs text-slate-600">
        graphhub.dev — open source
      </footer>
    </main>
  );
}
