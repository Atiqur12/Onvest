'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Plus } from 'lucide-react';

const titleFor = (path: string): string => {
  if (path.startsWith('/dashboard')) return 'Dashboard';
  if (path.startsWith('/funds')) return 'Funds';
  if (path.startsWith('/campaigns')) return 'Campaigns';
  if (path.startsWith('/investors')) return 'Investors';
  if (path.startsWith('/reports')) return 'Reports';
  if (path.startsWith('/settings')) return 'Settings';
  return 'Onvest';
};

export function TopHeader() {
  const pathname = usePathname();
  const title = titleFor(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-ink-200 bg-white/85 px-8 backdrop-blur-md">
      <div className="flex items-baseline gap-2">
        <h1 className="font-serif text-2xl text-ink-900">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="relative rounded-md p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
          aria-label="Notifications"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-rose ring-2 ring-white" />
        </button>
        <Link href="/campaigns" className="btn-primary">
          <Plus className="h-4 w-4" />
          New Campaign
        </Link>
        <div className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
          A
        </div>
      </div>
    </header>
  );
}
