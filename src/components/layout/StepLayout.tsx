import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '@/i18n';
import { useBill } from '@/store/billStore';
import { Button } from '@/components/ui/Button';

interface StepLayoutProps {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  /** Primary action. Defaults to "Continue" → next step. */
  primary?: ReactNode;
  canContinue?: boolean;
  /** Extra content shown above the footer buttons (hints, totals). */
  footerNote?: ReactNode;
  hideFooter?: boolean;
}

/** Shared shell for every step: heading, content, and a sticky footer nav. */
export function StepLayout({ title, subtitle, children, primary, canContinue = true, footerNote, hideFooter }: StepLayoutProps) {
  const { dict, dir } = useI18n();
  const next = useBill((s) => s.next);
  const back = useBill((s) => s.back);
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;
  const NextIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <div className="flex flex-col gap-6 pb-36">
      <header className="pt-6">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-mute">{subtitle}</p>}
      </header>

      {children}

      {/* Portaled to <body> so the fixed footer is never trapped by a parent's
          transform or overflow. */}
      {!hideFooter &&
        createPortal(
          <div className="fixed inset-x-0 bottom-0 z-30 bg-linear-to-t from-ink via-ink/90 to-transparent pt-10 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="mx-auto flex max-w-2xl flex-col gap-3 px-4">
              {footerNote}
              <div className="flex gap-3">
                <Button variant="soft" size="lg" onClick={back} icon={<BackIcon className="h-5 w-5" />} aria-label={dict.back} />
                {primary ?? (
                  <Button variant="primary" size="lg" className="flex-1" disabled={!canContinue} onClick={next}>
                    {dict.continue}
                    <NextIcon className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
