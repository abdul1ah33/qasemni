import { motion } from 'motion/react';

const lines = [
  { w: '62%', price: '150.00' },
  { w: '48%', price: '75.00' },
  { w: '70%', price: '180.00' },
  { w: '40%', price: '90.00' },
];

const avatars = ['from-violet-400 to-fuchsia-500', 'from-pink-400 to-rose-500', 'from-lime-300 to-emerald-500'];

/** Decorative floating receipt that "prints" its lines and splits into avatars. */
export function ReceiptIllustration() {
  return (
    <div aria-hidden className="relative mx-auto h-72 w-44 select-none">
      <motion.div
        initial={{ clipPath: 'inset(0 0 100% 0)' }}
        animate={{ clipPath: 'inset(0 0 0% 0)' }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="receipt-edge absolute inset-x-0 top-0 h-56 animate-float rounded-t-2xl bg-[#f5f1e8] p-4 pb-6 text-ink shadow-2xl"
      >
        <div className="mx-auto mb-3 h-2 w-16 rounded-full bg-ink/80" />
        <div className="mb-4 h-1.5 w-24 mx-auto rounded-full bg-ink/20" />
        {lines.map((l, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + i * 0.15 }}
            className="mb-2.5 flex items-center justify-between gap-2"
          >
            <span className="h-1.5 rounded-full bg-ink/35" style={{ width: l.w }} />
            <span className="font-mono text-[9px] font-bold text-ink/70">{l.price}</span>
          </motion.div>
        ))}
        <div className="my-3 border-t-2 border-dashed border-ink/20" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="flex items-center justify-between"
        >
          <span className="h-2 w-12 rounded-full bg-ink/70" />
          <span className="font-mono text-[11px] font-extrabold">893.76</span>
        </motion.div>
      </motion.div>

      {/* split avatars */}
      {avatars.map((g, i) => (
        <motion.div
          key={g}
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ opacity: 1, scale: 1, x: [0, (i - 1) * 58], y: [0, 196 - Math.abs(i - 1) * 12] }}
          transition={{ delay: 1.9 + i * 0.12, type: 'spring', stiffness: 160, damping: 14 }}
          className={`absolute top-10 left-1/2 -ml-5 grid h-10 w-10 place-items-center rounded-full bg-linear-to-br ${g} font-mono text-[10px] font-bold text-ink ring-4 ring-ink`}
        >
          297
        </motion.div>
      ))}
    </div>
  );
}
