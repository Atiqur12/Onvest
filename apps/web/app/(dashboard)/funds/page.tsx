import Link from 'next/link';
import { Building2, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { CreateFundButton } from './CreateFundButton';
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
  FR: '🇫🇷',
  LU: '🇱🇺',
  UK: '🇬🇧',
  OTHER: '🌍',
};

export default async function FundsPage() {
  const funds = await api.funds.list().catch(() => []);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="page-title">Funds</h1>
          <p className="page-subtitle">
            Each fund hosts one or more onboarding campaigns.
          </p>
        </div>
        <CreateFundButton />
      </div>

      {funds.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No funds yet"
          description="Create your first fund to start collecting investor submissions."
          action={{ label: 'Create your first fund', onClick: undefined }}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {funds.map((f, idx) => (
            <Link
              key={f.id}
              href={`/funds/${f.id}`}
              className="group block rounded-lg bg-white p-6 shadow-elevated transition-all duration-200 hover:-translate-y-1 hover:shadow-lifted animate-fade-up"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-50 text-brand-500">
                  <Building2 className="h-5 w-5" />
                </span>
                <span className="text-2xl">{jurisFlag[f.jurisdiction] ?? '🌍'}</span>
              </div>
              <h3 className="mt-4 font-serif text-2xl text-ink-900 group-hover:text-brand-500 transition-colors">
                {f.name}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-ink-500">
                <span>{typeLabel[f.type] ?? f.type}</span>
                <span className="text-ink-200">·</span>
                <span>{f.jurisdiction}</span>
              </div>
              {f.description && (
                <p className="mt-3 line-clamp-2 text-sm text-ink-500">{f.description}</p>
              )}
              <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-500">
                Open fund <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
          <CreateFundButton variant="card" />
        </div>
      )}
    </div>
  );
}

