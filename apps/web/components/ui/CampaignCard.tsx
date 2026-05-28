'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Copy, Check, MoreHorizontal } from 'lucide-react';
import type { OnboardingCampaign } from '@onvest/shared';
import { StatusBadge } from './StatusBadge';

interface CampaignCardProps {
  campaign: OnboardingCampaign;
  fundName?: string;
  inviteUrl: string;
  stats?: { total: number; approved: number; pending: number };
}

export function CampaignCard({ campaign, fundName, inviteUrl, stats }: CampaignCardProps) {
  const [copied, setCopied] = useState(false);
  const completion = stats && stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;

  function copy() {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="group overflow-hidden rounded-lg bg-white shadow-elevated transition-all duration-200 hover:-translate-y-1 hover:shadow-lifted animate-fade-up">
      <div className="relative h-24 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 px-5 py-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-serif text-xl leading-tight text-white">{campaign.name}</h3>
            {fundName && (
              <div className="mt-1 inline-flex items-center rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur-sm">
                {fundName}
              </div>
            )}
          </div>
          <button className="rounded-md p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4 px-5 py-4">
        <div className="flex items-center justify-between">
          <StatusBadge status={campaign.status} />
          <span className="font-mono text-[11px] text-ink-400">
            {campaign.requiredDocuments.length} docs required
          </span>
        </div>

        {stats && (
          <div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="font-serif text-2xl text-ink-900">{stats.total}</div>
                <div className="text-[10px] uppercase tracking-wider text-ink-500">Total</div>
              </div>
              <div>
                <div className="font-serif text-2xl text-emerald-600">{stats.approved}</div>
                <div className="text-[10px] uppercase tracking-wider text-ink-500">Approved</div>
              </div>
              <div>
                <div className="font-serif text-2xl text-amber-600">{stats.pending}</div>
                <div className="text-[10px] uppercase tracking-wider text-ink-500">Pending</div>
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-teal transition-all duration-700"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 rounded-md border border-ink-200 bg-canvas px-3 py-2">
          <span className="flex-1 truncate font-mono text-[11px] text-ink-500">{inviteUrl}</span>
          <button
            onClick={copy}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-ink-500 transition-colors hover:bg-white hover:text-brand-500"
            title="Copy invite link"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>

        <Link
          href={`/campaigns/${campaign.id}`}
          className="block w-full rounded-md border border-ink-200 py-2 text-center text-sm font-medium text-ink-900 transition-colors hover:bg-brand-500 hover:text-white hover:border-brand-500"
        >
          View campaign →
        </Link>
      </div>
    </div>
  );
}
