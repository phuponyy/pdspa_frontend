import { cn } from "@/lib/utils/cn";

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start"
      )}
    >
      {eyebrow ? (
        <span className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="text-3xl font-semibold text-[var(--ink)] md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-sm text-[var(--ink-muted)] md:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
