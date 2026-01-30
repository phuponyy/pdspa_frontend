"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ToastProvider } from "@/components/common/ToastProvider";
import WebVitalsReporter from "@/components/common/WebVitalsReporter";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount) => failureCount < 2,
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex + Math.random() * 250, 8000),
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <WebVitalsReporter />
        {children}
      </ToastProvider>
    </QueryClientProvider>
  );
}
