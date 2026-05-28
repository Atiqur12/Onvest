import { Send } from 'lucide-react';
import { api } from '@/lib/api';
import { CampaignCard } from '@/components/ui/CampaignCard';
import { EmptyState } from '@/components/ui/EmptyState';

export const dynamic = 'force-dynamic';

export default async function CampaignsPage() {
  const [campaigns, funds, investors] = await Promise.all([
    api.campaigns.list().catch(() => []),
    api.funds.list().catch(() => []),
    api.investors.list().catch(() => []),
  ]);

  const fundById = new Map(funds.map((f) => [f.id, f]));
  const investorsByCampaign = new Map<string, typeof investors>();
  investors.forEach((i) => {
    const arr = investorsByCampaign.get(i.campaignId) ?? [];
    arr.push(i);
    investorsByCampaign.set(i.campaignId, arr);
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Campaigns</h1>
        <p className="page-subtitle">All onboarding campaigns across your funds.</p>
      </div>

      {campaigns.length === 0 ? (
        <EmptyState
          icon={Send}
          title="No campaigns yet"
          description="Campaigns generate shareable invite links. Open any fund to create your first one."
          action={{ label: 'Open funds', href: '/funds' }}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((c) => {
            const fund = fundById.get(c.fundId);
            const list = investorsByCampaign.get(c.id) ?? [];
            const stats = {
              total: list.length,
              approved: list.filter((i) => i.status === 'APPROVED').length,
              pending: list.filter((i) => i.status === 'SUBMITTED' || i.status === 'UNDER_REVIEW').length,
            };
            return (
              <CampaignCard
                key={c.id}
                campaign={c}
                fundName={fund?.name}
                inviteUrl={`${appUrl}/onboarding/${c.inviteToken}`}
                stats={stats}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
