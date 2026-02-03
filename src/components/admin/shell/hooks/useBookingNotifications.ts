import { useMemo } from "react";
import { useAdminQuery } from "@/lib/api/adminHooks";
import { getBookings } from "@/lib/api/admin";
import type { Booking } from "@/types/admin-dashboard.types";

export const useBookingNotifications = (enabled: boolean) => {
  const bookingsQuery = useAdminQuery({
    queryKey: ["admin-booking-notifications"],
    queryFn: ({ signal }) =>
      getBookings(
        undefined,
        { status: "NEW", page: 1, limit: 5 },
        { notify: false, timeoutMs: 8000, signal }
      ),
    enabled,
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
    staleTime: 5_000,
    cacheTime: 60_000,
    toastOnError: false,
  });

  const newBookings = bookingsQuery.data?.items ?? [];
  const totalNewBookings = bookingsQuery.data?.pagination.total ?? newBookings.length;
  const badgeCount = totalNewBookings > 99 ? "99+" : totalNewBookings.toString();

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    []
  );

  const openBookingPopup = (booking: Booking) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("admin-booking-open", {
        detail: {
          booking,
        },
      })
    );
  };

  return {
    bookingsQuery,
    newBookings,
    totalNewBookings,
    badgeCount,
    dateFormatter,
    openBookingPopup,
  };
};
