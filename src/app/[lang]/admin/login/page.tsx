"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authSchema, type AuthFormValues } from "@/lib/schemas/authSchema";
import { loginAdmin } from "@/lib/api/admin";
import { useAuthStore } from "@/lib/stores/authStore";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { ApiError } from "@/lib/api/client";
import { getDefaultLang, getDictionary } from "@/lib/i18n";

export default function AdminLogin() {
  const router = useRouter();
  const params = useParams<{ lang?: string }>();
  const langParam = params?.lang;
  const lang = Array.isArray(langParam) ? langParam[0] : langParam;
  const resolvedLang = lang ?? getDefaultLang();
  const dict = getDictionary(resolvedLang);
  const setToken = useAuthStore((state) => state.setToken);
  const [error, setError] = useState<string | null>(null);

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
      const response = await loginAdmin(data);
      const accessToken = response?.data?.accessToken;
      if (!accessToken) {
        setError("Login failed. Missing access token.");
        return;
      }
      setToken(accessToken);
      router.replace(`/${resolvedLang}/admin/dashboard`);
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
          {dict.admin.loginTitle}
        </h1>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">
          Secure access for Panda Spa administrators.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input
            label={dict.admin.email}
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label={dict.admin.password}
            type="password"
            error={errors.password?.message}
            {...register("password")}
          />
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Signing in..." : dict.admin.signIn}
          </Button>
        </form>
      </div>
    </div>
  );
}
