"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/components/common/ToastProvider";
import { resources } from "@/lib/i18n";
import { updateSiteConfig, uploadMedia } from "@/lib/api/admin";
import { getSiteConfig } from "@/lib/api/public";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "@/lib/constants";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminInput from "@/components/admin/ui/AdminInput";
import {
  AdminAlertDialog,
  AdminAlertDialogAction,
  AdminAlertDialogCancel,
  AdminAlertDialogContent,
  AdminAlertDialogDescription,
  AdminAlertDialogTitle,
  AdminAlertDialogTrigger,
  AdminDialog,
  AdminDialogContent,
  AdminDialogDescription,
  AdminDialogFooter,
  AdminDialogHeader,
  AdminDialogTitle,
  AdminDialogTrigger,
} from "@/components/admin/ui/AdminDialog";
import { AdminCard, AdminCardContent, AdminCardHeader, AdminCardTitle } from "@/components/admin/ui/AdminCard";
import AdminSwitch from "@/components/admin/ui/AdminSwitch";
type NavItem = { label: string; href: string };
type TopBarFields = {
  address: string;
  hours: string;
  phonePrimary: string;
  phoneSecondary: string;
};

export default function SettingsPage() {
  const [forceHttps, setForceHttps] = useState(true);
  const [activeLang, setActiveLang] = useState("vi");
  const [navByLang, setNavByLang] = useState<Record<string, NavItem[]>>({
    vi: [],
    en: [],
  });
  const [topBarByLang, setTopBarByLang] = useState<
    Record<string, TopBarFields>
  >({
    vi: { address: "", hours: "", phonePrimary: "", phoneSecondary: "" },
    en: { address: "", hours: "", phonePrimary: "", phoneSecondary: "" },
  });
  const [branding, setBranding] = useState({
    logoUrl: "",
    iconSvgUrl: "",
  });
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const [isRemovingLogo, setIsRemovingLogo] = useState(false);
  const [isRemovingIcon, setIsRemovingIcon] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const iconInputRef = useRef<HTMLInputElement | null>(null);
  const toast = useToast();
  const { t } = useTranslation();

  const defaultNav = useMemo<Record<string, NavItem[]>>(() => {
    const viDict = resources.vi.translation;
    const enDict = resources.en.translation;
    return {
      vi: [
        { label: viDict.nav.home, href: "/vi" },
        { label: viDict.nav.about, href: "/vi/good-massage-in-da-nang" },
        { label: viDict.nav.services, href: "/vi/dich-vu" },
        { label: viDict.nav.price, href: "/vi/price-list" },
        { label: viDict.nav.news, href: "/vi/tin-tuc" },
        { label: viDict.nav.contact, href: "/vi/contact" },
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
        (["vi", "en"] as const).forEach((code) => {
          const raw =
            config[`navbar_${code}`] ||
            (code === "vi" ? config.navbar_vn : undefined);
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
            vi: {
              address: config.topbar_address_vi || config.topbar_address_vn || "",
              hours: config.topbar_hours_vi || config.topbar_hours_vn || "",
              phonePrimary:
                config.topbar_phone_primary_vi || config.topbar_phone_primary_vn || "",
              phoneSecondary:
                config.topbar_phone_secondary_vi || config.topbar_phone_secondary_vn || "",
            },
            en: {
              address: config.topbar_address_en || "",
              hours: config.topbar_hours_en || "",
              phonePrimary: config.topbar_phone_primary_en || "",
              phoneSecondary: config.topbar_phone_secondary_en || "",
            },
          });
          setBranding({
            logoUrl: config.site_logo_url || "",
            iconSvgUrl: config.site_icon_svg_url || "",
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

  const resolveAssetUrl = (value: string) =>
    value?.startsWith("/") ? `${API_BASE_URL}${value}` : value;

  const handleUpload = async (
    file: File | undefined,
    type: "logo" | "icon"
  ) => {
    if (!file) return;
    if (type === "icon" && file.type !== "image/svg+xml") {
      toast.push({ message: "Icon phải là SVG.", type: "error" });
      return;
    }
    if (type === "logo" && !file.type.startsWith("image/")) {
      toast.push({ message: "Logo phải là ảnh.", type: "error" });
      return;
    }

    try {
      type === "logo" ? setIsUploadingLogo(true) : setIsUploadingIcon(true);
      const response = await uploadMedia(file);
      const url = response?.data?.url;
      if (!url) {
        throw new Error("Upload failed");
      }
      const key = type === "logo" ? "site_logo_url" : "site_icon_svg_url";
      await updateSiteConfig(undefined, { [key]: url });
      setBranding((prev) => ({
        ...prev,
        [type === "logo" ? "logoUrl" : "iconSvgUrl"]: url,
      }));
      toast.push({ message: "Đã cập nhật.", type: "success" });
    } catch {
      toast.push({ message: "Không thể cập nhật.", type: "error" });
    } finally {
      type === "logo" ? setIsUploadingLogo(false) : setIsUploadingIcon(false);
    }
  };

  const handleRemove = async (type: "logo" | "icon") => {
    try {
      type === "logo" ? setIsRemovingLogo(true) : setIsRemovingIcon(true);
      const key = type === "logo" ? "site_logo_url" : "site_icon_svg_url";
      await updateSiteConfig(undefined, { [key]: "" });
      setBranding((prev) => ({
        ...prev,
        [type === "logo" ? "logoUrl" : "iconSvgUrl"]: "",
      }));
      toast.push({ message: "Đã xoá.", type: "success" });
    } catch {
      toast.push({ message: "Không thể xoá.", type: "error" });
    } finally {
      type === "logo" ? setIsRemovingLogo(false) : setIsRemovingIcon(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-white">{t("settings.title")}</h1>
        <AdminButton variant="ghost" className="text-[#8fb6ff]" onClick={handleSaveNav}>
          {t("settings.save")}
        </AdminButton>
      </div>

      <Section title={t("settings.navbar")}>
        <div className="flex flex-wrap gap-2 px-6 pt-4">
          {["vi", "en"].map((code) => (
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
        <AdminCardContent className="space-y-4 px-6 pb-6">
          {currentNav.map((item, index) => (
            <div
              key={`${activeLang}-nav-${index}`}
              className="grid gap-3 md:grid-cols-[1.1fr_1.6fr_auto]"
            >
              <AdminInput
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
              <AdminInput
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
              <AdminButton
                variant="secondary"
                onClick={() => {
                  setNavByLang((prev) => ({
                    ...prev,
                    [activeLang]: prev[activeLang].filter((_, i) => i !== index),
                  }));
                }}
              >
                {t("settings.delete")}
              </AdminButton>
            </div>
          ))}
          <AdminButton
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
          </AdminButton>
        </AdminCardContent>
      </Section>

      <Section title={t("settings.headerInfo")}>
        <AdminCardContent className="space-y-4 px-6 pb-6">
          <AdminInput
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
          <AdminInput
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
          <AdminInput
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
          <AdminInput
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
        </AdminCardContent>
      </Section>

      <Section title="Branding">
        <AdminCardContent className="space-y-6 px-6 pb-6">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Logo
              </p>
              {branding.logoUrl ? (
                <img
                  src={resolveAssetUrl(branding.logoUrl)}
                  alt="Site logo"
                  className="h-14 w-auto rounded-lg border border-white/10 bg-white/5 p-2"
                />
              ) : (
                <p className="text-sm text-slate-400">Chưa có logo.</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={logoInputRef}
                onChange={(event) => {
                  handleUpload(event.target.files?.[0], "logo");
                  event.target.value = "";
                }}
              />
              <AdminButton
                variant="secondary"
                disabled={isUploadingLogo}
                onClick={() => logoInputRef.current?.click()}
              >
                {isUploadingLogo ? "Đang tải..." : "Upload logo"}
              </AdminButton>
              <AdminAlertDialog>
                <AdminAlertDialogTrigger asChild>
                  <AdminButton
                    variant="outline"
                    className="!text-white !border-white/20 hover:!bg-white/10"
                    disabled={isRemovingLogo || !branding.logoUrl}
                  >
                    {isRemovingLogo ? "Đang xoá..." : "Xoá logo"}
                  </AdminButton>
                </AdminAlertDialogTrigger>
                <AdminAlertDialogContent>
                  <AdminAlertDialogTitle>Xoá logo?</AdminAlertDialogTitle>
                  <AdminAlertDialogDescription>
                    Logo hiện tại sẽ bị xoá khỏi cấu hình trang.
                  </AdminAlertDialogDescription>
                  <div className="mt-5 flex items-center justify-end gap-3">
                    <AdminAlertDialogCancel>Huỷ</AdminAlertDialogCancel>
                    <AdminAlertDialogAction onClick={() => handleRemove("logo")}>
                      Xoá
                    </AdminAlertDialogAction>
                  </div>
                </AdminAlertDialogContent>
              </AdminAlertDialog>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Site icon (SVG)
              </p>
              {branding.iconSvgUrl ? (
                <img
                  src={resolveAssetUrl(branding.iconSvgUrl)}
                  alt="Site icon"
                  className="h-12 w-12 rounded-lg border border-white/10 bg-white/5 p-2"
                />
              ) : (
                <p className="text-sm text-slate-400">Chưa có icon.</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/svg+xml"
                className="hidden"
                ref={iconInputRef}
                onChange={(event) => {
                  handleUpload(event.target.files?.[0], "icon");
                  event.target.value = "";
                }}
              />
              <AdminButton
                variant="secondary"
                disabled={isUploadingIcon}
                onClick={() => iconInputRef.current?.click()}
              >
                {isUploadingIcon ? "Đang tải..." : "Upload icon"}
              </AdminButton>
              <AdminAlertDialog>
                <AdminAlertDialogTrigger asChild>
                  <AdminButton
                    variant="outline"
                    className="!text-white !border-white/20 hover:!bg-white/10"
                    disabled={isRemovingIcon || !branding.iconSvgUrl}
                  >
                    {isRemovingIcon ? "Đang xoá..." : "Xoá icon"}
                  </AdminButton>
                </AdminAlertDialogTrigger>
                <AdminAlertDialogContent>
                  <AdminAlertDialogTitle>Xoá icon?</AdminAlertDialogTitle>
                  <AdminAlertDialogDescription>
                    Icon SVG hiện tại sẽ bị xoá khỏi cấu hình trang.
                  </AdminAlertDialogDescription>
                  <div className="mt-5 flex items-center justify-end gap-3">
                    <AdminAlertDialogCancel>Huỷ</AdminAlertDialogCancel>
                    <AdminAlertDialogAction onClick={() => handleRemove("icon")}>
                      Xoá
                    </AdminAlertDialogAction>
                  </div>
                </AdminAlertDialogContent>
              </AdminAlertDialog>
            </div>
          </div>
        </AdminCardContent>
      </Section>

      <Section title={t("settings.common")}>
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
            <AdminSwitch
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
      <AdminCard>
        <AdminCardContent className="divide-y divide-white/10 px-0 py-0">
          {children}
        </AdminCardContent>
      </AdminCard>
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


