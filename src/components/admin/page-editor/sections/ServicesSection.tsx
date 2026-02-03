import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Textarea from "@/components/common/Textarea";
import { getHomeServices, updateHomeServices } from "@/lib/api/admin";
import { storageKey } from "@/components/admin/page-editor/defaults";
import type { ServicesState } from "@/components/admin/page-editor/types";
import { formatVnd } from "@/components/admin/page-editor/utils";
import type { AdminService } from "@/types/api.types";
import type { Dispatch, SetStateAction } from "react";

type MediaTarget = {
  section: "highlights" | "recovery" | "services";
  index: number;
};

export type ServicesSectionProps = {
  activeLang: "vi" | "en";
  currentServices: ServicesState;
  adminServices: AdminService[];
  getServiceName: (service: AdminService | undefined, code: "vi" | "en") => string;
  setServicesByLang: Dispatch<SetStateAction<Record<string, ServicesState>>>;
  setIsDirty: (value: boolean) => void;
  setMediaTarget: (value: MediaTarget | null) => void;
  setMediaDialogOpen: (value: boolean) => void;
  notify: (text: string, type?: "success" | "error" | "info") => void;
  handleError: (err: unknown) => void;
};

export default function ServicesSection({
  activeLang,
  currentServices,
  adminServices,
  getServiceName,
  setServicesByLang,
  setIsDirty,
  setMediaTarget,
  setMediaDialogOpen,
  notify,
  handleError,
}: ServicesSectionProps) {
  return (
    <section
      id="services"
      className="rounded-[28px] bg-white p-6 text-[#0f1722] shadow-[0_30px_80px_rgba(5,10,18,0.35)]"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ff9f40]/15 text-[#ff6a3d]">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16" />
              <path d="M4 12h12" />
              <path d="M4 18h8" />
            </svg>
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Services Section</p>
            <p className="text-sm text-slate-500">Chọn dịch vụ hiển thị trên trang chủ.</p>
          </div>
        </div>
      </div>
      <div className="mt-5 grid gap-4">
        <Input
          label="Heading"
          value={currentServices.heading}
          onChange={(event) => {
            setIsDirty(true);
            setServicesByLang((prev) => ({
              ...prev,
              [activeLang]: { ...prev[activeLang], heading: event.target.value },
            }));
          }}
        />
        <Textarea
          label="Description"
          value={currentServices.description}
          onChange={(event) => {
            setIsDirty(true);
            setServicesByLang((prev) => ({
              ...prev,
              [activeLang]: { ...prev[activeLang], description: event.target.value },
            }));
          }}
        />
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Chọn dịch vụ</p>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {adminServices.map((service) => {
              const checked = currentServices.items.some(
                (item) => item.serviceId === service.id
              );
              return (
                <label
                  key={`svc-${service.id}`}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => {
                      setIsDirty(true);
                      setServicesByLang((prev) => {
                        const items = [...(prev[activeLang]?.items ?? [])];
                        if (event.target.checked) {
                          items.push({
                            serviceId: service.id,
                            imageUrl: "",
                            label: getServiceName(service, activeLang),
                            priceNote: "",
                          });
                        } else {
                          const index = items.findIndex(
                            (item) => item.serviceId === service.id
                          );
                          if (index >= 0) items.splice(index, 1);
                        }
                        return {
                          ...prev,
                          [activeLang]: { ...prev[activeLang], items },
                        };
                      });
                    }}
                  />
                  <span className="font-semibold">{getServiceName(service, activeLang)}</span>
                </label>
              );
            })}
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {currentServices.items.map((item, index) => (
            <div
              key={`service-item-${item.serviceId}-${index}`}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              {(() => {
                const service = adminServices.find(
                  (svc) => svc.id === item.serviceId
                );
                const prices = service?.priceOptions?.map((opt) => opt.price) ?? [];
                const minPrice = prices.length ? Math.min(...prices) : null;
                const previewTitle =
                  item.label?.trim() || getServiceName(service, activeLang) || "Service";
                const previewPrice =
                  item.priceNote?.trim() ||
                  (minPrice !== null ? `From ${formatVnd(minPrice)} VND` : "Liên hệ");
                return (
                  <div className="mb-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                    <div className="font-semibold text-slate-700">
                      Preview: {previewTitle}
                    </div>
                    <div className="text-slate-500">{previewPrice}</div>
                  </div>
                );
              })()}
              <Input
                label="Custom title"
                value={item.label || ""}
                placeholder={
                  getServiceName(
                    adminServices.find((svc) => svc.id === item.serviceId),
                    activeLang
                  ) || "Service name"
                }
                onChange={(event) => {
                  setIsDirty(true);
                  setServicesByLang((prev) => {
                    const next = [...(prev[activeLang]?.items ?? [])];
                    next[index] = { ...next[index], label: event.target.value };
                    return {
                      ...prev,
                      [activeLang]: { ...prev[activeLang], items: next },
                    };
                  });
                }}
              />
              <Input
                label="Price note"
                value={item.priceNote || ""}
                onChange={(event) => {
                  setIsDirty(true);
                  setServicesByLang((prev) => {
                    const next = [...(prev[activeLang]?.items ?? [])];
                    next[index] = { ...next[index], priceNote: event.target.value };
                    return {
                      ...prev,
                      [activeLang]: { ...prev[activeLang], items: next },
                    };
                  });
                }}
              />
              <Input
                label="Image URL"
                value={item.imageUrl || ""}
                onChange={(event) => {
                  setIsDirty(true);
                  setServicesByLang((prev) => {
                    const next = [...(prev[activeLang]?.items ?? [])];
                    next[index] = { ...next[index], imageUrl: event.target.value };
                    return {
                      ...prev,
                      [activeLang]: { ...prev[activeLang], items: next },
                    };
                  });
                }}
              />
              <div className="mt-2 flex justify-end">
                <Button
                  type="button"
                  className="px-4 py-2 text-xs"
                  onClick={() => {
                    setMediaTarget({ section: "services", index });
                    setMediaDialogOpen(true);
                  }}
                >
                  Chọn từ Media
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button
          onClick={async () => {
            try {
              const normalizedItems = (currentServices.items || []).map((item) => ({
                serviceId: item.serviceId,
                imageUrl: item.imageUrl?.trim() || "",
                label: item.label?.trim() || "",
                priceNote: item.priceNote?.trim() || "",
              }));
              await updateHomeServices(undefined, activeLang, {
                heading: currentServices.heading,
                description: currentServices.description,
                items: normalizedItems,
              });
              const fresh = await getHomeServices(undefined, activeLang);
              if (fresh) {
                setServicesByLang((prev) => ({
                  ...prev,
                  [activeLang]: {
                    heading: fresh.heading ?? "",
                    description: fresh.description ?? "",
                    items: Array.isArray(fresh.items)
                      ? fresh.items.map((entry) => ({
                          serviceId: entry?.serviceId ?? undefined,
                          imageUrl: entry?.imageUrl ?? "",
                          label: entry?.label ?? "",
                          priceNote: entry?.priceNote ?? "",
                        }))
                      : [],
                  },
                }));
              }
              notify("Services section updated.", "success");
              setIsDirty(false);
              if (typeof window !== "undefined") {
                window.localStorage.removeItem(storageKey);
              }
            } catch (err) {
              handleError(err);
            }
          }}
        >
          Save services
        </Button>
      </div>
    </section>
  );
}
