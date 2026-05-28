'use client';

import { AlertTriangle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  destructive = false,
  withReason = false,
  reasonPlaceholder = 'Reason…',
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
  withReason?: boolean;
  reasonPlaceholder?: string;
  onConfirm: (reason: string) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) {
      setReason('');
      setBusy(false);
    }
  }, [open]);

  if (!open) return null;

  async function submit() {
    if (withReason && !reason.trim()) return;
    setBusy(true);
    try {
      await onConfirm(reason.trim());
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close"
        onClick={onCancel}
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm animate-fade-up"
      />
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lifted animate-fade-up">
        <button
          onClick={onCancel}
          className="absolute right-3 top-3 rounded-md p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-900"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-4">
          {destructive && (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50">
              <AlertTriangle className="h-5 w-5 text-accent-rose" />
            </span>
          )}
          <div className="flex-1">
            <h3 className="font-serif text-2xl text-ink-900">{title}</h3>
            {description && <p className="mt-2 text-sm text-ink-500">{description}</p>}
            {withReason && (
              <textarea
                className="input mt-4 min-h-24"
                placeholder={reasonPlaceholder}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={busy || (withReason && !reason.trim())}
            className={destructive ? 'btn-danger' : 'btn-primary'}
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
