import type { Metadata } from "next";

import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { DashboardShell } from "@/components/dashboard/dash/dashboard-shell";
import { AuthProvider } from "@/context/auth-context";
import { brand, withBrandPrefix } from "@/lib/brand";
import { getMe } from "@/lib/me";

export const metadata: Metadata = {
  title: withBrandPrefix(`Dashboard - ${brand.description}`),
  description: brand.fullDescription,
};

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getMe();

  if (!user) {
    redirect("/auth/sign-in?next=/dashboard");
  }

  return (
    <AuthProvider initialUser={user}>
      <DashboardShell>{children}</DashboardShell>
      <Toaster richColors position="top-right" />
    </AuthProvider>
  );
}
