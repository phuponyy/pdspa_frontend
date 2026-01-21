"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadSchema, type LeadFormValues } from "@/lib/schemas/leadSchema";
import { submitLead } from "@/lib/api/public";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Textarea from "@/components/common/Textarea";
import type { PublicService } from "@/types/api.types";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function ContactForm({
  lang,
  services,
}: {
  lang: string;
  services?: PublicService[];
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      note: "",
      langCode: lang,
      items: [],
    },
  });

  const items = useWatch({ control, name: "items" });

  const toggleService = (serviceId: number, priceOptionId: number) => {
    const existing = items?.find((item) => item.serviceId === serviceId);
    const nextItems = existing
      ? items.filter((item) => item.serviceId !== serviceId)
      : [...(items || []), { serviceId, priceOptionId, qty: 1 }];
    setValue("items", nextItems, { shouldValidate: false, shouldDirty: true });
  };

  const updateQty = (serviceId: number, qty: number) => {
    const nextItems = (items || []).map((item) =>
      item.serviceId === serviceId ? { ...item, qty } : item
    );
    setValue("items", nextItems, { shouldValidate: false, shouldDirty: true });
  };

  const updatePriceOption = (serviceId: number, priceOptionId: number) => {
    const nextItems = (items || []).map((item) =>
      item.serviceId === serviceId ? { ...item, priceOptionId } : item
    );
    setValue("items", nextItems, { shouldValidate: false, shouldDirty: true });
  };

  const onSubmit = async (data: LeadFormValues) => {
    setStatus("loading");
    try {
      await submitLead(data);
      setStatus("success");
    } catch (error) {
      setStatus("error");
    }
  };

  const serviceList = services?.length ? services : [];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-6 rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label={t("form.fullName")}
          error={errors.fullName?.message}
          {...register("fullName")}
        />
        <Input
          label={t("form.phone")}
          error={errors.phone?.message}
          {...register("phone")}
        />
      </div>
      <Input
        label={t("form.email")}
        error={errors.email?.message}
        type="email"
        {...register("email")}
      />
      <Textarea
        label={t("form.note")}
        error={errors.note?.message}
        {...register("note")}
      />
      <div className="space-y-3">
        <p className="text-sm font-semibold text-[var(--ink)]">
          {t("form.pickServices")}
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {serviceList.length ? (
            serviceList.map((service) => {
              const serviceId = service.id;
            const selected = items?.some((item) => item.serviceId === serviceId);
            const selectedItem = items?.find((item) => item.serviceId === serviceId);
            const defaultOption = service.priceOptions[0];
            const selectedOptionId = selectedItem?.priceOptionId ?? defaultOption?.id;
            const selectedOption = service.priceOptions.find(
              (option) => option.id === selectedOptionId
            );
            return (
              <label
                key={serviceId}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-sm transition ${
                  selected
                    ? "border-[var(--accent-strong)] bg-[rgba(255,106,61,0.08)]"
                    : "border-[var(--line)] bg-[var(--mist)]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected || false}
                  disabled={!defaultOption}
                  onChange={() =>
                    defaultOption
                      ? toggleService(serviceId, defaultOption.id)
                      : null
                  }
                  className="mt-1 h-4 w-4 rounded border-[var(--line)] accent-[var(--accent-strong)]"
                />
                <div className="space-y-2">
                  <div className="font-semibold text-[var(--ink)]">
                    {service.name}
                  </div>
                  <p className="text-xs text-[var(--ink-muted)]">
                    {service.description || t("form.serviceDescriptionFallback")}
                  </p>
                  {service.priceOptions.length ? (
                    <div className="text-xs text-[var(--ink-muted)]">
                      {t("form.priceFrom")}{" "}
                      <span className="font-semibold text-[var(--ink)]">
                        {service.priceOptions[0].price.toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                  ) : null}
                  {selected ? (
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      {service.priceOptions.length ? (
                        <label className="flex items-center gap-2">
                          <span className="text-[var(--ink-muted)]">
                            {t("form.optionLabel")}
                          </span>
                          <select
                            className="h-8 rounded-full border border-[var(--line)] bg-white px-2 text-xs"
                            value={selectedOptionId}
                            onChange={(event) =>
                              updatePriceOption(
                                serviceId,
                                Number(event.target.value)
                              )
                            }
                          >
                            {service.priceOptions.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.code} -{" "}
                                {option.price.toLocaleString("vi-VN")}₫
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : null}
                      <label className="flex items-center gap-2">
                        <span className="text-[var(--ink-muted)]">
                          {t("form.qtyLabel")}
                        </span>
                        <input
                          type="number"
                          min={1}
                          value={selectedItem?.qty || 1}
                          onChange={(event) =>
                            updateQty(serviceId, Number(event.target.value) || 1)
                          }
                          className="h-8 w-16 rounded-full border border-[var(--line)] px-2 text-sm"
                        />
                      </label>
                      {selectedOption ? (
                        <span className="text-[var(--ink-muted)]">
                          {t("form.total")}{" "}
                          <span className="font-semibold text-[var(--ink)]">
                            {(selectedOption.price * (selectedItem?.qty || 1)).toLocaleString(
                              "vi-VN"
                            )}
                            ₫
                          </span>
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </label>
            );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--mist)] p-6 text-sm text-[var(--ink-muted)]">
              {t("form.servicesEmpty")}
            </div>
          )}
        </div>
        {errors.items?.message ? (
          <p className="text-xs text-red-500">{errors.items.message}</p>
        ) : null}
      </div>
      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? t("form.sending") : t("form.submit")}
      </Button>
      {status === "success" ? (
        <p className="text-sm text-[var(--jade)]">{t("form.success")}</p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm text-red-500">{t("form.error")}</p>
      ) : null}
    </form>
  );
}

