'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

export function SidePanel({
  open,
  onClose,
  title,
  children,
  width = 'w-full max-w-md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}) {
  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Close panel backdrop"
        onClick={onClose}
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm animate-fade-up"
      />
      <aside
        className={`relative flex h-full ${width} flex-col bg-white shadow-lifted animate-slide-in-right`}
      >
        <header className="flex items-center justify-between border-b border-ink-200 px-6 py-4">
          <h2 className="font-serif text-xl text-ink-900">{title}</h2>
          <button onClick={onClose} className="rounded-md p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-900">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </aside>
    </div>
  );
}
