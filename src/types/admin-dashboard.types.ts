export type OverviewResponse = {
  kpis: {
    revenue: { today: number; week: number; month: number };
    bookings: { total: number; new: number; confirmed: number; canceled: number };
    customers: { new: number; returning: number };
    topServices: { name: string; count: number }[];
  };
  charts: {
    labels: string[];
    revenue: number[];
    bookings: number[];
    users: number[];
  };
};

export type AnalyticsResponse = {
  labels: string[];
  series: {
    revenue: number[];
    bookings: number[];
    users: number[];
  };
  comparison: {
    revenue: { current: number; previous: number; change: number };
    bookings: { current: number; previous: number; change: number };
    users: { current: number; previous: number; change: number };
  };
};

export type LiveResponse = {
  onlineUsers: number;
  topPages: { path: string; count: number }[];
  trafficSources: { source: string; count: number }[];
  devices: { device: string; count: number }[];
  locations: { location: string; count: number }[];
  timeline: { label: string; active: number; heartbeats: number }[];
};

export type Customer = {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  lastVisit?: string | null;
  totalSpend: number;
  tags: string[];
  source?: string | null;
  branchId?: number | null;
  notes?: string | null;
  createdAt: string;
};

export type Booking = {
  id: number;
  status: "NEW" | "CONFIRMED" | "DONE" | "CANCELED";
  scheduledAt: string;
  notes?: string | null;
  customer?: { name: string };
  service?: { key: string };
  staff?: { name?: string | null };
};

export type PaginatedResponse<T> = {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
};
