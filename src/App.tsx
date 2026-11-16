import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import type { ComponentType } from 'react';
import { useDocumentLang, useI18n } from '@/i18n';
import { useBill, type Step } from '@/store/billStore';
import { Background } from '@/components/ui/Background';
import { Header } from '@/components/layout/Header';
import { Stepper } from '@/components/layout/Stepper';
import { ScanStep } from '@/features/scan/ScanStep';
import { ReviewStep } from '@/features/review/ReviewStep';
import { PeopleStep } from '@/features/people/PeopleStep';
import { AssignStep } from '@/features/assign/AssignStep';
import { SummaryStep } from '@/features/summary/SummaryStep';
import { isLite } from '@/lib/perf';

const SCREENS: Record<Step, ComponentType> = {
  scan: ScanStep,
  review: ReviewStep,
  people: PeopleStep,
  assign: AssignStep,
  summary: SummaryStep,
};

export default function App() {
  useDocumentLang();
  const { dir } = useI18n();
  const step = useBill((s) => s.step);
  const direction = useBill((s) => s.direction);
  const Screen = SCREENS[step];

  // Slide in the reading direction: forward = toward the end of the line.
  const offset = 60 * direction * (dir === 'rtl' ? -1 : 1);

  return (
    <MotionConfig reducedMotion="user">
      <Background />
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4">
        <Header />
        <AnimatePresence initial={false}>
          {step !== 'scan' && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Stepper />
            </motion.div>
          )}
        </AnimatePresence>

        <main className="relative flex-1">
          <AnimatePresence mode="wait" initial={false} custom={offset}>
            <motion.div
              key={step}
              custom={offset}
              variants={
                isLite
                  ? {
                      // Phones: transform + opacity only, which stay on the compositor.
                      enter: (o: number) => ({ opacity: 0, x: o * 0.5 }),
                      center: { opacity: 1, x: 0 },
                      exit: (o: number) => ({ opacity: 0, x: -o * 0.5 }),
                    }
                  : {
                      enter: (o: number) => ({ opacity: 0, x: o, filter: 'blur(6px)' }),
                      // Drop the filter once settled: CSS filters make `position: fixed`
                      // children (modals, lightbox) position relative to this wrapper.
                      center: { opacity: 1, x: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } },
                      // No filter on exit: animating from `filter: none` never resolves.
                      exit: (o: number) => ({ opacity: 0, x: -o }),
                    }
              }
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            >
              <Screen />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </MotionConfig>
  );
}
