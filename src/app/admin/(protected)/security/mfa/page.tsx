"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import QRCode from "qrcode";
import {
  enableMfa,
  disableMfa,
  getAdminMe,
  regenerateMfaRecoveryCodes,
  setupMfa,
} from "@/lib/api/admin";
import { useToast } from "@/components/common/ToastProvider";
import AdminButton from "@/components/admin/ui/AdminButton";
import { AdminCard, AdminCardContent, AdminCardHeader, AdminCardTitle } from "@/components/admin/ui/AdminCard";

const OTP_LENGTH = 6;

export default function AdminMfaPage() {
  const toast = useToast();
  const [setupData, setSetupData] = useState<{
    secret: string;
    otpauthUrl?: string;
    recoveryCodes: string[];
  } | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [disableUseRecovery, setDisableUseRecovery] = useState(false);
  const [regenCode, setRegenCode] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const meQuery = useQuery({
    queryKey: ["admin-me"],
    queryFn: () => getAdminMe(undefined),
  });
  const mfaEnabled = meQuery.data?.data?.mfaEnabled ?? false;

  const setupMutation = useMutation({
    mutationFn: () => setupMfa(undefined),
    onSuccess: (res) => {
      setSetupData(res.data);
      setCode("");
      toast.push({ type: "success", message: "Tạo mã MFA thành công." });
    },
    onError: () => toast.push({ type: "error", message: "Không thể tạo MFA." }),
  });

  const enableMutation = useMutation({
    mutationFn: (value: string) => enableMfa(undefined, { code: value }),
    onSuccess: () => {
      toast.push({ type: "success", message: "Đã bật MFA." });
      meQuery.refetch();
    },
    onError: () => toast.push({ type: "error", message: "Mã xác thực không đúng." }),
  });

  const disableMutation = useMutation({
    mutationFn: (value: { code?: string; recoveryCode?: string }) =>
      disableMfa(undefined, value),
    onSuccess: () => {
      toast.push({ type: "success", message: "Đã tắt MFA." });
      setDisableCode("");
      meQuery.refetch();
    },
    onError: () => toast.push({ type: "error", message: "Không thể tắt MFA." }),
  });

  const regenMutation = useMutation({
    mutationFn: (value: string) => regenerateMfaRecoveryCodes(undefined, { code: value }),
    onSuccess: (res) => {
      setSetupData((prev) =>
        prev
          ? { ...prev, recoveryCodes: res.data.recoveryCodes }
          : { secret: "", otpauthUrl: undefined, recoveryCodes: res.data.recoveryCodes }
      );
      toast.push({ type: "success", message: "Đã tạo recovery codes mới." });
      setRegenCode("");
    },
    onError: () => toast.push({ type: "error", message: "Không thể tạo recovery codes." }),
  });

  useEffect(() => {
    if (!setupData?.otpauthUrl) {
      setQrDataUrl(null);
      return;
    }
    let active = true;
    QRCode.toDataURL(setupData.otpauthUrl)
      .then((url: string) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => setQrDataUrl(null));
    return () => {
      active = false;
    };
  }, [setupData?.otpauthUrl]);

  const recoveryCodes = useMemo(() => setupData?.recoveryCodes || [], [setupData]);
  const isSetupReady = Boolean(setupData?.secret);
  const computedOtp = otpDigits.join("");
  const activeOtp = code || computedOtp;

  const copyText = async (value: string, message: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.push({ type: "success", message });
    } catch {
      toast.push({ type: "error", message: "Không thể sao chép." });
    }
  };

  const downloadRecoveryCodes = () => {
    if (!recoveryCodes.length) return;
    const content = recoveryCodes.join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `mfa-recovery-codes-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleOtpChange = (index: number, value: string) => {
    const next = value.replace(/\D/g, "").slice(-1);
    setOtpDigits((prev) => {
      const cloned = [...prev];
      cloned[index] = next;
      return cloned;
    });
    if (next && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="space-y-6 text-white">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
          Security Center
        </p>
        <h1 className="text-3xl font-semibold">Bảo mật MFA / 2FA</h1>
        <p className="mt-2 text-sm text-white/60">
          Tăng cường bảo mật tài khoản của bạn bằng phương thức xác thực hai yếu tố (TOTP).
        </p>
      </div>

      <AdminCard className="border-white/10 bg-[#141a22] text-white">
        <AdminCardContent className="flex flex-wrap items-center justify-between gap-4 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
              Trạng thái hiện tại
            </p>
            <div className="mt-2 flex items-center gap-2 text-lg font-semibold">
              <span className={`h-2.5 w-2.5 rounded-full ${mfaEnabled ? "bg-emerald-400" : "bg-rose-400"}`} />
              {mfaEnabled ? "Đã kích hoạt" : "Chưa kích hoạt"}
            </div>
          </div>
          <AdminButton
            className="h-11 px-6"
            onClick={() => setupMutation.mutate()}
            disabled={setupMutation.isPending}
          >
            {setupMutation.isPending ? "Đang tạo..." : "Bật MFA ngay"}
          </AdminButton>
        </AdminCardContent>
      </AdminCard>

      {setupData ? (
        <AdminCard className="border-white/10 bg-[#141a22] text-white">
          <AdminCardContent className="grid gap-6 py-6 md:grid-cols-[240px_1fr]">
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-[#121620] p-4 text-center">
              <div className="flex h-44 w-44 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-[#ff7b4b] to-[#ffae5b] shadow-[0_0_40px_rgba(255,140,60,0.45)]">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="MFA QR" className="h-28 w-28 rounded-xl bg-white p-3" />
                ) : (
                  <div className="text-xs text-white/70">QR đang tạo...</div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold">Quét mã QR</p>
                <p className="text-xs text-white/60">
                  Sử dụng Google Authenticator hoặc Authy để quét mã này.
                </p>
              </div>
            </div>
            <div className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                  Mã bí mật (Secret Key)
                </p>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-[#0f1420] px-4 py-3 text-sm">
                  <span className="flex-1 break-all text-white/80">{setupData.secret}</span>
                  <AdminButton
                    variant="secondary"
                    className="h-8 px-3 text-xs"
                    onClick={() => copyText(setupData.secret, "Đã sao chép secret key.")}
                  >
                    Copy
                  </AdminButton>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                  Mã xác thực 6 chữ số
                </p>
                <div className="mt-2 flex gap-2">
                  {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpRefs.current[index] = el;
                      }}
                      value={otpDigits[index]}
                      onChange={(event) => handleOtpChange(index, event.target.value)}
                      onKeyDown={(event) => handleOtpKeyDown(index, event)}
                      inputMode="numeric"
                      className="h-12 w-12 rounded-xl border border-white/10 bg-[#0f1420] text-center text-lg text-white"
                    />
                  ))}
                </div>
                <AdminButton
                  className="mt-4 h-11 w-full"
                  onClick={() => enableMutation.mutate(activeOtp.trim())}
                  disabled={enableMutation.isPending || activeOtp.trim().length !== OTP_LENGTH}
                >
                  {enableMutation.isPending ? "Đang xác nhận..." : "Xác thực & Kích hoạt"}
                </AdminButton>
                <input
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="Nhập OTP nếu không dùng ô"
                  className="mt-3 h-10 w-full rounded-xl border border-white/10 bg-[#0f1420] px-3 text-xs text-white/60"
                />
              </div>
              {recoveryCodes.length ? (
                <div className="rounded-2xl border border-white/10 bg-[#0f1420] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">Mã khôi phục (Recovery Codes)</p>
                      <p className="text-xs text-white/60">
                        Lưu trữ các mã này ở nơi an toàn. Bạn sẽ cần chúng nếu mất quyền truy cập.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <AdminButton
                        variant="secondary"
                        className="h-9 px-4 text-xs"
                        onClick={downloadRecoveryCodes}
                      >
                        Tải về
                      </AdminButton>
                      <AdminButton
                        variant="secondary"
                        className="h-9 px-4 text-xs"
                        onClick={() =>
                          copyText(recoveryCodes.join("\n"), "Đã sao chép recovery codes.")
                        }
                      >
                        Sao chép
                      </AdminButton>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {recoveryCodes.map((item) => (
                      <span
                        key={item}
                        className="rounded-xl border border-white/10 bg-[#111827] px-3 py-2 text-xs text-white/70"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </AdminCardContent>
        </AdminCard>
      ) : null}

      {mfaEnabled ? (
        <AdminCard className="border-white/10 bg-[#141a22] text-white">
          <AdminCardHeader>
            <AdminCardTitle>Tắt MFA</AdminCardTitle>
          </AdminCardHeader>
          <AdminCardContent className="space-y-4">
            <input
              value={disableCode}
              onChange={(event) => setDisableCode(event.target.value)}
              placeholder={disableUseRecovery ? "Recovery code" : "Authenticator code"}
              className="h-11 w-full rounded-xl border border-white/10 bg-[#0f1420] px-4 text-sm text-white"
            />
            <div className="flex flex-wrap items-center gap-3">
              <AdminButton
                size="sm"
                variant="secondary"
                onClick={() => setDisableUseRecovery((prev) => !prev)}
              >
                {disableUseRecovery ? "Dùng mã OTP" : "Dùng recovery code"}
              </AdminButton>
              <AdminButton
                size="sm"
                onClick={() =>
                  disableMutation.mutate(
                    disableUseRecovery
                      ? { recoveryCode: disableCode.trim() }
                      : { code: disableCode.trim() }
                  )
                }
                disabled={disableMutation.isPending || !disableCode.trim()}
              >
                {disableMutation.isPending ? "Đang tắt..." : "Tắt MFA"}
              </AdminButton>
            </div>
          </AdminCardContent>
        </AdminCard>
      ) : null}

      {mfaEnabled ? (
        <AdminCard className="border-white/10 bg-[#141a22] text-white">
          <AdminCardHeader>
            <AdminCardTitle>Regenerate recovery codes</AdminCardTitle>
          </AdminCardHeader>
          <AdminCardContent className="space-y-3">
            <input
              value={regenCode}
              onChange={(event) => setRegenCode(event.target.value)}
              placeholder="Authenticator code"
              className="h-11 w-full rounded-xl border border-white/10 bg-[#0f1420] px-4 text-sm text-white"
            />
            <AdminButton
              size="sm"
              onClick={() => regenMutation.mutate(regenCode.trim())}
              disabled={regenMutation.isPending || !regenCode.trim()}
            >
              {regenMutation.isPending ? "Đang tạo..." : "Tạo lại codes"}
            </AdminButton>
          </AdminCardContent>
        </AdminCard>
      ) : null}
      {isSetupReady ? null : (
        <p className="text-center text-xs text-white/50">
          Gặp khó khăn trong việc thiết lập?{" "}
          <span className="text-[var(--accent-strong)]">Liên hệ bộ phận hỗ trợ</span>
        </p>
      )}
    </div>
  );
}
