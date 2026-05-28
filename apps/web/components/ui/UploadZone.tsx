'use client';

import { useState } from 'react';
import { UploadCloud, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

type State =
  | { kind: 'idle' }
  | { kind: 'uploading' }
  | { kind: 'processing' }
  | { kind: 'done'; fileName: string; aiVerified?: boolean; aiFlag?: string | null }
  | { kind: 'error'; message: string };

export function UploadZone({
  label,
  description,
  accept = 'image/jpeg,image/png,image/webp,application/pdf',
  state,
  onFile,
}: {
  label: string;
  description?: string;
  accept?: string;
  state: State;
  onFile: (file: File) => void;
}) {
  const [drag, setDrag] = useState(false);

  function inputId() {
    return `upload-${label.replace(/\s+/g, '-').toLowerCase()}`;
  }

  return (
    <div
      className={`upload-zone ${drag ? 'border-brand-500 bg-brand-50/60' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onFile(file);
      }}
    >
      {state.kind === 'idle' && (
        <>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
            <UploadCloud className="h-6 w-6 text-brand-500" strokeWidth={1.5} />
          </span>
          <div>
            <div className="text-sm font-medium text-ink-900">{label}</div>
            {description && <p className="mt-0.5 text-xs text-ink-500">{description}</p>}
          </div>
          <label
            htmlFor={inputId()}
            className="cursor-pointer text-xs font-medium text-brand-500 underline-offset-2 hover:underline"
          >
            Browse or drop file
          </label>
          <input
            id={inputId()}
            type="file"
            className="hidden"
            accept={accept}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFile(file);
            }}
          />
        </>
      )}

      {state.kind === 'uploading' && (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <div className="text-sm font-medium text-ink-900">Uploading…</div>
        </>
      )}

      {state.kind === 'processing' && (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <div className="text-sm font-medium text-ink-900">Analysing document…</div>
          <p className="text-xs text-ink-500">Our AI is verifying authenticity and extracting data.</p>
        </>
      )}

      {state.kind === 'done' && (
        <>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </span>
          <div>
            <div className="text-sm font-medium text-ink-900">{state.fileName}</div>
            {state.aiVerified ? (
              <p className="mt-0.5 text-xs text-emerald-700">Document verified</p>
            ) : state.aiFlag ? (
              <p className="mt-0.5 text-xs text-accent-rose">Issue detected: {state.aiFlag}</p>
            ) : (
              <p className="mt-0.5 text-xs text-ink-500">Uploaded — awaiting review</p>
            )}
          </div>
          <label
            htmlFor={inputId()}
            className="cursor-pointer text-xs font-medium text-brand-500 underline-offset-2 hover:underline"
          >
            Replace file
          </label>
          <input
            id={inputId()}
            type="file"
            className="hidden"
            accept={accept}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFile(file);
            }}
          />
        </>
      )}

      {state.kind === 'error' && (
        <>
          <AlertCircle className="h-8 w-8 text-accent-rose" />
          <div className="text-sm font-medium text-accent-rose">{state.message}</div>
          <label
            htmlFor={inputId()}
            className="cursor-pointer text-xs font-medium text-brand-500 underline-offset-2 hover:underline"
          >
            Try again
          </label>
          <input
            id={inputId()}
            type="file"
            className="hidden"
            accept={accept}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFile(file);
            }}
          />
        </>
      )}
    </div>
  );
}
