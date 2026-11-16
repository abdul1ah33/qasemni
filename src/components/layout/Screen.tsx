import type { ReactNode } from 'react';
import { useI18n } from '@/i18n';
import { useBill } from '@/store/billStore';
import { Button } from '@/components/ui/Button';

interface ScreenProps {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  /** Replaces the default "Continue" button. */
  primary?: ReactNode;
  canContinue?: boolean;
  /** Shown above the bottom buttons (totals, hints). */
  note?: ReactNode;
}

/** Shared layout for every step after the scan: heading, content, bottom bar. */
export function Screen({ title, subtitle, children, primary, canContinue = true, note }: ScreenProps) {
  const { dict } = useI18n();
  const next = useBill((s) => s.next);
  const back = useBill((s) => s.back);

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 pb-6">
        <header className="pt-2">
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
        </header>
        {children}
      </div>

      <div className="sticky bottom-0 -mx-4 border-t border-line bg-bg px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {note && <div className="mb-3">{note}</div>}
        <div className="flex gap-2">
          <Button size="lg" onClick={back}>
            {dict.back}
          </Button>
          {primary ?? (
            <Button variant="primary" size="lg" className="flex-1" disabled={!canContinue} onClick={next}>
              {dict.continue}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
