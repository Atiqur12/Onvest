import { Check } from 'lucide-react';

interface Step {
  key: string;
  label: string;
}

export function ProgressSteps({
  steps,
  currentIndex,
}: {
  steps: Step[];
  currentIndex: number;
}) {
  return (
    <ol className="flex w-full items-center">
      {steps.map((s, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <li key={s.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center text-center">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-200 ${
                  done
                    ? 'border-brand-500 bg-brand-500 text-white shadow-glow'
                    : active
                      ? 'border-brand-500 bg-white text-brand-500 ring-4 ring-brand-50'
                      : 'border-ink-200 bg-white text-ink-400'
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={`mt-2 hidden text-xs font-medium md:block ${
                  active ? 'text-ink-900' : 'text-ink-500'
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span
                className={`mx-3 h-px flex-1 transition-colors duration-300 ${
                  done ? 'bg-brand-500' : 'bg-ink-200'
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
