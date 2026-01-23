import { cn } from "@/lib/utils/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  endAdornment?: React.ReactNode;
};

export default function Input({
  label,
  error,
  endAdornment,
  className,
  ...props
}: InputProps) {
  return (
    <label className="flex w-full flex-col gap-2 text-sm font-medium text-[var(--ink-muted)]">
      {label}
      <div className="relative">
        <input
          className={cn(
            "h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 text-[15px] text-[var(--ink)] outline-none transition focus:border-[var(--jade)] focus:ring-2 focus:ring-[rgba(31,107,95,0.2)]",
            endAdornment && "pr-12",
            error && "border-red-300 focus:border-red-400 focus:ring-red-200",
            className
          )}
          {...props}
        />
        {endAdornment ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {endAdornment}
          </div>
        ) : null}
      </div>
      {error ? <span className="text-xs text-red-500">{error}</span> : null}
    </label>
  );
}
