import { CheckCircle2, Clock, XCircle, Send, FileEdit, Pause } from 'lucide-react';

const config: Record<string, { className: string; icon?: React.ComponentType<{ className?: string }>; pulse?: boolean }> = {
  PENDING:       { className: 'pill-neutral', icon: Pause },
  SUBMITTED:     { className: 'pill-info', icon: Send, pulse: true },
  UNDER_REVIEW:  { className: 'pill-warning', icon: Clock, pulse: true },
  APPROVED:      { className: 'pill-success', icon: CheckCircle2 },
  REJECTED:      { className: 'pill-danger', icon: XCircle },
  DRAFT:         { className: 'pill-neutral', icon: FileEdit },
  ACTIVE:        { className: 'pill-success', icon: CheckCircle2 },
  CLOSED:        { className: 'pill-danger', icon: XCircle },
  AI_PROCESSING: { className: 'pill-warning', icon: Clock, pulse: true },
  ACCEPTED:      { className: 'pill-success', icon: CheckCircle2 },
};

export function StatusBadge({ status, size = 'sm' }: { status: string; size?: 'sm' | 'lg' }) {
  const c = config[status] ?? config.PENDING;
  const Icon = c.icon;
  const sizing = size === 'lg' ? 'px-3.5 py-1.5 text-sm' : '';
  return (
    <span className={`${c.className} ${sizing} ${c.pulse ? 'animate-pulse-soft' : ''}`}>
      {Icon && <Icon className={size === 'lg' ? 'h-4 w-4' : 'h-3 w-3'} />}
      {status.replace(/_/g, ' ')}
    </span>
  );
}
