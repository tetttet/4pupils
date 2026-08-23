import type { Metadata } from "next";
import "./globals.css";
import { brand, withBrandPrefix } from "@/lib/brand";

export const metadata: Metadata = {
  title: withBrandPrefix(brand.description),
  description: brand.fullDescription,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
