import { useI18n } from '@/i18n';
import { useBill } from '@/store/billStore';
import { signedAmount } from '@/core/split';
import type { ExtraKind, SplitMode } from '@/core/types';
import { Button } from '@/components/ui/Button';
import { MoneyInput } from '@/components/ui/MoneyInput';
import { RemoveButton } from '@/components/ui/RemoveButton';
import { Screen } from '@/components/layout/Screen';

/** Egyptian defaults: 12% service on the subtotal, 14% VAT on subtotal + service. */
const RATES = { service: 0.12, tax: 0.14 } as const;

const QUICK_ADD: ExtraKind[] = ['tax', 'service', 'delivery', 'tip', 'discount', 'other'];

export function ReviewStep() {
  const { dict, t, money } = useI18n();
  const d = dict.review;
  const s = useBill();

  const subtotal = s.items.reduce((a, i) => a + i.price, 0);
  const extrasTotal = s.extras.reduce((a, e) => a + signedAmount(e), 0);
  const total = subtotal + extrasTotal;
  const diff = s.detectedTotal !== null ? total - s.detectedTotal : null;

  const quickAdd = (kind: ExtraKind) => {
    const service = s.extras.filter((e) => e.kind === 'service').reduce((a, e) => a + e.amount, 0);
    const amount =
      kind === 'service' ? Math.round(subtotal * RATES.service) : kind === 'tax' ? Math.round((subtotal + service) * RATES.tax) : 0;
    const label = kind === 'service' ? `${dict.extraKinds.service} 12%` : kind === 'tax' ? `${dict.extraKinds.tax} 14%` : dict.extraKinds[kind];
    s.addExtra(kind, label, amount);
  };

  return (
    <Screen
      title={d.title}
      subtitle={d.subtitle}
      canContinue={s.items.some((i) => i.price > 0)}
      note={
        <div className="flex items-center justify-between font-semibold">
          <span>{d.total}</span>
          <span className="font-mono">{money(total)}</span>
        </div>
      }
    >
      <input value={s.merchant} onChange={(e) => s.setMerchant(e.target.value)} placeholder={d.merchantPlaceholder} className="input" />

      <section className="card p-3">
        <h2 className="mb-2 font-semibold">
          {d.items} <span className="text-muted">({s.items.length})</span>
        </h2>
        {s.items.length === 0 && <p className="py-3 text-sm text-muted">{d.empty}</p>}
        <ul className="flex flex-col gap-2">
          {s.items.map((item) => (
            <li key={item.id} className="flex items-center gap-2">
              {item.quantity > 1 && <span className="text-sm text-muted">{item.quantity}×</span>}
              <input
                value={item.name}
                onChange={(e) => s.updateItem(item.id, { name: e.target.value })}
                placeholder={d.itemName}
                aria-label={d.itemName}
                className="input flex-1"
              />
              <MoneyInput value={item.price} onChange={(price) => s.updateItem(item.id, { price })} ariaLabel={d.price} className="w-24" />
              <RemoveButton label={d.remove} onClick={() => s.removeItem(item.id)} />
            </li>
          ))}
        </ul>
        <Button variant="ghost" size="sm" className="mt-2" onClick={s.addItem}>
          + {d.addItem}
        </Button>
      </section>

      <section className="card p-3">
        <h2 className="mb-2 font-semibold">{d.extras}</h2>
        {s.extras.length === 0 && <p className="pb-2 text-sm text-muted">{d.noExtras}</p>}
        <ul className="flex flex-col gap-3">
          {s.extras.map((extra) => (
            <li key={extra.id} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <input
                  value={extra.label}
                  onChange={(e) => s.updateExtra(extra.id, { label: e.target.value })}
                  aria-label={d.extras}
                  className="input flex-1"
                />
                {extra.kind === 'discount' && <span className="font-mono">−</span>}
                <MoneyInput value={extra.amount} onChange={(amount) => s.updateExtra(extra.id, { amount })} ariaLabel={d.price} className="w-24" />
                <RemoveButton label={d.remove} onClick={() => s.removeExtra(extra.id)} />
              </div>
              <select
                value={extra.splitMode}
                onChange={(e) => s.updateExtra(extra.id, { splitMode: e.target.value as SplitMode })}
                className="h-9 self-start rounded-lg border border-line bg-card px-2 text-muted"
              >
                <option value="proportional">{d.splitProportional}</option>
                <option value="equal">{d.splitEqual}</option>
              </select>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_ADD.map((kind) => (
            <Button key={kind} size="sm" onClick={() => quickAdd(kind)}>
              + {dict.extraKinds[kind]}
              {kind === 'tax' && ' 14%'}
              {kind === 'service' && ' 12%'}
            </Button>
          ))}
        </div>
      </section>

      <section className="card p-3 text-sm">
        <Row label={d.subtotal} value={money(subtotal)} />
        <Row label={d.extras} value={money(extrasTotal)} />
        {s.detectedTotal !== null && <Row label={d.receiptSays} value={money(s.detectedTotal)} />}
        {diff !== null && (
          <p className={Math.abs(diff) <= 1 ? 'mt-2 text-accent' : 'mt-2 text-amber-600 dark:text-amber-400'}>
            {Math.abs(diff) <= 1 ? d.matches : t(d.mismatch, { amount: money(Math.abs(diff)) })}
          </p>
        )}
      </section>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-muted">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}
