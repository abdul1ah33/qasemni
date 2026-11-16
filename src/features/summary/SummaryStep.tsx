import clsx from 'clsx';
import { Check, ChevronDown, Copy, MessageCircle, Receipt, Share2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useI18n } from '@/i18n';
import { useBill } from '@/store/billStore';
import { computeSplit, type PersonShare } from '@/core/split';
import { Avatar } from '@/components/ui/Avatar';
import { Money } from '@/components/ui/Money';
import { Button } from '@/components/ui/Button';
import { StepLayout } from '@/components/layout/StepLayout';
import { buildShareText } from './shareText';

export function SummaryStep() {
  const { dict, money } = useI18n();
  const d = dict.summary;
  const { items, extras, people, merchant, reset } = useBill();
  const split = useMemo(() => computeSplit(items, extras, people), [items, extras, people]);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  const text = buildShareText(split, merchant, dict, money);
  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        /* user cancelled */
      }
    } else copy();
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  };

  const maxTotal = Math.max(1, ...split.shares.map((s) => s.total));

  return (
    <StepLayout
      title={d.title}
      subtitle={d.subtitle}
      primary={
        <Button variant="primary" size="lg" className="flex-1" onClick={reset} icon={<Receipt className="h-5 w-5" />}>
          {d.newBill}
        </Button>
      }
    >
      {/* Hero total */}
      <section
        className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,var(--color-violet),var(--color-pink)_55%,var(--color-orange))] p-6 text-ink"
      >
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-[radial-gradient(closest-side,rgb(255_255_255/0.3),transparent)]" />
        <p className="text-sm font-semibold opacity-80">
          {d.totalBill}
          {merchant && ` · ${merchant}`}
        </p>
        <Money value={split.grandTotal} className="mt-1 block font-mono text-4xl font-extrabold tracking-tight sm:text-5xl" />
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" className="bg-ink/85 text-white hover:bg-ink" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')} icon={<MessageCircle className="h-4 w-4" />}>
            {d.whatsapp}
          </Button>
          <Button size="sm" className="bg-white/30 text-ink hover:bg-white/45" onClick={copy} icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}>
            {copied ? d.copied : d.copy}
          </Button>
          <Button size="sm" className="bg-white/30 text-ink hover:bg-white/45" onClick={share} icon={<Share2 className="h-4 w-4" />}>
            {d.share}
          </Button>
        </div>
      </section>

      <ul className="flex flex-col gap-3">
        {split.shares.map((s) => (
          <PersonCard
            key={s.person.id}
            share={s}
            ratio={s.total / maxTotal}
            open={open === s.person.id}
            onToggle={() => setOpen(open === s.person.id ? null : s.person.id)}
          />
        ))}
      </ul>
    </StepLayout>
  );
}

function PersonCard({ share, ratio, open, onToggle }: { share: PersonShare; ratio: number; open: boolean; onToggle: () => void }) {
  const { dict, t, money } = useI18n();
  return (
    <li className="glass overflow-hidden rounded-3xl">
      <button onClick={onToggle} className="relative flex w-full cursor-pointer items-center gap-3 p-4 text-start">
        {/* relative share bar */}
        <span className="absolute inset-y-0 start-0 bg-white/[0.04]" style={{ width: `${ratio * 100}%` }} />
        <Avatar person={share.person} size={44} className="relative" />
        <div className="relative min-w-0 flex-1">
          <p className="truncate font-bold">{share.person.name}</p>
          <p className="text-xs text-mute">
            {t(dict.summary.itemsCount, { n: share.items.length })}
          </p>
        </div>
        <Money value={share.total} className="relative font-mono text-lg font-bold text-lime" />
        <span className={clsx('relative text-mute', open && 'rotate-180')}>
          <ChevronDown className="h-5 w-5" />
        </span>
      </button>

        {open && (
            <div className="mx-4 mb-4 border-t border-dashed border-line pt-3 text-sm">
              {share.items.map((l) => (
                <Line key={l.id} label={l.label} value={money(l.amount)} />
              ))}
              {share.extras.length > 0 && <div className="my-2 border-t border-line/60" />}
              {share.extras.map((l) => (
                <Line key={l.id} label={l.label} value={money(l.amount)} muted />
              ))}
            </div>
        )}
    </li>
  );
}

function Line({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className={clsx('flex justify-between gap-3 py-0.5', muted && 'text-mute')}>
      <span className="truncate">{label}</span>
      <span className="font-mono tabular-nums">{value}</span>
    </div>
  );
}
