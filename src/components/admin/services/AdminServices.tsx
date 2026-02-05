"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createAdminService,
  deleteAdminService,
  getAdminServices,
  updateAdminService,
} from "@/lib/api/admin";
import { useAdminQuery } from "@/lib/api/adminHooks";
import { ApiError } from "@/lib/api/client";
import { useToast } from "@/components/common/ToastProvider";
import type { AdminService } from "@/types/api.types";
import { DEFAULT_LANG } from "@/lib/constants";
import { useTranslation } from "react-i18next";
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

type ServicePriceOptionForm = {
  id?: number;
  code: string;
  price: number;
  durationMinutes?: number;
  isActive: boolean;
};

type ServiceFormState = {
  key: string;
  isActive: boolean;
  priceOptions: ServicePriceOptionForm[];
};

type TranslationDraft = {
  name: string;
  description: string;
};

const emptyServiceForm = (): ServiceFormState => ({
  key: "",
  isActive: true,
  priceOptions: [
    {
      code: "60min",
      price: 0,
      durationMinutes: 60,
      isActive: true,
    },
  ],
});

export default function AdminServices() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ServiceFormState>(emptyServiceForm());
  const { i18n } = useTranslation();
  const currentLang = (i18n.language?.split("-")[0] || DEFAULT_LANG) as "vi" | "en";
  const [activeLang, setActiveLang] = useState<"vi" | "en">(currentLang);
  const [translations, setTranslations] = useState<Record<string, TranslationDraft>>({
    vi: { name: "", description: "" },
    en: { name: "", description: "" },
  });
  const [editing, setEditing] = useState<AdminService | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const servicesQuery = useAdminQuery({
    queryKey: ["admin-services"],
    queryFn: ({ signal }) => getAdminServices(undefined, signal),
    toastOnError: true,
    errorMessage: "Không thể tải danh sách dịch vụ.",
  });

  const services = servicesQuery.data?.data || [];

  const notify = (message: string, type: "success" | "error" | "info" = "info") => {
    toast.push({ message, type });
  };

  const mapServiceToForm = (service: AdminService): ServiceFormState => {
    return {
      key: service.key,
      isActive: service.isActive,
      priceOptions: service.priceOptions.length
        ? service.priceOptions.map((option) => ({
            id: option.id,
            code: option.code,
            price: option.price,
            durationMinutes: option.durationMinutes ?? undefined,
            isActive: option.isActive ?? true,
          }))
        : [
            {
              code: "60min",
              price: 0,
              durationMinutes: 60,
              isActive: true,
            },
          ],
    };
  };

  const mapTranslations = (service?: AdminService) => {
    const base = {
      vi: { name: "", description: "" },
      en: { name: "", description: "" },
    };
    if (!service) return base;
    service.translations.forEach((item) => {
      const code = item.langCode === "vn" ? "vi" : item.langCode;
      if (code !== "vi" && code !== "en") return;
      base[code] = {
        name: item.name || "",
        description: item.description || "",
      };
    });
    return base;
  };

  const translationList = useMemo(
    () =>
      Object.entries(translations)
        .map(([langCode, value]) => ({
          langCode,
          name: value.name.trim(),
          description: value.description.trim(),
        }))
        .filter((item) => item.name.length > 0),
    [translations]
  );

  const createMutation = useMutation({
    mutationFn: () =>
      createAdminService(undefined, {
        key: form.key,
        isActive: form.isActive,
        translations: translationList.map((item) => ({
          langCode: item.langCode,
          name: item.name,
          description: item.description || undefined,
        })),
        priceOptions: form.priceOptions.map((option) => ({
          code: option.code,
          price: option.price,
          durationMinutes: option.durationMinutes,
          isActive: option.isActive,
        })),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      setDialogOpen(false);
      setForm(emptyServiceForm());
      setTranslations(mapTranslations());
      notify("Service created.", "success");
    },
    onError: (err: unknown) => handleError(err),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateAdminService(undefined, editing?.id as number, {
        key: form.key,
        isActive: form.isActive,
        translations: translationList.map((item) => ({
          langCode: item.langCode,
          name: item.name,
          description: item.description || undefined,
        })),
        priceOptions: form.priceOptions.map((option) => ({
          code: option.code,
          price: option.price,
          durationMinutes: option.durationMinutes,
          isActive: option.isActive,
        })),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyServiceForm());
      setTranslations(mapTranslations());
      notify("Service updated.", "success");
    },
    onError: (err: unknown) => handleError(err),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminService(undefined, id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      notify("Service deleted.", "success");
    },
    onError: (err: unknown) => handleError(err),
  });

  const handleError = (err: unknown) => {
    if (err instanceof ApiError) {
      notify(err.message || "Request failed.", "error");
      return;
    }
    notify("Unable to reach the server. Please try again.", "error");
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyServiceForm());
    setTranslations(mapTranslations());
    setActiveLang(currentLang);
    setDialogOpen(true);
  };

  const openEdit = (service: AdminService) => {
    setEditing(service);
    setForm(mapServiceToForm(service));
    setTranslations(mapTranslations(service));
    setActiveLang(currentLang);
    setDialogOpen(true);
  };

  useEffect(() => {
    if (!dialogOpen) return;
    setActiveLang(currentLang);
  }, [currentLang, dialogOpen]);

  const addOption = () => {
    setForm((prev) => ({
      ...prev,
      priceOptions: [
        ...prev.priceOptions,
        { code: "90min", price: 0, durationMinutes: 90, isActive: true },
      ],
    }));
  };

  const updateOption = (index: number, patch: Partial<ServicePriceOptionForm>) => {
    setForm((prev) => ({
      ...prev,
      priceOptions: prev.priceOptions.map((option, idx) =>
        idx === index ? { ...option, ...patch } : option
      ),
    }));
  };

  const removeOption = (index: number) => {
    setForm((prev) => ({
      ...prev,
      priceOptions: prev.priceOptions.filter((_, idx) => idx !== index),
    }));
  };

  const currentTranslation = translations[activeLang] || { name: "", description: "" };
  const canSubmit = useMemo(
    () =>
      form.key.trim() &&
      currentTranslation.name.trim() &&
      form.priceOptions.length > 0,
    [form.key, form.priceOptions.length, currentTranslation.name]
  );

  return (
    <div className="space-y-8">
      <AdminCard className="border-white/5 bg-[#0f1722]">
        <AdminCardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="py-2">
            <AdminCardTitle>Dịch vụ</AdminCardTitle>
            <p className="text-sm text-white/60">Quản lý dịch vụ và thời lượng.</p>
          </div>
          <AdminDialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <AdminDialogTrigger asChild>
              <AdminButton onClick={openCreate}>Thêm dịch vụ</AdminButton>
            </AdminDialogTrigger>
            <AdminDialogContent className="max-w-4xl border-white/10 bg-[#0f1722] text-white">
              <AdminDialogHeader>
                <AdminDialogTitle>{editing ? "Cập nhật dịch vụ" : "Tạo dịch vụ mới"}</AdminDialogTitle>
              </AdminDialogHeader>
              <div className="space-y-6">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#111a25] p-1 text-xs uppercase tracking-[0.2em]">
                  {(["vi", "en"] as const).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setActiveLang(code)}
                      className={`rounded-full px-3 py-1 font-semibold ${
                        activeLang === code
                          ? "bg-[#ff9f40] text-[#1a1410]"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      {code.toUpperCase()}
                    </button>
                  ))}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm text-slate-300">
                    <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">
                      Service key
                    </span>
                    <AdminInput
                      value={form.key}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, key: event.target.value }))
                      }
                      placeholder="body-massage"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-300">
                    <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">
                      Service name ({activeLang})
                    </span>
                    <AdminInput
                      value={currentTranslation.name}
                      onChange={(event) =>
                        setTranslations((prev) => ({
                          ...prev,
                          [activeLang]: {
                            ...prev[activeLang],
                            name: event.target.value,
                          },
                        }))
                      }
                    />
                  </label>
                </div>
                <label className="space-y-2 text-sm text-slate-300">
                  <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">
                    Description ({activeLang})
                  </span>
                  <textarea
                    value={currentTranslation.description}
                    onChange={(event) =>
                      setTranslations((prev) => ({
                        ...prev,
                        [activeLang]: {
                          ...prev[activeLang],
                          description: event.target.value,
                        },
                      }))
                    }
                    className="min-h-[90px] w-full rounded-xl border border-white/10 bg-[#111a25] px-4 py-3 text-sm text-white/80"
                  />
                </label>
                <div className="rounded-2xl border border-white/10 bg-[#111a25] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/50">Tuỳ chọn giá</p>
                    <button
                      type="button"
                      onClick={addOption}
                      className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff9f40]"
                    >
                      Thêm option
                    </button>
                  </div>
                  <div className="mt-4 space-y-3">
                    {form.priceOptions.map((option, index) => (
                      <div
                        key={`${option.code}-${index}`}
                        className="grid gap-3 rounded-xl border border-white/10 bg-[#0f1722] p-4 md:grid-cols-[1.4fr_1fr_1fr_auto]"
                      >
                        <AdminInput
                          value={option.code}
                          onChange={(event) => updateOption(index, { code: event.target.value })}
                          placeholder="60min"
                        />
                        <AdminInput
                          type="number"
                          min={0}
                          value={option.price}
                          onChange={(event) =>
                            updateOption(index, { price: Number(event.target.value) || 0 })
                          }
                          placeholder="Giá (đ)"
                        />
                        <AdminInput
                          type="number"
                          min={0}
                          value={option.durationMinutes ?? 0}
                          onChange={(event) =>
                            updateOption(index, {
                              durationMinutes: Number(event.target.value) || 0,
                            })
                          }
                          placeholder="Thời gian (phút)"
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="rounded-full border border-white/10 px-3 text-xs uppercase tracking-[0.2em] text-white/60 hover:text-white"
                        >
                          Xoá
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3">
                    <AdminButton
                      variant="outline"
                      onClick={() => {
                        setDialogOpen(false);
                        setEditing(null);
                        setForm(emptyServiceForm());
                        setTranslations(mapTranslations());
                      }}
                    >
                      Huỷ
                    </AdminButton>
                  <AdminButton
                    onClick={() => {
                      if (!canSubmit) {
                        notify("Vui lòng nhập đầy đủ thông tin.", "error");
                        return;
                      }
                  if (editing) {
                    updateMutation.mutate();
                  } else {
                    createMutation.mutate();
                  }
                }}
                disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {editing ? "Lưu cập nhật" : "Tạo dịch vụ"}
                  </AdminButton>
                </div>
              </div>
            </AdminDialogContent>
          </AdminDialog>
        </AdminCardHeader>
        <AdminCardContent className="space-y-4">
          {servicesQuery.isError ? (
            <div className="rounded-2xl border border-white/10 bg-[#111a25] p-4 text-sm text-white/70">
              Không thể tải dịch vụ. 
              <button
                type="button"
                onClick={() => servicesQuery.refetch()}
                className="ml-2 rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70 hover:text-white"
              >
                Retry
              </button>
            </div>
          ) : services.length ? (
            services.map((service) => {
              const translation =
                service.translations.find((item) => item.langCode === activeLang) ??
                (activeLang === "vi"
                  ? service.translations.find((item) => item.langCode === "vn")
                  : undefined) ??
                service.translations[0];
              return (
                <div
                  key={service.id}
                  className="rounded-3xl border border-white/10 bg-[#16202c] p-5 text-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {translation?.name || service.key}
                      </p>
                      <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                        {service.key}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {service.isActive ? (
                        <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-300">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/50">
                          Hidden
                        </span>
                      )}
                      <AdminButton variant="secondary" size="sm" onClick={() => openEdit(service)}>
                        Sửa
                      </AdminButton>
                      <AdminAlertDialog>
                        <AdminAlertDialogTrigger asChild>
                          <AdminButton variant="outline" size="sm">
                            Xoá
                          </AdminButton>
                        </AdminAlertDialogTrigger>
                        <AdminAlertDialogContent>
                          <AdminAlertDialogTitle>Delete service?</AdminAlertDialogTitle>
                          <AdminAlertDialogDescription>
                            Dữ liệu sẽ bị xoá khỏi hệ thống. Hãy chắc chắn trước khi tiếp tục.
                          </AdminAlertDialogDescription>
                          <div className="mt-5 flex items-center justify-end gap-3">
                            <AdminAlertDialogCancel>Huỷ</AdminAlertDialogCancel>
                            <AdminAlertDialogAction
                              onClick={() => deleteMutation.mutate(service.id)}
                            >
                              Xoá
                            </AdminAlertDialogAction>
                          </div>
                        </AdminAlertDialogContent>
                      </AdminAlertDialog>
                    </div>
                  </div>
                  {translation?.description ? (
                    <p className="mt-3 text-sm text-white/60">{translation.description}</p>
                  ) : null}
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    {service.priceOptions.map((option) => (
                      <div
                        key={option.id ?? option.code}
                        className="rounded-2xl border border-white/10 bg-[#0f1722] px-4 py-3"
                      >
                        <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                          {option.code}
                        </p>
                        <p className="mt-2 text-lg font-semibold text-white">
                          {option.price.toLocaleString("vi-VN")} đ
                        </p>
                        {option.durationMinutes ? (
                          <p className="text-xs text-white/60">
                            {option.durationMinutes} phút
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-white/60">Chưa có dịch vụ nào.</p>
          )}
        </AdminCardContent>
      </AdminCard>
    </div>
  );
}
