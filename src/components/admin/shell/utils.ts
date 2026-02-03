export const buildBreadcrumbTrail = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);
  const adminIndex = segments.indexOf("admin");
  const breadcrumb = (adminIndex >= 0 ? segments.slice(adminIndex + 1) : segments.slice(2)).map(
    (segment) => segment.replace(/-/g, " ")
  );
  const breadcrumbTrail = ["Admin", ...breadcrumb];
  return breadcrumbTrail.length > 1 ? breadcrumbTrail : ["Admin", "Overview"];
};

export const getAdminPath = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);
  const adminIndex = segments.indexOf("admin");
  if (adminIndex === -1) return "";
  return `/${segments.slice(adminIndex).join("/")}`;
};
