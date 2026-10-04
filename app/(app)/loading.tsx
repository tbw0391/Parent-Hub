export default function Loading() {
  return (
    <div className="flex flex-col gap-4 py-6" aria-busy="true" aria-label="Loading">
      <div className="h-6 w-40 animate-pulse rounded bg-panel" />
      <div className="h-4 w-64 animate-pulse rounded bg-panel" />
      <div className="mt-2 flex flex-col gap-2">
        <div className="h-14 animate-pulse rounded-lg bg-panel" />
        <div className="h-14 animate-pulse rounded-lg bg-panel" />
        <div className="h-14 animate-pulse rounded-lg bg-panel" />
      </div>
    </div>
  );
}
