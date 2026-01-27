export const ADMIN_BASE = "/admin" as const;

export const ADMIN_ROUTES = {
  base: ADMIN_BASE,
  login: `${ADMIN_BASE}/login`,
  overview: `${ADMIN_BASE}/overview`,
  dashboard: `${ADMIN_BASE}/dashboard`,
  analytics: `${ADMIN_BASE}/analytics`,
  live: `${ADMIN_BASE}/live`,
  customers: `${ADMIN_BASE}/customers`,
  bookings: `${ADMIN_BASE}/bookings`,
  leads: `${ADMIN_BASE}/leads`,
  posts: `${ADMIN_BASE}/posts`,
  pages: `${ADMIN_BASE}/pages`,
  services: `${ADMIN_BASE}/services`,
  media: `${ADMIN_BASE}/media`,
  users: `${ADMIN_BASE}/users`,
  settings: `${ADMIN_BASE}/settings`,
  roles: `${ADMIN_BASE}/settings/roles`,
  seoRedirects: `${ADMIN_BASE}/seo/redirects`,
  securityWhitelist: `${ADMIN_BASE}/security/ip-whitelist`,
  securityBlacklist: `${ADMIN_BASE}/security/ip-blacklist`,
} as const;
