'use client';

import { useState } from 'react';
import { Download, ShieldCheck, Loader2, Sparkles } from 'lucide-react';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === 'true';
const DEV_USER = process.env.NEXT_PUBLIC_DEV_USER_ID ?? 'user_fm_alpha';

interface Preview {
  rowCount: number;
  firstTimestamp: string | null;
  lastTimestamp: string | null;
  sample: Array<{
    timestamp: string;
    entityType: string;
    action: string;
    performedBy: string;
    fundName: string;
    investorName: string;
  }>;
}

function authHeaders(): Record<string, string> {
  return DEV_BYPASS ? { 'x-dev-user-id': DEV_USER } : {};
}

function rangeQs(from: string, to: string): string {
  const q = new URLSearchParams();
  if (from) q.set('from', `${from}T00:00:00.000Z`);
  if (to) q.set('to', `${to}T23:59:59.999Z`);
  const s = q.toString();
  return s ? `?${s}` : '';
}

export function MifidExportCard() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [preview, setPreview] = useState<Preview | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadPreview() {
    setPreviewing(true);
    setError(null);
    try {
      const res = await fetch(`${BASE}/reports/mifid/preview${rangeQs(from, to)}`, {
        headers: authHeaders(),
        cache: 'no-store',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? `HTTP ${res.status}`);
      setPreview(json.data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPreviewing(false);
    }
  }

  async function download() {
    setDownloading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE}/reports/mifid.csv${rangeQs(from, to)}`, {
        headers: authHeaders(),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `onvest-mifid-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="card-elevated space-y-5">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-50 text-brand-500">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <h2 className="font-serif text-2xl text-ink-900">MiFID II audit pack</h2>
          <p className="mt-1 text-sm text-ink-500">
            Full audit trail of every fund, campaign, investor, document and reviewer action across your portfolio.
            Streamed as a CSV that opens directly in Excel, Numbers, or any spreadsheet tool.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <label className="label">From (optional)</label>
          <input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="label">To (optional)</label>
          <input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="flex items-end gap-2">
          <button onClick={loadPreview} disabled={previewing} className="btn-secondary flex-1">
            {previewing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Preview
          </button>
          <button onClick={download} disabled={downloading} className="btn-primary flex-1">
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download CSV
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-accent-rose">{error}</p>
      )}

      {preview && (
        <div className="rounded-lg border border-ink-200 bg-canvas p-4">
          <div className="flex items-baseline justify-between">
            <div className="font-serif text-xl text-ink-900">
              {preview.rowCount.toLocaleString()} audit event{preview.rowCount === 1 ? '' : 's'} in range
            </div>
            <div className="font-mono text-[11px] text-ink-400">
              {preview.firstTimestamp ? new Date(preview.firstTimestamp).toLocaleDateString() : '—'}
              {' → '}
              {preview.lastTimestamp ? new Date(preview.lastTimestamp).toLocaleDateString() : '—'}
            </div>
          </div>
          {preview.sample.length > 0 && (
            <div className="mt-3 overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Entity</th>
                    <th>Action</th>
                    <th>By</th>
                    <th>Fund / investor</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.sample.map((r, i) => (
                    <tr key={i}>
                      <td className="font-mono text-[11px] text-ink-500">
                        {new Date(r.timestamp).toLocaleString()}
                      </td>
                      <td>{r.entityType}</td>
                      <td className="font-medium text-ink-900">{r.action.replace(/_/g, ' ')}</td>
                      <td className="text-ink-500">{r.performedBy}</td>
                      <td className="text-ink-700">
                        {r.investorName || r.fundName || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.rowCount > preview.sample.length && (
                <p className="mt-3 text-xs text-ink-500">
                  Showing the first {preview.sample.length} of {preview.rowCount.toLocaleString()}.
                  Download the CSV for the full set.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
