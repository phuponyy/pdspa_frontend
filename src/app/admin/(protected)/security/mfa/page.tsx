"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import QRCode from "qrcode";
import {
  enableMfa,
  disableMfa,
  getAdminMe,
  regenerateMfaRecoveryCodes,
  setupMfa,
} from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/common/ToastProvider";

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
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => setQrDataUrl(null));
    return () => {
      active = false;
    };
  }, [setupData?.otpauthUrl]);

  const recoveryCodes = useMemo(() => setupData?.recoveryCodes || [], [setupData]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-strong)]">
          Security
        </p>
        <h1 className="text-2xl font-semibold text-[var(--ink)]">MFA / 2FA</h1>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">
          Bật xác thực 2 lớp bằng TOTP + recovery codes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trạng thái</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-white/70">
            MFA hiện tại: <strong>{mfaEnabled ? "Đã bật" : "Chưa bật"}</strong>
          </span>
          <Button
            size="sm"
            onClick={() => setupMutation.mutate()}
            disabled={setupMutation.isPending}
          >
            {setupMutation.isPending ? "Đang tạo..." : "Thiết lập MFA"}
          </Button>
        </CardContent>
      </Card>

      {setupData ? (
        <Card>
          <CardHeader>
            <CardTitle>Thiết lập</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-[200px_1fr]">
            <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-4">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="MFA QR" className="h-40 w-40" />
              ) : (
                <div className="text-xs text-white/50">QR đang tạo...</div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">Secret</p>
                <p className="mt-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white">
                  {setupData.secret}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">Mã xác thực</p>
                <input
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="123456"
                  className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white"
                />
                <Button
                  className="mt-3"
                  size="sm"
                  onClick={() => enableMutation.mutate(code.trim())}
                  disabled={enableMutation.isPending || !code.trim()}
                >
                  {enableMutation.isPending ? "Đang xác nhận..." : "Bật MFA"}
                </Button>
              </div>
              {recoveryCodes.length ? (
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                    Recovery codes
                  </p>
                  <div className="mt-2 grid gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white">
                    {recoveryCodes.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {mfaEnabled ? (
        <Card>
          <CardHeader>
            <CardTitle>Tắt MFA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              value={disableCode}
              onChange={(event) => setDisableCode(event.target.value)}
              placeholder={disableUseRecovery ? "Recovery code" : "Authenticator code"}
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white"
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setDisableUseRecovery((prev) => !prev)}
              >
                {disableUseRecovery ? "Dùng mã OTP" : "Dùng recovery code"}
              </Button>
              <Button
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
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {mfaEnabled ? (
        <Card>
          <CardHeader>
            <CardTitle>Regenerate recovery codes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <input
              value={regenCode}
              onChange={(event) => setRegenCode(event.target.value)}
              placeholder="Authenticator code"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white"
            />
            <Button
              size="sm"
              onClick={() => regenMutation.mutate(regenCode.trim())}
              disabled={regenMutation.isPending || !regenCode.trim()}
            >
              {regenMutation.isPending ? "Đang tạo..." : "Tạo lại codes"}
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
