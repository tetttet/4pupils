import type { Metadata } from "next";

import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/dash/dashboard-shell";
import { RequireAuth } from "@/components/auth/require-auth";
import { brand, withBrandPrefix } from "@/lib/brand";

export const metadata: Metadata = {
  title: withBrandPrefix(`Dashboard - ${brand.description}`),
  description: brand.fullDescription,
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <RequireAuth><DashboardShell>{children}</DashboardShell></RequireAuth>;
}
