import clsx from 'clsx';
import { useMemo, type ReactNode } from 'react';
import { useI18n } from '@/i18n';
import { useBill } from '@/store/billStore';
import { computeSplit } from '@/core/split';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/layout/Screen';

export function AssignStep() {
  const { dict, t, money } = useI18n();
  const d = dict.assign;
  const { items, extras, people, toggleAssignee, setItemEveryone, assignUnassignedToEveryone, splitEverythingEqually } = useBill();

  const split = useMemo(() => computeSplit(items, extras, people), [items, extras, people]);
  const assigned = items.length - split.unassigned.length;
  const allAssigned = split.unassigned.length === 0 && items.length > 0;

  return (
    <Screen
      title={d.title}
      subtitle={d.subtitle}
      canContinue={allAssigned}
      note={
        <div className="flex min-h-9 items-center justify-between gap-3 text-sm">
          <span className="text-muted">{t(d.progress, { done: assigned, total: items.length })}</span>
          {!allAssigned && (
            <Button size="sm" variant="ghost" onClick={assignUnassignedToEveryone}>
              {d.assignRest}
            </Button>
          )}
        </div>
      }
    >
      <Button onClick={splitEverythingEqually}>{d.splitEqually}</Button>

      <ul className="flex flex-col gap-3">
        {items.map((item) => {
          const everyone = people.length > 0 && people.every((p) => item.assignees.includes(p.id));
          const count = item.assignees.length;
          return (
            <li key={item.id} className={clsx('card p-3', count === 0 && 'border-amber-500/60')}>
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold break-words">
                    {item.quantity > 1 && <span className="text-muted">{item.quantity}× </span>}
                    {item.name || '—'}
                  </p>
                  {count > 1 && <p className="text-sm text-muted">{t(d.each, { amount: money(Math.round(item.price / count)) })}</p>}
                </div>
                <span className="font-mono whitespace-nowrap">{money(item.price)}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Chip on={everyone} onClick={() => setItemEveryone(item.id, !everyone)}>
                  {d.everyone}
                </Chip>
                {people.map((p) => (
                  <Chip key={p.id} on={item.assignees.includes(p.id)} onClick={() => toggleAssignee(item.id, p.id)}>
                    {p.name}
                  </Chip>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </Screen>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={clsx(
        'h-10 max-w-full cursor-pointer truncate rounded-full border px-4 text-sm font-medium',
        on ? 'border-accent bg-accent text-accent-fg' : 'border-line bg-card text-fg',
      )}
    >
      {children}
    </button>
  );
}
