/** Static aurora glow behind everything: one painted layer, nothing animated. */
export function Background() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        background: [
          'radial-gradient(40rem 40rem at 0% 0%, rgb(139 92 246 / 0.22), transparent 70%)',
          'radial-gradient(36rem 36rem at 100% 45%, rgb(236 72 153 / 0.16), transparent 70%)',
          'radial-gradient(34rem 34rem at 30% 100%, rgb(251 146 60 / 0.12), transparent 70%)',
        ].join(','),
      }}
    />
  );
}
