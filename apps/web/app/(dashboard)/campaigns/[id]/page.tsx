import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { InvestorRow } from '@/components/ui/InvestorRow';
import { CampaignControls } from './CampaignControls';
import { EmptyState } from '@/components/ui/EmptyState';

export const dynamic = 'force-dynamic';

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = await api.campaigns.get(id).catch(() => null);
  if (!campaign) notFound();

  const investors = campaign.investors ?? [];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const inviteUrl = `${appUrl}/onboarding/${campaign.inviteToken}`;

  return (
    <div className="space-y-8">
      <Link href="/campaigns" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-3.5 w-3.5" /> All campaigns
      </Link>

      <div className="card-elevated">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="page-title">{campaign.name}</h1>
              <StatusBadge status={campaign.status} size="lg" />
            </div>
            <p className="page-subtitle">
              Requires {campaign.requiredDocuments.length} documents:{' '}
              <span className="text-ink-700">{campaign.requiredDocuments.map((d) => d.replace(/_/g, ' ')).join(', ')}</span>
            </p>
          </div>
        </div>
        <div className="mt-6">
          <CampaignControls campaignId={campaign.id} status={campaign.status} inviteUrl={inviteUrl} />
        </div>
      </div>

      <div>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="section-title">Investors</h2>
            <p className="text-sm text-ink-500">
              {investors.length} submission{investors.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {investors.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No investors yet"
            description="Share the invite link above to start collecting submissions."
          />
        ) : (
          <div className="overflow-hidden rounded-lg bg-white shadow-elevated">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Investor</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {investors.map((i) => (
                  <InvestorRow key={i.id} investor={i} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
