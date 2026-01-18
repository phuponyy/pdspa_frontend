"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/authStore";
import {
  createAdminUser,
  getAdminUsers,
  resetAdminUserPassword,
  updateAdminUser,
} from "@/lib/api/admin";
import Loading from "@/components/common/Loading";
import { useToast } from "@/components/common/ToastProvider";
import { ApiError } from "@/lib/api/client";
import type { AdminUser, UserRole } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const ROLE_OPTIONS: UserRole[] = ["ADMIN", "EDITOR", "VIEWER"];

export default function UsersPage() {
  const token = useAuthStore((state) => state.token);
  const [form, setForm] = useState({
    email: "",
    name: "",
    password: "",
    role: "EDITOR" as UserRole,
  });
  const toast = useToast();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => getAdminUsers(token || ""),
    enabled: Boolean(token),
  });

  const users = data?.data || [];

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

  if (!token) {
    return <p className="text-sm text-[var(--ink-muted)]">Please sign in.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Quản lý Users</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tạo user</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
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
                value={form.role}
                onChange={(event) =>
                  setForm({ ...form, role: event.target.value as UserRole })
                }
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <Button
            onClick={async () => {
              try {
                await createAdminUser(token, form);
                notify("User created.", "success");
                setForm({ email: "", name: "", password: "", role: "EDITOR" });
                await refetch();
              } catch (err) {
                handleError(err);
              }
            }}
          >
            Tạo user
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loading label="Loading users" />
          ) : (
            <div className="space-y-3">
              {users.length ? (
                users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    token={token}
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
  token,
  onUpdated,
  onSuccess,
  onError,
}: {
  user: AdminUser;
  token: string;
  onUpdated: () => void;
  onSuccess: (text: string, type?: "success" | "error" | "info") => void;
  onError: (err: unknown) => void;
}) {
  const [role, setRole] = useState<UserRole>(user.role);
  const [isActive, setIsActive] = useState(user.isActive);
  const [password, setPassword] = useState("");

  return (
    <div className="grid gap-3 rounded-2xl border border-white/10 bg-[#16202c] p-4 text-sm md:grid-cols-[1.4fr_1fr_1fr_1fr]">
      <div>
        <p className="font-semibold text-white">{user.email}</p>
        <p className="text-xs text-slate-400">{user.name || "-"}</p>
      </div>
      <label className="space-y-1">
        <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">
          Role
        </span>
        <select
          className="h-10 w-full rounded-xl border border-white/10 bg-[#1a2430] px-2 text-xs text-white"
          value={role}
          onChange={(event) => setRole(event.target.value as UserRole)}
        >
          {ROLE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1">
        <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">
          Status
        </span>
        <select
          className="h-10 w-full rounded-xl border border-white/10 bg-[#1a2430] px-2 text-xs text-white"
          value={isActive ? "ACTIVE" : "DISABLED"}
          onChange={(event) => setIsActive(event.target.value === "ACTIVE")}
        >
          <option value="ACTIVE">Active</option>
          <option value="DISABLED">Disabled</option>
        </select>
      </label>
      <div className="flex flex-col gap-2">
        <label className="space-y-1 text-xs uppercase tracking-[0.2em] text-slate-500">
          <span className="block">Reset password</span>
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={async () => {
              try {
                await updateAdminUser(token, user.id, { role, isActive });
                await onUpdated();
                onSuccess("User updated.", "success");
              } catch (err) {
                onError(err);
              }
            }}
          >
            Update
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              if (!password) return;
              try {
                await resetAdminUserPassword(token, user.id, { password });
                setPassword("");
                onSuccess("Password reset.", "success");
              } catch (err) {
                onError(err);
              }
            }}
          >
            Reset password
          </Button>
        </div>
      </div>
    </div>
  );
}
