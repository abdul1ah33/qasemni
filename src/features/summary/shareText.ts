import type { SplitResult } from '@/core/split';
import type { Dictionary } from '@/i18n/en';

/** Builds the plain-text message sent to WhatsApp / clipboard. */
export function buildShareText(
  split: SplitResult,
  merchant: string,
  dict: Dictionary,
  money: (p: number) => string,
): string {
  const lines = [`🧾 *${dict.summary.shareHeader}*${merchant ? ` — ${merchant}` : ''}`, ''];
  for (const s of split.shares) lines.push(`• ${s.person.name}: *${money(s.total)}*`);
  lines.push('', `${dict.summary.totalBill}: ${money(split.grandTotal)}`);
  return lines.join('\n');
}
