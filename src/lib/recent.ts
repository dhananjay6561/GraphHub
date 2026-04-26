const KEY = "graphhub:recent";
const MAX = 6;

export interface RecentRepo {
  path: string;     // "owner/repo"
  visitedAt: number;
}

export function loadRecent(): RecentRepo[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveRecent(ownerRepo: string): void {
  try {
    const next: RecentRepo[] = [
      { path: ownerRepo, visitedAt: Date.now() },
      ...loadRecent().filter((r) => r.path !== ownerRepo),
    ].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // localStorage may be unavailable (private browsing quota)
  }
}

export function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const sec  = Math.floor(diff / 1000);
  const min  = Math.floor(sec  / 60);
  const hr   = Math.floor(min  / 60);
  const day  = Math.floor(hr   / 24);
  if (sec  < 60)  return "just now";
  if (min  < 60)  return `${min}m ago`;
  if (hr   < 24)  return `${hr}h ago`;
  if (day  === 1) return "yesterday";
  return `${day}d ago`;
}
