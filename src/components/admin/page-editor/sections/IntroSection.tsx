import { getHomeIntro, updateHomeIntro } from "@/lib/api/admin";
import { storageKey } from "@/components/admin/page-editor/defaults";
import type { IntroState } from "@/components/admin/page-editor/types";
import type { Dispatch, SetStateAction } from "react";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminInput from "@/components/admin/ui/AdminInput";
import AdminTextarea from "@/components/admin/ui/AdminTextarea";

export type IntroSectionProps = {
  activeLang: "vi" | "en";
  currentIntro: IntroState;
  setIntroByLang: Dispatch<SetStateAction<Record<string, IntroState>>>;
  setIsDirty: (value: boolean) => void;
  setMediaTarget: (value: { section: "intro" } | null) => void;
  setMediaDialogOpen: (value: boolean) => void;
  notify: (text: string, type?: "success" | "error" | "info") => void;
  handleError: (err: unknown) => void;
};

export default function IntroSection({
  activeLang,
  currentIntro,
  setIntroByLang,
  setIsDirty,
  setMediaTarget,
  setMediaDialogOpen,
  notify,
  handleError,
}: IntroSectionProps) {
  return (
    <section
      id="intro"
      className="rounded-[28px] border border-white/10 bg-[#0b1220] p-6 text-white shadow-[0_30px_80px_rgba(2,6,23,0.6)]"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ff8a4b]/15 text-[#ff8a4b]">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12h16" />
              <path d="M4 6h10" />
              <path d="M4 18h7" />
            </svg>
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Intro Section</p>
            <p className="text-sm text-white/60">Điểm nổi bật trên trang chủ nằm bên dưới phần hero.</p>
          </div>
        </div>
      </div>
      <div className="mt-5 grid gap-4">
        <AdminInput
          label="Heading"
          placeholder="Tiêu đề phần giới thiệu..."
          value={currentIntro.heading}
          onChange={(event) => {
            setIsDirty(true);
            setIntroByLang((prev) => ({
              ...prev,
              [activeLang]: { ...prev[activeLang], heading: event.target.value },
            }));
          }}
        />
        <AdminTextarea
          label="Description"
          placeholder="Mô tả ngắn giới thiệu..."
          value={currentIntro.description}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
            setIsDirty(true);
            setIntroByLang((prev) => ({
              ...prev,
              [activeLang]: { ...prev[activeLang], description: event.target.value },
            }));
          }}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <AdminInput
            label="Image URL"
            placeholder="/uploads/media/intro.jpg"
            value={currentIntro.imageUrl}
            onChange={(event) => {
              setIsDirty(true);
              setIntroByLang((prev) => ({
                ...prev,
                [activeLang]: { ...prev[activeLang], imageUrl: event.target.value },
              }));
            }}
          />
          <div className="flex items-end">
            <AdminButton
              variant="outline"
              className="w-full"
              onClick={() => {
                setMediaTarget({ section: "intro" });
                setMediaDialogOpen(true);
              }}
            >
              Chọn từ Media
            </AdminButton>
          </div>
          <AdminInput
            label="Video URL"
            placeholder="https://youtube.com/..."
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
          <AdminInput
            label="Provider name"
            placeholder="Tripadvisor"
            value={currentIntro.providerName}
            onChange={(event) => {
              setIsDirty(true);
              setIntroByLang((prev) => ({
                ...prev,
                [activeLang]: { ...prev[activeLang], providerName: event.target.value },
              }));
            }}
          />
          <AdminInput
            label="Listing name"
            placeholder="Panda Spa"
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
          <AdminInput
            label="Rating"
            placeholder="5"
            value={currentIntro.rating}
            onChange={(event) => {
              setIsDirty(true);
              setIntroByLang((prev) => ({
                ...prev,
                [activeLang]: { ...prev[activeLang], rating: event.target.value },
              }));
            }}
          />
          <AdminInput
            label="Reviews"
            placeholder="1234"
            value={currentIntro.reviews}
            onChange={(event) => {
              setIsDirty(true);
              setIntroByLang((prev) => ({
                ...prev,
                [activeLang]: { ...prev[activeLang], reviews: event.target.value },
              }));
            }}
          />
          <AdminInput
            label="Rank text"
            placeholder="#1 Massage Đà Nẵng"
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
          <AdminInput
            label="Button label"
            placeholder="SPA ĐÀ NẴNG"
            value={currentIntro.buttonLabel}
            onChange={(event) => {
              setIsDirty(true);
              setIntroByLang((prev) => ({
                ...prev,
                [activeLang]: { ...prev[activeLang], buttonLabel: event.target.value },
              }));
            }}
          />
          <AdminInput
            label="Button link"
            placeholder="https://..."
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
        <AdminButton
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
        </AdminButton>
      </div>
    </section>
  );
}
