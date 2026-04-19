import { AuthPage } from "@/components/auth/sign-in/auth-page";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <AuthPage />
    </Suspense>
  );
}
