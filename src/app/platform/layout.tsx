import type { Metadata } from "next";
import type { ReactNode } from "react";

import { RequireAuth } from "@/components/auth/require-auth";
import { UserDashShell } from "@/components/dash/layout/user-dash-shell";
import { withBrandPrefix } from "@/lib/brand";

export const metadata: Metadata = {
  title: withBrandPrefix("Student Platform"),
  description:
    "Premium student platform experience for lessons, schedules, assignments, and learner communication.",
};

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth role="student" redirectTo="/auth/sign-in">
      <UserDashShell>{children}</UserDashShell>
    </RequireAuth>
  );
}
