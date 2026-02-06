"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  createAdminUser,
  deleteAdminUser,
  getAdminRoles,
  getAdminUsers,
  resetAdminUserPassword,
  updateAdminUser,
} from "@/lib/api/admin";
import Loading from "@/components/common/Loading";
import { useToast } from "@/components/common/ToastProvider";
import { ApiError } from "@/lib/api/client";
import type { AdminRole, AdminUser } from "@/types/api.types";
import {
  AdminAlertDialog,
  AdminAlertDialogAction,
  AdminAlertDialogCancel,
  AdminAlertDialogContent,
  AdminAlertDialogDescription,
  AdminAlertDialogTitle,
  AdminAlertDialogTrigger,
} from "@/components/admin/ui/AdminDialog";
import { useTranslation } from "react-i18next";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminInput from "@/components/admin/ui/AdminInput";
import { AdminCard, AdminCardContent, AdminCardHeader, AdminCardTitle } from "@/components/admin/ui/AdminCard";
import AdminSwitch from "@/components/admin/ui/AdminSwitch";

const DEFAULT_ROLE_KEY = "EDITOR";

export default function UsersPage() {
  const { i18n } = useTranslation();
  const labels = useMemo(
    () => ({
      heading: i18n.t("admin.users.heading"),
      tagline: i18n.t("admin.users.tagline"),
      createTitle: i18n.t("admin.users.createTitle"),
      usersTitle: i18n.t("admin.users.usersTitle"),
      create: i18n.t("admin.users.create"),
      save: i18n.t("admin.users.save"),
      resetPassword: i18n.t("admin.users.resetPassword"),
      delete: i18n.t("admin.users.delete"),
      cancel: i18n.t("admin.users.cancel"),
    }),
    [i18n]
  );
  const [form, setForm] = useState({
    email: "",
    name: "",
    avatarUrl: "",
    password: "",
    roleKey: DEFAULT_ROLE_KEY,
  });
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const toast = useToast();

  const rolesQuery = useQuery({
    queryKey: ["admin-roles"],
    queryFn: () => getAdminRoles(undefined),
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => getAdminUsers(undefined),
  });

  const users = data?.data || [];
  const roles = rolesQuery.data?.data || [];
  const roleMap = useMemo(
    () => new Map(roles.map((role) => [role.key, role])),
    [roles]
  );

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Cấu hình</p>
          <h1 className="text-2xl font-semibold text-white">{labels.heading}</h1>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70">
          {labels.tagline}
        </div>
      </div>

      <AdminCard className="border-white/5 bg-[#0f1722]">
        <AdminCardHeader className="py-2">
          <AdminCardTitle>{labels.createTitle}</AdminCardTitle>
        </AdminCardHeader>
        <AdminCardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <label className="space-y-2 text-sm text-slate-300">
              <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">
                Email
              </span>
              <AdminInput
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">
                Tên
              </span>
              <AdminInput
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">
                Ảnh đại diện (URL)
              </span>
              <AdminInput
                value={form.avatarUrl}
                placeholder="Nhập url ảnh"
                onChange={(event) =>
                  setForm({ ...form, avatarUrl: event.target.value })
                }
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">
                Mật khẩu
              </span>
              <div className="relative">
                <AdminInput
                  type={showCreatePassword ? "text" : "password"}
                  className="pr-12"
                  value={form.password}
                  onChange={(event) =>
                    setForm({ ...form, password: event.target.value })
                  }
                />
                <button
                  type="button"
                  aria-label={showCreatePassword ? "Hide password" : "Show password"}
                  onClick={() => setShowCreatePassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showCreatePassword ? (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                      <path d="M7.1 7.1C5 8.4 3.5 10.2 2.5 12c2.1 3.7 5.7 6 9.5 6 1.1 0 2.1-.2 3.1-.6" />
                      <path d="M9.9 4.2C10.6 4.1 11.3 4 12 4c3.8 0 7.4 2.3 9.5 6-.5.9-1.1 1.7-1.8 2.5" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2.5 12C4.6 8.3 8.2 6 12 6s7.4 2.3 9.5 6c-2.1 3.7-5.7 6-9.5 6s-7.4-2.3-9.5-6z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">
                Quyền
              </span>
              <select
                className="h-12 w-full rounded-2xl border border-white/10 bg-[#1a2430] px-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f7bff]"
                value={form.roleKey}
                onChange={(event) =>
                  setForm({ ...form, roleKey: event.target.value })
                }
              >
                {roles.map((role) => (
                  <option key={role.key} value={role.key}>
                    {role.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 uppercase tracking-[0.2em] text-white/60">
              {(roleMap.get(form.roleKey) || { name: "Custom" }).name}
            </span>
            {(roleMap.get(form.roleKey)?.permissions || []).map((permission) => (
              <span key={permission} className="rounded-full border border-white/10 px-3 py-1">
                {permission}
              </span>
            ))}
          </div>
          <AdminButton
            onClick={async () => {
              try {
                await createAdminUser(undefined, form);
                notify("User created.", "success");
                setForm({
                  email: "",
                  name: "",
                  avatarUrl: "",
                  password: "",
                  roleKey: DEFAULT_ROLE_KEY,
                });
                await refetch();
                await rolesQuery.refetch();
              } catch (err) {
                handleError(err);
              }
            }}
          >
            {labels.create}
          </AdminButton>
        </AdminCardContent>
      </AdminCard>

      <AdminCard className="border-white/5 bg-[#0f1722]">
        <AdminCardHeader>
          <AdminCardTitle>{labels.usersTitle}</AdminCardTitle>
        </AdminCardHeader>
        <AdminCardContent>
          {isLoading ? (
            <Loading label="Loading users" />
          ) : (
            <div className="space-y-4">
              {users.length ? (
                users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    roles={roles}
                    onUpdated={refetch}
                    onSuccess={notify}
                    onError={handleError}
                    labels={labels}
                  />
                ))
              ) : (
                <p className="text-sm text-slate-400">No users found.</p>
              )}
            </div>
          )}
        </AdminCardContent>
      </AdminCard>
    </div>
  );
}

function UserRow({
  user,
  roles,
  onUpdated,
  onSuccess,
  onError,
  labels,
}: {
  user: AdminUser;
  roles: AdminRole[];
  onUpdated: () => void;
  onSuccess: (text: string, type?: "success" | "error" | "info") => void;
  onError: (err: unknown) => void;
  labels: {
    save: string;
    resetPassword: string;
    delete: string;
    cancel: string;
  };
}) {
  const [name, setName] = useState(user.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [roleKey, setRoleKey] = useState(user.roleKey);
  const [isActive, setIsActive] = useState(user.isActive);
  const [password, setPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const roleMeta = useMemo(() => {
    if (roleKey === user.roleKey && user.role) {
      return user.role;
    }
    return roles.find((role) => role.key === roleKey) || null;
  }, [roleKey, roles, user.role, user.roleKey]);
  const securityRole = useMemo(
    () => roles.find((role) => role.key === "SECURITY_ADMIN") || null,
    [roles]
  );

  return (
    <div className="rounded-3xl border border-white/10 bg-[#16202c] p-5 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 overflow-hidden rounded-2xl border border-white/10 bg-white/10">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name || user.email} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-white/70">
                {(name || user.email).slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="text-lg font-semibold text-white">{name || user.email}</p>
            <p className="text-xs text-slate-400">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70">
          <span className="uppercase tracking-[0.2em]">
            {roleMeta?.name || roleKey}
          </span>
        </div>
      </div>
      {securityRole ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/60">
          <AdminButton
            size="sm"
            variant="secondary"
            disabled={roleKey === "SECURITY_ADMIN"}
            onClick={async () => {
              try {
                await updateAdminUser(undefined, user.id, {
                  roleKey: securityRole.key,
                });
                setRoleKey(securityRole.key);
                await onUpdated();
                onSuccess("Đã gán quyền Security.", "success");
              } catch (err) {
                onError(err);
              }
            }}
          >
            Gán Security
          </AdminButton>
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div className="space-y-3">
          <AdminInput
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Display name"
          />
          <AdminInput
            value={avatarUrl}
            onChange={(event) => setAvatarUrl(event.target.value)}
            placeholder="Avatar URL"
          />
        </div>
        <div className="space-y-3">
          <select
            className="h-12 w-full rounded-2xl border border-white/10 bg-[#1a2430] px-3 text-sm text-white"
            value={roleKey}
            onChange={(event) => setRoleKey(event.target.value)}
          >
            {roles.map((option) => (
              <option key={option.key} value={option.key}>
                {option.name}
              </option>
            ))}
          </select>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#111a25] px-4 py-3 text-xs text-white/70">
            <span className="uppercase tracking-[0.2em]">Trạng thái</span>
            <AdminSwitch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>
        <div className="space-y-3">
          <div className="relative">
            <AdminInput
              type={showResetPassword ? "text" : "password"}
              className="pr-12"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Đổi mật khẩu"
            />
            <button
              type="button"
              aria-label={showResetPassword ? "Hide password" : "Show password"}
              onClick={() => setShowResetPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
            >
              {showResetPassword ? (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3l18 18" />
                  <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                  <path d="M7.1 7.1C5 8.4 3.5 10.2 2.5 12c2.1 3.7 5.7 6 9.5 6 1.1 0 2.1-.2 3.1-.6" />
                  <path d="M9.9 4.2C10.6 4.1 11.3 4 12 4c3.8 0 7.4 2.3 9.5 6-.5.9-1.1 1.7-1.8 2.5" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2.5 12C4.6 8.3 8.2 6 12 6s7.4 2.3 9.5 6c-2.1 3.7-5.7 6-9.5 6s-7.4-2.3-9.5-6z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <AdminButton
              variant="secondary"
              onClick={async () => {
                try {
                  await updateAdminUser(undefined, user.id, {
                    name,
                    avatarUrl,
                    roleKey,
                    isActive,
                  });
                  await onUpdated();
                  onSuccess("User updated.", "success");
                } catch (err) {
                  onError(err);
                }
              }}
            >
              {labels.save}
            </AdminButton>
            <AdminButton
              variant="secondary"
              onClick={async () => {
                if (!password) return;
                try {
                  await resetAdminUserPassword(undefined, user.id, { password });
                  setPassword("");
                  onSuccess("Password reset.", "success");
                } catch (err) {
                  onError(err);
                }
              }}
            >
              {labels.resetPassword}
            </AdminButton>
            <AdminAlertDialog>
              <AdminAlertDialogTrigger asChild>
                <AdminButton variant="outline">{labels.delete}</AdminButton>
              </AdminAlertDialogTrigger>
              <AdminAlertDialogContent>
                <AdminAlertDialogTitle>Chắc chắn xoá thành viên này?</AdminAlertDialogTitle>
                <AdminAlertDialogDescription>
                  Thao tác này không thể hoàn tác. Người dùng sẽ mất quyền truy cập ngay lập tức.
                </AdminAlertDialogDescription>
                <div className="mt-5 flex items-center justify-end gap-3">
                  <AdminAlertDialogCancel className="cursor-pointer">{labels.cancel}</AdminAlertDialogCancel>
                  <AdminAlertDialogAction
                    className="cursor-pointer"
                    onClick={async () => {
                      try {
                        await deleteAdminUser(undefined, user.id);
                        await onUpdated();
                        onSuccess("User đã xoá.", "success");
                      } catch (err) {
                        onError(err);
                      }
                    }}
                  >
                    {labels.delete}
                  </AdminAlertDialogAction>
                </div>
              </AdminAlertDialogContent>
            </AdminAlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
