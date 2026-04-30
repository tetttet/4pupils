"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { SignUpWizard } from "@/components/auth/sign-up/sign-up-wizard";
import { SignUpRightPanel } from "@/components/auth/sign-up/sign-up-right-panel";
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
    <main className="relative min-h-screen border-t border-gray-300">
      <Button asChild className="absolute left-5 top-7 z-20" variant="ghost">
        <Link href="/o">
          <ChevronLeftIcon className="mr-2 h-4 w-4" />
          Главная страница
        </Link>
      </Button>

      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="flex w-full items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-md">
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
          </div>
        </div>

        <SignUpRightPanel />
      </div>
    </main>
  );
}
