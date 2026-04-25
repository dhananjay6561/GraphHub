import { UrlInput } from "@/components/UrlInput";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-slate-950 px-4">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">GraphHub</h1>
        <p className="text-slate-400 text-sm">
          Replace <code className="text-indigo-400">github.com</code> with{" "}
          <code className="text-indigo-400">graphhub.dev</code> to explore any repo as a knowledge graph
        </p>
      </div>
      <UrlInput />
    </main>
  );
}
