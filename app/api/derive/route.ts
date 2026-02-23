import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

// IMPORTANT: use a relative import so this project builds even if path aliases
// are not picked up by the bundler in some Vercel configurations.
import { deriveAll } from '../../../lib/derive';

// Ensure this route runs in the Node.js runtime on Vercel (fs/path are Node-only).
export const runtime = 'nodejs';

const BUILD_TAG = 'NP-DERIVE-V2-FIXED9';

function readFixture(): any {
  const p = path.join(process.cwd(), 'fixtures', 'raw_feature.json');
  const raw = fs.readFileSync(p, 'utf-8');
  return JSON.parse(raw);
}

/**
 * API contract (JSON2-style):
 * Return ONLY the derived payload at the root:
 * { rsl, cff, rc, rfs }
 *
 * No wrapper fields (ok/build_tag/problems/output) are returned because that
 * changes the JSON structure and breaks downstream binding.
 */
export async function GET() {
  try {
    const input = readFixture();

    // Do NOT pass "minimal harness opts" here.
    // Passing empty configs (roleConfigs/cohort lists/model stubs) can suppress
    // real calculations and lead to zeroed outputs.
    const out = deriveAll(input as any);

    const res = NextResponse.json(out);
    // Keep build metadata in headers (optional, does not change JSON structure).
    res.headers.set('x-build-tag', BUILD_TAG);
    res.headers.set('x-generated-at-utc', new Date().toISOString());
    return res;
  } catch (e: any) {
    // Even on error, avoid wrapping in { ok, problems, output }.
    // Return a minimal error object so callers can detect failure.
    return NextResponse.json(
      { error: String(e?.message ?? e), stack: String(e?.stack ?? '') },
      { status: 500 }
    );
  }
}
