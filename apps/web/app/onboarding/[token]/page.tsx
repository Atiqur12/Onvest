import { ShieldX } from 'lucide-react';
import { api } from '@/lib/api';
import { OnboardingFlow } from './OnboardingFlow';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  let campaign;
  try {
    campaign = await api.campaigns.publicByToken(token);
  } catch (err) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-canvas px-6">
        <div className="card-elevated max-w-md text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-accent-rose">
            <ShieldX className="h-7 w-7" />
          </span>
          <h1 className="mt-4 font-serif text-3xl text-ink-900">Invitation unavailable</h1>
          <p className="mt-2 text-sm text-ink-500">{(err as Error).message}</p>
          <p className="mt-1 text-xs text-ink-400">
            Please ask the fund manager for an up-to-date invite link.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-canvas">
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-500 shadow-glow" />
            <span className="font-serif text-xl text-ink-900">Onvest</span>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wider text-ink-500">Onboarding for</div>
            <div className="font-serif text-base text-ink-900">{campaign.fund.name}</div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-12">
        <OnboardingFlow campaign={campaign} inviteToken={token} />
      </div>
    </main>
  );
}
