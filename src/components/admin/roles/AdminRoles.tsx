"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  createAdminRole,
  deleteAdminRole,
  getAdminRoles,
  updateAdminRole,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { AdminRole } from "@/types/api.types";
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
} from "@/components/admin/ui/AdminDialog";
import { AdminCard, AdminCardContent, AdminCardHeader, AdminCardTitle } from "@/components/admin/ui/AdminCard";
import { useToast } from "@/components/common/ToastProvider";

const PERMISSION_OPTIONS = [
  { key: "view_dashboard", label: "Overview & Analytics" },
  { key: "view_live", label: "Live dashboard" },
  { key: "view_bookings", label: "View bookings" },
  { key: "edit_bookings", label: "Edit bookings" },
  { key: "manage_customers", label: "Customers" },
  { key: "manage_services", label: "Services" },
  { key: "export_data", label: "Exports" },
  { key: "manage_staff", label: "Staff" },
  { key: "manage_users", label: "Users & roles" },
  { key: "manage_pages", label: "Pages" },
  { key: "manage_posts", label: "Posts" },
  { key: "manage_media", label: "Media" },
  { key: "manage_redirects", label: "Redirects" },
  { key: "manage_broken_links", label: "Broken links" },
  { key: "manage_keywords", label: "Keyword tracking" },
];

export default function AdminRoles() {
  const toast = useToast();
  const { t } = useTranslation();
  const [form, setForm] = useState({
    key: "",
    name: "",
    description: "",
    permissions: [] as string[],
  });

  const rolesQuery = useQuery({
    queryKey: ["admin-roles"],
    queryFn: () => getAdminRoles(undefined),
  });

  const roles = rolesQuery.data?.data || [];

  const notify = (text: string, type: "success" | "error" | "info" = "info") => {
    toast.push({ message: text, type });
  };

  const handleError = (err: unknown) => {
    if (err instanceof ApiError) {
      notify(err.message || "Request failed.", "error");
      return;
    }
    notify("Unable to reach the server. Please try again.", "error");
  };

  const togglePermission = (key: string) => {
    setForm((prev) => {
      const next = prev.permissions.includes(key)
        ? prev.permissions.filter((permission) => permission !== key)
        : [...prev.permissions, key];
      return { ...prev, permissions: next };
    });
  };

  return (
    <div className="space-y-8">
      <AdminCard className="border-white/5 bg-[#0f1722]">
        <AdminCardHeader className="py-2">
          <AdminCardTitle>{t("admin.roles.title")}</AdminCardTitle>
        </AdminCardHeader>
        <AdminCardContent className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-[#111a25] p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              {t("admin.roles.createTitle")}
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="space-y-2 text-sm text-slate-300">
                <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">
                  {t("admin.roles.key")}
                </span>
                <AdminInput
                  value={form.key}
                  onChange={(event) =>
                    setForm({ ...form, key: event.target.value.toUpperCase() })
                  }
                  placeholder="CUSTOM_ROLE"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">
                  {t("admin.roles.name")}
                </span>
                <AdminInput
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">
                  {t("admin.roles.description")}
                </span>
                <AdminInput
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {PERMISSION_OPTIONS.map((permission) => {
                const active = form.permissions.includes(permission.key);
                return (
                  <button
                    key={permission.key}
                    type="button"
                    className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${
                      active
                        ? "border-[#2f7bff] bg-[#2f7bff]/20 text-white"
                        : "border-white/10 text-white/60"
                    }`}
                    onClick={() => togglePermission(permission.key)}
                  >
                    {permission.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-5">
              <AdminButton
                onClick={async () => {
                  try {
                    await createAdminRole(undefined, form);
                    notify("Role created.", "success");
                    setForm({ key: "", name: "", description: "", permissions: [] });
                    await rolesQuery.refetch();
                  } catch (err) {
                    handleError(err);
                  }
                }}
              >
                {t("admin.roles.create")}
              </AdminButton>
            </div>
          </div>

          <div className="space-y-4">
            {roles.length ? (
              roles.map((role) => (
                <RoleRow
                  key={role.id}
                  role={role}
                  onUpdated={rolesQuery.refetch}
                  onSuccess={notify}
                  onError={handleError}
                  labels={{
                    name: t("admin.roles.name"),
                    description: t("admin.roles.description"),
                    save: t("admin.roles.save"),
                    system: t("admin.roles.system"),
                  }}
                />
              ))
            ) : (
              <p className="text-sm text-slate-400">{t("admin.roles.empty")}</p>
            )}
          </div>
        </AdminCardContent>
      </AdminCard>
    </div>
  );
}

function RoleRow({
  role,
  onUpdated,
  onSuccess,
  onError,
  labels,
}: {
  role: AdminRole;
  onUpdated: () => void | Promise<unknown>;
  onSuccess: (text: string, type?: "success" | "error" | "info") => void;
  onError: (err: unknown) => void;
  labels: {
    name: string;
    description: string;
    save: string;
    system: string;
  };
}) {
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description || "");
  const [permissions, setPermissions] = useState<string[]>(role.permissions || []);

  const togglePermission = (key: string) => {
    setPermissions((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-[#16202c] p-5 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-white">{name}</p>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">{role.key}</p>
        </div>
        {role.isSystem ? (
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/60">
            {labels.system}
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-300">
          <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">
            {labels.name}
          </span>
          <AdminInput value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">
            {labels.description}
          </span>
          <AdminInput
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {PERMISSION_OPTIONS.map((permission) => {
          const active = permissions.includes(permission.key);
          return (
            <button
              key={permission.key}
              type="button"
              className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${
                active
                  ? "border-[#2f7bff] bg-[#2f7bff]/20 text-white"
                  : "border-white/10 text-white/60"
              }`}
              onClick={() => togglePermission(permission.key)}
            >
              {permission.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <AdminButton
          variant="secondary"
          onClick={async () => {
            try {
              await updateAdminRole(undefined, role.id, {
                name,
                description,
                permissions,
              });
              await onUpdated();
              onSuccess("Role updated.", "success");
            } catch (err) {
              onError(err);
            }
          }}
        >
          {labels.save}
        </AdminButton>
        {!role.isSystem ? (
          <AdminAlertDialog>
            <AdminAlertDialogTrigger asChild>
              <AdminButton variant="outline">Delete role</AdminButton>
            </AdminAlertDialogTrigger>
            <AdminAlertDialogContent>
              <AdminAlertDialogTitle>Delete role?</AdminAlertDialogTitle>
              <AdminAlertDialogDescription>
                This action cannot be undone. Users must be reassigned first.
              </AdminAlertDialogDescription>
              <div className="mt-5 flex items-center justify-end gap-3">
                <AdminAlertDialogCancel>Cancel</AdminAlertDialogCancel>
                <AdminAlertDialogAction
                  onClick={async () => {
                    try {
                      await deleteAdminRole(undefined, role.id);
                      await onUpdated();
                      onSuccess("Role deleted.", "success");
                    } catch (err) {
                      onError(err);
                    }
                  }}
                >
                  Delete
                </AdminAlertDialogAction>
              </div>
            </AdminAlertDialogContent>
          </AdminAlertDialog>
        ) : null}
      </div>
    </div>
  );
}
