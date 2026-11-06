import clsx from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, ImageIcon, Plus, Store, Trash2, TriangleAlert, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useI18n } from '@/i18n';
import { useBill } from '@/store/billStore';
import { signedAmount } from '@/core/split';
import type { ExtraKind, SplitMode } from '@/core/types';
import { Button } from '@/components/ui/Button';
import { MoneyInput } from '@/components/ui/MoneyInput';
import { AnimatedMoney } from '@/components/ui/AnimatedMoney';
import { StepLayout, fadeUp } from '@/components/layout/StepLayout';
import { EGYPT_RATES, EXTRA_META } from './extraMeta';

const rowAnim = {
  layout: true,
  initial: { opacity: 0, y: -8, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, x: 40, transition: { duration: 0.18 } },
  transition: { type: 'spring' as const, stiffness: 400, damping: 32 },
};

export function ReviewStep() {
  const { dict, t, money } = useI18n();
  const d = dict.review;
  const s = useBill();
  const [lightbox, setLightbox] = useState(false);

  const subtotal = useMemo(() => s.items.reduce((a, i) => a + i.price, 0), [s.items]);
  const extrasTotal = useMemo(() => s.extras.reduce((a, e) => a + signedAmount(e), 0), [s.extras]);
  const total = subtotal + extrasTotal;
  const diff = s.detectedTotal !== null ? total - s.detectedTotal : null;
  const canContinue = s.items.some((i) => i.price > 0);

  const quickAdd = (kind: ExtraKind) => {
    const service = s.extras.filter((e) => e.kind === 'service').reduce((a, e) => a + e.amount, 0);
    const amount =
      kind === 'service' ? Math.round(subtotal * EGYPT_RATES.service) : kind === 'tax' ? Math.round((subtotal + service) * EGYPT_RATES.tax) : 0;
    const label = kind === 'service' ? `${dict.extraKinds.service} 12%` : kind === 'tax' ? `${dict.extraKinds.tax} 14%` : dict.extraKinds[kind];
    s.addExtra(kind, label, amount);
  };

  return (
    <StepLayout
      title={d.title}
      subtitle={d.subtitle}
      canContinue={canContinue}
      footerNote={
        <div className="glass flex items-center justify-between rounded-2xl px-4 py-3">
          <span className="text-sm text-mute">{d.total}</span>
          <AnimatedMoney value={total} className="font-mono text-xl font-bold text-lime" />
        </div>
      }
    >
      {/* Merchant + receipt thumbnail */}
      <motion.section variants={fadeUp} className="glass flex items-center gap-3 rounded-3xl p-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/5">
          <Store className="h-5 w-5 text-mute" />
        </div>
        <input
          value={s.merchant}
          onChange={(e) => s.setMerchant(e.target.value)}
          placeholder={d.merchantPlaceholder}
          aria-label={d.merchant}
          className="field text-lg font-bold"
        />
        {s.imageUrl && (
          <button
            onClick={() => setLightbox(true)}
            className="relative h-12 w-12 shrink-0 cursor-pointer overflow-hidden rounded-2xl ring-1 ring-line transition hover:ring-lime"
            aria-label={d.viewReceipt}
          >
            <img src={s.imageUrl} alt="" className="h-full w-full object-cover" />
            <ImageIcon className="absolute right-1 bottom-1 h-3.5 w-3.5 drop-shadow" />
          </button>
        )}
      </motion.section>

      {/* Items */}
      <motion.section variants={fadeUp} className="glass rounded-3xl p-3 sm:p-4">
        <div className="mb-2 flex items-center justify-between px-2">
          <h2 className="font-bold">
            {d.items} <span className="text-mute">· {s.items.length}</span>
          </h2>
          <span className="hidden gap-6 pe-12 text-xs text-mute sm:flex">
            <span className="w-12 text-center">{d.qty}</span>
            <span className="w-24 text-end">{d.price}</span>
          </span>
        </div>

        <ul className="flex flex-col">
          <AnimatePresence initial={false}>
            {s.items.map((item) => (
              <motion.li key={item.id} {...rowAnim} className="group flex items-center gap-1 border-b border-line/60 py-1 last:border-0 sm:gap-2">
                <input
                  value={item.name}
                  onChange={(e) => s.updateItem(item.id, { name: e.target.value })}
                  placeholder={d.itemName}
                  aria-label={d.itemName}
                  className="field min-w-0 flex-1 font-medium"
                  autoFocus={!item.name}
                />
                <div className="flex items-center rounded-xl bg-white/[0.03]">
                  <span className="ps-2 text-xs text-mute">×</span>
                  <input
                    inputMode="numeric"
                    value={item.quantity}
                    onChange={(e) => s.updateItem(item.id, { quantity: Math.max(1, parseInt(e.target.value.replace(/\D/g, '')) || 1) })}
                    aria-label={d.qty}
                    className="field w-9 px-1 text-center font-mono"
                  />
                </div>
                <MoneyInput value={item.price} onChange={(price) => s.updateItem(item.id, { price })} ariaLabel={d.price} className="w-20 text-end sm:w-24" />
                <button
                  onClick={() => s.removeItem(item.id)}
                  className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-xl text-mute transition hover:bg-red-500/10 hover:text-red-400 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                  aria-label="remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        {s.items.length === 0 && <p className="px-2 py-6 text-center text-sm text-mute">{d.empty}</p>}

        <Button variant="ghost" size="sm" className="mt-2 w-full border border-dashed border-line" onClick={s.addItem} icon={<Plus className="h-4 w-4" />}>
          {d.addItem}
        </Button>
      </motion.section>

      {/* Extras */}
      <motion.section variants={fadeUp} className="glass rounded-3xl p-3 sm:p-4">
        <h2 className="mb-2 px-2 font-bold">{d.extras}</h2>
        <ul className="flex flex-col gap-1">
          <AnimatePresence initial={false}>
            {s.extras.map((extra) => {
              const { Icon, color } = EXTRA_META[extra.kind];
              return (
                <motion.li key={extra.id} {...rowAnim} className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl p-1 sm:flex-nowrap">
                  <span className={clsx('grid h-9 w-9 shrink-0 place-items-center rounded-xl', color)}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <input
                    value={extra.label}
                    onChange={(e) => s.updateExtra(extra.id, { label: e.target.value })}
                    className="field min-w-0 flex-1 font-medium"
                    aria-label="label"
                  />
                  <div className="flex items-center gap-1">
                    {extra.kind === 'discount' && <span className="font-mono text-lime">−</span>}
                    <MoneyInput value={extra.amount} onChange={(amount) => s.updateExtra(extra.id, { amount })} className="w-24 text-end" />
                  </div>
                  {/* On phones the controls wrap onto their own line. */}
                  <div className="flex w-full items-center justify-end gap-1 sm:w-auto">
                    <SplitModeToggle
                      value={extra.splitMode}
                      onChange={(splitMode) => s.updateExtra(extra.id, { splitMode })}
                      labels={[d.splitProportional, d.splitEqual]}
                    />
                    <button
                      onClick={() => s.removeExtra(extra.id)}
                      className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-xl text-mute transition hover:bg-red-500/10 hover:text-red-400"
                      aria-label="remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>

        <div className="mt-3 flex flex-wrap gap-2 px-1">
          {(['tax', 'service', 'delivery', 'tip', 'discount', 'other'] as ExtraKind[]).map((kind) => {
            const { Icon, color } = EXTRA_META[kind];
            return (
              <motion.button
                key={kind}
                whileTap={{ scale: 0.92 }}
                onClick={() => quickAdd(kind)}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-white/[0.03] py-1 ps-1 pe-3 text-xs font-semibold transition hover:bg-white/[0.08]"
              >
                <span className={clsx('grid h-6 w-6 place-items-center rounded-full', color)}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                {dict.extraKinds[kind]}
                {kind === 'tax' && <span className="text-mute">14%</span>}
                {kind === 'service' && <span className="text-mute">12%</span>}
              </motion.button>
            );
          })}
        </div>
      </motion.section>

      {/* Totals check */}
      <motion.section variants={fadeUp} className="glass rounded-3xl p-4 text-sm">
        <Row label={d.subtotal} value={money(subtotal)} />
        <Row label={d.extras} value={money(extrasTotal)} />
        {s.detectedTotal !== null && <Row label={d.receiptSays} value={money(s.detectedTotal)} />}
        <AnimatePresence mode="wait">
          {diff !== null && (
            <motion.p
              key={diff === 0 ? 'ok' : 'off'}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={clsx('mt-3 flex items-center gap-2 rounded-xl p-2.5 text-xs font-medium', Math.abs(diff) <= 1 ? 'bg-lime/10 text-lime' : 'bg-orange/10 text-orange')}
            >
              {Math.abs(diff) <= 1 ? <CheckCircle2 className="h-4 w-4" /> : <TriangleAlert className="h-4 w-4" />}
              {Math.abs(diff) <= 1 ? d.matches : t(d.mismatch, { amount: money(Math.abs(diff)) })}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.section>

      <AnimatePresence>
        {lightbox && s.imageUrl && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
          >
            <motion.img
              src={s.imageUrl}
              alt=""
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-h-[90vh] max-w-full rounded-2xl"
            />
            <X className="absolute top-5 right-5 h-6 w-6" />
          </motion.div>
        )}
      </AnimatePresence>
    </StepLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-mute">{label}</span>
      <span className="font-mono tabular-nums">{value}</span>
    </div>
  );
}

function SplitModeToggle({
  value,
  onChange,
  labels,
}: {
  value: SplitMode;
  onChange: (v: SplitMode) => void;
  labels: [string, string];
}) {
  const options: SplitMode[] = ['proportional', 'equal'];
  return (
    <div className="flex rounded-full bg-white/5 p-0.5 text-[11px] font-semibold">
      {options.map((o, i) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={clsx('cursor-pointer rounded-full px-2.5 py-1 transition-colors', value === o ? 'bg-white text-ink' : 'text-mute hover:text-white')}
        >
          {labels[i]}
        </button>
      ))}
    </div>
  );
}
