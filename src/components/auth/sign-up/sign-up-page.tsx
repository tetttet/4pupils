"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { useAuth } from "@/context/auth-context";
import { SignUpWizard } from "@/components/auth/sign-up/sign-up-wizard";
import { buildAuthHref, getSafeNextPath } from "@/lib/auth-redirect";

type Role = "student" | "teacher";

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, user, loading } = useAuth();

  const requestedNext = searchParams.get("next");
  const studentNextUrl = getSafeNextPath(requestedNext, "/platform");
  const nextUrl = getSafeNextPath(requestedNext, "/dashboard");

  const [role, setRole] = React.useState<Role>("student");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (loading || !user) return;

    if (user.role === "student") {
      router.replace(studentNextUrl);
      return;
    }

    router.replace(nextUrl);
  }, [loading, user, router, nextUrl, studentNextUrl]);

  if (loading || user) {
    return null;
  }

  async function onFinalSubmit() {
    setError(null);
    setSubmitting(true);

    try {
      const r = await register({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
        role,
      });

      if (!r.ok) {
        setError(r.message || "Не удалось зарегистрироваться.");
        return;
      }

      const redirectTo = role === "student" ? studentNextUrl : nextUrl;

      router.replace(redirectTo);
      router.refresh();
    } catch {
      setError("Ошибка сети. Попробуйте ещё раз.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell mode="sign-up">
      <SignUpWizard
        loading={loading}
        submitting={submitting}
        error={error}
        onErrorChange={setError}
        values={{ role, firstName, lastName, email, password }}
        onChange={{
          setRole,
          setFirstName,
          setLastName,
          setEmail,
          setPassword,
        }}
        signInHref={buildAuthHref("/auth/sign-in", requestedNext)}
        onFinalSubmit={onFinalSubmit}
      />
    </AuthShell>
  );
}
