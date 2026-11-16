const lines = [
  { w: '62%', price: '150.00' },
  { w: '48%', price: '75.00' },
  { w: '70%', price: '180.00' },
  { w: '40%', price: '90.00' },
];

const avatars = ['from-violet-400 to-fuchsia-500', 'from-pink-400 to-rose-500', 'from-lime-300 to-emerald-500'];

/** Decorative receipt split between three avatars. */
export function ReceiptIllustration() {
  return (
    <div aria-hidden className="relative mx-auto h-72 w-44 select-none">
      <div className="receipt-edge absolute inset-x-0 top-0 h-56 -rotate-3 rounded-t-2xl bg-[#f5f1e8] p-4 pb-6 text-ink shadow-2xl"
      >
        <div className="mx-auto mb-3 h-2 w-16 rounded-full bg-ink/80" />
        <div className="mb-4 h-1.5 w-24 mx-auto rounded-full bg-ink/20" />
        {lines.map((l, i) => (
          <div key={i} className="mb-2.5 flex items-center justify-between gap-2">
            <span className="h-1.5 rounded-full bg-ink/35" style={{ width: l.w }} />
            <span className="font-mono text-[9px] font-bold text-ink/70">{l.price}</span>
          </div>
        ))}
        <div className="my-3 border-t-2 border-dashed border-ink/20" />
        <div className="flex items-center justify-between">
          <span className="h-2 w-12 rounded-full bg-ink/70" />
          <span className="font-mono text-[11px] font-extrabold">893.76</span>
        </div>
      </div>

      {/* split avatars */}
      {avatars.map((g, i) => (
        <div
          key={g}
          className={`absolute top-10 left-1/2 -ml-5 grid h-10 w-10 place-items-center rounded-full bg-linear-to-br ${g} font-mono text-[10px] font-bold text-ink ring-4 ring-ink`}
          style={{ transform: `translate(${(i - 1) * 58}px, ${196 - Math.abs(i - 1) * 12}px)` }}
        >
          297
        </div>
      ))}
    </div>
  );
}
