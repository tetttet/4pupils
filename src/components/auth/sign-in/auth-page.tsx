"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  ArrowRightIcon,
  AtSignIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  ShieldCheckIcon,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { buildAuthHref, getSafeNextPath } from "@/lib/auth-redirect";
import UnderAuth from "../under-auth";

export function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, loading } = useAuth();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const requestedNext = searchParams.get("next");
  const studentNextUrl = getSafeNextPath(requestedNext, "/platform");
  const nextUrl = getSafeNextPath(requestedNext, "/dashboard");

  React.useEffect(() => {
    if (!loading && user) {
      if (user.role === "student") {
        router.replace(studentNextUrl);
        return;
      }

      router.replace(nextUrl);
    }
  }, [loading, user, router, nextUrl, studentNextUrl]);

  if (loading || user) {
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await login({ email, password });

      if (!res.ok) {
        setError(res.message || "Не удалось войти. Проверьте данные.");
        return;
      }

      if (res.user.role === "student") {
        router.replace(studentNextUrl);
      } else {
        router.replace(nextUrl);
      }

      router.refresh();
    } catch {
      setError("Ошибка сети. Попробуйте ещё раз.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell mode="sign-in">
      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0F3B57]">
            Личный кабинет
          </p>
          <h1 className="mt-3 text-[32px] font-semibold leading-tight tracking-[-0.03em] text-slate-950 sm:text-[38px]">
            Вход в систему
          </h1>
          <p className="mt-3 text-[14px] leading-6 text-slate-500">
            Введите email и пароль, указанные при регистрации.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] leading-5 text-red-700"
          >
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label
              className="text-[12px] font-semibold text-slate-700"
              htmlFor="sign-in-email"
            >
              Email
            </label>
            <InputGroup className="h-12 rounded-lg border-slate-300 bg-white shadow-none has-[[data-slot=input-group-control]:focus-visible]:border-[#0F3B57] has-[[data-slot=input-group-control]:focus-visible]:ring-[#0F3B57]/10">
              <InputGroupAddon className="pl-4 text-slate-400">
                <AtSignIcon aria-hidden="true" className="size-[17px]" />
              </InputGroupAddon>
              <InputGroupInput
                id="sign-in-email"
                className="h-full px-3 text-[14px] text-slate-900 placeholder:text-slate-400"
                placeholder="name@example.com"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting || loading}
              />
            </InputGroup>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <label
                className="text-[12px] font-semibold text-slate-700"
                htmlFor="sign-in-password"
              >
                Пароль
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-[12px] font-medium text-[#0F3B57] underline-offset-4 hover:underline"
              >
                Забыли пароль?
              </Link>
            </div>

            <InputGroup className="h-12 rounded-lg border-slate-300 bg-white shadow-none has-[[data-slot=input-group-control]:focus-visible]:border-[#0F3B57] has-[[data-slot=input-group-control]:focus-visible]:ring-[#0F3B57]/10">
              <InputGroupAddon className="pl-4 text-slate-400">
                <LockIcon aria-hidden="true" className="size-[17px]" />
              </InputGroupAddon>
              <InputGroupInput
                id="sign-in-password"
                className="h-full px-3 text-[14px] text-slate-900 placeholder:text-slate-400"
                placeholder="Введите пароль"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting || loading}
              />
              <InputGroupAddon align="inline-end" className="pr-2">
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  disabled={submitting || loading}
                  className="grid size-8 place-items-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                  aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                >
                  {showPassword ? (
                    <EyeOffIcon aria-hidden="true" className="size-[17px]" />
                  ) : (
                    <EyeIcon aria-hidden="true" className="size-[17px]" />
                  )}
                </button>
              </InputGroupAddon>
            </InputGroup>
          </div>

          <Button
            className="group h-12 w-full rounded-lg bg-[#0F3B57] px-5 text-[14px] text-white shadow-none transition-colors hover:bg-[#0A2D43]"
            type="submit"
            disabled={submitting || loading}
          >
            <span>
              {submitting ? "Входим..." : "Войти в аккаунт"}
            </span>
            <ArrowRightIcon
              aria-hidden="true"
              className="size-4 transition-transform group-hover:translate-x-0.5"
            />
          </Button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheckIcon aria-hidden="true" className="size-3.5" />
            Ваши данные защищены
          </div>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-[11px] text-slate-400">Нет аккаунта?</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <Button
          asChild
          className="h-12 w-full rounded-lg border-slate-300 bg-white text-[13px] font-semibold text-[#0F3B57] shadow-none transition-colors hover:border-slate-400 hover:bg-slate-50"
          variant="outline"
        >
          <Link href={buildAuthHref("/auth/sign-up", requestedNext)}>
            Создать аккаунт
          </Link>
        </Button>

        <UnderAuth
          text="Войти"
          className="text-center text-[11px] text-slate-400"
        />
      </div>
    </AuthShell>
  );
}
