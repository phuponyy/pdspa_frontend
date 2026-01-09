"use client";

import PageEditor from "@/components/admin/PageEditor";
import { useAuthStore } from "@/lib/stores/authStore";

export default function HomeEditorPage() {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return (
      <p className="text-sm text-[var(--ink-muted)]">
        Please sign in to edit the homepage.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--jade)]">
          Homepage
        </p>
        <h1 className="text-2xl font-semibold text-[var(--ink)]">
          Content editor
        </h1>
      </div>
      <PageEditor token={token} />
    </div>
  );
}
