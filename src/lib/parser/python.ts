import type { FunctionDef, ClassDef } from "@/types";

interface PyParseResult {
  importStrings: string[];
  exports: string[];
  functions: FunctionDef[];
  classes: ClassDef[];
}

export function parsePython(content: string): PyParseResult {
  const lines = content.split("\n");
  const importStrings: string[] = [];
  const functions: FunctionDef[] = [];
  const classes: ClassDef[] = [];

  let currentClass: ClassDef | null = null;
  let classIndent = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimStart();
    const lineNo = i + 1;
    const indent = line.length - trimmed.length;

    if (!trimmed || trimmed.startsWith("#")) continue;

    // ── imports ───────────────────────────────────────────────────────────────

    // import x.y.z
    const simpleImport = trimmed.match(/^import\s+([\w.]+)/);
    if (simpleImport) {
      importStrings.push(simpleImport[1]);
      continue;
    }

    // from x.y import a, b, c
    const fromImport = trimmed.match(/^from\s+([\w.]+)\s+import\s+/);
    if (fromImport) {
      importStrings.push(fromImport[1]);
      continue;
    }

    // ── class scope boundary ───────────────────────────────────────────────────

    if (currentClass !== null && indent <= classIndent && trimmed.length > 0) {
      currentClass = null;
      classIndent = -1;
    }

    // ── class definitions ─────────────────────────────────────────────────────

    const classDef = trimmed.match(/^class\s+(\w+)/);
    if (classDef) {
      currentClass = { name: classDef[1], line: lineNo, exported: false, methods: [] };
      classIndent = indent;
      classes.push(currentClass);
      continue;
    }

    // ── function / method definitions ─────────────────────────────────────────

    const fnDef = trimmed.match(/^(?:async\s+)?def\s+(\w+)\s*\(/);
    if (fnDef) {
      const name = fnDef[1];
      if (currentClass && indent > classIndent) {
        currentClass.methods.push(name);
      } else {
        functions.push({ name, line: lineNo, exported: false });
      }
      continue;
    }
  }

  // Python has no explicit exports — treat all top-level defs as exported
  const exports = [
    ...functions.map((f) => f.name),
    ...classes.map((c) => c.name),
  ];

  return { importStrings, exports, functions, classes };
}
