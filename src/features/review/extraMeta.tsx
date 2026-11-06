import { BadgePercent, Bike, Coins, HandPlatter, Landmark, Receipt } from 'lucide-react';
import type { ExtraKind } from '@/core/types';

/** Icon + colour for each kind of extra charge. */
export const EXTRA_META: Record<ExtraKind, { Icon: typeof Receipt; color: string }> = {
  tax: { Icon: Landmark, color: 'text-violet bg-violet/15' },
  service: { Icon: HandPlatter, color: 'text-pink bg-pink/15' },
  delivery: { Icon: Bike, color: 'text-orange bg-orange/15' },
  tip: { Icon: Coins, color: 'text-yellow-300 bg-yellow-300/15' },
  discount: { Icon: BadgePercent, color: 'text-lime bg-lime/15' },
  other: { Icon: Receipt, color: 'text-sky-300 bg-sky-300/15' },
};

/** Egyptian defaults: 12% service on the subtotal, 14% VAT on subtotal + service. */
export const EGYPT_RATES = { service: 0.12, tax: 0.14 } as const;
