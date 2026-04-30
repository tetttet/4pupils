"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  AtSignIcon,
  ChevronLeftIcon,
  LockIcon,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { buildAuthHref, getSafeNextPath } from "@/lib/auth-redirect";
import { brand } from "@/lib/brand";
import UnderAuth from "../under-auth";

const authPhotoSrc = "/images/bg/bg-article.jpg";

export function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, loading } = useAuth();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

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
    <main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2 border-t border-gray-300">
      {/* Left / Marketing */}
      <div className="relative hidden h-full overflow-hidden border-r bg-black lg:flex">
        {/* Replace authPhotoSrc above when the final sign-in photo is ready. */}
        <Image
          src={authPhotoSrc}
          alt="Учебное пространство"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-black/45" />

        <div className="relative z-10 flex h-full w-full flex-col p-10 text-white">
          <div className="inline-flex w-fit rounded-md bg-white/90 px-3 py-2 shadow-sm">
            <Logo />
          </div>

          <div className="mt-auto max-w-xl space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              {brand.name}
            </p>
            <h2 className="text-5xl font-bold leading-tight">
              Добро пожаловать обратно
            </h2>
            <p className="max-w-md text-base leading-relaxed text-white/80">
              Войдите в аккаунт, чтобы продолжить обучение, вернуться к курсам
              и видеть свой прогресс без лишних шагов.
            </p>
            <div className="flex max-w-md items-center gap-4 border-t border-white/25 pt-5">
              <p className="text-sm text-white/75">
                Курсы, материалы и прогресс в одном личном кабинете.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right / Form */}
      <div className="relative flex min-h-screen flex-col justify-center p-4">
        <div
          aria-hidden
          className="-z-10 absolute inset-0 isolate opacity-60 contain-strict"
        >
          <div className="-translate-y-87.5 absolute top-0 right-0 h-320 w-140 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)]" />
          <div className="absolute top-0 right-0 h-320 w-60 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] [translate:5%_-50%]" />
          <div className="-translate-y-87.5 absolute top-0 right-0 h-320 w-60 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)]" />
        </div>

        <Button asChild className="absolute top-7 left-5" variant="ghost">
          <Link href="/o">
            <ChevronLeftIcon />
            Главная страница
          </Link>
        </Button>

        <div className="mx-auto w-full space-y-5 sm:w-sm">
          <div className="flex flex-col space-y-2">
            <div className="space-y-1">
              <h1 className="font-bold text-2xl tracking-wide mt-4 lg:mt-0">
                Вход в аккаунт
              </h1>
              <p className="text-base text-muted-foreground">
                Введите email и пароль, чтобы продолжить
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-0 space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <form className="space-y-3" onSubmit={onSubmit}>
              <div className="space-y-2">
                <p className="text-start text-muted-foreground text-xs">
                  Email
                </p>
                <InputGroup>
                  <InputGroupInput
                    placeholder="your.email@example.com"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting || loading}
                  />
                  <InputGroupAddon>
                    <AtSignIcon />
                  </InputGroupAddon>
                </InputGroup>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-start text-muted-foreground text-xs">
                    Пароль
                  </p>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs underline underline-offset-4 text-muted-foreground hover:text-primary"
                  >
                    Забыли пароль?
                  </Link>
                </div>

                <InputGroup>
                  <InputGroupInput
                    placeholder="Введите пароль"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={submitting || loading}
                  />
                  <InputGroupAddon>
                    <LockIcon />
                  </InputGroupAddon>
                </InputGroup>
              </div>

              <Button
                className="w-full"
                type="submit"
                size="lg"
                disabled={submitting || loading}
              >
                {submitting ? "Входим..." : "Войти"}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Мы не передаём ваши данные третьим лицам
              </p>
            </form>

            <div className="mt-4">
              <div className="h-px w-full bg-border" />
              <div className="mt-4 rounded-lg border bg-muted/30 p-4 text-center text-[12px] text-muted-foreground">
                Получите доступ ко всем возможностям платформы и сохраните
                прогресс обучения
              </div>

              <p className="mt-4 text-center text-sm text-muted-foreground">
                Нет аккаунта?{" "}
              </p>

              <Button
                asChild
                className="w-full mt-2"
                size="lg"
                variant="outline"
              >
                <Link href={buildAuthHref("/auth/sign-up", requestedNext)}>
                  Зарегистрироваться
                </Link>
              </Button>
            </div>
          </div>

          <UnderAuth text="Войти" />
        </div>
      </div>
    </main>
  );
}
