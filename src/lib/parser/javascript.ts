import type { FunctionDef, ClassDef } from "@/types";

interface JsParseResult {
  importStrings: string[];
  exports: string[];
  functions: FunctionDef[];
  classes: ClassDef[];
}

export function parseJavaScript(content: string): JsParseResult {
  const lines = content.split("\n");
  const importStrings: string[] = [];
  const exports: string[] = [];
  const functions: FunctionDef[] = [];
  const classes: ClassDef[] = [];

  // current class context for method tracking
  let currentClass: ClassDef | null = null;
  let classIndent = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimStart();
    const lineNo = i + 1;

    // ── imports ──────────────────────────────────────────────────────────────

    // import ... from '...'  /  import ... from "..."
    const esImport = line.match(/^\s*import\s+.*?from\s+['"]([^'"]+)['"]/);
    if (esImport) {
      importStrings.push(esImport[1]);
      continue;
    }

    // import('...')  — dynamic
    const dynImport = line.match(/import\(['"]([^'"]+)['"]\)/);
    if (dynImport) {
      importStrings.push(dynImport[1]);
    }

    // require('...')
    const req = line.match(/require\(['"]([^'"]+)['"]\)/);
    if (req) {
      importStrings.push(req[1]);
    }

    // ── exports + declarations ────────────────────────────────────────────────

    // export default function Name
    const expDefFn = trimmed.match(/^export\s+default\s+(?:async\s+)?function\s+(\w+)/);
    if (expDefFn) {
      exports.push(expDefFn[1]);
      functions.push({ name: expDefFn[1], line: lineNo, exported: true });
      continue;
    }

    // export function Name / export async function Name
    const expFn = trimmed.match(/^export\s+(?:async\s+)?function\s+(\w+)/);
    if (expFn) {
      exports.push(expFn[1]);
      functions.push({ name: expFn[1], line: lineNo, exported: true });
      continue;
    }

    // export const Name = () =>  /  export const Name = function
    const expConstFn = trimmed.match(
      /^export\s+const\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[\w]+)\s*=>/
    );
    if (expConstFn) {
      exports.push(expConstFn[1]);
      functions.push({ name: expConstFn[1], line: lineNo, exported: true });
      continue;
    }

    const expConstFnExpr = trimmed.match(
      /^export\s+const\s+(\w+)\s*=\s*(?:async\s+)?function/
    );
    if (expConstFnExpr) {
      exports.push(expConstFnExpr[1]);
      functions.push({ name: expConstFnExpr[1], line: lineNo, exported: true });
      continue;
    }

    // export class Name
    const expClass = trimmed.match(/^export\s+(?:default\s+)?class\s+(\w+)/);
    if (expClass) {
      currentClass = { name: expClass[1], line: lineNo, exported: true, methods: [] };
      classIndent = line.length - trimmed.length;
      classes.push(currentClass);
      exports.push(expClass[1]);
      continue;
    }

    // unexported class Name
    const bareClass = trimmed.match(/^class\s+(\w+)/);
    if (bareClass) {
      currentClass = { name: bareClass[1], line: lineNo, exported: false, methods: [] };
      classIndent = line.length - trimmed.length;
      classes.push(currentClass);
      continue;
    }

    // unexported function Name
    const bareFn = trimmed.match(/^(?:async\s+)?function\s+(\w+)/);
    if (bareFn) {
      functions.push({ name: bareFn[1], line: lineNo, exported: false });
      continue;
    }

    // const Name = () =>  /  const Name = function  (unexported)
    const constArrow = trimmed.match(
      /^const\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[\w]+)\s*=>/
    );
    if (constArrow) {
      functions.push({ name: constArrow[1], line: lineNo, exported: false });
      continue;
    }

    const constFnExpr = trimmed.match(
      /^const\s+(\w+)\s*=\s*(?:async\s+)?function/
    );
    if (constFnExpr) {
      functions.push({ name: constFnExpr[1], line: lineNo, exported: false });
      continue;
    }

    // method inside class
    if (currentClass) {
      const indent = line.length - trimmed.length;
      // left class scope if indent returns to class level
      if (trimmed.startsWith("}") && indent <= classIndent) {
        currentClass = null;
        continue;
      }
      const method = trimmed.match(/^(?:async\s+)?(?:static\s+)?(\w+)\s*\(/);
      if (
        method &&
        method[1] !== "if" &&
        method[1] !== "for" &&
        method[1] !== "while" &&
        method[1] !== "switch"
      ) {
        currentClass.methods.push(method[1]);
      }
    }
  }

  return { importStrings, exports, functions, classes };
}
