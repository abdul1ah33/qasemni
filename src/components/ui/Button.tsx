import clsx from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
}

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-accent-fg',
  secondary: 'border border-line bg-card text-fg',
  ghost: 'text-accent',
};

const sizes = {
  sm: 'h-9 px-3 text-sm rounded-lg gap-1.5',
  md: 'h-11 px-4 text-[15px] rounded-xl gap-2',
  lg: 'h-13 px-5 text-base rounded-xl gap-2',
};

export function Button({ variant = 'secondary', size = 'md', className, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        'inline-flex shrink-0 cursor-pointer items-center justify-center font-semibold whitespace-nowrap select-none',
        'active:opacity-70 disabled:cursor-not-allowed disabled:opacity-40',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    />
  );
}
