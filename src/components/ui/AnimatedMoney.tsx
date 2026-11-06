import { animate, useMotionValue, useTransform, motion } from 'motion/react';
import { useEffect } from 'react';
import { useI18n } from '@/i18n';
import type { Piastres } from '@/core/types';

/** A money value that counts up/down smoothly whenever it changes. */
export function AnimatedMoney({ value, className, duration = 0.8 }: { value: Piastres; className?: string; duration?: number }) {
  const { money } = useI18n();
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => money(Math.round(v)));

  useEffect(() => {
    const controls = animate(mv, value, { duration, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [mv, value, duration]);

  return <motion.span className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>{text}</motion.span>;
}
