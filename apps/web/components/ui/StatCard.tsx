import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

type Tone = 'blue' | 'amber' | 'emerald' | 'purple';

const toneClass: Record<Tone, string> = {
  blue: 'stat-card-blue',
  amber: 'stat-card-amber',
  emerald: 'stat-card-emerald',
  purple: 'stat-card-purple',
};

const iconBg: Record<Tone, string> = {
  blue: 'bg-brand-50 text-brand-500',
  amber: 'bg-amber-50 text-amber-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  purple: 'bg-purple-50 text-purple-600',
};

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'blue',
  trend,
  delay,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: Tone;
  trend?: { value: number; label?: string };
  delay?: number;
}) {
  const TrendIcon = trend && trend.value >= 0 ? TrendingUp : TrendingDown;
  const trendColor = trend && trend.value >= 0 ? 'text-emerald-600' : 'text-accent-rose';

  return (
    <div
      className={`stat-card ${toneClass[tone]} animate-fade-up`}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-ink-500">{label}</span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-md ${iconBg[tone]}`}>
          <Icon className="h-4.5 w-4.5" strokeWidth={2} />
        </span>
      </div>
      <div className="mt-3 font-serif text-5xl text-ink-900">{value}</div>
      {trend && (
        <div className={`mt-3 inline-flex items-center gap-1 text-xs font-medium ${trendColor}`}>
          <TrendIcon className="h-3.5 w-3.5" />
          {trend.value > 0 ? '+' : ''}
          {trend.value}%
          <span className="text-ink-500">{trend.label ?? 'this month'}</span>
        </div>
      )}
    </div>
  );
}
