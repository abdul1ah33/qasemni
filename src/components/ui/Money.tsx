import { useI18n } from '@/i18n';
import type { Piastres } from '@/core/types';

/** A formatted money value with tabular digits. */
export function Money({ value, className }: { value: Piastres; className?: string }) {
  const { money } = useI18n();
  return (
    <span className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {money(value)}
    </span>
  );
}
