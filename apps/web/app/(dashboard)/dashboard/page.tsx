import Link from 'next/link';
import { Users, Clock, CheckCircle2, Zap, ArrowRight, Send, FileBarChart } from 'lucide-react';
import { api } from '@/lib/api';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [funds, campaigns, investors] = await Promise.all([
    api.funds.list().catch(() => []),
    api.campaigns.list().catch(() => []),
    api.investors.list().catch(() => []),
  ]);

  const pending = investors.filter((i) => i.status === 'SUBMITTED' || i.status === 'UNDER_REVIEW');
  const approved = investors.filter((i) => i.status === 'APPROVED');
  const activeCampaigns = campaigns.filter((c) => c.status === 'ACTIVE');

  const recent = [...investors].sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1)).slice(0, 8);

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-ink-500">Welcome back</p>
          <h1 className="page-title mt-1">Your portfolio at a glance</h1>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total investors"   value={investors.length}      icon={Users}        tone="blue"    trend={{ value: 12 }} delay={0} />
        <StatCard label="Pending review"    value={pending.length}        icon={Clock}        tone="amber"   delay={80} />
        <StatCard label="Approved"          value={approved.length}       icon={CheckCircle2} tone="emerald" trend={{ value: 8 }}  delay={160} />
        <StatCard label="Active campaigns"  value={activeCampaigns.length} icon={Zap}          tone="purple"  delay={240} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card-elevated lg:col-span-2 animate-fade-up" style={{ animationDelay: '300ms' }}>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="section-title">Recent activity</h2>
            <Link href="/investors" className="inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:underline">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No activity yet"
              description="Once investors submit their onboarding details you'll see their updates here in real time."
              action={{ label: 'Create a campaign', href: '/campaigns' }}
            />
          ) : (
            <ol className="space-y-1">
              {recent.map((i) => (
                <li
                  key={i.id}
                  className="flex items-center justify-between gap-3 rounded-md px-2 py-3 transition-colors hover:bg-canvas"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="tl-dot-blue mt-1" />
                    <div className="min-w-0">
                      <div className="truncate text-sm text-ink-900">
                        <span className="font-medium">
                          {i.firstName} {i.lastName}
                        </span>{' '}
                        <span className="text-ink-500">
                          {i.status === 'APPROVED'
                            ? 'was approved'
                            : i.status === 'REJECTED'
                              ? 'was rejected'
                              : 'submitted onboarding documents'}
                        </span>
                      </div>
                      <div className="text-xs text-ink-400">
                        {formatDate(i.submittedAt ?? i.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={i.status} />
                    <Link
                      href={`/investors/${i.id}`}
                      className="text-xs font-medium text-brand-500 hover:underline"
                    >
                      Open
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="space-y-4 animate-fade-up" style={{ animationDelay: '400ms' }}>
          <h2 className="section-title">Quick actions</h2>

          <Link
            href="/campaigns"
            className="group relative block overflow-hidden rounded-lg bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 p-5 text-white shadow-elevated transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white/15 backdrop-blur-sm">
                <Send className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <div className="font-medium">Create new campaign</div>
                <div className="text-xs text-white/70">Invite investors via a shareable link</div>
              </div>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            href="/investors?status=SUBMITTED"
            className="group block rounded-lg border border-brand-500/40 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-500">
                <Users className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <div className="font-medium text-ink-900">Review pending investors</div>
                <div className="text-xs text-ink-500">{pending.length} awaiting your decision</div>
              </div>
              <ArrowRight className="h-4 w-4 text-brand-500 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            href="/reports"
            className="group block rounded-lg border border-ink-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-ink-100 text-ink-700">
                <FileBarChart className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <div className="font-medium text-ink-900">Export compliance report</div>
                <div className="text-xs text-ink-500">Full audit trail · MiFID II ready</div>
              </div>
              <ArrowRight className="h-4 w-4 text-ink-500 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </section>
      </div>

      {funds.length === 0 && (
        <EmptyState
          icon={Zap}
          title="Get started"
          description="Create your first fund, then add an onboarding campaign to start collecting investor submissions."
          action={{ label: 'Create your first fund', href: '/funds' }}
        />
      )}
    </div>
  );
}
