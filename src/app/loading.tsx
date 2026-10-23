export default function RootLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[50vh] w-full items-center justify-center p-8"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <span className="text-xs font-medium text-slate-500">Loading Akshitha Edutech Portal...</span>
      </div>
    </div>
  );
}
