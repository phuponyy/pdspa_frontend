export default function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--jade)]">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold text-[var(--ink)]">{value}</p>
      {note ? (
        <p className="mt-2 text-xs text-[var(--ink-muted)]">{note}</p>
      ) : null}
    </div>
  );
}
