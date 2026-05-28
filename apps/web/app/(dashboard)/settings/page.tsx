import { Settings, KeyRound, Mail, Sparkles, HardDrive } from 'lucide-react';

const integrations = [
  {
    icon: KeyRound,
    name: 'Clerk authentication',
    env: 'CLERK_SECRET_KEY',
    status: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'live' : 'pending',
    body: 'Real user accounts and JWT verification. Until set, the dev bypass authorises every request as the seeded fund manager.',
  },
  {
    icon: HardDrive,
    name: 'AWS S3 storage',
    env: 'AWS_ACCESS_KEY_ID',
    status: 'pending',
    body: 'Encrypted document storage with pre-signed download URLs. Without keys the upload route returns 503.',
  },
  {
    icon: Sparkles,
    name: 'Claude AI document analysis',
    env: 'ANTHROPIC_API_KEY',
    status: 'pending',
    body: 'claude-opus-4-7 vision classification on every uploaded document, with confidence scores and flag detection.',
  },
  {
    icon: Mail,
    name: 'Resend email notifications',
    env: 'RESEND_API_KEY',
    status: 'pending',
    body: 'Investor submission alerts to the fund manager, approval/rejection emails to investors.',
  },
] as const;

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">
          Manage integrations, billing and team access. Most settings will be configured here once the corresponding
          API keys are added to your environment.
        </p>
      </div>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="section-title">Integrations</h2>
          <span className="font-mono text-xs text-ink-400">
            Configure in <code>apps/api/.env</code>
          </span>
        </div>
        <div className="space-y-3">
          {integrations.map((it) => {
            const Icon = it.icon;
            const live = it.status === 'live';
            return (
              <div
                key={it.env}
                className="card-bordered flex items-start gap-4 animate-fade-up"
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${
                    live ? 'bg-emerald-50 text-emerald-600' : 'bg-ink-100 text-ink-500'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-ink-900">{it.name}</h3>
                    <span className={live ? 'pill-success' : 'pill-warning'}>
                      {live ? 'Live' : 'Pending API key'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-500">{it.body}</p>
                  <div className="mt-2 font-mono text-[11px] text-ink-400">{it.env}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card-elevated flex items-start gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-50 text-brand-500">
          <Settings className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-serif text-xl text-ink-900">Team management, billing &amp; SSO</h3>
          <p className="mt-1 text-sm text-ink-500">
            Coming soon. Send a note to{' '}
            <a href="mailto:atiqur@on-vest.com" className="text-brand-500 hover:underline">
              atiqur@on-vest.com
            </a>{' '}
            if there&apos;s a specific setting you need before then.
          </p>
        </div>
      </section>
    </div>
  );
}
