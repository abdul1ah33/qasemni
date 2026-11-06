import { motion, type HTMLMotionProps } from 'motion/react';
import clsx from 'clsx';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'ghost' | 'soft';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant;
  size?: 'md' | 'lg' | 'sm';
  icon?: ReactNode;
  children?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    'text-ink bg-[linear-gradient(110deg,var(--color-lime),#fde68a_45%,var(--color-orange))] shadow-[0_10px_40px_-10px_rgb(190_242_100/0.55)] hover:shadow-[0_14px_50px_-8px_rgb(190_242_100/0.7)]',
  soft: 'glass text-white hover:bg-white/[0.08]',
  ghost: 'text-mute hover:text-white hover:bg-white/[0.05]',
};

const sizes = {
  sm: 'h-9 px-3.5 text-sm gap-1.5 rounded-xl',
  md: 'h-11 px-5 text-sm gap-2 rounded-2xl',
  lg: 'h-14 px-7 text-base gap-2.5 rounded-2xl',
};

export function Button({ variant = 'soft', size = 'md', icon, children, className, disabled, ...rest }: ButtonProps) {
  return (
    <motion.button
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      disabled={disabled}
      className={clsx(
        'relative inline-flex shrink-0 cursor-pointer items-center justify-center font-semibold whitespace-nowrap transition-[background,box-shadow,color,opacity] select-none',
        'disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </motion.button>
  );
}
