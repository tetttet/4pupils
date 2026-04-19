import type { Metadata } from "next";
import type { ReactNode } from "react";
import { brand, withBrandPrefix } from "@/lib/brand";

export const metadata: Metadata = {
  title: withBrandPrefix(`Teacher Inbox - ${brand.description}`),
  description: brand.fullDescription,
};

export default function TeacherInboxLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
