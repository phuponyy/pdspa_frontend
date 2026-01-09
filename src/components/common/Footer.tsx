import Container from "./Container";

export default function Footer({
  hotline,
  siteName = "Panda Spa",
}: {
  hotline?: string;
  siteName?: string;
}) {
  return (
    <footer className="mt-20 border-t border-[var(--line)] bg-[var(--mist)] py-10">
      <Container className="flex flex-col gap-6 text-sm text-[var(--ink-muted)] md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-base font-semibold text-[var(--ink)]">{siteName}</p>
          <p>Wellness rituals, thoughtfully designed for modern balance.</p>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--jade)]">
            Concierge
          </p>
          <p className="text-lg font-semibold text-[var(--ink)]">
            {hotline || "0909 000 000"}
          </p>
        </div>
      </Container>
    </footer>
  );
}
