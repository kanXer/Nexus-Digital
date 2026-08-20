export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-brand-blue/30 border-t-brand-blue-light animate-spin" />
        <p className="text-white/40 text-sm font-medium tracking-wide">Loading…</p>
      </div>
    </div>
  );
}
