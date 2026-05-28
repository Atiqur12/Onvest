'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Building2 } from 'lucide-react';
import { api } from '@/lib/api';
import { SidePanel } from '@/components/ui/SidePanel';

export function CreateFundButton({ variant = 'button' }: { variant?: 'button' | 'card' }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState('VC');
  const [jurisdiction, setJurisdiction] = useState('FR');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      await api.funds.create({
        name,
        type: type as never,
        jurisdiction: jurisdiction as never,
        description: description || undefined,
      });
      setName(''); setDescription('');
      setOpen(false);
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {variant === 'button' ? (
        <button onClick={() => setOpen(true)} className="btn-primary">
          <Plus className="h-4 w-4" />
          New fund
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="group flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-ink-200 bg-canvas p-6 text-center transition-all duration-200 hover:border-brand-500 hover:bg-brand-50/40"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-500 transition-transform group-hover:scale-110">
            <Plus className="h-5 w-5" />
          </span>
          <span className="font-medium text-ink-900">Create another fund</span>
        </button>
      )}

      <SidePanel open={open} onClose={() => setOpen(false)} title="New fund">
        <form onSubmit={submit} className="space-y-5">
          <div className="flex items-center gap-3 rounded-md bg-canvas p-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-500">
              <Building2 className="h-5 w-5" />
            </span>
            <p className="text-sm text-ink-500">
              Funds are containers for onboarding campaigns. You can add multiple campaigns per fund.
            </p>
          </div>

          <div>
            <label className="label">Fund name</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={255}
              placeholder="e.g. Meridian Growth Fund II"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Type</label>
              <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="PE">Private Equity</option>
                <option value="VC">Venture Capital</option>
                <option value="REAL_ESTATE">Real Estate</option>
                <option value="HEDGE_FUND">Hedge Fund</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Jurisdiction</label>
              <select className="input" value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)}>
                <option value="FR">France 🇫🇷</option>
                <option value="LU">Luxembourg 🇱🇺</option>
                <option value="UK">United Kingdom 🇬🇧</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Description (optional)</label>
            <textarea
              className="input min-h-24"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Strategy, vintage, target investors…"
            />
          </div>
          {err && <p className="text-sm text-accent-rose">{err}</p>}
          <div className="flex justify-end gap-2 border-t border-ink-100 pt-4">
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? 'Creating…' : 'Create fund'}
            </button>
          </div>
        </form>
      </SidePanel>
    </>
  );
}
