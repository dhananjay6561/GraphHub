import "server-only";
import { NextResponse } from "next/server";

// GitHub owner and repo names: alphanumeric, hyphens, underscores, dots.
// Max 100 chars each. Rejects path traversal, colons, slashes, etc.
const SAFE_SEGMENT = /^[A-Za-z0-9_.\-]{1,100}$/;

export function validateParams(
  owner: string,
  repo: string
): NextResponse | null {
  if (!SAFE_SEGMENT.test(owner) || !SAFE_SEGMENT.test(repo)) {
    return NextResponse.json(
      { error: "internal", message: "invalid owner or repo name" },
      { status: 400 }
    );
  }
  return null;
}
