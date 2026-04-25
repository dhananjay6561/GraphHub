import type { ParsedFile, Language, ResolvedImport } from "@/types";
import { detectLanguage, tryResolve } from "@/lib/utils";
import { parseJavaScript } from "./javascript";
import { parsePython } from "./python";
import { parseGolang } from "./golang";

// ─── Single file ──────────────────────────────────────────────────────────────

export function parse(
  file: { path: string; content: string },
  knownPaths: Set<string>
): ParsedFile {
  const language: Language = detectLanguage(file.path) ?? "unknown";

  try {
    let raw: { importStrings: string[]; exports: string[]; functions: ParsedFile["functions"]; classes: ParsedFile["classes"] };

    if (language === "javascript" || language === "typescript") {
      raw = parseJavaScript(file.content);
    } else if (language === "python") {
      raw = parsePython(file.content);
    } else if (language === "go") {
      raw = parseGolang(file.content);
    } else {
      raw = { importStrings: [], exports: [], functions: [], classes: [] };
    }

    const imports: ResolvedImport[] = raw.importStrings.map((raw) => {
      const resolved = tryResolve(file.path, raw, knownPaths);
      return {
        raw,
        resolved,
        external: !raw.startsWith(".") || resolved === null,
      };
    });

    return {
      path: file.path,
      language,
      imports,
      exports: raw.exports,
      functions: raw.functions,
      classes: raw.classes,
    };
  } catch {
    // never throw — return partial
    return {
      path: file.path,
      language,
      imports: [],
      exports: [],
      functions: [],
      classes: [],
    };
  }
}

// ─── Batch ────────────────────────────────────────────────────────────────────

export function parseAll(
  files: { path: string; content: string }[]
): { parsed: ParsedFile[]; errors: { path: string; error: string }[] } {
  const knownPaths = new Set(files.map((f) => f.path));
  const parsed: ParsedFile[] = [];
  const errors: { path: string; error: string }[] = [];

  for (const file of files) {
    try {
      parsed.push(parse(file, knownPaths));
    } catch (err) {
      errors.push({
        path: file.path,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { parsed, errors };
}
