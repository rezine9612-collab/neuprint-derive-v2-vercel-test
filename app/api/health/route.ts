import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ ok: true, service: 'neuprint-derive-v2-vercel-test' });
}
