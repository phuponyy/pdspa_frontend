"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  exportBookings,
  getAdminMe,
  getBookings,
  updateBooking,
  updateBookingStatus,
} from "@/lib/api/admin";
import { getServices } from "@/lib/api/public";
import DataTable from "@/components/admin/DataTable";
import {
  AdminDialog,
  AdminDialogContent,
  AdminDialogHeader,
  AdminDialogTitle,
import type { Booking } from "@/types/admin-dashboard.types";
import type { PublicService } from "@/types/api.types";
import { DEFAULT_LANG } from "@/lib/constants";
import { useTranslation } from "react-i18next";
import { useAdminQuery } from "@/lib/api/adminHooks";
import AdminButton from "@/components/admin/ui/AdminButton";
import { AdminDialog, AdminDialogTrigger, AdminDialogContent, AdminDialogHeader, AdminDialogTitle, AdminDialogDescription, AdminDialogFooter, AdminAlertDialog, AdminAlertDialogTrigger, AdminAlertDialogAction, AdminAlertDialogCancel, AdminAlertDialogContent, AdminAlertDialogTitle, AdminAlertDialogDescription } from "@/components/admin/ui/AdminDialog";
import { AdminCard, AdminCardContent, AdminCardHeader, AdminCardTitle } from "@/components/admin/ui/AdminCard";

const statusColor: Record<Booking["status"], string> = {
  NEW: "bg-sky-500/15 text-sky-200 border-sky-500/30",
  CONFIRMED: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
  PENDING: "bg-slate-500/15 text-slate-200 border-slate-500/30",
  CANCELED: "bg-rose-500/15 text-rose-200 border-rose-500/30",
};

type BookingService = {
  id: string;
  serviceId?: number;
  serviceLabel: string;
  optionId?: number;
  duration?: string;
  guests: number;
};

const fallbackServices = ["Aroma Massage", "Stone Therapy", "Facial Care", "Body Scrub", "Foot Relax"];
const fallbackDurations = ["60 minutes", "90 minutes", "120 minutes"];

const formatDateInput = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const formatTimeInput = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(11, 16);
};

