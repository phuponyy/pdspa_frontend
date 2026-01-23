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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const DEFAULT_ROLE_KEY = "EDITOR";

export default function UsersPage() {
  const [form, setForm] = useState({
    email: "",
    name: "",
    avatarUrl: "",
    password: "",
    roleKey: DEFAULT_ROLE_KEY,
  });
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
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Settings</p>
          <h1 className="text-2xl font-semibold text-white">User Management</h1>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70">
          Create users, assign roles, and manage access.
        </div>
      </div>

      <Card className="border-white/5 bg-[#0f1722]">
        <CardHeader>
          <CardTitle>Create user</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <label className="space-y-2 text-sm text-slate-300">
              <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">
                Email
              </span>
              <Input
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">
                Name
              </span>
              <Input
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">
                Avatar URL
              </span>
              <Input
                value={form.avatarUrl}
                onChange={(event) =>
                  setForm({ ...form, avatarUrl: event.target.value })
                }
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">
                Password
              </span>
              <Input
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
                }
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">
                Role
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
          <Button
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
            Create user
          </Button>
        </CardContent>
      </Card>

      <Card className="border-white/5 bg-[#0f1722]">
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
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
                  />
                ))
              ) : (
                <p className="text-sm text-slate-400">No users found.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function UserRow({
  user,
  roles,
  onUpdated,
  onSuccess,
  onError,
}: {
  user: AdminUser;
  roles: AdminRole[];
  onUpdated: () => void;
  onSuccess: (text: string, type?: "success" | "error" | "info") => void;
  onError: (err: unknown) => void;
}) {
  const [name, setName] = useState(user.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [roleKey, setRoleKey] = useState(user.roleKey);
  const [isActive, setIsActive] = useState(user.isActive);
  const [password, setPassword] = useState("");
  const roleMeta = useMemo(() => {
    if (roleKey === user.roleKey && user.role) {
      return user.role;
    }
    return roles.find((role) => role.key === roleKey) || null;
  }, [roleKey, roles, user.role, user.roleKey]);

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

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div className="space-y-3">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Display name"
          />
          <Input
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
            <span className="uppercase tracking-[0.2em]">Active</span>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>
        <div className="space-y-3">
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Reset password"
          />
          <div className="flex flex-wrap gap-2">
            <Button
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
              Save changes
            </Button>
            <Button
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
              Reset password
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogTitle>Delete user?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. The user will lose access immediately.
                </AlertDialogDescription>
                <div className="mt-5 flex items-center justify-end gap-3">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      try {
                        await deleteAdminUser(undefined, user.id);
                        await onUpdated();
                        onSuccess("User deleted.", "success");
                      } catch (err) {
                        onError(err);
                      }
                    }}
                  >
                    Delete user
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
