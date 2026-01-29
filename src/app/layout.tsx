import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import Providers from "./providers";

const bodyFont = Roboto({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Panda Spa",
    template: "%s",
  },
  description: "Premium spa and wellness experiences tailored for balance.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerStore = await headers();
  const nonce = headerStore.get("x-nonce") || "";
  let iconUrl = "";
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const response = await fetch(`${apiBase}/public/config`, { cache: "no-store" });
    if (response.ok) {
      const payload = (await response.json()) as {
        data?: Record<string, string>;
      };
      const raw = payload?.data?.site_icon_svg_url;
      if (raw) {
        iconUrl = raw.startsWith("/") ? `${apiBase}${raw}` : raw;
      }
    }
  } catch {
    iconUrl = "";
  }
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="csp-nonce" content={nonce} />
        {iconUrl ? (
          <link rel="icon" href={iconUrl} type="image/svg+xml" />
        ) : null}
      </head>
      <body className={`${bodyFont.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
