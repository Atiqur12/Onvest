import { FileText, Calendar } from 'lucide-react';
import { MifidExportCard } from './MifidExportCard';

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">Compliance exports and audit-ready summaries.</p>
      </div>

      <MifidExportCard />

      <section>
        <h2 className="section-title mb-4">Coming soon</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <PlannedReport
            icon={FileText}
            title="Investor register (PDF)"
            body="One PDF per investor: profile, document list with AI verdicts, full per-investor audit trail. Designed for archive."
          />
          <PlannedReport
            icon={Calendar}
            title="Period summary"
            body="High-level submissions, approvals and rejections over a custom date range with charts."
          />
        </div>
      </section>
    </div>
  );
}

function PlannedReport({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof FileText;
  title: string;
  body: string;
}) {
  return (
    <div className="card-bordered animate-fade-up">
      <div className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-ink-100 text-ink-500">
          <Icon className="h-5 w-5" />
        </span>
        <span className="pill-neutral">Planned</span>
      </div>
      <h3 className="mt-4 font-serif text-xl text-ink-900">{title}</h3>
      <p className="mt-1 text-sm text-ink-500">{body}</p>
    </div>
  );
}
