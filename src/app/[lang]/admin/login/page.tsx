"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authSchema, type AuthFormValues } from "@/lib/schemas/authSchema";
import { loginAdmin } from "@/lib/api/admin";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { ApiError } from "@/lib/api/client";
import { useTranslation } from "react-i18next";

export default function AdminLogin() {
  const router = useRouter();
  const baseAdminPath = "/admin";
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = async (data: AuthFormValues) => {
    setError(null);
    try {
      await loginAdmin(data);
      router.replace(`${baseAdminPath}/dashboard`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Login failed. Please check your credentials.");
        return;
      }
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-[var(--line)] bg-white p-8 shadow-[var(--shadow)]">
        <h1 className="text-2xl font-semibold text-[var(--ink)]">
          {t("admin.loginTitle")}
        </h1>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">
          Bảo mật quyền truy cập dành cho quản trị viên của Panda Spa.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input
            label={t("admin.email")}
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label={t("admin.password")}
            type={showPassword ? "text" : "password"}
            error={errors.password?.message}
            {...register("password")}
            endAdornment={
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((prev) => !prev)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--ink-muted)] hover:text-[var(--ink)]"
              >
                {showPassword ? (
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
            }
          />
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Signing in..." : t("admin.signIn")}
          </Button>
        </form>
      </div>
    </div>
  );
}
