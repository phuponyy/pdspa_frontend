"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  createAdminRole,
  deleteAdminRole,
  getAdminRoles,
  updateAdminRole,
} from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/common/ToastProvider";
import { ApiError } from "@/lib/api/client";
import type { AdminRole } from "@/types/api.types";

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
];

export default function AdminRoles() {
  const toast = useToast();
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
      <Card className="border-white/5 bg-[#0f1722]">
        <CardHeader className="py-2">
          <CardTitle>Cấu hình quyền</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-[#111a25] p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Tạo quyền</p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="space-y-2 text-sm text-slate-300">
                <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">
                  Key
                </span>
                <Input
                  value={form.key}
                  onChange={(event) =>
                    setForm({ ...form, key: event.target.value.toUpperCase() })
                  }
                  placeholder="CUSTOM_ROLE"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">
                  Tên
                </span>
                <Input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">
                  Mô tả
                </span>
                <Input
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
              <Button
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
                Tạo quyền
              </Button>
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
                />
              ))
            ) : (
              <p className="text-sm text-slate-400">No roles found.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RoleRow({
  role,
  onUpdated,
  onSuccess,
  onError,
}: {
  role: AdminRole;
  onUpdated: () => void | Promise<unknown>;
  onSuccess: (text: string, type?: "success" | "error" | "info") => void;
  onError: (err: unknown) => void;
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
            Hệ thống
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-300">
          <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Tên</span>
          <Input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">
            Mô tả
          </span>
          <Input
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
        <Button
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
          Lưu quyền
        </Button>
        {!role.isSystem ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Delete role</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogTitle>Delete role?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Users must be reassigned first.
              </AlertDialogDescription>
              <div className="mt-5 flex items-center justify-end gap-3">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
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
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
      </div>
    </div>
  );
}
