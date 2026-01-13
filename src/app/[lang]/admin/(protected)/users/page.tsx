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
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Loading from "@/components/common/Loading";
import { useToast } from "@/components/common/ToastProvider";
import { ApiError } from "@/lib/api/client";
import type { AdminUser, UserRole } from "@/types/api.types";

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
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
          Users
        </p>
        <h1 className="text-2xl font-semibold text-[var(--ink)]">
          Manage users
        </h1>
        <p className="text-sm text-[var(--ink-muted)]">
          Admin can create, update roles, and reset passwords.
        </p>
      </div>

      <div className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
        <h2 className="text-lg font-semibold text-[var(--ink)]">
          Create user
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input
            label="Email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
          <Input
            label="Name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
          />
          <label className="space-y-2 text-sm text-[var(--ink)]">
            <span className="block text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
              Role
            </span>
            <select
              className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-3 text-sm"
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
        <div className="mt-4">
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
            Create user
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
        <h2 className="text-lg font-semibold text-[var(--ink)]">
          User list
        </h2>
        {isLoading ? (
          <Loading label="Loading users" />
        ) : (
          <div className="mt-4 space-y-3">
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
              <p className="text-sm text-[var(--ink-muted)]">
                No users found.
              </p>
            )}
          </div>
        )}
      </div>
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
    <div className="grid gap-3 rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-4 text-sm md:grid-cols-[1.4fr_1fr_1fr_1fr]">
      <div>
        <p className="font-semibold text-[var(--ink)]">{user.email}</p>
        <p className="text-xs text-[var(--ink-muted)]">{user.name || "-"}</p>
      </div>
      <label className="space-y-1">
        <span className="block text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
          Role
        </span>
        <select
          className="h-10 w-full rounded-xl border border-[var(--line)] bg-white px-2 text-xs"
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
        <span className="block text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
          Status
        </span>
        <select
          className="h-10 w-full rounded-xl border border-[var(--line)] bg-white px-2 text-xs"
          value={isActive ? "ACTIVE" : "DISABLED"}
          onChange={(event) => setIsActive(event.target.value === "ACTIVE")}
        >
          <option value="ACTIVE">Active</option>
          <option value="DISABLED">Disabled</option>
        </select>
      </label>
      <div className="flex flex-col gap-2">
        <Input
          label="Reset password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
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
            variant="outline"
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
