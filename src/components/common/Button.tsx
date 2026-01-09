import { cn } from "@/lib/utils/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
};

export default function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition",
        variant === "primary" &&
          "bg-[var(--jade)] text-white shadow-[0_16px_40px_rgba(31,107,95,0.28)] hover:bg-[var(--jade-deep)]",
        variant === "outline" &&
          "border border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--jade)] hover:text-[var(--jade)]",
        variant === "ghost" &&
          "text-[var(--ink)] hover:bg-[rgba(31,107,95,0.08)]",
        className
      )}
      {...props}
    />
  );
}
