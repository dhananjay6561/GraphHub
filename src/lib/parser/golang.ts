import type { FunctionDef, ClassDef } from "@/types";

interface GoParseResult {
  importStrings: string[];
  exports: string[];
  functions: FunctionDef[];
  classes: ClassDef[]; // type structs/interfaces
}

export function parseGolang(content: string): GoParseResult {
  const lines = content.split("\n");
  const importStrings: string[] = [];
  const functions: FunctionDef[] = [];
  const classes: ClassDef[] = [];

  let inImportBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const lineNo = i + 1;

    if (!trimmed || trimmed.startsWith("//")) continue;

    // ── imports ───────────────────────────────────────────────────────────────

    // single-line: import "pkg"
    const singleImport = trimmed.match(/^import\s+"([^"]+)"/);
    if (singleImport) {
      importStrings.push(singleImport[1]);
      continue;
    }

    // block: import (
    if (trimmed === "import (") {
      inImportBlock = true;
      continue;
    }
    if (inImportBlock) {
      if (trimmed === ")") {
        inImportBlock = false;
        continue;
      }
      // "pkg"  or  alias "pkg"
      const pkgMatch = trimmed.match(/"([^"]+)"/);
      if (pkgMatch) importStrings.push(pkgMatch[1]);
      continue;
    }

    // ── functions ─────────────────────────────────────────────────────────────

    // func Name(  or  func (recv Type) Name(
    const fnWithReceiver = trimmed.match(/^func\s+\([^)]+\)\s+(\w+)\s*\(/);
    if (fnWithReceiver) {
      const name = fnWithReceiver[1];
      const exported = name[0] === name[0].toUpperCase() && name[0] !== name[0].toLowerCase();
      functions.push({ name, line: lineNo, exported });
      continue;
    }

    const plainFn = trimmed.match(/^func\s+(\w+)\s*\(/);
    if (plainFn) {
      const name = plainFn[1];
      const exported = /^[A-Z]/.test(name);
      functions.push({ name, line: lineNo, exported });
      continue;
    }

    // ── types ─────────────────────────────────────────────────────────────────

    // type Name struct  /  type Name interface
    const typeDef = trimmed.match(/^type\s+(\w+)\s+(?:struct|interface)/);
    if (typeDef) {
      const name = typeDef[1];
      const exported = /^[A-Z]/.test(name);
      classes.push({ name, line: lineNo, exported, methods: [] });
      continue;
    }
  }

  const exports = [
    ...functions.filter((f) => f.exported).map((f) => f.name),
    ...classes.filter((c) => c.exported).map((c) => c.name),
  ];

  return { importStrings, exports, functions, classes };
}
