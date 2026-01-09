import Button from "./Button";

export default function ErrorState({
  title = "Something went wrong",
  message = "Please try again in a moment.",
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
      <h3 className="text-lg font-semibold text-[var(--ink)]">{title}</h3>
      <p className="text-sm text-[var(--ink-muted)]">{message}</p>
      {onRetry ? (
        <Button onClick={onRetry} className="w-fit">
          Retry
        </Button>
      ) : null}
    </div>
  );
}
