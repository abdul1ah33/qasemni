import { motion } from 'motion/react';
import { isLite } from '@/lib/perf';

/*
 * Aurora blobs are soft radial gradients rather than `filter: blur()` on solid
 * circles: same look, but nothing has to be re-blurred every frame.
 */
const BLOBS = [
  {
    className: '-top-64 -left-56 h-[48rem] w-[48rem]',
    color: 'rgb(139 92 246 / 0.32)',
    animate: { x: [0, 80, -20, 0], y: [0, 60, 120, 0] },
    duration: 22,
  },
  {
    className: 'top-1/4 -right-64 h-[44rem] w-[44rem]',
    color: 'rgb(236 72 153 / 0.26)',
    animate: { x: [0, -100, 0], y: [0, -80, 0] },
    duration: 26,
  },
  {
    className: '-bottom-72 left-0 h-[42rem] w-[42rem]',
    color: 'rgb(251 146 60 / 0.2)',
    animate: { x: [0, 60, -60, 0], y: [0, -40, 0, 0] },
    duration: 30,
  },
];

/** Aurora blobs + dotted grid (+ film grain and drift on desktop) behind everything. */
export function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {BLOBS.map((b, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${b.className}`}
          style={{ background: `radial-gradient(circle closest-side, ${b.color}, transparent)` }}
          // Endless drifting keeps the GPU busy; phones get a still aurora.
          animate={isLite ? undefined : b.animate}
          transition={{ duration: b.duration, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      {/* dotted grid */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: 'radial-gradient(rgb(255 255 255 / 0.35) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)',
        }}
      />
      {/* grain: a full-screen SVG noise filter is very expensive on mobile */}
      {!isLite && (
        <svg className="absolute inset-0 h-full w-full opacity-[0.06] mix-blend-overlay">
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      )}
    </div>
  );
}
