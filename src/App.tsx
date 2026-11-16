import { useEffect, type ComponentType } from 'react';
import { useDocumentLang, useI18n } from '@/i18n';
import { STEPS, useBill, type Step } from '@/store/billStore';
import { Button } from '@/components/ui/Button';
import { ScanStep } from '@/features/scan/ScanStep';
import { ReviewStep } from '@/features/review/ReviewStep';
import { PeopleStep } from '@/features/people/PeopleStep';
import { AssignStep } from '@/features/assign/AssignStep';
import { SummaryStep } from '@/features/summary/SummaryStep';

const SCREENS: Record<Step, ComponentType> = {
  scan: ScanStep,
  review: ReviewStep,
  people: PeopleStep,
  assign: AssignStep,
  summary: SummaryStep,
};

export default function App() {
  useDocumentLang();
  const { dict, t, toggle } = useI18n();
  const step = useBill((s) => s.step);
  const reset = useBill((s) => s.reset);
  const Screen = SCREENS[step];

  // Each step starts at the top of the page.
  useEffect(() => window.scrollTo(0, 0), [step]);

  // The scan screen isn't counted as a numbered step.
  const index = STEPS.indexOf(step);
  const total = STEPS.length - 1;

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 pt-[env(safe-area-inset-top)]">
      <header className="flex h-14 items-center justify-between gap-2">
        <span className="text-lg font-bold">{dict.appName}</span>
        <div className="flex items-center gap-1">
          {step !== 'scan' && (
            <Button variant="ghost" size="sm" onClick={reset}>
              {dict.startOver}
            </Button>
          )}
          <Button size="sm" onClick={toggle}>
            {dict.langToggle}
          </Button>
        </div>
      </header>

      {step !== 'scan' && (
        <div className="mb-4">
          <div className="mb-1.5 flex justify-between text-xs text-muted">
            <span>{t(dict.stepOf, { n: index, total })}</span>
            <span>{dict.steps[step]}</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-line">
            <div className="h-full bg-accent" style={{ width: `${(index / total) * 100}%` }} />
          </div>
        </div>
      )}

      <Screen key={step} />
    </div>
  );
}
