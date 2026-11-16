import clsx from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'ghost' | 'soft';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'md' | 'lg' | 'sm';
  icon?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: 'text-ink bg-[linear-gradient(110deg,var(--color-lime),#fde68a_45%,var(--color-orange))]',
  soft: 'glass text-white hover:bg-white/[0.08]',
  ghost: 'text-mute hover:text-white hover:bg-white/[0.05]',
};

const sizes = {
  sm: 'h-9 px-3.5 text-sm gap-1.5 rounded-xl',
  md: 'h-11 px-5 text-sm gap-2 rounded-2xl',
  lg: 'h-14 px-7 text-base gap-2.5 rounded-2xl',
};

export function Button({ variant = 'soft', size = 'md', icon, children, className, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        'relative inline-flex shrink-0 cursor-pointer items-center justify-center font-semibold whitespace-nowrap select-none',
        'active:opacity-80 disabled:cursor-not-allowed disabled:opacity-40',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
