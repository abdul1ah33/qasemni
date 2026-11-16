import clsx from 'clsx';
import { useState } from 'react';
import { parseAmount, toInputValue } from '@/core/money';
import type { Piastres } from '@/core/types';

interface MoneyInputProps {
  value: Piastres;
  onChange: (p: Piastres) => void;
  className?: string;
  ariaLabel?: string;
}

const format = (p: Piastres) => (p ? toInputValue(p) : '');

/**
 * Lets the user type freely ("45", "45,5", "٤٥") and commits a clean integer
 * piastre value on every valid keystroke, re-formatting when focus leaves.
 */
export function MoneyInput({ value, onChange, className, ariaLabel }: MoneyInputProps) {
  // While focused, show what the user typed; otherwise show the stored value.
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <input
      inputMode="decimal"
      aria-label={ariaLabel}
      placeholder="0.00"
      value={draft ?? format(value)}
      onFocus={(e) => {
        setDraft(format(value));
        e.currentTarget.select();
      }}
      onBlur={() => setDraft(null)}
      onChange={(e) => {
        setDraft(e.target.value);
        const p = parseAmount(e.target.value);
        onChange(p === null ? 0 : Math.abs(p));
      }}
      className={clsx('input text-end font-mono tabular-nums', className)}
      dir="ltr"
    />
  );
}
