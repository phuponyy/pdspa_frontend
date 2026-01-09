import { cn } from "@/lib/utils/cn";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export default function Textarea({
  label,
  error,
  className,
  ...props
}: TextareaProps) {
  return (
    <label className="flex w-full flex-col gap-2 text-sm font-medium text-[var(--ink-muted)]">
      {label}
      <textarea
        className={cn(
          "min-h-[120px] resize-y rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-[15px] text-[var(--ink)] outline-none transition focus:border-[var(--jade)] focus:ring-2 focus:ring-[rgba(31,107,95,0.2)]",
          error && "border-red-300 focus:border-red-400 focus:ring-red-200",
          className
        )}
        {...props}
      />
      {error ? <span className="text-xs text-red-500">{error}</span> : null}
    </label>
  );
}
