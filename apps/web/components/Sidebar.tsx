'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Send,
  Users,
  FileText,
  Settings,
  LogOut,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const items: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/funds', label: 'Funds', icon: Building2 },
  { href: '/campaigns', label: 'Campaigns', icon: Send },
  { href: '/investors', label: 'Investors', icon: Users },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col bg-canvas-sidebar text-white md:flex">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <span className="relative inline-flex">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-500 shadow-glow" />
          <span className="absolute inset-0 h-2.5 w-2.5 animate-ping rounded-full bg-brand-500 opacity-30" />
        </span>
        <span className="font-serif text-2xl tracking-tight text-white">Onvest</span>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== '/dashboard' && pathname.startsWith(href + '/'));
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-link ${active ? 'sidebar-link-active' : ''}`}
            >
              <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="relative">
        <div className="pointer-events-none absolute -top-12 left-0 right-0 h-12 bg-gradient-to-t from-canvas-sidebar to-transparent" />
        <div className="m-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 font-semibold text-white">
              A
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-white">Atiqur</div>
              <div className="truncate text-[11px] text-white/50">atiqur@on-vest.com</div>
            </div>
            <button
              className="rounded-md p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
