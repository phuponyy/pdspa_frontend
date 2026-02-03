import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Textarea from "@/components/common/Textarea";
import { getHomeIntro, updateHomeIntro } from "@/lib/api/admin";
import { storageKey } from "@/components/admin/page-editor/defaults";
import type { IntroState } from "@/components/admin/page-editor/types";
import type { Dispatch, SetStateAction } from "react";

export type IntroSectionProps = {
  activeLang: "vi" | "en";
  currentIntro: IntroState;
  setIntroByLang: Dispatch<SetStateAction<Record<string, IntroState>>>;
  setIsDirty: (value: boolean) => void;
  notify: (text: string, type?: "success" | "error" | "info") => void;
  handleError: (err: unknown) => void;
};

export default function IntroSection({
  activeLang,
  currentIntro,
  setIntroByLang,
  setIsDirty,
  notify,
  handleError,
}: IntroSectionProps) {
  return (
    <section
      id="intro"
      className="rounded-[28px] bg-white p-6 text-[#0f1722] shadow-[0_30px_80px_rgba(5,10,18,0.35)]"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ff9f40]/15 text-[#ff6a3d]">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12h16" />
              <path d="M4 6h10" />
              <path d="M4 18h7" />
            </svg>
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Intro Section</p>
            <p className="text-sm text-slate-500">Điểm nổi bật trên trang chủ nằm bên dưới phần hero.</p>
          </div>
        </div>
      </div>
      <div className="mt-5 grid gap-4">
        <Input
          label="Heading"
          value={currentIntro.heading}
          onChange={(event) => {
            setIsDirty(true);
            setIntroByLang((prev) => ({
              ...prev,
              [activeLang]: { ...prev[activeLang], heading: event.target.value },
            }));
          }}
        />
        <Textarea
          label="Description"
          value={currentIntro.description}
          onChange={(event) => {
            setIsDirty(true);
            setIntroByLang((prev) => ({
              ...prev,
              [activeLang]: { ...prev[activeLang], description: event.target.value },
            }));
          }}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Image URL"
            value={currentIntro.imageUrl}
            onChange={(event) => {
              setIsDirty(true);
              setIntroByLang((prev) => ({
                ...prev,
                [activeLang]: { ...prev[activeLang], imageUrl: event.target.value },
              }));
            }}
          />
          <Input
            label="Video URL"
            value={currentIntro.videoUrl}
            onChange={(event) => {
              setIsDirty(true);
              setIntroByLang((prev) => ({
                ...prev,
                [activeLang]: { ...prev[activeLang], videoUrl: event.target.value },
              }));
            }}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Provider name"
            value={currentIntro.providerName}
            onChange={(event) => {
              setIsDirty(true);
              setIntroByLang((prev) => ({
                ...prev,
                [activeLang]: { ...prev[activeLang], providerName: event.target.value },
              }));
            }}
          />
          <Input
            label="Listing name"
            value={currentIntro.listingName}
            onChange={(event) => {
              setIsDirty(true);
              setIntroByLang((prev) => ({
                ...prev,
                [activeLang]: { ...prev[activeLang], listingName: event.target.value },
              }));
            }}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="Rating"
            value={currentIntro.rating}
            onChange={(event) => {
              setIsDirty(true);
              setIntroByLang((prev) => ({
                ...prev,
                [activeLang]: { ...prev[activeLang], rating: event.target.value },
              }));
            }}
          />
          <Input
            label="Reviews"
            value={currentIntro.reviews}
            onChange={(event) => {
              setIsDirty(true);
              setIntroByLang((prev) => ({
                ...prev,
                [activeLang]: { ...prev[activeLang], reviews: event.target.value },
              }));
            }}
          />
          <Input
            label="Rank text"
            value={currentIntro.rankText}
            onChange={(event) => {
              setIsDirty(true);
              setIntroByLang((prev) => ({
                ...prev,
                [activeLang]: { ...prev[activeLang], rankText: event.target.value },
              }));
            }}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Button label"
            value={currentIntro.buttonLabel}
            onChange={(event) => {
              setIsDirty(true);
              setIntroByLang((prev) => ({
                ...prev,
                [activeLang]: { ...prev[activeLang], buttonLabel: event.target.value },
              }));
            }}
          />
          <Input
            label="Button link"
            value={currentIntro.buttonLink}
            onChange={(event) => {
              setIsDirty(true);
              setIntroByLang((prev) => ({
                ...prev,
                [activeLang]: { ...prev[activeLang], buttonLink: event.target.value },
              }));
            }}
          />
        </div>
        <Button
          onClick={async () => {
            try {
              await updateHomeIntro(undefined, activeLang, {
                heading: currentIntro.heading,
                description: currentIntro.description,
                imageUrl: currentIntro.imageUrl,
                videoUrl: currentIntro.videoUrl,
                providerName: currentIntro.providerName,
                listingName: currentIntro.listingName,
                rating: Number(currentIntro.rating),
                reviews: Number(currentIntro.reviews),
                rankText: currentIntro.rankText,
                buttonLabel: currentIntro.buttonLabel,
                buttonLink: currentIntro.buttonLink,
              });
              const fresh = await getHomeIntro(undefined, activeLang);
              if (fresh) {
                setIntroByLang((prev) => ({
                  ...prev,
                  [activeLang]: {
                    heading: fresh.heading ?? "",
                    description: fresh.description ?? "",
                    imageUrl: fresh.imageUrl ?? "",
                    videoUrl: fresh.videoUrl ?? "",
                    providerName: fresh.providerName ?? "Tripadvisor",
                    listingName: fresh.listingName ?? "Panda Spa",
                    rating: fresh.rating ? String(fresh.rating) : "5",
                    reviews: fresh.reviews ? String(fresh.reviews) : "",
                    rankText: fresh.rankText ?? "",
                    buttonLabel: fresh.buttonLabel ?? "SPA DA NANG",
                    buttonLink: fresh.buttonLink ?? "",
                  },
                }));
              }
              notify("Intro section updated.", "success");
              setIsDirty(false);
              if (typeof window !== "undefined") {
                window.localStorage.removeItem(storageKey);
              }
            } catch (err) {
              handleError(err);
            }
          }}
        >
          Save intro
        </Button>
      </div>
    </section>
  );
}
