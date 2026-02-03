import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { HOTLINE, HOTLINE_SECONDARY, SPA_ADDRESS, SPA_HOURS } from "@/lib/constants";
import type { TopBarConfig } from "../types";

export type TopBarProps = {
  hideTopBar: boolean;
  topBar: TopBarConfig;
  hotline?: string;
  currentLang: string;
  buildLangSwitcherHref: (code: string) => string;
};

export const TopBar = ({
  hideTopBar,
  topBar,
  hotline,
  currentLang,
  buildLangSwitcherHref,
}: TopBarProps) => {
  return (
    <div
      className={cn(
        "hidden text-sm text-white transition-all duration-300 md:block",
        hideTopBar ? "max-h-0 opacity-0 pointer-events-none" : "max-h-20 opacity-100 pointer-events-auto"
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-8 px-6 py-3 lg:px-10">
        <div className="flex items-center gap-2">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          <span>{topBar.address || SPA_ADDRESS}</span>
        </div>
        <div className="flex items-center gap-2">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="8" />
            <path d="M12 8v5l3 2" />
          </svg>
          <span>Working Time: {topBar.hours || SPA_HOURS}</span>
        </div>
        <div className="flex items-center gap-2">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.9 19.9 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.9 19.9 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7 13 13 0 0 0 .7 2.8 2 2 0 0 1-.5 2.1l-1.2 1.2a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5 13 13 0 0 0 2.8.7 2 2 0 0 1 1.7 2z" />
          </svg>
          <span>{topBar.phonePrimary || hotline || HOTLINE}</span>
        </div>
        <div className="flex items-center gap-2">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.9 19.9 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.9 19.9 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7 13 13 0 0 0 .7 2.8 2 2 0 0 1-.5 2.1l-1.2 1.2a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5 13 13 0 0 0 2.8.7 2 2 0 0 1 1.7 2z" />
          </svg>
          <span>{topBar.phoneSecondary || HOTLINE_SECONDARY}</span>
        </div>
        <div className="flex items-center gap-2">
          {[
            { code: "vi", label: "VI" },
            { code: "en", label: "EN" },
          ].map((item) => (
            <Link
              key={item.code}
              href={buildLangSwitcherHref(item.code)}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition",
                item.code === currentLang
                  ? "border-white text-white"
                  : "border-[rgba(255,255,255,0.4)] text-[rgba(255,255,255,0.7)] hover:text-white"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
