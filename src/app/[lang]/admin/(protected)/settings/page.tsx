"use client";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
        Settings
      </p>
      <h1 className="text-2xl font-semibold text-[var(--ink)]">
        Site settings
      </h1>
      <p className="text-sm text-[var(--ink-muted)]">
        Configure branding, SEO defaults, and contact details here.
      </p>
    </div>
  );
}
