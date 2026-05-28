'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, MessageSquare } from 'lucide-react';
import { api } from '@/lib/api';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import type { InvestorStatus } from '@onvest/shared';

export function InvestorActions({
  investorId,
  status,
}: {
  investorId: string;
  status: InvestorStatus;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);

  if (status === 'APPROVED' || status === 'REJECTED') {
    return (
      <div className="card-bordered">
        <div className="text-sm text-ink-500">
          Investor has already been reviewed. Final state:{' '}
          <span className="font-medium text-ink-900">{status}</span>.
        </div>
      </div>
    );
  }

  async function approve() {
    setBusy(true); setErr(null);
    try {
      await api.investors.approve(investorId);
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function reject(reason: string) {
    setBusy(true); setErr(null);
    try {
      await api.investors.reject(investorId, reason);
      setRejectOpen(false);
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="card-elevated space-y-3">
        <h2 className="section-title">Review decision</h2>
        <p className="text-sm text-ink-500">
          Once approved or rejected the investor is notified by email and the decision is locked into the audit trail.
        </p>
        <button onClick={approve} disabled={busy} className="btn-success w-full">
          <CheckCircle2 className="h-4 w-4" />
          Approve investor
        </button>
        <button
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-brand-500/40 px-4 py-2.5 text-sm font-medium text-brand-500 transition-colors hover:bg-brand-50 disabled:opacity-50"
        >
          <MessageSquare className="h-4 w-4" />
          Request more information
        </button>
        <button onClick={() => setRejectOpen(true)} disabled={busy} className="btn-danger w-full">
          <XCircle className="h-4 w-4" />
          Reject
        </button>
        {err && <p className="text-xs text-accent-rose">{err}</p>}
      </div>

      <ConfirmModal
        open={rejectOpen}
        title="Reject this investor?"
        description="The investor will receive an email with the reason you provide. This decision is logged in the audit trail."
        confirmLabel="Reject investor"
        destructive
        withReason
        reasonPlaceholder="Briefly explain what needs to change…"
        onConfirm={reject}
        onCancel={() => setRejectOpen(false)}
      />
    </>
  );
}