export default function AdminBookings() {
  const queryClient = useQueryClient();
  const { i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] || DEFAULT_LANG;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [services, setServices] = useState<BookingService[]>([]);
  const [availableServices, setAvailableServices] = useState<PublicService[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer" | "card">("cash");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [notes, setNotes] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [whatsappId, setWhatsappId] = useState("");
  const [lineId, setLineId] = useState("");
  const [wechatId, setWechatId] = useState("");
  const [bookingError, setBookingError] = useState("");

  const bookingsQuery = useAdminQuery({
    queryKey: ["admin-bookings"],
    queryFn: ({ signal }) =>
      getBookings(undefined, { page: 1, pageSize: 20 }, { signal }),
    toastOnError: true,
    errorMessage: "Không thể tải danh sách booking.",
  });

  const meQuery = useAdminQuery({
    queryKey: ["admin-me"],
    queryFn: ({ signal }) => getAdminMe(undefined, signal),
    toastOnError: false,
  });
  const permissions = meQuery.data?.data?.permissions || [];
  const canEditBookings = permissions.includes("edit_bookings") || permissions.includes("manage_bookings");

  const servicesQuery = useAdminQuery({
    queryKey: ["admin-booking-services", lang],
    queryFn: ({ signal }) => getServices(lang, signal),
    toastOnError: false,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Booking["status"] }) =>
      updateBookingStatus(undefined, id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-bookings"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Record<string, unknown>;
    }) => updateBooking(undefined, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
    },
  });

  useEffect(() => {
    if (servicesQuery.data?.data) {
      setAvailableServices(servicesQuery.data.data);
    }
  }, [servicesQuery.data]);

  useEffect(() => {
    if (!selectedBooking) return;
    const items = selectedBooking.items?.length
      ? selectedBooking.items.map((item) => ({
          id: `item-${item.id}`,
          serviceId: item.serviceId,
          serviceLabel: item.service?.name || "",
          optionId: item.priceOptionId ?? item.priceOption?.id,
          duration: item.duration || fallbackDurations[1],
          guests: item.guests || 1,
        }))
      : [
          {
            id: `service-${selectedBooking.id}`,
            serviceId: availableServices[0]?.id,
            serviceLabel: availableServices[0]?.name || fallbackServices[0],
            optionId: availableServices[0]?.priceOptions?.[0]?.id,
            duration: fallbackDurations[1],
            guests: 1,
          },
        ];
    setServices(items);
    setPaymentMethod(
      (selectedBooking.paymentMethod as "cash" | "transfer" | "card") || "cash"
    );
    setScheduleDate(formatDateInput(selectedBooking.scheduledAt));
    setScheduleTime(formatTimeInput(selectedBooking.scheduledAt));
    setNotes(selectedBooking.notes || "");
    setFullName(selectedBooking.customer?.name || "");
    setPhone(selectedBooking.contactPhone || "");
    setEmail(selectedBooking.contactEmail || "");
    setWhatsappId(selectedBooking.contactWhatsApp || "");
    setLineId(selectedBooking.contactLine || "");
    setWechatId(selectedBooking.contactWeChat || "");
    setBookingError("");
  }, [selectedBooking, availableServices]);

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const detail = (event as CustomEvent<Booking>).detail;
      if (!detail) return;
      setSelectedBooking(detail);
      setIsDialogOpen(true);
    };
    window.addEventListener("admin-booking-open", handleOpen as EventListener);
    return () => {
      window.removeEventListener("admin-booking-open", handleOpen as EventListener);
    };
  }, []);

  const addService = () => {
    setServices((prev) => [
      ...prev,
      {
        id: `service-${Date.now()}`,
        serviceId: availableServices[0]?.id,
        serviceLabel: availableServices[0]?.name || fallbackServices[0],
        optionId: availableServices[0]?.priceOptions?.[0]?.id,
        duration: fallbackDurations[0],
        guests: 1,
      },
    ]);
  };

  const updateService = (id: string, patch: Partial<BookingService>) => {
    setServices((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const resolveService = (serviceId?: number) =>
    availableServices.find((service) => service.id === serviceId);

  const totalAmount = services.reduce((sum, item) => {
    const service = resolveService(item.serviceId);
    const option = service?.priceOptions?.find((opt) => opt.id === item.optionId);
    if (!option) return sum;
    const guests = item.guests || 1;
    return sum + option.price * guests;
  }, 0);

  const columns = useMemo<ColumnDef<Booking>[]>(
    () => [
      { id: "customer", header: "Khách hàng", accessorFn: (row) => row.customer?.name || "" },
      { id: "service", header: "Dịch vụ", accessorFn: (row) => row.service?.key || "" },
      { id: "staff", header: "Nhân Viên", accessorFn: (row) => row.staff?.name || "" },
      { accessorKey: "scheduledAt", header: "Đã lên lịch" },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
              statusColor[row.original.status]
            }`}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Hành động",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={() => {
                setSelectedBooking(row.original);
                setIsDialogOpen(true);
              }}
            >
              Xem
            </AdminButton>
            {canEditBookings ? (
              <>
                <AdminButton
                  variant="outline"
                  size="sm"
                  onClick={() => mutation.mutate({ id: row.original.id, status: "CONFIRMED" })}
                >
                  Xác nhận
                </AdminButton>
                <AdminButton
                  variant="outline"
                  size="sm"
                  onClick={() => mutation.mutate({ id: row.original.id, status: "PENDING" })}
                >
                  Pending
                </AdminButton>
                <AdminButton
                  variant="outline"
                  size="sm"
                  onClick={() => mutation.mutate({ id: row.original.id, status: "CANCELED" })}
                >
                  Huỷ
                </AdminButton>
              </>
            ) : null}
          </div>
        ),
      },
    ],
    [mutation]
  );

  const handleExport = async (format: "csv" | "xlsx") => {
    const blob = await exportBookings(format);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bookings.${format}`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSaveBooking = async () => {
    if (!selectedBooking) return;
    if (!fullName.trim() || !phone.trim()) {
      setBookingError("Vui lòng nhập đầy đủ họ tên và số điện thoại.");
      return;
    }
    if (!scheduleDate || !scheduleTime) {
      setBookingError("Vui lòng chọn ngày và giờ.");
      return;
    }
    const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}:00`);
    if (Number.isNaN(scheduledAt.getTime())) {
      setBookingError("Ngày giờ không hợp lệ.");
      return;
    }
    if (!services.length || services.some((item) => !item.serviceId)) {
      setBookingError("Vui lòng chọn dịch vụ hợp lệ.");
      return;
    }
    setBookingError("");

    const payload = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      whatsappId: whatsappId.trim() || undefined,
      lineId: lineId.trim() || undefined,
      wechatId: wechatId.trim() || undefined,
      note: notes.trim() || undefined,
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
      items: services.map((item) => ({
        serviceId: item.serviceId,
        priceOptionId: item.optionId,
        qty: 1,
        guests: item.guests,
        duration: item.duration,
      })),
    };

    await updateMutation.mutateAsync({ id: selectedBooking.id, payload });
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-8">
      <AdminCard className="border-white/5">
        <AdminCardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="py-2">
            <AdminCardTitle>Bookings</AdminCardTitle>
            <p className="text-sm text-white/60">Quy trình: Mới &gt; Đã Xác Nhận &gt; Pending / Huỷ</p>
          </div>
          <div className="flex gap-2">
            <AdminButton variant="outline" size="sm" onClick={() => handleExport("csv")}>
              Xuất CSV
            </AdminButton>
            <AdminButton variant="outline" size="sm" onClick={() => handleExport("xlsx")}>
              Xuất Excel
            </AdminButton>
          </div>
        </AdminCardHeader>
        <AdminCardContent>
          {bookingsQuery.isError ? (
            <div className="rounded-2xl border border-white/10 bg-[#111a25] p-4 text-sm text-white/70">
              Không thể tải booking.
              <button
                type="button"
                onClick={() => bookingsQuery.refetch()}
                className="ml-2 rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70 hover:text-white"
              >
                Retry
              </button>
            </div>
          ) : (
            <DataTable columns={columns} data={bookingsQuery.data?.items || []} searchColumn="customer" />
          )}
        </AdminCardContent>
      </AdminCard>
      <AdminDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AdminDialogContent className="max-h-[85vh] w-[96vw] max-w-6xl overflow-y-auto border-white/10 bg-[#0f1722] text-white">
          <AdminDialogHeader>
            <AdminDialogTitle>Comprehensive Spa Reservation</AdminDialogTitle>
          </AdminDialogHeader>
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-[#101826] p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-white/50">Guest Information</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="h-11 rounded-xl border border-white/10 bg-[#0f1722] px-4 text-sm text-white/80 placeholder:text-white/40"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-11 rounded-xl border border-white/10 bg-[#0f1722] px-4 text-sm text-white/80 placeholder:text-white/40"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="h-11 rounded-xl border border-white/10 bg-[#0f1722] px-4 text-sm text-white/80 placeholder:text-white/40"
                  />
                  <input
                    type="text"
                    placeholder="WhatsApp ID"
                    value={whatsappId}
                    onChange={(event) => setWhatsappId(event.target.value)}
                    className="h-11 rounded-xl border border-white/10 bg-[#0f1722] px-4 text-sm text-white/80 placeholder:text-white/40"
                  />
                  <input
                    type="text"
                    placeholder="Line ID"
                    value={lineId}
                    onChange={(event) => setLineId(event.target.value)}
                    className="h-11 rounded-xl border border-white/10 bg-[#0f1722] px-4 text-sm text-white/80 placeholder:text-white/40"
                  />
                  <input
                    type="text"
                    placeholder="WeChat ID"
                    value={wechatId}
                    onChange={(event) => setWechatId(event.target.value)}
                    className="h-11 rounded-xl border border-white/10 bg-[#0f1722] px-4 text-sm text-white/80 placeholder:text-white/40"
                  />
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#101826] p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/50">Your Spa Package</p>
                  <button
                    type="button"
                    onClick={addService}
                    className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff9f40]"
                  >
                    Add another service
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="grid gap-3 rounded-xl border border-white/10 bg-[#0f1722] p-4 md:grid-cols-[2fr_1fr_1fr]"
                    >
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Service</p>
                        <select
                          value={service.serviceId || ""}
                          onChange={(event) => {
                            const nextId = Number(event.target.value);
                            const nextService = resolveService(nextId);
                            updateService(service.id, {
                              serviceId: nextId,
                              serviceLabel: nextService?.name || service.serviceLabel,
                              optionId: nextService?.priceOptions?.[0]?.id,
                            });
                          }}
                          className="mt-2 h-10 w-full rounded-lg border border-white/10 bg-[#111a25] px-3 text-sm text-white/80"
                        >
                          {availableServices.length
                            ? availableServices.map((option) => (
                                <option key={option.id} value={option.id}>
                                  {option.name}
                                </option>
                              ))
                            : fallbackServices.map((option) => (
                                <option key={option} value="">
                                  {option}
                                </option>
                              ))}
                        </select>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Duration</p>
                        <select
                          value={
                            service.optionId
                              ? String(service.optionId)
                              : service.duration || fallbackDurations[0]
                          }
                          onChange={(event) => {
                            const nextOptionId = Number(event.target.value);
                            if (Number.isNaN(nextOptionId)) {
                              updateService(service.id, { duration: event.target.value });
                              return;
                            }
                            const options = resolveService(service.serviceId)?.priceOptions || [];
                            const nextOption = options.find((opt) => opt.id === nextOptionId);
                            updateService(service.id, {
                              optionId: nextOptionId,
                              duration: nextOption?.durationMinutes
                                ? `${nextOption.durationMinutes} min`
                                : service.duration,
                            });
                          }}
                          className="mt-2 h-10 w-full rounded-lg border border-white/10 bg-[#111a25] px-3 text-sm text-white/80"
                        >
                          {resolveService(service.serviceId)?.priceOptions?.length
                            ? resolveService(service.serviceId)?.priceOptions?.map((option) => (
                                <option key={option.id} value={option.id}>
                                  {option.durationMinutes
                                    ? `${option.durationMinutes} min · ${option.price.toLocaleString("vi-VN")} đ`
                                    : `${option.code} · ${option.price.toLocaleString("vi-VN")} đ`}
                                </option>
                              ))
                            : fallbackDurations.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                        </select>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Guests</p>
                        <input
                          type="number"
                          min={1}
                          value={service.guests}
                          onChange={(event) =>
                            updateService(service.id, { guests: Number(event.target.value) || 1 })
                          }
                          className="mt-2 h-10 w-full rounded-lg border border-white/10 bg-[#111a25] px-3 text-sm text-white/80"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#101826] p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-white/50">Booking Schedule</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(event) => setScheduleDate(event.target.value)}
                    className="h-11 rounded-xl border border-white/10 bg-[#0f1722] px-4 text-sm text-white/80"
                  />
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(event) => setScheduleTime(event.target.value)}
                    className="h-11 rounded-xl border border-white/10 bg-[#0f1722] px-4 text-sm text-white/80"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-[#101826] p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-white/50">Special Requirements</p>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Pick-up location, allergies, or therapist preferences..."
                  className="mt-3 min-h-[130px] w-full rounded-xl border border-white/10 bg-[#0f1722] px-4 py-3 text-sm text-white/80 placeholder:text-white/40"
                />
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#101826] p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-white/50">Payment Method</p>
                <div className="mt-4 grid gap-3">
                  <div className="grid gap-3 md:grid-cols-3">
                    {[
                      { value: "cash", label: "Cash" },
                      { value: "transfer", label: "Bank Transfer" },
                      { value: "card", label: "Credit Card" },
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
                      <p>Account number: 4789717</p>
                      <p>Bank: ACB</p>
                      <p>Account name: Phạm Thị Dung</p>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#101826] p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white/60">Total Amount</p>
                  <p className="text-2xl font-semibold text-[#ff9f40]">
                    {totalAmount.toLocaleString("vi-VN")} đ
                  </p>
                </div>
                {bookingError ? (
                  <p className="mt-3 text-sm text-rose-300">{bookingError}</p>
                ) : null}
                {canEditBookings ? (
                  <AdminButton
                    className="mt-4 w-full"
                    onClick={handleSaveBooking}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? "Saving..." : "Cập nhật booking"}
                  </AdminButton>
                ) : (
                  <AdminButton className="mt-4 w-full" disabled>
                    Chỉ xem
                  </AdminButton>
                )}
              </div>
            </div>
          </div>
        </AdminDialogContent>
      </AdminDialog>
    </div>
  );
}
