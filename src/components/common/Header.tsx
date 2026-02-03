"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils/cn";
import { useHeaderScroll } from "./header/hooks/useHeaderScroll";
import { useHeaderConfig } from "./header/hooks/useHeaderConfig";
import { useActiveLink } from "./header/hooks/useActiveLink";
import { useMobileMenu } from "./header/hooks/useMobileMenu";
import { useBookingDialog } from "./header/hooks/useBookingDialog";
import { MobileMenu } from "./header/components/MobileMenu";
import { TopBar } from "./header/components/TopBar";
import { MainNav } from "./header/components/MainNav";
import { BookingDialog } from "./header/components/BookingDialog";

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

  const hideTopBar = useHeaderScroll(!isAdminRoute);
  const { links, topBar, logoUrl, buildPublicHref } = useHeaderConfig(
    lang,
    fixedT,
    !isAdminRoute
  );
  const { currentLang, buildLangSwitcherHref, isActive } = useActiveLink(pathname, lang);
  const { isOpen, setIsOpen, query, setQuery, filteredLinks } = useMobileMenu(links, pathname);
  const booking = useBookingDialog({ lang, fixedT });

  const navLinkClass = (active: boolean) =>
    cn(
      "relative transition-colors duration-300",
      "after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-[var(--accent-strong)] after:shadow-[0_0_12px_rgba(255,106,61,0.65)] after:transition-transform after:duration-300",
      active
        ? "text-[var(--accent-strong)] after:scale-x-100"
        : "text-[rgba(0,0,0,0.55)] hover:text-[rgba(0,0,0,0.9)] hover:after:scale-x-100"
    );

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
      <MobileMenu
        lang={lang}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        links={filteredLinks}
        isActive={isActive}
        query={query}
        setQuery={setQuery}
      />
      <TopBar
        hideTopBar={hideTopBar}
        topBar={topBar}
        hotline={hotline}
        currentLang={currentLang}
        buildLangSwitcherHref={buildLangSwitcherHref}
      />
      <MainNav
        logoUrl={logoUrl}
        links={links}
        isActive={isActive}
        navLinkClass={navLinkClass}
        onOpenMobileMenu={() => setIsOpen(true)}
        onOpenBooking={() => booking.setIsOpen(true)}
        fixedT={fixedT}
        buildPublicHref={buildPublicHref}
      />
      <BookingDialog
        open={booking.isOpen}
        onOpenChange={booking.setIsOpen}
        fixedT={fixedT}
        services={booking.services}
        servicesLoading={booking.servicesLoading}
        bookingServices={booking.bookingServices}
        scheduleDate={booking.scheduleDate}
        scheduleTime={booking.scheduleTime}
        paymentMethod={booking.paymentMethod}
        notes={booking.notes}
        fullName={booking.fullName}
        phone={booking.phone}
        email={booking.email}
        whatsappId={booking.whatsappId}
        lineId={booking.lineId}
        wechatId={booking.wechatId}
        bookingError={booking.bookingError}
        isSubmitting={booking.isSubmitting}
        fieldErrors={booking.fieldErrors}
        addBookingService={booking.addBookingService}
        updateBookingService={booking.updateBookingService}
        resolveService={booking.resolveService}
        formatPrice={booking.formatPrice}
        totalAmount={booking.totalAmount}
        setScheduleDate={booking.setScheduleDate}
        setScheduleTime={booking.setScheduleTime}
        setPaymentMethod={booking.setPaymentMethod}
        setNotes={booking.setNotes}
        setFullName={booking.setFullName}
        setPhone={booking.setPhone}
        setEmail={booking.setEmail}
        setWhatsappId={booking.setWhatsappId}
        setLineId={booking.setLineId}
        setWechatId={booking.setWechatId}
        handleSubmit={booking.handleSubmit}
      />
    </header>
  );
}
