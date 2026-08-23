import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { UserDashShell } from "@/components/dash/layout/user-dash-shell";
import { AuthProvider } from "@/context/auth-context";
import { withBrandPrefix } from "@/lib/brand";
import { getMe } from "@/lib/me";

export const metadata: Metadata = {
  title: withBrandPrefix("Student Platform"),
  description:
    "Premium student platform experience for lessons, schedules, assignments, and learner communication.",
};

export default async function PlatformLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getMe();

  if (!user) {
    redirect("/auth/sign-in?next=/platform");
  }

  if (user.role !== "student") {
    redirect("/403");
  }

  return (
    <AuthProvider initialUser={user}>
      <UserDashShell>{children}</UserDashShell>
    </AuthProvider>
  );
}
