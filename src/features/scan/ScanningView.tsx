import { AnimatePresence, motion } from 'motion/react';
import { useI18n } from '@/i18n';
import type { OcrPhase } from './ocr.service';

interface ScanningViewProps {
  imageUrl: string;
  phase: OcrPhase | 'parsing';
  progress: number;
}

/** The receipt photo with a laser sweeping over it while OCR runs. */
export function ScanningView({ imageUrl, phase, progress }: ScanningViewProps) {
  const { dict } = useI18n();
  const pct = Math.round(progress * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, rotate: -2 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 24 }}
      className="mx-auto flex w-full max-w-sm flex-col items-center gap-6"
    >
      <div className="relative w-full overflow-hidden rounded-3xl border border-line bg-ink-2 shadow-[0_30px_80px_-20px_rgb(139_92_246/0.45)]">
        <img src={imageUrl} alt="" className="max-h-[52vh] w-full object-contain opacity-80" />
        {/* tech grid */}
        <div
          className="absolute inset-0 opacity-30 mix-blend-screen"
          style={{
            backgroundImage:
              'linear-gradient(rgb(190 242 100 / 0.25) 1px, transparent 1px), linear-gradient(90deg, rgb(190 242 100 / 0.25) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
        {/* laser */}
        <div className="absolute inset-x-0 h-24 -translate-y-full animate-scan">
          <div className="h-full w-full bg-linear-to-b from-transparent to-lime/30" />
          <div className="h-[3px] w-full bg-lime shadow-[0_0_24px_6px_rgb(190_242_100/0.7)]" />
        </div>
        {/* soft vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgb(7_7_12/0.8))]" />
      </div>

      <div className="w-full">
        <div className="mb-2 flex items-center justify-between text-sm">
          <AnimatePresence mode="wait">
            <motion.span
              key={phase}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="font-semibold"
            >
              {dict.scan[phase]}
            </motion.span>
          </AnimatePresence>
          <span className="font-mono text-lime tabular-nums">{pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-violet),var(--color-pink),var(--color-lime))]"
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          />
        </div>
      </div>
    </motion.div>
  );
}
