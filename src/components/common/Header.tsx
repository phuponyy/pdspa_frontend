"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Button from "./Button";
import { useTranslation } from "react-i18next";
import {
  HOTLINE,
  HOTLINE_SECONDARY,
  SPA_ADDRESS,
  SPA_HOURS,
  SUPPORTED_LANGS,
} from "@/lib/constants";
import { cn } from "@/lib/utils/cn";
import { createBooking, getServices, getSiteConfig } from "@/lib/api/public";
import type { PublicService } from "@/types/api.types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type NavItem = { label: string; href: string };
type TopBarConfig = {
  address?: string;
  hours?: string;
  phonePrimary?: string;
  phoneSecondary?: string;
};

type BookingServiceRow = {
  id: string;
  serviceId?: number;
  serviceLabel: string;
  optionId?: number;
  duration?: string;
  guests: number;
};

const fallbackServices = ["Aroma Massage", "Stone Therapy", "Facial Care", "Body Scrub"];
const fallbackDurations = ["60 minutes", "90 minutes", "120 minutes"];

export default function Header({
  lang,
  hotline,
  className,
}: {
  lang: string;
  hotline?: string;
  className?: string;
}) {
  const { i18n } = useTranslation();
  const fixedT = useMemo(() => i18n.getFixedT(lang), [i18n, lang]);
  const pathname = usePathname();
  const isAdminRoute = pathname.includes("/admin");
  const [hideTopBar, setHideTopBar] = useState(false);
  const lastScroll = useRef(0);
  const lastToggle = useRef(0);
  const rafRef = useRef<number | null>(null);
  const buildPublicHref = (path: string) => {
    if (lang === "en") {
      return `/${path}`.replace(/\/+$/, "") || "/";
    }
    return `/${lang}${path ? `/${path}` : ""}`;
  };
  const defaultLinks = useMemo(
    () => [
      { href: buildPublicHref(""), label: fixedT("nav.home") },
      { href: buildPublicHref("good-massage-in-da-nang"), label: fixedT("nav.about") },
      { href: buildPublicHref("dich-vu"), label: fixedT("nav.services") },
      { href: buildPublicHref("price-list"), label: fixedT("nav.price") },
      {
        href: buildPublicHref(lang === "vi" ? "tin-tuc" : "tin-tuc"),
        label: fixedT("nav.news"),
      },
      { href: buildPublicHref("contact"), label: fixedT("nav.contact") },
    ],
    [lang, fixedT]
  );
  const [links, setLinks] = useState<NavItem[]>(defaultLinks);
  const [topBar, setTopBar] = useState<TopBarConfig>({});
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [services, setServices] = useState<PublicService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [bookingServices, setBookingServices] = useState<BookingServiceRow[]>([]);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer" | "card">("cash");
  const [notes, setNotes] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [whatsappId, setWhatsappId] = useState("");
  const [lineId, setLineId] = useState("");
  const [wechatId, setWechatId] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isAdminRoute) {
      return;
    }
    const onScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(() => {
        const current = Math.max(window.scrollY, 0);
        const isScrollingDown = current > lastScroll.current;
        const distance = Math.abs(current - lastToggle.current);

        if (current < 120) {
          setHideTopBar(false);
          lastToggle.current = current;
        } else if (distance > 80) {
          setHideTopBar(isScrollingDown);
          lastToggle.current = current;
        }

        lastScroll.current = current;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isAdminRoute]);

  useEffect(() => {
    if (isAdminRoute) {
      return;
    }
    let active = true;
    const loadConfig = async () => {
      try {
        setLinks(defaultLinks);
        const response = await getSiteConfig();
        const config = response?.data ?? {};
        const raw =
          config[`navbar_${lang}`] || (lang === "vi" ? config.navbar_vn : undefined);
        if (!raw) {
          setLinks(defaultLinks);
        } else {
          const parsed = JSON.parse(raw) as NavItem[];
          if (!Array.isArray(parsed) || !parsed.length) {
            setLinks(defaultLinks);
          } else if (active) {
            setLinks(
              parsed.map((item) => ({
                label: String(item.label || ""),
                href: String(item.href || ""),
              }))
            );
          }
        }

        if (active) {
          setTopBar({
            address:
              config[`topbar_address_${lang}`] ||
              (lang === "vi" ? config.topbar_address_vn : undefined) ||
              SPA_ADDRESS,
            hours:
              config[`topbar_hours_${lang}`] ||
              (lang === "vi" ? config.topbar_hours_vn : undefined) ||
              SPA_HOURS,
            phonePrimary:
              config[`topbar_phone_primary_${lang}`] ||
              (lang === "vi" ? config.topbar_phone_primary_vn : undefined) ||
              HOTLINE,
            phoneSecondary:
              config[`topbar_phone_secondary_${lang}`] ||
              (lang === "vi" ? config.topbar_phone_secondary_vn : undefined) ||
              HOTLINE_SECONDARY,
          });
        }
      } catch {
        if (active) {
          setLinks(defaultLinks);
          setTopBar({
            address: SPA_ADDRESS,
            hours: SPA_HOURS,
            phonePrimary: HOTLINE,
            phoneSecondary: HOTLINE_SECONDARY,
          });
        }
      }
    };

    loadConfig();
    return () => {
      active = false;
    };
  }, [lang, defaultLinks, isAdminRoute]);

  useEffect(() => {
    if (!isBookingOpen) return;
    let active = true;
    const loadServices = async () => {
      if (services.length) return;
      setServicesLoading(true);
      try {
        const response = await getServices(lang);
        if (active) {
          setServices(response?.data ?? []);
        }
      } catch {
        if (active) {
          setServices([]);
        }
      } finally {
        if (active) {
          setServicesLoading(false);
        }
      }
    };
    loadServices();
    return () => {
      active = false;
    };
  }, [isBookingOpen, lang, services.length]);

  useEffect(() => {
    if (!isBookingOpen) return;
    const firstService = services[0];
    setBookingServices([
      {
        id: `service-${Date.now()}`,
        serviceId: firstService?.id,
        serviceLabel: firstService?.name || fallbackServices[0],
        optionId: firstService?.priceOptions?.[0]?.id,
        duration: fallbackDurations[1],
        guests: 1,
      },
    ]);
    setScheduleDate("");
    setScheduleTime("");
    setPaymentMethod("cash");
    setNotes("");
    setFullName("");
    setPhone("");
    setEmail("");
    setWhatsappId("");
    setLineId("");
    setWechatId("");
    setBookingError("");
    setIsSubmitting(false);
    setFieldErrors({});
  }, [isBookingOpen, services]);

  const segments = pathname.split("/").filter(Boolean);
  const currentLang = SUPPORTED_LANGS.includes(segments[0] as "vi" | "en")
    ? segments[0]
    : "en";
  const restPath = SUPPORTED_LANGS.includes(segments[0] as "vi" | "en")
    ? segments.slice(1).join("/")
    : segments.join("/");
  const buildLangSwitcherHref = (code: string) => {
    if (code === "en") {
      return `/${restPath}`.replace(/\/+$/, "") || "/";
    }
    return `/${code}${restPath ? `/${restPath}` : ""}`;
  };

  const isActive = (href: string) => {
    if (href === "/" || href === `/${lang}`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };
  const navLinkClass = (active: boolean) =>
    cn(
      "transition",
      active
        ? "text-[var(--accent-strong)]"
        : "text-[rgba(0,0,0,0.55)] hover:text-[rgba(0,0,0,0.9)]"
    );

  const addBookingService = () => {
    setBookingServices((prev) => [
      ...prev,
      {
        id: `service-${Date.now()}`,
        serviceId: services[0]?.id,
        serviceLabel: services[0]?.name || fallbackServices[0],
        optionId: services[0]?.priceOptions?.[0]?.id,
        duration: fallbackDurations[0],
        guests: 1,
      },
    ]);
  };

  const updateBookingService = (id: string, patch: Partial<BookingServiceRow>) => {
    setBookingServices((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const resolveService = (row: BookingServiceRow) =>
    services.find((service) => service.id === row.serviceId);

  const formatPrice = (value: number) => {
    try {
      return value.toLocaleString("vi-VN");
    } catch {
      return String(value);
    }
  };

  const totalAmount = bookingServices.reduce((sum, item) => {
    const service = resolveService(item);
    const option = service?.priceOptions?.find((opt) => opt.id === item.optionId);
    if (!option) return sum;
    const qty = 1;
    const guests = item.guests || 1;
    return sum + option.price * qty * guests;
  }, 0);

  const canSubmitBooking =
    fullName.trim().length > 1 &&
    phone.trim().length > 5 &&
    email.trim().length > 0 &&
    scheduleDate &&
    scheduleTime &&
    bookingServices.length > 0 &&
    bookingServices.every((item) => Boolean(item.serviceId));

  const validateBooking = () => {
    const nextErrors: Record<string, string> = {};
    if (fullName.trim().length < 2) nextErrors.fullName = fixedT("bookingPopup.errors.fullName");
    if (phone.trim().length < 6) nextErrors.phone = fixedT("bookingPopup.errors.phone");
    if (!email.trim()) nextErrors.email = fixedT("bookingPopup.errors.email");
    if (!scheduleDate) nextErrors.scheduleDate = fixedT("bookingPopup.errors.scheduleDate");
    if (!scheduleTime) nextErrors.scheduleTime = fixedT("bookingPopup.errors.scheduleTime");
    if (!bookingServices.length || bookingServices.some((item) => !item.serviceId)) {
      nextErrors.services = fixedT("bookingPopup.errors.services");
    }
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmitBooking = async () => {
    if (isSubmitting) return;
    if (!validateBooking()) {
      setBookingError(fixedT("bookingPopup.errors.required"));
      return;
    }
    setBookingError("");
    setIsSubmitting(true);
    const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}:00`);
    const payload = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      whatsappId: whatsappId.trim() || undefined,
      lineId: lineId.trim() || undefined,
      wechatId: wechatId.trim() || undefined,
      note: notes.trim() || undefined,
      langCode: lang,
      scheduledAt: scheduledAt.toISOString(),
      paymentMethod,
      paymentDetails:
        paymentMethod === "transfer"
          ? {
              accountNumber: "4789717",
              bankName: "ACB",
              accountName: "Phạm Thị Dung",
            }
          : undefined,
      items: bookingServices.map((item) => ({
        serviceId: item.serviceId as number,
        priceOptionId: item.optionId,
        qty: 1,
        guests: item.guests,
        duration: item.duration,
      })),
    };

    try {
      await createBooking(payload);
      setIsBookingOpen(false);
    } catch {
      setBookingError(fixedT("bookingPopup.errors.submitFail"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAdminRoute) {
    return null;
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-[70] bg-black transition-[padding] duration-300 bg-transparent py-10 pointer-events-auto",
        hideTopBar ? "m-[10px]" : "pt-0",
        className
      )}
    >
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
      <div className="bg-transparent">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 lg:px-10">
          <div className="flex flex-1 items-center justify-between gap-8 rounded-full bg-white px-8 py-2 shadow-[0_18px_40px_rgba(255,106,61,0.4)]">
            <Link href={buildPublicHref("")} className="flex items-center gap-3">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F5617c6399e7e490498e90123ca427448%2F579ea19fe5e6468982aa7d2e2790f9f4"
                alt="Panda Spa"
                className="h-14 w-auto object-contain"
                loading="lazy"
              />
            </Link>
            <nav className="hidden items-center gap-9 text-base font-semibold text-black md:flex">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={navLinkClass(isActive(link.href))}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="hidden h-12 w-12 items-center justify-center rounded-full border border-[rgba(0,0,0,0.08)] text-[var(--accent-strong)] transition hover:border-[var(--accent-strong)] md:inline-flex"
                aria-label="Search"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-3.5-3.5" />
                </svg>
              </button>
              <Button
                className="hidden px-7 py-3 text-base md:inline-flex"
                onClick={() => setIsBookingOpen(true)}
              >
                {fixedT("hero.ctaPrimary")}
              </Button>
              <Link
                href="/admin/login"
                className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)] hover:text-[var(--accent-strong)] md:inline-flex"
              >
                {fixedT("nav.admin")}
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="max-h-[85vh] w-[96vw] max-w-6xl -translate-y-[45%] overflow-y-auto border-white/10 bg-[#0f1722] text-white">
          <DialogHeader>
            <DialogTitle>{fixedT("bookingPopup.title")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-[#101826] p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-white/50">
                  {fixedT("bookingPopup.guestInfo")}
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <input
                    type="text"
                    placeholder={fixedT("bookingPopup.placeholders.fullName")}
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className={`h-11 rounded-xl border bg-[#0f1722] px-4 text-sm text-white/80 placeholder:text-white/40 ${
                      fieldErrors.fullName
                        ? "border-rose-500 ring-1 ring-rose-500/40"
                        : "border-white/10"
                    }`}
                  />
                  <input
                    type="email"
                    placeholder={fixedT("bookingPopup.placeholders.email")}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className={`h-11 rounded-xl border bg-[#0f1722] px-4 text-sm text-white/80 placeholder:text-white/40 ${
                      fieldErrors.email
                        ? "border-rose-500 ring-1 ring-rose-500/40"
                        : "border-white/10"
                    }`}
                  />
                  <input
                    type="tel"
                    placeholder={fixedT("bookingPopup.placeholders.phone")}
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className={`h-11 rounded-xl border bg-[#0f1722] px-4 text-sm text-white/80 placeholder:text-white/40 ${
                      fieldErrors.phone
                        ? "border-rose-500 ring-1 ring-rose-500/40"
                        : "border-white/10"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={fixedT("bookingPopup.placeholders.whatsapp")}
                    value={whatsappId}
                    onChange={(event) => setWhatsappId(event.target.value)}
                    className="h-11 rounded-xl border border-white/10 bg-[#0f1722] px-4 text-sm text-white/80 placeholder:text-white/40"
                  />
                  <input
                    type="text"
                    placeholder={fixedT("bookingPopup.placeholders.line")}
                    value={lineId}
                    onChange={(event) => setLineId(event.target.value)}
                    className="h-11 rounded-xl border border-white/10 bg-[#0f1722] px-4 text-sm text-white/80 placeholder:text-white/40"
                  />
                  <input
                    type="text"
                    placeholder={fixedT("bookingPopup.placeholders.wechat")}
                    value={wechatId}
                    onChange={(event) => setWechatId(event.target.value)}
                    className="h-11 rounded-xl border border-white/10 bg-[#0f1722] px-4 text-sm text-white/80 placeholder:text-white/40"
                  />
                </div>
                {fieldErrors.fullName || fieldErrors.email || fieldErrors.phone ? (
                  <p className="mt-3 text-sm text-rose-300">
                    {fieldErrors.fullName || fieldErrors.email || fieldErrors.phone}
                  </p>
                ) : null}
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#101826] p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/50">
                    {fixedT("bookingPopup.spaPackage")}
                  </p>
                  <button
                    type="button"
                    onClick={addBookingService}
                    className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff9f40]"
                  >
                    {fixedT("bookingPopup.addService")}
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  {bookingServices.map((item) => {
                    const service = resolveService(item);
                    const priceOptions = service?.priceOptions ?? [];
                    const usePriceOptions = priceOptions.length > 0;
                    const selectedOption = priceOptions.find((opt) => opt.id === item.optionId);
                    const lineTotal = selectedOption
                      ? selectedOption.price * (item.guests || 1)
                      : 0;
                    return (
                      <div
                        key={item.id}
                        className="grid gap-3 rounded-xl border border-white/10 bg-[#0f1722] p-4 md:grid-cols-[2fr_1fr_1fr]"
                      >
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                            {fixedT("bookingPopup.labels.service")}
                          </p>
                          <select
                            value={item.serviceId ? `id:${item.serviceId}` : `label:${item.serviceLabel}`}
                            onChange={(event) => {
                              const value = event.target.value;
                              if (value.startsWith("id:")) {
                                const nextId = Number(value.replace("id:", ""));
                                const nextService = services.find((s) => s.id === nextId);
                                updateBookingService(item.id, {
                                  serviceId: nextId,
                                  serviceLabel: nextService?.name || item.serviceLabel,
                                  optionId: nextService?.priceOptions?.[0]?.id,
                                  duration: fallbackDurations[0],
                                });
                              } else {
                                updateBookingService(item.id, {
                                  serviceId: undefined,
                                  serviceLabel: value.replace("label:", ""),
                                });
                              }
                            }}
                            className="mt-2 h-10 w-full rounded-lg border border-white/10 bg-[#111a25] px-3 text-sm text-white/80"
                          >
                            {services.length
                              ? services.map((service) => (
                                  <option key={service.id} value={`id:${service.id}`}>
                                    {service.name}
                                  </option>
                                ))
                              : fallbackServices.map((service) => (
                                  <option key={service} value={`label:${service}`}>
                                    {service}
                                  </option>
                                ))}
                          </select>
                          {servicesLoading ? (
                            <p className="mt-2 text-xs text-white/50">
                              {fixedT("bookingPopup.labels.loadingServices")}
                            </p>
                          ) : null}
                          {fieldErrors.services ? (
                            <p className="mt-2 text-xs text-rose-300">{fieldErrors.services}</p>
                          ) : null}
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                            {fixedT("bookingPopup.labels.duration")}
                          </p>
                          <select
                            value={
                              usePriceOptions
                                ? String(item.optionId ?? priceOptions[0]?.id ?? "")
                                : item.duration || fallbackDurations[0]
                            }
                            onChange={(event) => {
                              if (usePriceOptions) {
                                const nextId = Number(event.target.value);
                                const nextOption = priceOptions.find((opt) => opt.id === nextId);
                                updateBookingService(item.id, {
                                  optionId: nextId,
                                  duration: nextOption?.durationMinutes
                                    ? `${nextOption.durationMinutes} min`
                                    : item.duration,
                                });
                              } else {
                                updateBookingService(item.id, { duration: event.target.value });
                              }
                            }}
                            className="mt-2 h-10 w-full rounded-lg border border-white/10 bg-[#111a25] px-3 text-sm text-white/80"
                          >
                            {usePriceOptions
                              ? priceOptions.map((option) => (
                                  <option key={option.id} value={option.id}>
                                    {option.durationMinutes
                                      ? `${option.durationMinutes} min · ${formatPrice(option.price)} đ`
                                      : `${option.code} · ${formatPrice(option.price)} đ`}
                                  </option>
                                ))
                              : fallbackDurations.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                          </select>
                          {selectedOption?.durationMinutes ? (
                            <p className="mt-2 text-xs text-white/60">
                              {fixedT("bookingPopup.labels.duration")}: {selectedOption.durationMinutes} min
                            </p>
                          ) : null}
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                            {fixedT("bookingPopup.labels.guests")}
                          </p>
                          <input
                            type="number"
                            min={1}
                            value={item.guests}
                            onChange={(event) =>
                              updateBookingService(item.id, {
                                guests: Number(event.target.value) || 1,
                              })
                            }
                            className="mt-2 h-10 w-full rounded-lg border border-white/10 bg-[#111a25] px-3 text-sm text-white/80"
                          />
                          {selectedOption ? (
                            <p className="mt-2 text-xs text-white/60">
                              {formatPrice(selectedOption.price)} đ / {fixedT("bookingPopup.labels.guests")}
                              {" "}- {formatPrice(lineTotal)} đ
                            </p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#101826] p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-white/50">
                  {fixedT("bookingPopup.bookingSchedule")}
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(event) => setScheduleDate(event.target.value)}
                    className={`h-11 rounded-xl border bg-[#0f1722] px-4 text-sm text-white/80 ${
                      fieldErrors.scheduleDate
                        ? "border-rose-500 ring-1 ring-rose-500/40"
                        : "border-white/10"
                    }`}
                  />
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(event) => setScheduleTime(event.target.value)}
                    className={`h-11 rounded-xl border bg-[#0f1722] px-4 text-sm text-white/80 ${
                      fieldErrors.scheduleTime
                        ? "border-rose-500 ring-1 ring-rose-500/40"
                        : "border-white/10"
                    }`}
                  />
                </div>
                {fieldErrors.scheduleDate || fieldErrors.scheduleTime ? (
                  <p className="mt-3 text-sm text-rose-300">
                    {fieldErrors.scheduleDate || fieldErrors.scheduleTime}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-[#101826] p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-white/50">
                  {fixedT("bookingPopup.specialRequirements")}
                </p>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder={fixedT("bookingPopup.placeholders.note")}
                  className="mt-3 min-h-[130px] w-full rounded-xl border border-white/10 bg-[#0f1722] px-4 py-3 text-sm text-white/80 placeholder:text-white/40"
                />
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#101826] p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-white/50">
                  {fixedT("bookingPopup.paymentMethod")}
                </p>
                <div className="mt-4 grid gap-3">
                  <div className="grid gap-3 md:grid-cols-3">
                    {[
                      { value: "cash", label: fixedT("bookingPopup.paymentCash") },
                      { value: "transfer", label: fixedT("bookingPopup.paymentTransfer") },
                      { value: "card", label: fixedT("bookingPopup.paymentCard") },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setPaymentMethod(option.value as "cash" | "transfer" | "card")}
                        className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                          paymentMethod === option.value
                            ? "border-[#ff9f40] bg-[#1b1f2a] text-white"
                            : "border-white/10 bg-[#0f1722] text-white/70 hover:text-white"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {paymentMethod === "transfer" ? (
                    <div className="rounded-xl border border-white/10 bg-[#0f1722] px-4 py-3 text-sm text-white/70">
                      <p>{fixedT("bookingPopup.bankInfo.accountNumber")}</p>
                      <p>{fixedT("bookingPopup.bankInfo.bankName")}</p>
                      <p>{fixedT("bookingPopup.bankInfo.accountName")}</p>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#101826] p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white/60">{fixedT("bookingPopup.totalAmount")}</p>
                  <p className="text-2xl font-semibold text-[#ff9f40]">
                    {formatPrice(totalAmount || 0)} đ
                  </p>
                </div>
                {bookingError ? (
                  <p className="mt-3 text-sm text-rose-300">{bookingError}</p>
                ) : null}
                <Button className="mt-4 w-full" onClick={handleSubmitBooking} disabled={isSubmitting}>
                  {isSubmitting ? fixedT("form.sending") : fixedT("bookingPopup.bookNow")}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
