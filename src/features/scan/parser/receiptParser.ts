import { normalizeDigits, parseAmount } from '@/core/money';
import type { ExtraKind, ParsedReceipt, Piastres } from '@/core/types';
import { classifyLine, type LineKind } from './keywords';

/**
 * Turns raw OCR text into structured receipt data using heuristics.
 * It is deliberately forgiving: anything it gets wrong can be fixed by the
 * user on the Review step.
 */

// A number that isn't glued to letters: 1,250.00 | 45.5 | 12
const NUMBER_RE = /(?<![\p{L}\d])-?\d{1,3}(?:,\d{3})+(?:[.,]\d{1,2})?(?![\p{L}\d])|(?<![\p{L}\d])-?\d+(?:[.,]\d{1,2})?(?![\p{L}\d])/gu;
const CURRENCY_RE = /\b(?:EGP|L\.?E\.?)(?![\p{L}])|ج\.?\s?م\.?|جنيه(?:ا)?|£/giu;
const PERCENT_RE = /-?\d+(?:[.,]\d+)?\s*%/g;
const DATE_RE = /\b\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}\b|\b\d{4}[/\-.]\d{1,2}[/\-.]\d{1,2}\b|\b\d{1,2}:\d{2}\b/;
const QTY_PREFIX_RE = /^\s*(\d{1,2})\s*[x×*]\s*/i;
const QTY_SUFFIX_RE = /\s*[x×*]\s*(\d{1,2})(?![\d.,])/i;
// "2 x 20.00" → quantity × unit price
const MULT_RE = /(?<![\d.,])(\d{1,2})\s*[x×*]\s*(\d+(?:[.,]\d{1,2})?)(?![\d.,])/;
const LETTERS_RE = /[\p{L}]{2,}/u;

interface NumberToken {
  raw: string;
  value: Piastres;
  hasDecimals: boolean;
  index: number;
}

export function normalizeLine(line: string): string {
  return normalizeDigits(line)
    .replace(/[|¦_~`"“”]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractNumbers(line: string): NumberToken[] {
  const out: NumberToken[] = [];
  for (const m of line.matchAll(NUMBER_RE)) {
    const value = parseAmount(m[0]);
    if (value === null) continue;
    out.push({ raw: m[0], value, hasDecimals: /[.,]\d{1,2}$/.test(m[0]), index: m.index ?? 0 });
  }
  return out;
}

function cleanName(s: string): string {
  return s
    .replace(NUMBER_RE, ' ')
    .replace(/[@#:;=*•·.\-–—,()[\]{}]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Picks the most likely price on a line: the right-most number with decimals, else the right-most number. */
function pickPrice(nums: NumberToken[]): NumberToken | undefined {
  const withDecimals = nums.filter((n) => n.hasDecimals);
  return (withDecimals.length ? withDecimals : nums).at(-1);
}

interface ParsedItemLine {
  name: string;
  quantity: number;
  price: Piastres;
}

export function parseItemLine(line: string): ParsedItemLine | null {
  let text = normalizeLine(line).replace(CURRENCY_RE, ' ').replace(PERCENT_RE, ' ');
  let quantity: number | null = null;
  let unitPrice: Piastres | null = null;

  const mult = text.match(MULT_RE);
  const pre = text.match(QTY_PREFIX_RE);
  if (mult) {
    quantity = Number(mult[1]);
    unitPrice = parseAmount(mult[2]);
    text = text.replace(MULT_RE, ' ');
  } else if (pre) {
    quantity = Number(pre[1]);
    text = text.replace(QTY_PREFIX_RE, ' ');
  } else {
    const suf = text.match(QTY_SUFFIX_RE);
    if (suf) {
      quantity = Number(suf[1]);
      text = text.replace(QTY_SUFFIX_RE, ' ');
    }
  }

  const nums = extractNumbers(text);
  const priceTok = pickPrice(nums);
  const name = cleanName(text);
  if (!LETTERS_RE.test(name)) return null;

  if (!priceTok) {
    // Only "qty × unit" was written — compute the line total.
    return unitPrice && quantity ? { name, quantity, price: unitPrice * quantity } : null;
  }
  if (priceTok.value <= 0) return null;

  // A whole number followed by words ("26 July St") is an address, not a price.
  const after = text.slice(priceTok.index + priceTok.raw.length);
  if (!priceTok.hasDecimals && LETTERS_RE.test(after)) return null;

  // Remaining numbers may be "qty unit-price" columns: "Burger 2 45.00 90.00"
  const others = nums.filter((n) => n !== priceTok);
  if (quantity === null) {
    const qtyTok = others.find((n) => !n.hasDecimals && n.value >= 100 && n.value <= 5000);
    if (qtyTok) quantity = qtyTok.value / 100;
  }

  return { name, quantity: quantity && quantity > 0 ? quantity : 1, price: priceTok.value };
}

const EXTRA_KINDS: ReadonlySet<LineKind> = new Set<LineKind>(['tax', 'service', 'delivery', 'tip', 'discount']);

export function parseReceiptText(raw: string): ParsedReceipt {
  const lines = raw.split(/\r?\n/).map(normalizeLine).filter(Boolean);
  const result: ParsedReceipt = { items: [], extras: [] };
  const totals: Piastres[] = [];
  let seenFirstPrice = false;

  for (const line of lines) {
    const kind = classifyLine(line);
    if (kind === 'ignore') continue;

    const amountTok = pickPrice(extractNumbers(line.replace(CURRENCY_RE, ' ').replace(PERCENT_RE, ' ')));

    if (kind === 'subtotal') {
      if (amountTok) result.subtotal = Math.abs(amountTok.value);
      continue;
    }
    if (kind === 'total') {
      if (amountTok) totals.push(Math.abs(amountTok.value));
      continue;
    }
    if (EXTRA_KINDS.has(kind)) {
      if (amountTok && amountTok.value !== 0) {
        result.extras.push({
          kind: kind as ExtraKind,
          label: cleanName(line.replace(CURRENCY_RE, ' ').replace(PERCENT_RE, ' ')) || kind,
          amount: Math.abs(amountTok.value),
        });
      }
      continue;
    }

    // Skip dates/times — they look like numbers but aren't prices.
    if (DATE_RE.test(line)) continue;

    const item = parseItemLine(line);
    if (item) {
      // Negative standalone lines are discounts.
      if (/(^|\s)-\d/.test(line)) {
        result.extras.push({ kind: 'discount', label: item.name, amount: item.price });
      } else {
        result.items.push(item);
      }
      seenFirstPrice = true;
    } else if (!seenFirstPrice && !result.merchant && LETTERS_RE.test(line) && !/\d{3,}/.test(line)) {
      // The first meaningful text line above the items is usually the shop name.
      result.merchant = cleanName(line);
    }
  }

  if (totals.length) result.total = Math.max(...totals);
  return result;
}
