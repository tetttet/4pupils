import type { Metadata } from "next";
import { Header } from "@/components/layout/header/header";
import { StickyFooter } from "@/components/layout/footer/sticky-footer";
import { brand, withBrandPrefix } from "@/lib/brand";

export const metadata: Metadata = {
  title: withBrandPrefix(brand.description),
  description: brand.fullDescription,
};

export default function OLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      {children}
      <StickyFooter />
    </>
  );
}
