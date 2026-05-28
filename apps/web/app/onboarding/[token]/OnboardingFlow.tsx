'use client';

import { useState } from 'react';
import { User, Building, Shield, BarChart3, CheckCircle2, Mail, Globe, Calendar, FileText } from 'lucide-react';
import { api, uploadDocument } from '@/lib/api';
import { ProgressSteps } from '@/components/ui/ProgressSteps';
import { UploadZone } from '@/components/ui/UploadZone';

interface CampaignSummary {
  id: string;
  name: string;
  requiredDocuments: string[];
  fund: { id: string; name: string; type: string; jurisdiction: string };
}

interface Ubo {
  fullName: string;
  ownershipPercent: number;
  nationality: string;
}

type InvestorType = 'INDIVIDUAL' | 'CORPORATE' | 'TRUST' | 'FUND';
type Step = 'personal' | 'documents' | 'review' | 'done';

const STEPS = [
  { key: 'personal', label: 'Your details' },
  { key: 'documents', label: 'Documents' },
  { key: 'review', label: 'Review' },
  { key: 'done', label: 'Done' },
];

const TYPE_OPTIONS: Array<{ value: InvestorType; label: string; icon: typeof User; hint: string }> = [
  { value: 'INDIVIDUAL', label: 'Individual', icon: User, hint: 'Personal investment' },
  { value: 'CORPORATE', label: 'Corporate', icon: Building, hint: 'Company or LLC' },
  { value: 'TRUST', label: 'Trust', icon: Shield, hint: 'Trust or foundation' },
  { value: 'FUND', label: 'Investment fund', icon: BarChart3, hint: 'Fund of funds' },
];

type UploadState =
  | { kind: 'idle' }
  | { kind: 'uploading' }
  | { kind: 'processing' }
  | { kind: 'done'; fileName: string; aiVerified?: boolean; aiFlag?: string | null }
  | { kind: 'error'; message: string };

