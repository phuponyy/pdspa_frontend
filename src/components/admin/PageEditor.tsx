"use client";

import { useState } from "react";
import Button from "../common/Button";
import Input from "../common/Input";
import Textarea from "../common/Textarea";
import {
  updateHomeHero,
  updateHomeMeta,
  updateHomeStatus,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";

export default function PageEditor({
  token,
  lang,
}: {
  token: string;
  lang: string;
}) {
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [message, setMessage] = useState<string | null>(null);

  const notify = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleError = (err: unknown) => {
    if (err instanceof ApiError) {
      notify(err.message || "Request failed.");
      return;
    }
    notify("Unable to reach the server. Please try again.");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
        <h2 className="text-lg font-semibold text-[var(--ink)]">SEO Metadata</h2>
        <div className="mt-4 grid gap-4">
          <Input
            label="Meta title"
            value={metaTitle}
            onChange={(event) => setMetaTitle(event.target.value)}
          />
          <Textarea
            label="Meta description"
            value={metaDescription}
            onChange={(event) => setMetaDescription(event.target.value)}
          />
          <Button
            onClick={async () => {
              try {
                await updateHomeMeta(token, lang, { metaTitle, metaDescription });
                notify("SEO metadata updated.");
              } catch (err) {
                handleError(err);
              }
            }}
          >
            Save SEO
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
        <h2 className="text-lg font-semibold text-[var(--ink)]">Hero section</h2>
        <div className="mt-4 grid gap-4">
          <Input
            label="Heading"
            value={heading}
            onChange={(event) => setHeading(event.target.value)}
          />
          <Textarea
            label="Subheading"
            value={subheading}
            onChange={(event) => setSubheading(event.target.value)}
          />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[var(--ink)]">
                Hero slider images (max 10)
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  if (images.length >= 10) {
                    notify("Maximum 10 images.");
                    return;
                  }
                  setImages((prev) => [...prev, ""]);
                }}
              >
                Add image
              </Button>
            </div>
            <div className="space-y-3">
              {images.map((value, idx) => (
                <div key={`hero-image-${idx}`} className="flex gap-2">
                  <Input
                    label={`Image URL ${idx + 1}`}
                    value={value}
                    onChange={(event) => {
                      const next = [...images];
                      next[idx] = event.target.value;
                      setImages(next);
                    }}
                  />
                  <Button
                    variant="outline"
                    className="h-12 px-4"
                    onClick={() =>
                      setImages((prev) => prev.filter((_, i) => i !== idx))
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))}
              {!images.length ? (
                <p className="text-xs text-[var(--ink-muted)]">
                  No images yet. Add up to 10 URLs.
                </p>
              ) : null}
            </div>
          </div>
          <Button
            onClick={async () => {
              try {
                await updateHomeHero(token, lang, {
                  heading,
                  subheading,
                  images: images.map((item) => item.trim()).filter(Boolean),
                });
                notify("Hero section updated.");
              } catch (err) {
                handleError(err);
              }
            }}
          >
            Save hero
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
        <h2 className="text-lg font-semibold text-[var(--ink)]">Publish status</h2>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <select
            className="h-12 rounded-2xl border border-[var(--line)] bg-white px-4 text-sm"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "DRAFT" | "PUBLISHED")
            }
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
          <Button
            variant="outline"
            onClick={async () => {
              try {
                await updateHomeStatus(token, { status });
                notify("Homepage status updated.");
              } catch (err) {
                handleError(err);
              }
            }}
          >
            Update status
          </Button>
        </div>
      </div>

      {message ? (
        <p className="text-sm text-[var(--jade)]">{message}</p>
      ) : null}
    </div>
  );
}
