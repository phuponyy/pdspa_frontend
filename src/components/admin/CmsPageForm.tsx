"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { useToast } from "@/components/common/ToastProvider";
import type { CmsPage } from "@/types/api.types";
import { ApiError } from "@/lib/api/client";
import { useSearchParams } from "next/navigation";

export default function CmsPageForm({
  initial,
  langCode,
  onSave,
}: {
  initial?: CmsPage;
  langCode: string;
  onSave: (payload: Record<string, unknown>) => Promise<void>;
}) {
  const languages = useMemo(() => ["vi", "en"], []);
  const searchParams = useSearchParams();
  const initialLang =
    searchParams.get("lang") && languages.includes(searchParams.get("lang") || "")
      ? (searchParams.get("lang") as string)
      : langCode;
  const [activeLang, setActiveLang] = useState(initialLang);
  const [translations, setTranslations] = useState<Record<string, {
    title: string;
    slug: string;
    content: string;
  }>>(() => {
    const base: Record<string, { title: string; slug: string; content: string }> =
      {};
    languages.forEach((code) => {
      base[code] = { title: "", slug: "", content: "" };
    });
    initial?.translations?.forEach((t) => {
      const code = t.language?.code || langCode;
      if (!base[code]) return;
      base[code] = {
        title: t.title || "",
        slug: t.slug || "",
        content:
          typeof t.content === "string"
            ? t.content
            : JSON.stringify(t.content || ""),
      };
    });
    return base;
  });
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    initial?.status || "DRAFT"
  );
  const [isDirty, setIsDirty] = useState(false);
  const storageKey = `cms-page-draft-${initial?.id ?? "new"}`;
  const toast = useToast();

  const notify = (text: string, type: "success" | "error" | "info" = "info") => {
    toast.push({ message: text, type });
  };

  const handleError = (err: unknown) => {
    if (err instanceof ApiError) {
      notify(err.message || "Request failed.", "error");
      return;
    }
    notify("Unable to reach the server. Please try again.", "error");
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (!url.searchParams.get("lang")) {
      url.searchParams.set("lang", activeLang);
      window.history.replaceState(null, "", url.toString());
    }
  }, [activeLang]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as {
        translations: typeof translations;
        status: "DRAFT" | "PUBLISHED";
        activeLang: string;
      };
      if (parsed?.translations) {
        setTranslations(parsed.translations);
      }
      if (parsed?.status) {
        setStatus(parsed.status);
      }
      if (parsed?.activeLang && languages.includes(parsed.activeLang)) {
        setActiveLang(parsed.activeLang);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey, languages]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isDirty) return;
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ translations, status, activeLang })
    );
  }, [translations, status, activeLang, isDirty, storageKey]);

  const current = translations[activeLang] || {
    title: "",
    slug: "",
    content: "",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {languages.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => {
                setActiveLang(code);
                if (typeof window !== "undefined") {
                  const url = new URL(window.location.href);
                  url.searchParams.set("lang", code);
                  window.history.replaceState(null, "", url.toString());
                }
              }}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                activeLang === code
                  ? "bg-[var(--accent-strong)] text-white"
                  : "border border-[var(--line)] text-[var(--ink-muted)] hover:text-[var(--ink)]"
              }`}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
        {activeLang !== langCode ? (
          <Button
            variant="outline"
            onClick={() => {
              const primary = translations[langCode];
              setTranslations((prev) => ({
                ...prev,
                [activeLang]: { ...primary },
              }));
            }}
          >
            Clone from {langCode.toUpperCase()}
          </Button>
        ) : null}
      </div>
      <div className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
        <div className="grid gap-4">
          <Input
            label="Title"
            value={current.title}
            onChange={(event) => {
              setIsDirty(true);
              setTranslations((prev) => ({
                ...prev,
                [activeLang]: { ...prev[activeLang], title: event.target.value },
              }));
            }}
          />
          <Input
            label="Slug"
            value={current.slug}
            onChange={(event) => {
              setIsDirty(true);
              setTranslations((prev) => ({
                ...prev,
                [activeLang]: { ...prev[activeLang], slug: event.target.value },
              }));
            }}
          />
          <div>
            <p className="mb-2 text-sm font-semibold text-[var(--ink)]">
              Content
            </p>
            <RichTextEditor
              value={current.content}
              onChange={(value) => {
                setIsDirty(true);
                setTranslations((prev) => ({
                  ...prev,
                  [activeLang]: { ...prev[activeLang], content: value },
                }));
              }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="h-12 rounded-2xl border border-[var(--line)] bg-white px-4 text-sm"
              value={status}
              onChange={(event) => {
                setIsDirty(true);
                setStatus(event.target.value as "DRAFT" | "PUBLISHED");
              }}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
            <Button
              onClick={async () => {
                try {
                  await onSave({
                    status,
                    translations: [
                      {
                        langCode: activeLang,
                        title: current.title,
                        slug: current.slug,
                        content: current.content,
                      },
                    ],
                  });
                  notify("Saved.", "success");
                  setIsDirty(false);
                  if (typeof window !== "undefined") {
                    window.localStorage.removeItem(storageKey);
                  }
                } catch (err) {
                  handleError(err);
                }
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
