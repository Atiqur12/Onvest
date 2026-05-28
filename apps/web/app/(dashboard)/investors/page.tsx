import Link from 'next/link';
import { Users } from 'lucide-react';
import { api } from '@/lib/api';
import { InvestorRow } from '@/components/ui/InvestorRow';
import { EmptyState } from '@/components/ui/EmptyState';
import type { InvestorStatus } from '@onvest/shared';

export const dynamic = 'force-dynamic';

const FILTERS: Array<{ value?: InvestorStatus; label: string }> = [
  { value: undefined, label: 'All' },
  { value: 'SUBMITTED' as InvestorStatus, label: 'Submitted' },
  { value: 'UNDER_REVIEW' as InvestorStatus, label: 'Under review' },
  { value: 'APPROVED' as InvestorStatus, label: 'Approved' },
  { value: 'REJECTED' as InvestorStatus, label: 'Rejected' },
];

export default async function InvestorsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: InvestorStatus }>;
}) {
  const { status } = await searchParams;
  const investors = await api.investors.list({ status }).catch(() => []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Investors</h1>
        <p className="page-subtitle">Review submissions across every campaign.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const active = status === f.value;
          const href = f.value ? `/investors?status=${f.value}` : '/investors';
          return (
            <Link
              key={f.label}
              href={href}
              className={`rounded-md border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? 'border-brand-500 bg-brand-500 text-white shadow-glow'
                  : 'border-ink-200 bg-white text-ink-700 hover:bg-canvas hover:border-ink-200'
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {investors.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No investors match this filter"
          description="Try a different status filter, or share a campaign invite link to collect new submissions."
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
  );
}
