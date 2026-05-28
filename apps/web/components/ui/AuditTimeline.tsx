import { formatDate } from '@/lib/utils';

export interface AuditEvent {
  id: string;
  action: string;
  performedBy: string;
  createdAt: string;
}

const dotForAction: Record<string, string> = {
  CREATED: 'tl-dot-blue',
  SUBMITTED: 'tl-dot-blue',
  APPROVED: 'tl-dot-green',
  REJECTED: 'tl-dot-red',
  DOCUMENT_UPLOADED: 'tl-dot-blue',
  DOCUMENT_ACCEPTED: 'tl-dot-green',
  DOCUMENT_REJECTED: 'tl-dot-red',
  AI_PROCESSED: 'tl-dot-amber',
  STATUS_CHANGED: 'tl-dot-gray',
};

function actorBadge(actor: string): string {
  if (actor === 'investor') return 'bg-brand-50 text-brand-700';
  if (actor === 'ai_system') return 'bg-amber-50 text-amber-700';
  return 'bg-ink-100 text-ink-700';
}

export function AuditTimeline({ events }: { events: AuditEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-ink-500">No audit entries yet.</p>;
  }
  return (
    <ol className="relative space-y-5 border-l border-ink-200 pl-5">
      {events.map((e) => (
        <li key={e.id} className="relative">
          <span className={`${dotForAction[e.action] ?? 'tl-dot-gray'} absolute -left-[27px] top-1.5`} />
          <div className="text-sm font-medium text-ink-900">{e.action.replace(/_/g, ' ')}</div>
          <div className="mt-0.5 flex items-center gap-2">
            <span className={`pill text-[10px] ${actorBadge(e.performedBy)}`}>{e.performedBy}</span>
            <span className="text-xs text-ink-500">{formatDate(e.createdAt)}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}
