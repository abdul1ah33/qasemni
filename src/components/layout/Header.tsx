import { motion } from 'motion/react';
import { Languages, RotateCcw } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useBill } from '@/store/billStore';
import { Button } from '@/components/ui/Button';

export function Logo() {
  const { dict } = useI18n();
  return (
    <div className="flex items-center gap-2.5">
      <motion.div
        whileHover={{ rotate: -8, scale: 1.08 }}
        className="relative grid h-9 w-9 place-items-center rounded-xl bg-[linear-gradient(135deg,var(--color-violet),var(--color-pink),var(--color-orange))]"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path d="M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21z" fill="#07070c" />
          <path d="M12 7v9" stroke="#bef264" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 2.5" />
        </svg>
      </motion.div>
      <span className="text-lg font-extrabold tracking-tight">{dict.appName}</span>
    </div>
  );
}

export function Header() {
  const { dict, toggle } = useI18n();
  const step = useBill((s) => s.step);
  const reset = useBill((s) => s.reset);

  return (
    <header className="flex items-center justify-between gap-3 py-4">
      <Logo />
      <div className="flex items-center gap-1">
        {step !== 'scan' && (
          <Button variant="ghost" size="sm" onClick={reset} icon={<RotateCcw className="h-4 w-4" />}>
            <span className="hidden sm:inline">{dict.startOver}</span>
          </Button>
        )}
        <Button variant="soft" size="sm" onClick={toggle} icon={<Languages className="h-4 w-4" />}>
          {dict.langToggle}
        </Button>
      </div>
    </header>
  );
}
