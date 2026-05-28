import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar />
      <div className="md:pl-[260px]">
        <TopHeader />
        <main className="mx-auto max-w-[1280px] px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
