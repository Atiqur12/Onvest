import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Mail, Globe, Calendar, FileText } from 'lucide-react';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DocumentCard } from '@/components/ui/DocumentCard';
import { AuditTimeline, type AuditEvent } from '@/components/ui/AuditTimeline';
import { InvestorActions } from './InvestorActions';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

function initials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

export default async function InvestorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const investor = await api.investors.get(id).catch(() => null);
  if (!investor) notFound();
  const audit = (await api.investors.audit(id).catch(() => [])) as AuditEvent[];

  return (
    <div className="space-y-8">
      <Link href="/investors" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-3.5 w-3.5" /> All investors
      </Link>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* LEFT — Investor profile (40%) */}
        <div className="space-y-6 lg:col-span-2">
          <div className="card-elevated">
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-lg font-semibold text-brand-700">
                {initials(investor.firstName, investor.lastName)}
              </span>
              <div className="min-w-0 flex-1">
                <h1 className="font-serif text-3xl text-ink-900">
                  {investor.firstName} {investor.lastName}
                </h1>
                <div className="mt-1.5">
                  <StatusBadge status={investor.status} size="lg" />
                </div>
              </div>
            </div>

            <dl className="mt-6 space-y-3">
              <Field icon={Mail} label="Email" value={investor.email} mono />
              <Field icon={Globe} label="Nationality" value={investor.nationality} />
              <Field icon={FileText} label="Investor type" value={investor.investorType} />
              {investor.entityName && (
                <Field icon={FileText} label="Entity" value={investor.entityName} />
              )}
              <Field
                icon={Calendar}
                label="Submitted"
                value={investor.submittedAt ? formatDate(investor.submittedAt) : '—'}
              />
              <Field
                icon={Calendar}
                label="Reviewed"
                value={investor.reviewedAt ? formatDate(investor.reviewedAt) : '—'}
              />
            </dl>

            {investor.rejectionReason && (
              <div className="mt-5 rounded-md bg-rose-50 p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-accent-rose">
                  Rejection reason
                </div>
                <p className="mt-1.5 text-sm text-ink-900">{investor.rejectionReason}</p>
              </div>
            )}

            {investor.uboDetails && investor.uboDetails.length > 0 && (
              <div className="mt-5">
                <div className="label">Ultimate beneficial owners</div>
                <ul className="space-y-2">
                  {investor.uboDetails.map((u, idx) => (
                    <li key={idx} className="rounded-md bg-canvas p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-ink-900">{u.fullName}</span>
                        <span className="pill-info">{u.ownershipPercent}%</span>
                      </div>
                      <div className="mt-0.5 text-xs text-ink-500">Nationality: {u.nationality}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <InvestorActions investorId={investor.id} status={investor.status} />

          <div className="card-elevated">
            <h2 className="section-title mb-4">Activity timeline</h2>
            <AuditTimeline events={audit} />
          </div>
        </div>

        {/* RIGHT — Documents (60%) */}
        <div className="space-y-4 lg:col-span-3">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="section-title">Submitted documents</h2>
              <p className="text-sm text-ink-500">
                {investor.documents.length} document{investor.documents.length === 1 ? '' : 's'} uploaded
              </p>
            </div>
          </div>

          {investor.documents.length === 0 ? (
            <div className="card-bordered text-center text-sm text-ink-500">
              No documents uploaded yet.
            </div>
          ) : (
            <div className="space-y-4">
              {investor.documents.map((d) => (
                <DocumentCard key={d.id} doc={d} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 text-ink-400" />
      <div className="min-w-0 flex-1">
        <dt className="text-[11px] font-medium uppercase tracking-wider text-ink-500">{label}</dt>
        <dd className={`mt-0.5 truncate text-sm text-ink-900 ${mono ? 'font-mono text-xs' : ''}`}>
          {value}
        </dd>
      </div>
    </div>
  );
}
