import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Button from "../../Button";
import type { PublicService } from "@/types/api.types";
import type { BookingServiceRow } from "../types";

export type BookingDialogProps = {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  fixedT: (key: string) => string;
  services: PublicService[];
  servicesLoading: boolean;
  bookingServices: BookingServiceRow[];
  scheduleDate: string;
  scheduleTime: string;
  paymentMethod: "cash" | "transfer" | "card";
  notes: string;
  fullName: string;
  phone: string;
  email: string;
  whatsappId: string;
  lineId: string;
  wechatId: string;
  bookingError: string;
  isSubmitting: boolean;
  fieldErrors: Record<string, string>;
  addBookingService: () => void;
  updateBookingService: (id: string, patch: Partial<BookingServiceRow>) => void;
  resolveService: (row: BookingServiceRow) => PublicService | undefined;
  formatPrice: (value: number) => string;
  totalAmount: number;
  setScheduleDate: (value: string) => void;
  setScheduleTime: (value: string) => void;
  setPaymentMethod: (value: "cash" | "transfer" | "card") => void;
  setNotes: (value: string) => void;
  setFullName: (value: string) => void;
  setPhone: (value: string) => void;
  setEmail: (value: string) => void;
  setWhatsappId: (value: string) => void;
  setLineId: (value: string) => void;
  setWechatId: (value: string) => void;
  handleSubmit: () => void;
};

export const BookingDialog = ({
  open,
  onOpenChange,
  fixedT,
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
}: BookingDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                    fieldErrors.fullName ? "border-rose-500 ring-1 ring-rose-500/40" : "border-white/10"
                  }`}
                />
                <input
                  type="email"
                  placeholder={fixedT("bookingPopup.placeholders.email")}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={`h-11 rounded-xl border bg-[#0f1722] px-4 text-sm text-white/80 placeholder:text-white/40 ${
                    fieldErrors.email ? "border-rose-500 ring-1 ring-rose-500/40" : "border-white/10"
                  }`}
                />
                <input
                  type="tel"
                  placeholder={fixedT("bookingPopup.placeholders.phone")}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className={`h-11 rounded-xl border bg-[#0f1722] px-4 text-sm text-white/80 placeholder:text-white/40 ${
                    fieldErrors.phone ? "border-rose-500 ring-1 ring-rose-500/40" : "border-white/10"
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
                  const lineTotal = selectedOption ? selectedOption.price * (item.guests || 1) : 0;
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
                                duration: "60 minutes",
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
                            ? services.map((serviceItem) => (
                                <option key={serviceItem.id} value={`id:${serviceItem.id}`}>
                                  {serviceItem.name}
                                </option>
                              ))
                            : ["Aroma Massage", "Stone Therapy", "Facial Care", "Body Scrub"].map((serviceItem) => (
                                <option key={serviceItem} value={`label:${serviceItem}`}>
                                  {serviceItem}
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
                              : item.duration || "60 minutes"
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
                            : ["60 minutes", "90 minutes", "120 minutes"].map((option) => (
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
                            {formatPrice(selectedOption.price)} đ / {fixedT("bookingPopup.labels.guests")} - {formatPrice(lineTotal)} đ
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
                    fieldErrors.scheduleDate ? "border-rose-500 ring-1 ring-rose-500/40" : "border-white/10"
                  }`}
                />
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(event) => setScheduleTime(event.target.value)}
                  className={`h-11 rounded-xl border bg-[#0f1722] px-4 text-sm text-white/80 ${
                    fieldErrors.scheduleTime ? "border-rose-500 ring-1 ring-rose-500/40" : "border-white/10"
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
                <p className="text-2xl font-semibold text-[#ff9f40]">{formatPrice(totalAmount || 0)} đ</p>
              </div>
              {bookingError ? <p className="mt-3 text-sm text-rose-300">{bookingError}</p> : null}
              <Button className="mt-4 w-full" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? fixedT("form.sending") : fixedT("bookingPopup.bookNow")}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
