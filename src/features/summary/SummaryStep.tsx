import { useMemo, useState } from 'react';
import { useI18n } from '@/i18n';
import { useBill } from '@/store/billStore';
import { computeSplit, type ShareLine } from '@/core/split';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/layout/Screen';
import { buildShareText } from './shareText';

export function SummaryStep() {
  const { dict, money } = useI18n();
  const d = dict.summary;
  const { items, extras, people, merchant, reset } = useBill();
  const split = useMemo(() => computeSplit(items, extras, people), [items, extras, people]);
  const [copied, setCopied] = useState(false);

  const text = buildShareText(split, merchant, dict, money);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  };
  const share = async () => {
    if (!navigator.share) return copy();
    try {
      await navigator.share({ text });
    } catch {
      /* user cancelled */
    }
  };

  return (
    <Screen
      title={d.title}
      subtitle={d.subtitle}
      primary={
        <Button variant="primary" size="lg" className="flex-1" onClick={reset}>
          {d.newBill}
        </Button>
      }
    >
      <section className="card p-4">
        <p className="text-sm text-muted">
          {d.totalBill}
          {merchant && ` · ${merchant}`}
        </p>
        <p className="mt-1 font-mono text-3xl font-bold">{money(split.grandTotal)}</p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Button size="sm" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')}>
            {d.whatsapp}
          </Button>
          <Button size="sm" onClick={copy}>
            {copied ? d.copied : d.copy}
          </Button>
          <Button size="sm" onClick={share}>
            {d.share}
          </Button>
        </div>
      </section>

      <ul className="card divide-y divide-line">
        {split.shares.map((s) => (
          <li key={s.person.id}>
            {/* Native disclosure: tap a person to see their breakdown. */}
            <details>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
                <span className="min-w-0 truncate font-semibold">{s.person.name}</span>
                <span className="font-mono font-semibold text-accent">{money(s.total)}</span>
              </summary>
              <div className="px-4 pb-4 text-sm">
                <Lines title={d.items} lines={s.items} money={money} />
                {s.extras.length > 0 && <Lines title={d.fees} lines={s.extras} money={money} />}
              </div>
            </details>
          </li>
        ))}
      </ul>
    </Screen>
  );
}

function Lines({ title, lines, money }: { title: string; lines: ShareLine[]; money: (p: number) => string }) {
  return (
    <div className="mt-2 first:mt-0">
      <p className="mb-1 text-xs font-semibold text-muted uppercase">{title}</p>
      {lines.map((l) => (
        <div key={l.id} className="flex justify-between gap-3 py-0.5">
          <span className="min-w-0 truncate">{l.label}</span>
          <span className="font-mono">{money(l.amount)}</span>
        </div>
      ))}
    </div>
  );
}
