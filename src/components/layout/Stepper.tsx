import clsx from 'clsx';
import { useI18n } from '@/i18n';
import { STEPS, useBill } from '@/store/billStore';

/** Pill-shaped progress bar; completed steps are clickable to jump back. */
export function Stepper() {
  const { dict } = useI18n();
  const step = useBill((s) => s.step);
  const goTo = useBill((s) => s.goTo);
  const current = STEPS.indexOf(step);

  return (
    <nav className="glass flex gap-1 rounded-2xl p-1" aria-label="progress">
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <button
            key={s}
            disabled={!done}
            onClick={() => goTo(s)}
            className={clsx(
              'relative flex-1 rounded-xl px-1 py-2 text-[11px] font-semibold sm:text-xs',
              active ? 'text-ink' : done ? 'cursor-pointer text-white hover:bg-white/5' : 'text-mute/60',
            )}
          >
            {active && (
              <span
                className="absolute inset-0 rounded-xl bg-[linear-gradient(110deg,var(--color-lime),#fde68a)]"
              />
            )}
            <span className="relative flex items-center justify-center gap-1">
              {done && <span className="text-lime">✓</span>}
              {dict.steps[s]}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
