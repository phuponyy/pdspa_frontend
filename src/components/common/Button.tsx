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
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition",
        variant === "primary" &&
          "bg-[linear-gradient(135deg,#ff6a3d,#ffb640)] text-white shadow-[0_18px_40px_rgba(255,106,61,0.35)] hover:brightness-110",
        variant === "outline" &&
          "border border-[rgba(255,106,61,0.4)] bg-white text-[var(--ink)] hover:border-[var(--accent-strong)] hover:text-[var(--accent-strong)]",
        variant === "ghost" &&
          "text-[var(--ink)] hover:bg-[rgba(255,106,61,0.08)]",
        className
      )}
      {...props}
    />
  );
}
