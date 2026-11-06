/**
 * Domain model. All money values are integers in piastres
 * (1 EGP = 100 piastres) to avoid floating-point rounding errors.
 */
export type Piastres = number;

export interface Person {
  id: string;
  name: string;
  /** Index into the avatar palette. */
  color: number;
}

export interface Item {
  id: string;
  name: string;
  quantity: number;
  /** Line total (quantity × unit price). */
  price: Piastres;
  /** IDs of the people who share this item. */
  assignees: string[];
}

export type ExtraKind = 'tax' | 'service' | 'delivery' | 'tip' | 'discount' | 'other';

/**
 * How an extra charge is distributed:
 *  - proportional: by each person's share of the items (fair for tax/service)
 *  - equal: same amount for everyone (fair for flat fees like delivery)
 */
export type SplitMode = 'proportional' | 'equal';

export interface Extra {
  id: string;
  kind: ExtraKind;
  label: string;
  /** Always positive. Discounts are subtracted based on `kind`. */
  amount: Piastres;
  splitMode: SplitMode;
}

/** What the receipt parser returns — no IDs or assignments yet. */
export interface ParsedReceipt {
  merchant?: string;
  items: Array<Pick<Item, 'name' | 'quantity' | 'price'>>;
  extras: Array<Pick<Extra, 'kind' | 'label' | 'amount'>>;
  subtotal?: Piastres;
  total?: Piastres;
}
