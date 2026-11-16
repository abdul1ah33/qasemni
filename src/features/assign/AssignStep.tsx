import clsx from 'clsx';
import { Check, Equal, Users } from 'lucide-react';
import { useMemo } from 'react';
import { useI18n } from '@/i18n';
import { useBill } from '@/store/billStore';
import { computeSplit } from '@/core/split';
import { Avatar } from '@/components/ui/Avatar';
import { Money } from '@/components/ui/Money';
import { Button } from '@/components/ui/Button';
import { StepLayout } from '@/components/layout/StepLayout';

export function AssignStep() {
  const { dict, t, money } = useI18n();
  const d = dict.assign;
  const { items, extras, people, toggleAssignee, setItemEveryone, assignUnassignedToEveryone, splitEverythingEqually } = useBill();

  const split = useMemo(() => computeSplit(items, extras, people), [items, extras, people]);
  const assigned = items.length - split.unassigned.length;
  const allAssigned = split.unassigned.length === 0 && items.length > 0;

  return (
    <StepLayout
      title={d.title}
      subtitle={d.subtitle}
      canContinue={allAssigned}
      footerNote={
        !allAssigned && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-orange/25 bg-orange/10 px-4 py-2.5 text-xs">
            <span className="text-orange">{d.unassignedHint}</span>
            <Button size="sm" variant="soft" onClick={assignUnassignedToEveryone} icon={<Users className="h-4 w-4" />}>
              {d.assignRest}
            </Button>
          </div>
        )
      }
    >
      {/* Live tally */}
      <section className="glass -mx-1 rounded-3xl p-3">
        <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none]">
          {split.shares.map((s) => (
            <div key={s.person.id} className="flex min-w-[5.5rem] flex-col items-center gap-1.5 rounded-2xl px-2 py-1">
              <Avatar person={s.person} size={40} />
              <span className="max-w-20 truncate text-xs font-semibold">{s.person.name}</span>
              <Money value={s.total} className="font-mono text-[11px] text-lime" />
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-lime" style={{ width: `${items.length ? (assigned / items.length) * 100 : 0}%` }} />
          </div>
          <span className="text-xs whitespace-nowrap text-mute">{t(d.progress, { done: assigned, total: items.length })}</span>
        </div>
        <Button variant="soft" size="sm" onClick={splitEverythingEqually} icon={<Equal className="h-4 w-4 text-pink" />}>
          {d.splitEqually}
        </Button>
      </div>

      <ul className="flex flex-col gap-3">
        {items.map((item) => {
          const everyone = people.length > 0 && people.every((p) => item.assignees.includes(p.id));
          const count = item.assignees.length;
          return (
            <li
              key={item.id}
              className={clsx(
                'glass relative overflow-hidden rounded-3xl p-4',
                count > 0 && 'border-lime/25',
              )}
            >
              {count > 0 && <span className="absolute inset-y-0 start-0 w-1 bg-lime" />}
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {item.quantity > 1 && <span className="text-mute">{item.quantity}× </span>}
                    {item.name || '—'}
                  </p>
                  {count > 1 && (
                    <p className="text-xs text-mute">
                      {t(d.each, { amount: money(Math.round(item.price / count)) })}
                    </p>
                  )}
                </div>
                <span className="font-mono font-semibold tabular-nums">{money(item.price)}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setItemEveryone(item.id, !everyone)}
                  className={clsx(
                    'flex h-10 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-xs font-bold',
                    everyone ? 'border-transparent bg-white text-ink' : 'border-line text-mute hover:text-white',
                  )}
                >
                  <Users className="h-4 w-4" />
                  {d.everyone}
                </button>
                {people.map((p) => {
                  const on = item.assignees.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => toggleAssignee(item.id, p.id)}
                      title={p.name}
                      aria-pressed={on}
                      className="relative cursor-pointer rounded-full"
                    >
                      <Avatar person={p} size={40} active={on} />
                      {on && (
                        <span className="absolute -end-0.5 -bottom-0.5 grid h-4 w-4 place-items-center rounded-full bg-lime text-ink ring-2 ring-ink"
                        >
                          <Check className="h-3 w-3" strokeWidth={3.5} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>
    </StepLayout>
  );
}
