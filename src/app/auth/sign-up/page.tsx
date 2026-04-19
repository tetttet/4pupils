import SignUpPage from "@/components/auth/sign-up/sign-up-page";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <SignUpPage />
    </Suspense>
  );
}