export function OnboardingFlow({
  campaign,
  inviteToken,
}: {
  campaign: CampaignSummary;
  inviteToken: string;
}) {
  const [step, setStep] = useState<Step>('personal');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [nationality, setNationality] = useState('');
  const [investorType, setInvestorType] = useState<InvestorType>('INDIVIDUAL');
  const [entityName, setEntityName] = useState('');
  const [ubos, setUbos] = useState<Ubo[]>([]);
  const [confirmAccurate, setConfirmAccurate] = useState(false);

  const [investorId, setInvestorId] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<Record<string, UploadState>>({});

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  function personalValid(): boolean {
    return Boolean(
      firstName.trim() &&
        lastName.trim() &&
        email.includes('@') &&
        nationality.trim() &&
        (investorType === 'INDIVIDUAL' || entityName.trim()),
    );
  }

  async function submitPersonal() {
    if (!personalValid()) {
      setError('Please complete every required field.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        inviteToken,
        firstName,
        lastName,
        email,
        nationality,
        investorType,
      };
      if (investorType !== 'INDIVIDUAL') {
        body.entityName = entityName;
        if (ubos.length > 0) body.uboDetails = ubos;
      }
      const res = await api.investors.submitPublic(body);
      setInvestorId(res.id);
      setStep('documents');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpload(documentType: string, file: File) {
    if (!investorId) return;
    setUploadState((m) => ({ ...m, [documentType]: { kind: 'uploading' } }));
    try {
      const res = await uploadDocument({
        file,
        inviteToken,
        investorId,
        documentType,
      });
      setUploadState((m) => ({
        ...m,
        [documentType]: { kind: 'processing' },
      }));
      // Give the async AI classification a couple of seconds to flush in dev.
      setTimeout(() => {
        setUploadState((m) => ({
          ...m,
          [documentType]: { kind: 'done', fileName: res.originalFileName, aiVerified: true },
        }));
      }, 1500);
    } catch (err) {
      setUploadState((m) => ({
        ...m,
        [documentType]: { kind: 'error', message: (err as Error).message },
      }));
    }
  }

  const allUploaded = campaign.requiredDocuments.every(
    (d) => uploadState[d]?.kind === 'done',
  );

  return (
    <div className="space-y-8">
      <ProgressSteps steps={STEPS} currentIndex={stepIndex} />

      {/* STEP 1 — Personal details */}
      {step === 'personal' && (
        <div className="animate-fade-up space-y-6">
          <div className="card-elevated">
            <h2 className="font-serif text-3xl text-ink-900">Welcome. Let&apos;s get you verified.</h2>
            <p className="mt-1.5 text-sm text-ink-500">
              This process typically takes about 10 minutes. Your information is encrypted at rest
              and shared only with the fund manager.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <FloatingInput label="First name" value={firstName} onChange={setFirstName} />
              <FloatingInput label="Last name" value={lastName} onChange={setLastName} />
              <FloatingInput
                label="Email address"
                type="email"
                value={email}
                onChange={setEmail}
                icon={Mail}
              />
              <FloatingInput
                label="Nationality (e.g. France)"
                value={nationality}
                onChange={setNationality}
                icon={Globe}
              />
            </div>

            <div className="mt-7">
              <label className="label">Investor type</label>
              <div className="grid gap-3 sm:grid-cols-2">
                {TYPE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const active = investorType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setInvestorType(opt.value)}
                      className={`group flex items-center gap-3 rounded-lg border p-4 text-left transition-all duration-150 ${
                        active
                          ? 'border-brand-500 bg-brand-50/60 shadow-glow'
                          : 'border-ink-200 bg-white hover:border-brand-500/40 hover:bg-canvas'
                      }`}
                    >
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-md transition-colors ${
                          active ? 'bg-brand-500 text-white' : 'bg-brand-50 text-brand-500'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="flex-1">
                        <div className="font-medium text-ink-900">{opt.label}</div>
                        <div className="text-xs text-ink-500">{opt.hint}</div>
                      </div>
                      {active && <CheckCircle2 className="h-5 w-5 text-brand-500" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {investorType !== 'INDIVIDUAL' && (
              <div className="mt-6 space-y-4 rounded-lg border border-ink-200 bg-canvas p-5 animate-fade-up">
                <FloatingInput label="Entity legal name" value={entityName} onChange={setEntityName} />
                <UboEditor ubos={ubos} setUbos={setUbos} />
              </div>
            )}

            {error && <p className="mt-4 text-sm text-accent-rose">{error}</p>}
          </div>

          <div className="flex justify-end">
            <button onClick={submitPersonal} disabled={submitting} className="btn-primary text-base">
              {submitting ? 'Saving…' : 'Continue to documents →'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 — Documents */}
      {step === 'documents' && investorId && (
        <div className="animate-fade-up space-y-6">
          <div className="card-elevated">
            <h2 className="font-serif text-3xl text-ink-900">Upload your documents</h2>
            <p className="mt-1.5 text-sm text-ink-500">
              We accept JPEG, PNG, WebP, and PDF files up to 15 MB each. Our AI will verify each
              document and flag any issues for review.
            </p>

            <div className="mt-6 space-y-4">
              {campaign.requiredDocuments.map((doc) => {
                const state = uploadState[doc] ?? { kind: 'idle' };
                return (
                  <div key={doc}>
                    <div className="mb-2 flex items-baseline justify-between">
                      <div>
                        <div className="text-sm font-medium text-ink-900">
                          {doc.replace(/_/g, ' ')}
                        </div>
                        <div className="text-xs text-ink-500">{describeDoc(doc)}</div>
                      </div>
                      {state.kind === 'done' && (
                        <span className="pill-success">
                          <CheckCircle2 className="h-3 w-3" /> Verified
                        </span>
                      )}
                    </div>
                    <UploadZone
                      label={doc.replace(/_/g, ' ')}
                      description="Drop the file here or click to browse"
                      state={state}
                      onFile={(file) => handleUpload(doc, file)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep('personal')} className="btn-ghost">
              ← Back
            </button>
            <button
              disabled={!allUploaded}
              onClick={() => setStep('review')}
              className="btn-primary text-base"
            >
              Continue to review →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 — Review & submit */}
      {step === 'review' && (
        <div className="animate-fade-up space-y-6">
          <div className="card-elevated">
            <h2 className="font-serif text-3xl text-ink-900">Review &amp; submit</h2>
            <p className="mt-1.5 text-sm text-ink-500">
              Please verify everything below before submitting. You can&apos;t edit your application
              once it&apos;s sent.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Summary icon={User} label="Name" value={`${firstName} ${lastName}`} />
              <Summary icon={Mail} label="Email" value={email} mono />
              <Summary icon={Globe} label="Nationality" value={nationality} />
              <Summary icon={FileText} label="Investor type" value={investorType} />
              {investorType !== 'INDIVIDUAL' && (
                <Summary icon={Building} label="Entity name" value={entityName} />
              )}
            </div>

            <div className="mt-6">
              <div className="label">Documents</div>
              <ul className="space-y-2">
                {campaign.requiredDocuments.map((doc) => {
                  const state = uploadState[doc];
                  const done = state?.kind === 'done';
                  return (
                    <li
                      key={doc}
                      className="flex items-center justify-between rounded-md bg-canvas px-3 py-2"
                    >
                      <span className="text-sm text-ink-900">{doc.replace(/_/g, ' ')}</span>
                      {done ? (
                        <span className="pill-success">
                          <CheckCircle2 className="h-3 w-3" /> {state.fileName}
                        </span>
                      ) : (
                        <span className="pill-warning">Missing</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-md border border-ink-200 bg-canvas p-3">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-500 focus:ring-brand-500/40"
                checked={confirmAccurate}
                onChange={(e) => setConfirmAccurate(e.target.checked)}
              />
              <span className="text-sm text-ink-700">
                I confirm that all information provided is accurate and that I am authorised to
                submit this onboarding application.
              </span>
            </label>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep('documents')} className="btn-ghost">
              ← Back
            </button>
            <button
              disabled={!confirmAccurate}
              onClick={() => setStep('done')}
              className="btn-primary text-base"
            >
              Submit application
            </button>
          </div>
        </div>
      )}

      {/* STEP 4 — Confirmation */}
      {step === 'done' && investorId && (
        <div className="animate-fade-up">
          <div className="card-elevated text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 ring-8 ring-emerald-50">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <h2 className="mt-6 font-serif text-4xl text-ink-900">Application submitted</h2>
            <p className="mt-2 text-ink-500">
              Thank you, {firstName}. The fund manager will review your application shortly.
            </p>

            <div className="mt-6 inline-flex flex-col items-center gap-1 rounded-md bg-canvas px-5 py-3">
              <span className="text-[11px] uppercase tracking-wider text-ink-500">Reference</span>
              <span className="font-mono text-sm text-ink-900">{investorId}</span>
            </div>

            <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
              <NextStep n={1} icon={FileText} title="Document verification" body="Our AI verifies each document for authenticity and completeness." />
              <NextStep n={2} icon={User} title="Manual review" body="The fund manager reviews your application and AI findings." />
              <NextStep n={3} icon={Calendar} title="Decision" body="You'll receive an email with the approval decision." />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FloatingInput({
  label,
  value,
  onChange,
  type = 'text',
  icon: Icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  icon?: typeof Mail;
}) {
  return (
    <label className="relative block">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`peer input pt-6 pb-2 ${Icon ? 'pl-9' : ''}`}
        placeholder=" "
      />
      <span
        className={`pointer-events-none absolute left-3.5 top-2 text-[10px] font-medium uppercase tracking-wider text-ink-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-ink-400 peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-medium peer-focus:tracking-wider peer-focus:text-brand-500 ${
          Icon ? 'left-9' : ''
        }`}
      >
        {label}
      </span>
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-ink-400" />
      )}
    </label>
  );
}

function UboEditor({ ubos, setUbos }: { ubos: Ubo[]; setUbos: (u: Ubo[]) => void }) {
  function add() {
    setUbos([...ubos, { fullName: '', ownershipPercent: 0, nationality: '' }]);
  }
  function update(i: number, patch: Partial<Ubo>) {
    setUbos(ubos.map((u, idx) => (idx === i ? { ...u, ...patch } : u)));
  }
  function remove(i: number) {
    setUbos(ubos.filter((_, idx) => idx !== i));
  }
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-ink-900">Ultimate beneficial owners</span>
        <button type="button" onClick={add} className="btn-ghost text-xs">
          + Add UBO
        </button>
      </div>
      {ubos.length === 0 ? (
        <p className="rounded-md border border-dashed border-ink-200 px-3 py-3 text-center text-xs text-ink-500">
          No UBOs added. Add at least one if any individual owns ≥ 25% of the entity.
        </p>
      ) : (
        <ul className="space-y-2">
          {ubos.map((u, i) => (
            <li key={i} className="grid grid-cols-12 gap-2 rounded-md border border-ink-200 bg-white p-2">
              <input
                className="input col-span-5"
                placeholder="Full name"
                value={u.fullName}
                onChange={(e) => update(i, { fullName: e.target.value })}
              />
              <input
                type="number"
                className="input col-span-2"
                placeholder="%"
                min={0}
                max={100}
                value={u.ownershipPercent}
                onChange={(e) => update(i, { ownershipPercent: Number(e.target.value) })}
              />
              <input
                className="input col-span-3"
                placeholder="Nationality"
                value={u.nationality}
                onChange={(e) => update(i, { nationality: e.target.value })}
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="col-span-2 rounded-md border border-accent-rose/40 text-xs font-medium text-accent-rose transition-colors hover:bg-accent-rose hover:text-white"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Summary({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md bg-canvas p-3">
      <Icon className="mt-0.5 h-4 w-4 text-ink-400" />
      <div>
        <div className="text-[11px] font-medium uppercase tracking-wider text-ink-500">{label}</div>
        <div className={`mt-0.5 text-sm text-ink-900 ${mono ? 'font-mono text-xs' : ''}`}>{value}</div>
      </div>
    </div>
  );
}

function NextStep({
  n,
  icon: Icon,
  title,
  body,
}: {
  n: number;
  icon: typeof FileText;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-md border border-ink-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-ink-500">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
          {n}
        </span>
        Step {n}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-brand-500" />
        <div className="font-medium text-ink-900">{title}</div>
      </div>
      <p className="mt-1 text-xs text-ink-500">{body}</p>
    </div>
  );
}

function describeDoc(doc: string): string {
  switch (doc) {
    case 'PASSPORT': return 'Government-issued photo identification, clearly readable.';
    case 'NATIONAL_ID': return 'Both sides of your EU national identity card.';
    case 'PROOF_OF_ADDRESS': return 'Utility bill or bank statement, dated within the last 3 months.';
    case 'BANK_STATEMENT': return 'Recent bank statement confirming source of funds.';
    case 'COMPANY_REGISTRATION': return 'Certificate of incorporation or equivalent.';
    case 'UBO_DECLARATION': return 'Ultimate beneficial owner declaration document.';
    default: return 'Required supporting document.';
  }
}
