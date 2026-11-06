import type { Piastres } from './types';

export const CURRENCY = 'EGP';

/** Converts an EGP amount (e.g. 45.5) into integer piastres (4550). */
export function toPiastres(egp: number): Piastres {
  return Math.round(egp * 100);
}

export function fromPiastres(p: Piastres): number {
  return p / 100;
}

/**
 * Parses a human/OCR-written amount: "1,250.50", "1.250,50", "45,5", "٤٥٫٥٠".
 * Returns null when the string isn't a number.
 */
export function parseAmount(raw: string): Piastres | null {
  let s = normalizeDigits(raw).replace(/[^\d.,-]/g, '');
  if (!s || !/\d/.test(s)) return null;

  const lastDot = s.lastIndexOf('.');
  const lastComma = s.lastIndexOf(',');
  if (lastDot !== -1 && lastComma !== -1) {
    // Both present: whichever comes last is the decimal separator.
    const dec = lastDot > lastComma ? '.' : ',';
    const thou = dec === '.' ? ',' : '.';
    s = s.split(thou).join('').replace(dec, '.');
  } else if (lastComma !== -1) {
    // Only commas: "1,250" is thousands, "45,50" is decimal.
    const groups = s.split(',');
    const isThousands = groups.length > 1 && groups.slice(1).every((g) => g.length === 3);
    s = isThousands ? groups.join('') : s.replace(/,(?=[^,]*$)/, '.').replace(/,/g, '');
  }

  const n = Number(s);
  return Number.isFinite(n) ? toPiastres(n) : null;
}

/** Converts Arabic-Indic and Persian digits/separators to ASCII. */
export function normalizeDigits(s: string): string {
  return s
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/٫/g, '.') // Arabic decimal separator
    .replace(/٬/g, ','); // Arabic thousands separator
}

const formatters = new Map<string, Intl.NumberFormat>();

export function formatMoney(p: Piastres, locale = 'en-EG'): string {
  let f = formatters.get(locale);
  if (!f) {
    f = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: CURRENCY,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    formatters.set(locale, f);
  }
  return f.format(fromPiastres(p));
}

/** Plain "45.50" for editable inputs. */
export function toInputValue(p: Piastres): string {
  return fromPiastres(p).toFixed(2);
}
