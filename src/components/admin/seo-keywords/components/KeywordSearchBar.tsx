import AdminButton from "@/components/admin/ui/AdminButton";
import AdminInput from "@/components/admin/ui/AdminInput";

export type KeywordSearchBarProps = {
  query: string;
  setQuery: (value: string) => void;
  page: number;
  totalPages: number;
  pageSize: number;
  setPage: (value: number) => void;
  setPageSize: (value: number) => void;
};

export const KeywordSearchBar = ({
  query,
  setQuery,
  page,
  totalPages,
  pageSize,
  setPage,
  setPageSize,
}: KeywordSearchBarProps) => {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink-muted)] shadow-[var(--shadow)]">
      <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
        Search
        <AdminInput
          placeholder="Find keyword..."
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
        />
      </label>
      <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
        Per page
        <select
          className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs"
          value={pageSize}
          onChange={(event) => {
            setPageSize(Number(event.target.value));
            setPage(1);
          }}
        >
          {[10, 20, 30, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
      <div className="ml-auto flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
        <AdminButton size="sm" variant="secondary" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>
          Prev
        </AdminButton>
        <span>
          {page} / {totalPages}
        </span>
        <AdminButton
          size="sm"
          variant="secondary"
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
        >
          Next
        </AdminButton>
      </div>
    </div>
  );
};
