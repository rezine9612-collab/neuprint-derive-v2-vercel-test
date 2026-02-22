'use client';

import { useMemo, useState } from 'react';

type ApiResult = {
  ok: boolean;
  generated_at_utc?: string;
  problems?: string[];
  output?: any;
  error?: string;
};

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<ApiResult | null>(null);

  const pretty = useMemo(() => {
    if (!res) return '';
    return JSON.stringify(res, null, 2);
  }, [res]);

  async function run() {
    setLoading(true);
    setRes(null);
    try {
      const r = await fetch('/api/derive', { cache: 'no-store' });
      const j = (await r.json()) as ApiResult;
      setRes(j);
    } catch (e: any) {
      setRes({ ok: false, error: String(e?.message ?? e) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 980, margin: '0 auto', padding: 24 }}>
      <h1 style={{ margin: '8px 0 12px', fontSize: 24 }}>NeuPrint DERIVE V2, Vercel Test Harness</h1>
      <p style={{ margin: 0, lineHeight: 1.5, opacity: 0.85 }}>
        This app runs <code>lib/derive.ts</code> server-side using a fixed fixture at <code>fixtures/raw_feature.json</code>,
        then returns JSON2-style output plus a simple validation report.
      </p>

      <div style={{ display: 'flex', gap: 12, marginTop: 16, alignItems: 'center' }}>
        <button
          onClick={run}
          disabled={loading}
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            border: '1px solid #ddd',
            background: loading ? '#f4f4f4' : '#fff',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
          }}
        >
          {loading ? 'Running…' : 'Run DERIVE'}
        </button>
        <a
          href="/api/health"
          style={{ textDecoration: 'none', padding: '10px 12px', borderRadius: 10, border: '1px solid #ddd' }}
        >
          Health
        </a>
      </div>

      {res && (
        <section style={{ marginTop: 18 }}>
          <div style={{
            padding: 12,
            borderRadius: 12,
            border: '1px solid #e5e5e5',
            background: res.ok ? '#fbfffb' : '#fff7f7'
          }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>
              Status: {res.ok ? 'OK' : 'FAIL'}
            </div>
            {res.generated_at_utc && (
              <div style={{ opacity: 0.8 }}>generated_at_utc: {res.generated_at_utc}</div>
            )}
            {Array.isArray(res.problems) && res.problems.length > 0 && (
              <ul style={{ margin: '10px 0 0', paddingLeft: 18 }}>
                {res.problems.map((p, i) => (
                  <li key={i} style={{ margin: '4px 0' }}>{p}</li>
                ))}
              </ul>
            )}
            {res.error && (
              <div style={{ marginTop: 8, color: '#b00020' }}>{res.error}</div>
            )}
          </div>

          <h2 style={{ margin: '18px 0 10px', fontSize: 18 }}>Response (raw)</h2>
          <pre style={{
            margin: 0,
            padding: 14,
            borderRadius: 12,
            border: '1px solid #eee',
            background: '#fafafa',
            overflowX: 'auto',
            fontSize: 12,
            lineHeight: 1.4
          }}>{pretty}</pre>
        </section>
      )}

      <footer style={{ marginTop: 24, opacity: 0.75, fontSize: 12 }}>
        Tip: You can replace <code>fixtures/raw_feature.json</code> with your own raw feature to test determinism.
      </footer>
    </main>
  );
}
