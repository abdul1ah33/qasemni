import clsx from 'clsx';
import { motion } from 'motion/react';
import type { Person } from '@/core/types';

export const AVATAR_GRADIENTS = [
  'from-violet-400 to-fuchsia-500',
  'from-pink-400 to-rose-500',
  'from-orange-300 to-amber-500',
  'from-lime-300 to-emerald-500',
  'from-sky-300 to-blue-500',
  'from-teal-300 to-cyan-500',
  'from-yellow-200 to-orange-400',
  'from-indigo-300 to-violet-600',
];

export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => [...w][0] ?? '')
    .join('')
    .toUpperCase() || '?';

interface AvatarProps {
  person: Person;
  size?: number;
  active?: boolean;
  className?: string;
}

export function Avatar({ person, size = 40, active = true, className }: AvatarProps) {
  return (
    <motion.span
      className={clsx(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-linear-to-br font-bold text-ink transition-[filter,opacity] duration-300',
        AVATAR_GRADIENTS[person.color % AVATAR_GRADIENTS.length],
        !active && 'opacity-35 grayscale',
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(person.name)}
    </motion.span>
  );
}
