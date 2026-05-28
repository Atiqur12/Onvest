'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Check, X, AlertTriangle, FileText } from 'lucide-react';
import type { DocumentRecord } from '@onvest/shared';
import { api } from '@/lib/api';
import { StatusBadge } from './StatusBadge';
import { formatDate } from '@/lib/utils';

function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function DocumentCard({ doc }: { doc: DocumentRecord }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function view() {
    setBusy(true); setErr(null);
    try {
      const { url } = await api.documents.downloadUrl(doc.id);
      window.open(url, '_blank');
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function accept() {
    setBusy(true);
    try {
      await api.documents.accept(doc.id);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function reject() {
    setBusy(true);
    try {
      await api.documents.reject(doc.id);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const confidence = doc.aiConfidence != null ? Math.round(doc.aiConfidence * 100) : null;
  const aiBarColor =
    confidence == null
      ? 'bg-ink-200'
      : confidence >= 85
        ? 'bg-emerald-500'
        : confidence >= 65
          ? 'bg-amber-500'
          : 'bg-accent-rose';

  return (
    <div className="card-bordered space-y-4 animate-fade-up">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-500">
            <FileText className="h-5 w-5" />
          </span>
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-ink-500">
              {doc.documentType.replace(/_/g, ' ')}
            </div>
            <div className="mt-0.5 text-sm font-medium text-ink-900">{doc.originalFileName}</div>
            <div className="mt-0.5 font-mono text-[11px] text-ink-400">
              {humanSize(doc.fileSize)} · uploaded {formatDate(doc.uploadedAt)}
            </div>
          </div>
        </div>
        <StatusBadge status={doc.status} />
      </div>

      <div className="rounded-md bg-canvas p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-ink-500">AI analysis</span>
          {confidence != null && (
            <span className="font-mono text-xs text-ink-700">{confidence}% confidence</span>
          )}
        </div>
        {doc.aiClassification ? (
          <>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="text-emerald-600">●</span>
              <span className="font-medium text-ink-900">Detected: {doc.aiClassification}</span>
              {doc.aiClassification === doc.documentType && (
                <span className="text-emerald-600">— matches required type</span>
              )}
              {doc.aiClassification !== doc.documentType && (
                <span className="text-amber-600">— differs from required type</span>
              )}
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100">
              <div
                className={`h-full ${aiBarColor} transition-all duration-700`}
                style={{ width: `${confidence ?? 0}%` }}
              />
            </div>
            {doc.aiFlags && doc.aiFlags.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {doc.aiFlags.map((f) => (
                  <li key={f} className="pill-danger inline-flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {f.replace(/_/g, ' ')}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-emerald-700">✓ No issues detected</p>
            )}
            {doc.isExpired && (
              <p className="mt-2 text-xs text-accent-rose font-medium">⚠ Document appears expired</p>
            )}
          </>
        ) : (
          <p className="mt-2 text-sm text-ink-500">Awaiting AI analysis…</p>
        )}
      </div>

      {err && <p className="text-xs text-accent-rose">{err}</p>}
      <div className="flex flex-wrap gap-2">
        <button onClick={view} disabled={busy} className="btn-secondary">
          <Eye className="h-4 w-4" />
          View document
        </button>
        <button onClick={accept} disabled={busy} className="btn-success">
          <Check className="h-4 w-4" />
          Accept
        </button>
        <button onClick={reject} disabled={busy} className="btn-danger">
          <X className="h-4 w-4" />
          Reject
        </button>
      </div>
    </div>
  );
}
