export default function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-[var(--ink-muted)]">
      <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--jade)]" />
      <span>{label}...</span>
    </div>
  );
}
