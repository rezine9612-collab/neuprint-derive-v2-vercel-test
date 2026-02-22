import { NextResponse } from 'next/server';

const BUILD_TAG = 'NP-DERIVE-V2-FIXED8';

export async function GET() {
  return NextResponse.json({ ok: true, service: 'neuprint-derive-v2-vercel-test', build_tag: BUILD_TAG });
}
