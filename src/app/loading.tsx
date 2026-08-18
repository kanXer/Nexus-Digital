export default function Loading() {
  return (
    <div className="fixed inset-x-0 top-0 z-[200] h-0.5 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="h-full w-1/3 bg-gradient-to-r from-brand-blue-dark via-brand-blue to-brand-blue-light animate-[loading-bar_1s_ease-in-out_infinite]" />
    </div>
  );
}
