import { AuthPage } from "@/components/auth/sign-in/auth-page";
import { getSafeNextPath } from "@/lib/auth-redirect";
import { getMe } from "@/lib/me";
import { redirect } from "next/navigation";
import { Suspense } from "react";

type PageProps = {
  searchParams?: Promise<{ next?: string | string[] }>;
};

async function getCurrentUser() {
  try {
    return await getMe();
  } catch {
    return null;
  }
}

function getSingleSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Page({ searchParams }: PageProps) {
  const [params, user] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);
  const requestedNext = getSingleSearchParam(params?.next);

  if (user) {
    redirect(
      user.role === "student"
        ? getSafeNextPath(requestedNext, "/platform")
        : getSafeNextPath(requestedNext, "/dashboard"),
    );
  }

  return (
    <Suspense fallback={<div />}>
      <AuthPage />
    </Suspense>
  );
}
