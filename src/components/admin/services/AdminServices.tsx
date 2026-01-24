"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import {
  createAdminService,
  deleteAdminService,
  getAdminServices,
  updateAdminService,
} from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ApiError } from "@/lib/api/client";
import { useToast } from "@/components/common/ToastProvider";
import type { AdminService } from "@/types/api.types";

type ServicePriceOptionForm = {
  id?: number;
  code: string;
  price: number;
  durationMinutes?: number;
  isActive: boolean;
};

type ServiceFormState = {
  key: string;
  name: string;
  description: string;
  isActive: boolean;
  priceOptions: ServicePriceOptionForm[];
};

const emptyServiceForm = (): ServiceFormState => ({
  key: "",
  name: "",
  description: "",
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
  const pathname = usePathname();
  const lang = pathname.split("/").filter(Boolean)[0] || "vi";
  const [form, setForm] = useState<ServiceFormState>(emptyServiceForm());
  const [editing, setEditing] = useState<AdminService | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const servicesQuery = useQuery({
    queryKey: ["admin-services"],
    queryFn: () => getAdminServices(undefined),
  });

  const services = servicesQuery.data?.data || [];

  const notify = (message: string, type: "success" | "error" | "info" = "info") => {
    toast.push({ message, type });
  };

  const mapServiceToForm = (service: AdminService): ServiceFormState => {
    const translation =
      service.translations.find((item) => item.langCode === lang) ||
      (lang === "vi" ? service.translations.find((item) => item.langCode === "vn") : undefined) ||
      service.translations[0];
    return {
      key: service.key,
      name: translation?.name || "",
      description: translation?.description || "",
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

  const createMutation = useMutation({
    mutationFn: () =>
      createAdminService(undefined, {
        key: form.key,
        isActive: form.isActive,
        translations: [
          {
            langCode: lang,
            name: form.name,
            description: form.description || undefined,
          },
        ],
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
      notify("Service created.", "success");
    },
    onError: (err: unknown) => handleError(err),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateAdminService(undefined, editing?.id as number, {
        key: form.key,
        isActive: form.isActive,
        translations: [
          {
            langCode: lang,
            name: form.name,
            description: form.description || undefined,
          },
        ],
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
    setDialogOpen(true);
  };

  const openEdit = (service: AdminService) => {
    setEditing(service);
    setForm(mapServiceToForm(service));
    setDialogOpen(true);
  };

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

  const canSubmit = useMemo(
    () => form.key.trim() && form.name.trim() && form.priceOptions.length > 0,
    [form]
  );

  return (
    <div className="space-y-8">
      <Card className="border-white/5 bg-[#0f1722]">
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="py-2">
            <CardTitle>Dịch vụ</CardTitle>
            <p className="text-sm text-white/60">Quản lý dịch vụ và thời lượng.</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>Thêm dịch vụ</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl border-white/10 bg-[#0f1722] text-white">
              <DialogHeader>
                <DialogTitle>{editing ? "Cập nhật dịch vụ" : "Tạo dịch vụ mới"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm text-slate-300">
                    <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">
                      Service key
                    </span>
                    <Input
                      value={form.key}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, key: event.target.value }))
                      }
                      placeholder="body-massage"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-300">
                    <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">
                      Service name ({lang})
                    </span>
                    <Input
                      value={form.name}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, name: event.target.value }))
                      }
                    />
                  </label>
                </div>
                <label className="space-y-2 text-sm text-slate-300">
                  <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">
                    Description ({lang})
                  </span>
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, description: event.target.value }))
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
                        <Input
                          value={option.code}
                          onChange={(event) => updateOption(index, { code: event.target.value })}
                          placeholder="60min"
                        />
                        <Input
                          type="number"
                          min={0}
                          value={option.price}
                          onChange={(event) =>
                            updateOption(index, { price: Number(event.target.value) || 0 })
                          }
                          placeholder="Giá (đ)"
                        />
                        <Input
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
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      setEditing(null);
                      setForm(emptyServiceForm());
                    }}
                  >
                    Huỷ
                  </Button>
                  <Button
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
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-4">
          {services.length ? (
            services.map((service) => {
              const translation =
                service.translations.find((item) => item.langCode === lang) ??
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
                      <Button variant="secondary" size="sm" onClick={() => openEdit(service)}>
                        Sửa
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Xoá
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogTitle>Delete service?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Dữ liệu sẽ bị xoá khỏi hệ thống. Hãy chắc chắn trước khi tiếp tục.
                          </AlertDialogDescription>
                          <div className="mt-5 flex items-center justify-end gap-3">
                            <AlertDialogCancel>Huỷ</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(service.id)}
                            >
                              Xoá
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
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
        </CardContent>
      </Card>
    </div>
  );
}
