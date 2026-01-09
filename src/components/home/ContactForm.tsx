"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadSchema, type LeadFormValues } from "@/lib/schemas/leadSchema";
import { submitLead } from "@/lib/api/public";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Textarea from "@/components/common/Textarea";
import type { HomeSectionItem } from "@/types/page.types";
import { useState } from "react";

export default function ContactForm({
  lang,
  services,
  labels,
}: {
  lang: string;
  services?: HomeSectionItem[];
  labels: {
    fullName: string;
    phone: string;
    email: string;
    note: string;
    submit: string;
    pickServices: string;
  };
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );

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

  const toggleService = (serviceId: number, priceOptionId?: number) => {
    const existing = items?.find((item) => item.serviceId === serviceId);
    const nextItems = existing
      ? items.filter((item) => item.serviceId !== serviceId)
      : [...(items || []), { serviceId, priceOptionId, qty: 1 }];
    setValue("items", nextItems, { shouldValidate: true });
  };

  const updateQty = (serviceId: number, qty: number) => {
    const nextItems = (items || []).map((item) =>
      item.serviceId === serviceId ? { ...item, qty } : item
    );
    setValue("items", nextItems, { shouldValidate: true });
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

  const serviceList = services?.length ? services : fallbackServices;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-6 rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label={labels.fullName}
          error={errors.fullName?.message}
          {...register("fullName")}
        />
        <Input
          label={labels.phone}
          error={errors.phone?.message}
          {...register("phone")}
        />
      </div>
      <Input
        label={labels.email}
        error={errors.email?.message}
        type="email"
        {...register("email")}
      />
      <Textarea
        label={labels.note}
        error={errors.note?.message}
        {...register("note")}
      />
      <div className="space-y-3">
        <p className="text-sm font-semibold text-[var(--ink)]">
          {labels.pickServices}
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {serviceList.map((service, index) => {
            const serviceId = Number(service.serviceId || service.id || index + 1);
            const selected = items?.some((item) => item.serviceId === serviceId);
            return (
              <label
                key={serviceId}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-sm transition ${
                  selected
                    ? "border-[var(--jade)] bg-[rgba(31,107,95,0.08)]"
                    : "border-[var(--line)] bg-[var(--mist)]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected || false}
                  onChange={() =>
                    toggleService(
                      serviceId,
                      service.priceOptions?.[0]?.id
                    )
                  }
                  className="mt-1 h-4 w-4 rounded border-[var(--line)] accent-[var(--jade)]"
                />
                <div className="space-y-2">
                  <div className="font-semibold text-[var(--ink)]">
                    {service.title || "Custom service"}
                  </div>
                  <p className="text-xs text-[var(--ink-muted)]">
                    {service.description || "Tailored recommendation with our team."}
                  </p>
                  {selected ? (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[var(--ink-muted)]">Qty</span>
                      <input
                        type="number"
                        min={1}
                        value={
                          items?.find((item) => item.serviceId === serviceId)?.qty ||
                          1
                        }
                        onChange={(event) =>
                          updateQty(serviceId, Number(event.target.value) || 1)
                        }
                        className="h-8 w-16 rounded-full border border-[var(--line)] px-2 text-sm"
                      />
                    </div>
                  ) : null}
                </div>
              </label>
            );
          })}
        </div>
        {errors.items?.message ? (
          <p className="text-xs text-red-500">{errors.items.message}</p>
        ) : null}
      </div>
      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending..." : labels.submit}
      </Button>
      {status === "success" ? (
        <p className="text-sm text-[var(--jade)]">
          We received your request. Our team will reach out shortly.
        </p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm text-red-500">
          Unable to submit right now. Please try again.
        </p>
      ) : null}
    </form>
  );
}

const fallbackServices: HomeSectionItem[] = [
  {
    id: 1,
    title: "Aroma body reset",
    description: "Light pressure with aroma oils to release tension.",
  },
  {
    id: 2,
    title: "Signature foot therapy",
    description: "Focused reflexology with calming herbal compress.",
  },
];
