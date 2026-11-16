import type { ComponentType } from 'react';
import { useDocumentLang } from '@/i18n';
import { useBill, type Step } from '@/store/billStore';
import { Background } from '@/components/ui/Background';
import { Header } from '@/components/layout/Header';
import { Stepper } from '@/components/layout/Stepper';
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
  const step = useBill((s) => s.step);
  const Screen = SCREENS[step];

  return (
    <>
      <Background />
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4">
        <Header />
        {step !== 'scan' && <Stepper />}
        <main className="relative flex-1">
          <Screen key={step} />
        </main>
      </div>
    </>
  );
}
