export default function JobsLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-6"
    >
      <div className="space-y-2">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-96 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="h-11 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
        <div className="flex gap-2">
          <div className="h-8 w-28 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          <div className="h-8 w-28 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          <div className="h-8 w-28 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-56 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 animate-pulse space-y-3"
          >
            <div className="h-5 w-40 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-60 rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-16 w-full rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
