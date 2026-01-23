"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/common/ToastProvider";
import { resources } from "@/lib/i18n";
import { updateSiteConfig } from "@/lib/api/admin";
import { getSiteConfig } from "@/lib/api/public";
import { useTranslation } from "react-i18next";

type NavItem = { label: string; href: string };
type TopBarFields = {
  address: string;
  hours: string;
  phonePrimary: string;
  phoneSecondary: string;
};

export default function SettingsPage() {
  const [forceHttps, setForceHttps] = useState(true);
  const [activeLang, setActiveLang] = useState("vn");
  const [navByLang, setNavByLang] = useState<Record<string, NavItem[]>>({
    vn: [],
    en: [],
  });
  const [topBarByLang, setTopBarByLang] = useState<
    Record<string, TopBarFields>
  >({
    vn: { address: "", hours: "", phonePrimary: "", phoneSecondary: "" },
    en: { address: "", hours: "", phonePrimary: "", phoneSecondary: "" },
  });
  const toast = useToast();
  const { t } = useTranslation();

  const defaultNav = useMemo<Record<string, NavItem[]>>(() => {
    const vnDict = resources.vn.translation;
    const enDict = resources.en.translation;
    return {
      vn: [
        { label: vnDict.nav.home, href: "/vn" },
        { label: vnDict.nav.about, href: "/vn/good-massage-in-da-nang" },
        { label: vnDict.nav.services, href: "/vn/dich-vu" },
        { label: vnDict.nav.price, href: "/vn/price-list" },
        { label: vnDict.nav.news, href: "/vn/news" },
        { label: vnDict.nav.contact, href: "/vn/contact" },
      ],
      en: [
        { label: enDict.nav.home, href: "/en" },
        { label: enDict.nav.about, href: "/en/good-massage-in-da-nang" },
        { label: enDict.nav.services, href: "/en/dich-vu" },
        { label: enDict.nav.price, href: "/en/price-list" },
        { label: enDict.nav.news, href: "/en/news" },
        { label: enDict.nav.contact, href: "/en/contact" },
      ],
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadConfig = async () => {
      try {
        const response = await getSiteConfig();
        const config = response?.data ?? {};
        const next = { ...defaultNav };
        (["vn", "en"] as const).forEach((code) => {
          const raw = config[`navbar_${code}`];
          if (!raw) return;
          try {
            const parsed = JSON.parse(raw) as NavItem[];
            if (Array.isArray(parsed) && parsed.length) {
              next[code] = parsed;
            }
          } catch {
            return;
          }
        });
        if (active) {
          setNavByLang(next);
          setTopBarByLang({
            vn: {
              address: config.topbar_address_vn || "",
              hours: config.topbar_hours_vn || "",
              phonePrimary: config.topbar_phone_primary_vn || "",
              phoneSecondary: config.topbar_phone_secondary_vn || "",
            },
            en: {
              address: config.topbar_address_en || "",
              hours: config.topbar_hours_en || "",
              phonePrimary: config.topbar_phone_primary_en || "",
              phoneSecondary: config.topbar_phone_secondary_en || "",
            },
          });
        }
      } catch {
        if (active) {
          setNavByLang(defaultNav);
        }
      }
    };
    loadConfig();
    return () => {
      active = false;
    };
  }, [defaultNav]);

  const currentNav = navByLang[activeLang] || [];

  const handleSaveNav = async () => {
    const sanitizeItems = (items: NavItem[]) =>
      items
        .map((item) => ({
          label: item.label.trim(),
          href: item.href.trim(),
        }))
        .filter(
          (item) =>
            item.label &&
            item.href &&
            !item.href.toLowerCase().startsWith("javascript:") &&
            !item.href.toLowerCase().startsWith("data:")
        );

    const payload: Record<string, string> = {
      [`navbar_${activeLang}`]: JSON.stringify(sanitizeItems(currentNav)),
      [`topbar_address_${activeLang}`]: topBarByLang[activeLang]?.address || "",
      [`topbar_hours_${activeLang}`]: topBarByLang[activeLang]?.hours || "",
      [`topbar_phone_primary_${activeLang}`]:
        topBarByLang[activeLang]?.phonePrimary || "",
      [`topbar_phone_secondary_${activeLang}`]:
        topBarByLang[activeLang]?.phoneSecondary || "",
    };

    try {
      await updateSiteConfig(undefined, payload);
      toast.push({ message: "Đã lưu menu.", type: "success" });
    } catch {
      toast.push({
        message: "Lưu thất bại. Vui lòng thử lại.",
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-white">{t("settings.title")}</h1>
        <Button variant="ghost" className="text-[#8fb6ff]" onClick={handleSaveNav}>
          {t("settings.save")}
        </Button>
      </div>

      <Section title={t("settings.navbar")}>
        <div className="flex flex-wrap gap-2 px-6 pt-4">
          {["vn", "en"].map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setActiveLang(code)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                activeLang === code
                  ? "bg-[#2f7bff] text-white"
                  : "border border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
        <CardContent className="space-y-4 px-6 pb-6">
          {currentNav.map((item, index) => (
            <div
              key={`${activeLang}-nav-${index}`}
              className="grid gap-3 md:grid-cols-[1.1fr_1.6fr_auto]"
            >
              <Input
                placeholder={t("settings.menuLabel")}
                value={item.label}
                onChange={(event) => {
                  setNavByLang((prev) => {
                    const next = [...prev[activeLang]];
                    next[index] = { ...next[index], label: event.target.value };
                    return { ...prev, [activeLang]: next };
                  });
                }}
              />
              <Input
                placeholder={t("settings.menuLink")}
                value={item.href}
                onChange={(event) => {
                  setNavByLang((prev) => {
                    const next = [...prev[activeLang]];
                    next[index] = { ...next[index], href: event.target.value };
                    return { ...prev, [activeLang]: next };
                  });
                }}
              />
              <Button
                variant="secondary"
                onClick={() => {
                  setNavByLang((prev) => ({
                    ...prev,
                    [activeLang]: prev[activeLang].filter((_, i) => i !== index),
                  }));
                }}
              >
                {t("settings.delete")}
              </Button>
            </div>
          ))}
          <Button
            variant="secondary"
            onClick={() =>
              setNavByLang((prev) => ({
                ...prev,
                [activeLang]: [
                  ...prev[activeLang],
                  { label: "", href: "" },
                ],
              }))
            }
          >
            {t("settings.addMenu")}
          </Button>
        </CardContent>
      </Section>

      <Section title={t("settings.headerInfo")}>
        <CardContent className="space-y-4 px-6 pb-6">
          <Input
            placeholder={t("settings.address")}
            value={topBarByLang[activeLang]?.address || ""}
            onChange={(event) =>
              setTopBarByLang((prev) => ({
                ...prev,
                [activeLang]: {
                  ...prev[activeLang],
                  address: event.target.value,
                },
              }))
            }
          />
          <Input
            placeholder={t("settings.hours")}
            value={topBarByLang[activeLang]?.hours || ""}
            onChange={(event) =>
              setTopBarByLang((prev) => ({
                ...prev,
                [activeLang]: {
                  ...prev[activeLang],
                  hours: event.target.value,
                },
              }))
            }
          />
          <Input
            placeholder={t("settings.phonePrimary")}
            value={topBarByLang[activeLang]?.phonePrimary || ""}
            onChange={(event) =>
              setTopBarByLang((prev) => ({
                ...prev,
                [activeLang]: {
                  ...prev[activeLang],
                  phonePrimary: event.target.value,
                },
              }))
            }
          />
          <Input
            placeholder={t("settings.phoneSecondary")}
            value={topBarByLang[activeLang]?.phoneSecondary || ""}
            onChange={(event) =>
              setTopBarByLang((prev) => ({
                ...prev,
                [activeLang]: {
                  ...prev[activeLang],
                  phoneSecondary: event.target.value,
                },
              }))
            }
          />
        </CardContent>
      </Section>

      <Section title={t("settings.common")}>
        <SettingRow icon={<span className="text-xl">💡</span>} label="Logo" value="Panda Spa" />
        <SettingRow icon={<span className="text-xl">Tt</span>} label="Tên Website" value="Panda Spa" />
        <SettingRow icon={<span className="text-xl">❝</span>} label="Slogan" value="The best CMS ever" />
      </Section>

      <Section title={t("settings.region")}>
        <SettingRow icon={<span className="text-xl">🌐</span>} label="Ngôn ngữ Quản trị" value="Tiếng Việt" />
        <SettingRow icon={<span className="text-xl">🕒</span>} label="Múi giờ" value="(GMT+7) Bangkok" />
        <SettingRow icon={<span className="text-xl">📅</span>} label="Định dạng Ngày" value="d/m/Y" />
        <SettingRow icon={<span className="text-xl">⏱</span>} label="Định dạng Giờ" value="H:i" />
      </Section>

      <Section title={t("settings.security")}>
        <SettingRow
          icon={<span className="text-xl">🔒</span>}
          label={t("settings.forceHttps")}
          trailing={
            <Switch
              checked={forceHttps}
              onClick={() => setForceHttps((prev) => !prev)}
            />
          }
        />
        <SettingRow
          icon={<span className="text-xl">🛡️</span>}
          label={t("settings.twoFactor")}
          value={t("settings.enabled")}
        />
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
        {title}
      </p>
      <Card>
        <CardContent className="divide-y divide-white/10 px-0 py-0">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}

function SettingRow({
  icon,
  label,
  value,
  trailing,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#233142] text-[#5aa3ff]">
          {icon}
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold text-white">{label}</p>
          {value ? <p className="text-sm text-slate-400">{value}</p> : null}
        </div>
      </div>
      {trailing ? (
        trailing
      ) : (
        <span className="text-white/40">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        </span>
      )}
    </div>
  );
}
