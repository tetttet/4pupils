"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { USER_ROLES } from "@/types/user";

export function RequireAuth({
  children,
  role,
  redirectTo = "/auth/sign-in",
}: {
  children: React.ReactNode;
  role?: USER_ROLES;
  redirectTo?: string;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace(redirectTo);
      return;
    }

    if (role && user.role !== role) {
      router.replace("/403");
    }
  }, [user, loading, role, router, redirectTo]);

  if (loading) return null;
  if (!user) return null;
  if (role && user.role !== role) return null;

  return <>{children}</>;
}
