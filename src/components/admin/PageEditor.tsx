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

export default function PageEditor({ token }: { token: string }) {
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [message, setMessage] = useState<string | null>(null);

  const notify = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 3000);
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
              await updateHomeMeta(token, { metaTitle, metaDescription });
              notify("SEO metadata updated.");
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
          <Input
            label="Image URL"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
          />
          <Button
            onClick={async () => {
              await updateHomeHero(token, { heading, subheading, imageUrl });
              notify("Hero section updated.");
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
              await updateHomeStatus(token, { status });
              notify("Homepage status updated.");
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
