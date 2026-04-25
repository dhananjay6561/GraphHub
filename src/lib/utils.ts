import type { Language } from "@/types";
import path from "path";

// ─── Constants ────────────────────────────────────────────────────────────────

export const MAX_FILE_BYTES = 500_000;

export const SUPPORTED_EXTENSIONS: Record<string, Language> = {
  ".js": "javascript",
  ".jsx": "javascript",
  ".ts": "typescript",
  ".tsx": "typescript",
  ".py": "python",
  ".go": "go",
  ".java": "java",
  ".rs": "rust",
  ".cpp": "cpp",
  ".c": "c",
  ".cs": "csharp",
  ".rb": "ruby",
  ".php": "php",
};

export const SKIP_PATH_FRAGMENTS = [
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "out",
  "coverage",
  "__pycache__",
  ".pytest_cache",
  "vendor",
];

const SKIP_FILENAME_PATTERNS = [
  /\.lock$/,
  /\.sum$/,
  /^go\.sum$/,
  /\.env/,
  /\.config\.js$/,
  /\.eslintrc/,
  /\.prettierrc/,
  // binaries / media
  /\.(png|jpg|jpeg|gif|svg|ico|webp|bmp|tiff)$/,
  /\.(woff|woff2|ttf|otf|eot)$/,
  /\.(mp4|mp3|wav|ogg|webm)$/,
  /\.(pdf|zip|tar|gz|rar|7z)$/,
  /\.(exe|dll|so|dylib|bin)$/,
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function detectLanguage(filePath: string): Language | null {
  const ext = path.extname(filePath).toLowerCase();
  return SUPPORTED_EXTENSIONS[ext] ?? null;
}

export function shouldIncludeFile({
  path: filePath,
  size,
}: {
  path: string;
  size: number;
}): boolean {
  if (size > MAX_FILE_BYTES) return false;

  const lower = filePath.toLowerCase();
  if (SKIP_PATH_FRAGMENTS.some((frag) => lower.includes(`/${frag}/`) || lower.startsWith(`${frag}/`)))
    return false;

  const filename = path.basename(filePath);
  if (SKIP_FILENAME_PATTERNS.some((re) => re.test(filename))) return false;

  if (detectLanguage(filePath) === null) return false;

  return true;
}

export function topLevelFolder(filePath: string): string {
  const parts = filePath.split("/");
  return parts.length > 1 ? parts[0] : "root";
}

// ─── Import resolution ───────────────────────────────────────────────────────

const RESOLVE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

export function tryResolve(
  importerPath: string,
  importString: string,
  knownPaths: Set<string>
): string | null {
  if (!importString.startsWith(".")) return null;

  const importerDir = path.dirname(importerPath);
  const base = path.join(importerDir, importString).replace(/\\/g, "/");

  // exact match (already has extension)
  if (knownPaths.has(base)) return base;

  // try adding extensions
  for (const ext of RESOLVE_EXTENSIONS) {
    const candidate = base + ext;
    if (knownPaths.has(candidate)) return candidate;
  }

  // try /index.*
  for (const ext of RESOLVE_EXTENSIONS) {
    const candidate = `${base}/index${ext}`;
    if (knownPaths.has(candidate)) return candidate;
  }

  return null;
}
