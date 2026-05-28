'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Check, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import type { CampaignStatus } from '@onvest/shared';

export function CampaignControls({
  campaignId,
  status,
  inviteUrl,
}: {
  campaignId: string;
  status: CampaignStatus;
  inviteUrl: string;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  function copyInvite() {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function changeStatus(next: CampaignStatus) {
    setBusy(true);
    try {
      await api.campaigns.setStatus(campaignId, next);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-5 md:grid-cols-3">
      <div className="md:col-span-2">
        <div className="label">Public invite link</div>
        <div className="flex items-center gap-2 rounded-md border border-ink-200 bg-canvas px-3 py-2.5">
          <span className="flex-1 truncate font-mono text-xs text-ink-700">{inviteUrl}</span>
          <button
            onClick={copyInvite}
            className="inline-flex h-8 items-center gap-1.5 rounded px-2.5 text-xs font-medium text-ink-700 transition-colors hover:bg-white hover:text-brand-500"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        {status !== 'ACTIVE' && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-amber-700">
            <AlertCircle className="h-3.5 w-3.5" />
            Campaign is <strong>{status}</strong> — investors can&apos;t submit until you set it ACTIVE.
          </p>
        )}
      </div>

      <div>
        <div className="label">Status</div>
        <div className="flex flex-wrap gap-2">
          <StatusButton current={status === 'DRAFT'} disabled={busy} onClick={() => changeStatus('DRAFT' as CampaignStatus)} variant="ghost">
            Draft
          </StatusButton>
          <StatusButton current={status === 'ACTIVE'} disabled={busy} onClick={() => changeStatus('ACTIVE' as CampaignStatus)} variant="primary">
            Active
          </StatusButton>
          <StatusButton current={status === 'CLOSED'} disabled={busy} onClick={() => changeStatus('CLOSED' as CampaignStatus)} variant="danger">
            Closed
          </StatusButton>
        </div>
      </div>
    </div>
  );
}

function StatusButton({
  current,
  disabled,
  onClick,
  variant,
  children,
}: {
  current: boolean;
  disabled: boolean;
  onClick: () => void;
  variant: 'primary' | 'danger' | 'ghost';
  children: React.ReactNode;
}) {
  const base = 'inline-flex items-center justify-center rounded-md px-3 py-2 text-xs font-medium transition-all duration-150 disabled:opacity-50';
  const palette = current
    ? variant === 'primary'
      ? 'bg-brand-500 text-white shadow-glow'
      : variant === 'danger'
        ? 'bg-accent-rose text-white'
        : 'bg-ink-700 text-white'
    : variant === 'primary'
      ? 'border border-brand-500/40 text-brand-500 hover:bg-brand-50'
      : variant === 'danger'
        ? 'border border-accent-rose/40 text-accent-rose hover:bg-rose-50'
        : 'border border-ink-200 text-ink-700 hover:bg-ink-100';
  return (
    <button onClick={onClick} disabled={disabled || current} className={`${base} ${palette}`}>
      {children}
    </button>
  );
}
