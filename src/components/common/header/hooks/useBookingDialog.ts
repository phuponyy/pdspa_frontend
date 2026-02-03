import { useEffect, useMemo, useState } from "react";
import { createBooking, getServices } from "@/lib/api/public";
import type { PublicService } from "@/types/api.types";
import type { BookingServiceRow } from "../types";

const fallbackServices = ["Aroma Massage", "Stone Therapy", "Facial Care", "Body Scrub"];
const fallbackDurations = ["60 minutes", "90 minutes", "120 minutes"];

type UseBookingDialogArgs = {
  lang: string;
  fixedT: (key: string) => string;
};

export const useBookingDialog = ({ lang, fixedT }: UseBookingDialogArgs) => {
  const [isOpen, setIsOpen] = useState(false);
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
  const [pendingServiceId, setPendingServiceId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleOpen = (event: Event) => {
      const detail = (event as CustomEvent<{ serviceId?: number }>).detail;
      if (detail?.serviceId) {
        setPendingServiceId(detail.serviceId);
      }
      setIsOpen(true);
    };
    window.addEventListener("public-booking-open", handleOpen as EventListener);
    return () => {
      window.removeEventListener("public-booking-open", handleOpen as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen, lang, services.length]);

  useEffect(() => {
    if (!isOpen) return;
    const preferred =
      pendingServiceId && services.length
        ? services.find((service) => service.id === pendingServiceId)
        : undefined;
    const firstService = preferred || services[0];
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
    if (preferred) {
      setPendingServiceId(null);
    }
  }, [isOpen, services, pendingServiceId]);

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

  const totalAmount = useMemo(() => {
    return bookingServices.reduce((sum, item) => {
      const service = resolveService(item);
      const option = service?.priceOptions?.find((opt) => opt.id === item.optionId);
      if (!option) return sum;
      const qty = 1;
      const guests = item.guests || 1;
      return sum + option.price * qty * guests;
    }, 0);
  }, [bookingServices, services]);

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

  const handleSubmit = async () => {
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
      setIsOpen(false);
    } catch {
      setBookingError(fixedT("bookingPopup.errors.submitFail"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isOpen,
    setIsOpen,
    services,
    servicesLoading,
    bookingServices,
    scheduleDate,
    scheduleTime,
    paymentMethod,
    notes,
    fullName,
    phone,
    email,
    whatsappId,
    lineId,
    wechatId,
    bookingError,
    isSubmitting,
    fieldErrors,
    addBookingService,
    updateBookingService,
    resolveService,
    formatPrice,
    totalAmount,
    setScheduleDate,
    setScheduleTime,
    setPaymentMethod,
    setNotes,
    setFullName,
    setPhone,
    setEmail,
    setWhatsappId,
    setLineId,
    setWechatId,
    handleSubmit,
  };
};
