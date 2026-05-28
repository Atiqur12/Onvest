'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Send } from 'lucide-react';
import { api } from '@/lib/api';
import { SidePanel } from '@/components/ui/SidePanel';

const ALL_DOCS = [
  { id: 'PASSPORT', label: 'Passport', desc: 'Government-issued photo identification' },
  { id: 'NATIONAL_ID', label: 'National ID', desc: 'EU national identity card' },
  { id: 'PROOF_OF_ADDRESS', label: 'Proof of address', desc: 'Utility bill, bank statement (≤3 months)' },
  { id: 'BANK_STATEMENT', label: 'Bank statement', desc: 'Source of funds confirmation' },
  { id: 'COMPANY_REGISTRATION', label: 'Company registration', desc: 'For corporate investors' },
  { id: 'UBO_DECLARATION', label: 'UBO declaration', desc: 'Ultimate beneficial owner attestation' },
];

export function CreateCampaignButton({ fundId }: { fundId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [required, setRequired] = useState<string[]>(['PASSPORT', 'PROOF_OF_ADDRESS']);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function toggle(doc: string) {
    setRequired((prev) =>
      prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc],
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (required.length === 0) {
      setErr('Select at least one required document.');
      return;
    }
    setBusy(true); setErr(null);
    try {
      await api.campaigns.create({ fundId, name, requiredDocuments: required });
      setName('');
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
      <button onClick={() => setOpen(true)} className="btn-primary">
        <Plus className="h-4 w-4" />
        New campaign
      </button>

      <SidePanel open={open} onClose={() => setOpen(false)} title="New onboarding campaign" width="w-full max-w-lg">
        <form onSubmit={submit} className="space-y-5">
          <div className="flex items-center gap-3 rounded-md bg-canvas p-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-500">
              <Send className="h-5 w-5" />
            </span>
            <p className="text-sm text-ink-500">
              A campaign generates a unique invite link you can share with prospective investors.
            </p>
          </div>

          <div>
            <label className="label">Campaign name</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Q3 2026 Onboarding"
            />
          </div>

          <div>
            <span className="label">Required documents</span>
            <div className="space-y-2">
              {ALL_DOCS.map((doc) => {
                const on = required.includes(doc.id);
                return (
                  <label
                    key={doc.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors ${
                      on ? 'border-brand-500 bg-brand-50/50' : 'border-ink-200 bg-white hover:bg-canvas'
                    }`}
                  >
                    <span
                      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                        on ? 'bg-brand-500' : 'bg-ink-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-soft transition-transform ${
                          on ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </span>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={on}
                      onChange={() => toggle(doc.id)}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-ink-900">{doc.label}</div>
                      <div className="text-xs text-ink-500">{doc.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {err && <p className="text-sm text-accent-rose">{err}</p>}

          <div className="flex justify-end gap-2 border-t border-ink-100 pt-4">
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? 'Creating…' : 'Create campaign'}
            </button>
          </div>
        </form>
      </SidePanel>
    </>
  );
}
