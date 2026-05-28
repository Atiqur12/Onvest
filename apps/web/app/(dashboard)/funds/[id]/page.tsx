import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Building2, Send } from 'lucide-react';
import { api } from '@/lib/api';
import { CampaignCard } from '@/components/ui/CampaignCard';
import { CreateCampaignButton } from './CreateCampaignButton';
import { EmptyState } from '@/components/ui/EmptyState';

export const dynamic = 'force-dynamic';

const typeLabel: Record<string, string> = {
  PE: 'Private Equity',
  VC: 'Venture Capital',
  REAL_ESTATE: 'Real Estate',
  HEDGE_FUND: 'Hedge Fund',
  OTHER: 'Other',
};

const jurisFlag: Record<string, string> = {
  FR: '🇫🇷', LU: '🇱🇺', UK: '🇬🇧', OTHER: '🌍',
};

export default async function FundDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fund = await api.funds.get(id).catch(() => null);
  if (!fund) notFound();
  const campaigns = await api.campaigns.list(fund.id).catch(() => []);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  return (
    <div className="space-y-10">
      <div>
        <Link href="/funds" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
          <ArrowLeft className="h-3.5 w-3.5" /> All funds
        </Link>
      </div>

      <div className="card-elevated flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-brand-50 text-brand-500">
            <Building2 className="h-7 w-7" />
          </span>
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-ink-500">
              {jurisFlag[fund.jurisdiction]} <span>{typeLabel[fund.type] ?? fund.type}</span>
              <span className="text-ink-200">·</span>
              <span>{fund.jurisdiction}</span>
            </div>
            <h1 className="page-title mt-1">{fund.name}</h1>
            {fund.description && (
              <p className="mt-2 max-w-2xl text-sm text-ink-500">{fund.description}</p>
            )}
          </div>
        </div>
        <CreateCampaignButton fundId={fund.id} />
      </div>

      <div>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="section-title">Onboarding campaigns</h2>
          <span className="font-mono text-xs text-ink-400">{campaigns.length} total</span>
        </div>
        {campaigns.length === 0 ? (
          <EmptyState
            icon={Send}
            title="No campaigns yet"
            description="Create your first onboarding campaign to start inviting investors."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {campaigns.map((c) => (
              <CampaignCard
                key={c.id}
                campaign={c}
                fundName={fund.name}
                inviteUrl={`${appUrl}/onboarding/${c.inviteToken}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
