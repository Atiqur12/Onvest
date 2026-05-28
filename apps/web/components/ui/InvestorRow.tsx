import Link from 'next/link';
import type { Investor } from '@onvest/shared';
import { StatusBadge } from './StatusBadge';
import { formatDate } from '@/lib/utils';

function initials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

const avatarPalette = [
  'bg-brand-50 text-brand-600',
  'bg-amber-50 text-amber-700',
  'bg-emerald-50 text-emerald-700',
  'bg-purple-50 text-purple-700',
  'bg-rose-50 text-accent-rose',
  'bg-teal-50 text-teal-700',
];

function avatarColor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return avatarPalette[h % avatarPalette.length];
}

export function InvestorRow({ investor }: { investor: Investor }) {
  return (
    <tr>
      <td>
        <Link href={`/investors/${investor.id}`} className="group flex items-center gap-3">
          <span className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${avatarColor(investor.id)}`}>
            {initials(investor.firstName, investor.lastName)}
          </span>
          <div>
            <div className="font-medium text-ink-900 group-hover:text-brand-500 transition-colors">
              {investor.firstName} {investor.lastName}
            </div>
            <div className="text-xs text-ink-500">{investor.email}</div>
          </div>
        </Link>
      </td>
      <td><span className="pill-neutral">{investor.investorType}</span></td>
      <td><StatusBadge status={investor.status} /></td>
      <td className="text-sm text-ink-500">
        {investor.submittedAt ? formatDate(investor.submittedAt) : '—'}
      </td>
    </tr>
  );
}
