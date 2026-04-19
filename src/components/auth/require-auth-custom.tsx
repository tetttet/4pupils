"use client";

import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import type { USER_ROLES } from "@/types/user";

type RequireAuthProps = {
  children: React.ReactNode;
  roles?: USER_ROLES[];
  redirectUnauthed?: string;
  redirectUnauthorized?: string;
  fallback?: React.ReactNode;
};

export function RequireAuthCustom({
  children,
  roles,
  redirectUnauthed = "/",
  redirectUnauthorized = "/403",
  fallback = null,
}: RequireAuthProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const isAuthed = !!user;
  const needsRoleCheck = !!roles?.length;

  const isAllowed = useMemo(() => {
    if (!user) return false;
    if (!needsRoleCheck) return true; // любой залогиненный
    return roles!.includes(user.role as USER_ROLES);
  }, [user, needsRoleCheck, roles]);

  useEffect(() => {
    if (loading) return;

    // 1) Не залогинен
    if (!isAuthed) {
      router.replace(redirectUnauthed);
      return;
    }

    // 2) Залогинен, но роль не подходит
    if (needsRoleCheck && !isAllowed) {
      router.replace(redirectUnauthorized);
      return;
    }
  }, [
    loading,
    isAuthed,
    needsRoleCheck,
    isAllowed,
    router,
    redirectUnauthed,
    redirectUnauthorized,
  ]);

  // Пока грузится — показываем fallback
  if (loading) return <>{fallback}</>;

  // Если не залогинен — ничего не рендерим (редирект уже пошёл)
  if (!isAuthed) return null;

  // Если роль не подходит — ничего не рендерим (редирект уже пошёл)
  if (needsRoleCheck && !isAllowed) return null;

  return <>{children}</>;
}

/** Удобные обёртки под конкретные роли */
export const RequireStudent = (props: Omit<RequireAuthProps, "roles">) => (
  <RequireAuthCustom {...props} roles={["student"]} />
);

export const RequireTeacher = (props: Omit<RequireAuthProps, "roles">) => (
  <RequireAuthCustom {...props} roles={["teacher"]} />
);

export const RequireAdmin = (props: Omit<RequireAuthProps, "roles">) => (
  <RequireAuthCustom {...props} roles={["admin"]} />
);
