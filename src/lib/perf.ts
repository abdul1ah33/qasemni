/**
 * True on phones/tablets (touch-first or narrow screens). Used to skip
 * effects that are cheap on desktop GPUs but make mobile scrolling janky:
 * live blur filters, full-screen noise, endless background animations.
 */
export const isLite: boolean =
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: none), (pointer: coarse), (max-width: 767px)').matches;
