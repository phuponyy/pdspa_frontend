export type OverviewResponse = {
  kpis: {
    revenue: { today: number; week: number; month: number };
    bookings: { total: number; new: number; confirmed: number; canceled: number };
    customers: { new: number; returning: number };
    topServices: { name: string; count: number }[];
    performance: { avgMs: number; p95Ms: number; samples: number };
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
  activeSessions: {
    sessionId: string;
    page?: string;
    referrer?: string;
    device?: string;
    source?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    lastSeen: number;
    timeOnPageSec?: number;
  }[];
  funnel: { step: string; count: number }[];
  errorRate: {
    total: number;
    errors: number;
    rate: number;
    byStatus: { "4xx": number; "5xx": number };
    bookingFails: number;
    paymentFails: number;
  };
  spike: {
    level: "normal" | "warning" | "critical";
    current: number;
    average: number;
    delta: number;
  };
  endpoints: {
    path: string;
    total: number;
    errors4xx: number;
    errors5xx: number;
    errorRate: number;
  }[];
};

export type ObservabilitySummary = {
  uptimeSec: number;
  totalRequests: number;
  totalErrors: number;
  errorRate: number;
  topSlow: {
    method: string;
    route: string;
    count: number;
    errors: number;
    p95: number;
    avg: number;
  }[];
  health: {
    status: string;
    database: string;
  };
};

export type WebVitalsSummary = {
  summary: Record<
    string,
    {
      p75: number;
      avg: number;
      samples: number;
    }
  >;
  timeseries: {
    labels: string[];
    series: Record<string, number[]>;
  };
  topPages: {
    page: string;
    samples: number;
    lcpP75: number;
    inpP75: number;
    clsP75: number;
  }[];
};

export type LighthouseReport = {
  id: number;
  url: string;
  device?: string | null;
  performance?: number | null;
  accessibility?: number | null;
  bestPractices?: number | null;
  seo?: number | null;
  pwa?: number | null;
  lcp?: number | null;
  cls?: number | null;
  tbt?: number | null;
  tti?: number | null;
  fcp?: number | null;
  speedIndex?: number | null;
  totalBlockingTime?: number | null;
  createdAt: string;
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
  status: "NEW" | "CONFIRMED" | "PENDING" | "CANCELED";
  scheduledAt: string;
  notes?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactWhatsApp?: string | null;
  contactLine?: string | null;
  contactWeChat?: string | null;
  paymentMethod?: string | null;
  paymentDetails?: {
    accountNumber?: string;
    bankName?: string;
    accountName?: string;
  } | null;
  totalAmount?: number | null;
  customer?: { name: string };
  service?: { key: string };
  staff?: { name?: string | null };
  items?: {
    id: number;
    serviceId: number;
    priceOptionId?: number | null;
    qty: number;
    guests: number;
    duration?: string | null;
    service?: { name?: string | null };
    priceOption?: { id: number; code: string; price: number };
  }[];
};

export type PaginatedResponse<T> = {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
};
