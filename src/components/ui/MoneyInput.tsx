import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { parseAmount, toInputValue } from '@/core/money';
import type { Piastres } from '@/core/types';

interface MoneyInputProps {
  value: Piastres;
  onChange: (p: Piastres) => void;
  className?: string;
  ariaLabel?: string;
}

/**
 * Lets the user type freely ("45", "45,5", "٤٥") and commits a clean integer
 * piastre value on every valid keystroke, re-formatting on blur.
 */
export function MoneyInput({ value, onChange, className, ariaLabel }: MoneyInputProps) {
  const [draft, setDraft] = useState(() => (value ? toInputValue(value) : ''));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDraft(value ? toInputValue(value) : '');
  }, [value, focused]);

  return (
    <input
      inputMode="decimal"
      aria-label={ariaLabel}
      placeholder="0.00"
      value={draft}
      onFocus={(e) => {
        setFocused(true);
        e.currentTarget.select();
      }}
      onBlur={() => setFocused(false)}
      onChange={(e) => {
        setDraft(e.target.value);
        const p = parseAmount(e.target.value);
        onChange(p === null ? 0 : Math.abs(p));
      }}
      className={clsx('field font-mono tabular-nums', className)}
      dir="ltr"
    />
  );
}
