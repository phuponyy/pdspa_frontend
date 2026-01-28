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
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="csp-nonce" content={nonce} />
      </head>
      <body className={`${bodyFont.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
