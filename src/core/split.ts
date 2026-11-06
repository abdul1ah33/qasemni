import type { Extra, Item, Person, Piastres } from './types';

export interface ShareLine {
  id: string;
  label: string;
  amount: Piastres;
}

export interface PersonShare {
  person: Person;
  items: ShareLine[];
  extras: ShareLine[];
  itemsTotal: Piastres;
  extrasTotal: Piastres;
  total: Piastres;
}

export interface SplitResult {
  shares: PersonShare[];
  unassigned: Item[];
  subtotal: Piastres;
  extrasTotal: Piastres;
  grandTotal: Piastres;
}

export const signedAmount = (e: Pick<Extra, 'kind' | 'amount'>): Piastres =>
  e.kind === 'discount' ? -Math.abs(e.amount) : Math.abs(e.amount);

/**
 * Splits an integer `total` into parts proportional to `weights`, using the
 * largest-remainder method so the parts always add up to exactly `total`.
 * Zero/empty weights fall back to an equal split.
 */
export function allocate(total: Piastres, weights: number[]): Piastres[] {
  const n = weights.length;
  if (n === 0) return [];
  const sign = total < 0 ? -1 : 1;
  const abs = Math.abs(total);

  const sumW = weights.reduce((a, b) => a + Math.max(0, b), 0);
  const w = sumW > 0 ? weights.map((x) => Math.max(0, x)) : weights.map(() => 1);
  const totalW = sumW > 0 ? sumW : n;

  const exact = w.map((x) => (abs * x) / totalW);
  const parts = exact.map(Math.floor);
  let leftover = abs - parts.reduce((a, b) => a + b, 0);

  // Give the leftover piastres to the largest fractional remainders.
  const order = exact
    .map((x, i) => ({ i, r: x - Math.floor(x) }))
    .sort((a, b) => b.r - a.r || a.i - b.i);
  for (let k = 0; leftover > 0; k = (k + 1) % n, leftover--) parts[order[k].i]++;

  return parts.map((p) => p * sign);
}

/**
 * The heart of the app: who owes what.
 *  1. Each item is split equally between the people who shared it.
 *  2. Each extra (tax, service, delivery, discount…) is split either in
 *     proportion to what each person ordered, or equally.
 */
export function computeSplit(items: Item[], extras: Extra[], people: Person[]): SplitResult {
  const index = new Map(people.map((p, i) => [p.id, i]));
  const shares: PersonShare[] = people.map((person) => ({
    person,
    items: [],
    extras: [],
    itemsTotal: 0,
    extrasTotal: 0,
    total: 0,
  }));
  const unassigned: Item[] = [];

  for (const item of items) {
    const who = item.assignees.filter((id) => index.has(id));
    if (who.length === 0) {
      unassigned.push(item);
      continue;
    }
    const parts = allocate(item.price, who.map(() => 1));
    who.forEach((id, k) => {
      const s = shares[index.get(id)!];
      s.items.push({ id: item.id, label: item.name, amount: parts[k] });
      s.itemsTotal += parts[k];
    });
  }

  if (people.length > 0) {
    const weights = shares.map((s) => s.itemsTotal);
    for (const extra of extras) {
      const amount = signedAmount(extra);
      if (amount === 0) continue;
      const parts = allocate(amount, extra.splitMode === 'equal' ? people.map(() => 1) : weights);
      shares.forEach((s, k) => {
        s.extras.push({ id: extra.id, label: extra.label, amount: parts[k] });
        s.extrasTotal += parts[k];
      });
    }
  }

  for (const s of shares) s.total = s.itemsTotal + s.extrasTotal;

  const subtotal = items.reduce((a, i) => a + i.price, 0);
  const extrasTotal = extras.reduce((a, e) => a + signedAmount(e), 0);
  return { shares, unassigned, subtotal, extrasTotal, grandTotal: subtotal + extrasTotal };
}
