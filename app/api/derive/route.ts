import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

// IMPORTANT: use a relative import so this project builds even if path aliases
// are not picked up by the bundler in some Vercel configurations.
import { deriveAll } from '../../../lib/derive';

// Ensure this route runs in the Node.js runtime on Vercel (fs/path are Node-only).
export const runtime = 'nodejs';

function readFixture(): any {
  const p = path.join(process.cwd(), 'fixtures', 'raw_feature.json');
  const raw = fs.readFileSync(p, 'utf-8');
  return JSON.parse(raw);
}

function validateJSON2Shape(out: any): string[] {
  const problems: string[] = [];

  const must = [
    'rsl.level.short_name',
    'rsl.level.full_name',
    'rsl.level.definition',
    'rsl.fri.score',
    'rsl.cohort.percentile_0to1',
    'rsl.sri.score',
    'cff.pattern.primary_label',
    'cff.final_type.type_code',
    'rc.control_pattern',
    'rc.reliability_band',
    'rfs.recommended_roles_top3'
  ];

  const get = (obj: any, dotted: string) => dotted.split('.').reduce((a, k) => (a ? a[k] : undefined), obj);

  for (const p of must) {
    const v = get(out, p);
    if (v === undefined || v === null) problems.push(`Missing: ${p}`);
  }

  // Type checks (lightweight)
  const fri = get(out, 'rsl.fri.score');
  if (typeof fri !== 'number') problems.push('Type: rsl.fri.score should be number');

  const pct = get(out, 'rsl.cohort.percentile_0to1');
  if (typeof pct !== 'number') problems.push('Type: rsl.cohort.percentile_0to1 should be number');

  const roles = get(out, 'rfs.recommended_roles_top3');
  if (!Array.isArray(roles)) problems.push('Type: rfs.recommended_roles_top3 should be array');

  return problems;
}

export async function GET() {
  try {
    const input = readFixture();

    // Minimal opts so the harness can run without your full model/config set.
    // Replace these with your production values when ready.
    const out = deriveAll(input, {
      rcLogisticModel: { beta0: 0, betas: {}, z_clip: 8 },
      roleConfigs: [],
      // Minimal deterministic defaults so the harness always returns
      // the canonical 4 observed structural signals.
      activeSignalIds: ['S1', 'S2', 'S5', 'S14'],
      cohortFriList: [],
    } as any);

    const problems = validateJSON2Shape(out);

    return NextResponse.json({
      ok: problems.length === 0,
      generated_at_utc: new Date().toISOString(),
      problems,
      output: out,
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        generated_at_utc: new Date().toISOString(),
        problems: ['Exception thrown in /api/derive'],
        error: String(e?.stack ?? e?.message ?? e),
      },
      { status: 500 }
    );
  }
}
