import { describe, expect, it } from 'vitest';
import { allocate, computeSplit } from './split';
import { parseAmount } from './money';
import type { Extra, Item, Person } from './types';

describe('allocate', () => {
  it('always sums to the exact total', () => {
    expect(allocate(1000, [1, 1, 1])).toEqual([334, 333, 333]);
    expect(allocate(-100, [1, 1, 1]).reduce((a, b) => a + b)).toBe(-100);
  });
  it('splits proportionally', () => {
    expect(allocate(300, [100, 200])).toEqual([100, 200]);
  });
  it('falls back to equal when all weights are zero', () => {
    expect(allocate(10, [0, 0])).toEqual([5, 5]);
  });
});

describe('computeSplit', () => {
  const people: Person[] = [
    { id: 'a', name: 'Ali', color: 0 },
    { id: 'b', name: 'Sara', color: 1 },
  ];
  const items: Item[] = [
    { id: '1', name: 'Burger', quantity: 1, price: 20000, assignees: ['a'] },
    { id: '2', name: 'Fries', quantity: 1, price: 6000, assignees: ['a', 'b'] },
    { id: '3', name: 'Salad', quantity: 1, price: 4000, assignees: ['b'] },
  ];
  const extras: Extra[] = [
    { id: 't', kind: 'tax', label: 'VAT', amount: 4200, splitMode: 'proportional' },
    { id: 'd', kind: 'delivery', label: 'Delivery', amount: 2000, splitMode: 'equal' },
    { id: 'x', kind: 'discount', label: 'Promo', amount: 3000, splitMode: 'proportional' },
  ];

  it('splits items, proportional and equal extras, and discounts', () => {
    const r = computeSplit(items, extras, people);
    const [ali, sara] = r.shares;
    expect(ali.itemsTotal).toBe(23000);
    expect(sara.itemsTotal).toBe(7000);
    expect(r.grandTotal).toBe(30000 + 4200 + 2000 - 3000);
    expect(ali.total + sara.total).toBe(r.grandTotal);
    // Ali ate 23/30 of the food → pays 23/30 of the VAT.
    expect(ali.extras.find((e) => e.id === 't')!.amount).toBe(3220);
    expect(ali.extras.find((e) => e.id === 'd')!.amount).toBe(1000);
  });

  it('reports unassigned items', () => {
    const r = computeSplit([{ ...items[0], assignees: [] }], [], people);
    expect(r.unassigned).toHaveLength(1);
  });
});

describe('parseAmount', () => {
  it.each([
    ['1,250.50', 125050],
    ['1.250,50', 125050],
    ['45,50', 4550],
    ['1,250', 125000],
    ['٤٥٫٥٠', 4550],
    ['abc', null],
  ])('%s → %s', (input, expected) => {
    expect(parseAmount(input)).toBe(expected);
  });
});
