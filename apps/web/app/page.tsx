import Link from 'next/link';
import { ArrowRight, ShieldCheck, Sparkles, Layers } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-canvas">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-500 shadow-glow" />
          <span className="font-serif text-2xl text-ink-900">Onvest</span>
        </div>
        <Link href="/dashboard" className="btn-secondary">
          Open dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <section className="mx-auto max-w-5xl px-6 pt-16 pb-24 text-center">
        <span className="pill-info inline-flex items-center gap-1.5 px-3 py-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          AI-assisted KYC for European fund managers
        </span>
        <h1 className="mt-6 font-serif text-6xl leading-[1.05] text-ink-900 md:text-7xl">
          Onboard investors with the rigour
          <br />
          <em className="font-serif text-brand-500">of private banking.</em>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-500">
          A digital KYC and investor onboarding platform built for the precision of European fund
          managers — PE, VC, real estate, and beyond.
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <Link href="/dashboard" className="btn-primary text-base">
            Open dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="mailto:atiqur@on-vest.com" className="btn-secondary text-base">
            Talk to founder
          </a>
        </div>

        <div className="mx-auto mt-16 grid max-w-3xl gap-4 md:grid-cols-3">
          <Feature icon={ShieldCheck} title="MiFID II audit trail" body="Every state change automatically captured." />
          <Feature icon={Sparkles} title="AI document review" body="Claude Opus reads, classifies, and flags issues." />
          <Feature icon={Layers} title="Reusable campaigns" body="One invite link, many investors, full visibility." />
        </div>
      </section>
    </main>
  );
}

function Feature({ icon: Icon, title, body }: { icon: typeof ShieldCheck; title: string; body: string }) {
  return (
    <div className="card-bordered text-left">
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-500">
        <Icon className="h-5 w-5" />
      </span>
      <div className="mt-4 font-serif text-xl text-ink-900">{title}</div>
      <p className="mt-1 text-sm text-ink-500">{body}</p>
    </div>
  );
}
