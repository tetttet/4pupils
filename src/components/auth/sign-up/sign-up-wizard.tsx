"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

import {
  AtSignIcon,
  LockIcon,
  UserIcon,
  GraduationCapIcon,
  SparklesIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "lucide-react";
import UnderAuth from "../under-auth";

type Role = "student" | "teacher";

type Props = {
  loading: boolean;
  submitting: boolean;
  error: string | null;
  onErrorChange: (v: string | null) => void;
  signInHref: string;
  values: {
    role: Role;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  };
  onChange: {
    setRole: (v: Role) => void;
    setFirstName: (v: string) => void;
    setLastName: (v: string) => void;
    setEmail: (v: string) => void;
    setPassword: (v: string) => void;
  };
  onFinalSubmit: () => Promise<void>;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function SignUpWizard(props: Props) {
  const {
    loading,
    submitting,
    error,
    onErrorChange,
    signInHref,
    values,
    onChange,
    onFinalSubmit,
  } = props;

  const [step, setStep] = React.useState<1 | 2>(1);

  const disabled = submitting || loading;

  const step1Valid =
    values.firstName.trim().length > 0 &&
    values.lastName.trim().length > 0 &&
    (values.role === "student" || values.role === "teacher");

  const step2Valid =
    values.email.trim().length > 0 &&
    values.password.length >= 8 &&
    values.email.includes("@");

  const progress = step === 1 ? 45 : 100;

  function goNext() {
    onErrorChange(null);
    if (step === 1) {
      if (!step1Valid) {
        onErrorChange("Заполните имя/фамилию и выберите роль.");
        return;
      }
      setStep(2);
    }
  }

  function goBack() {
    onErrorChange(null);
    if (step === 2) setStep(1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onErrorChange(null);

    if (step === 1) {
      goNext();
      return;
    }

    if (!step1Valid) {
      setStep(1);
      onErrorChange("Сначала заполните данные на шаге 1.");
      return;
    }

    if (!step2Valid) {
      onErrorChange("Проверьте email и пароль (минимум 8 символов).");
      return;
    }

    await onFinalSubmit();
  }

  const fillHint = React.useMemo(() => {
    let points = 0;
    if (values.firstName.trim()) points += 1;
    if (values.lastName.trim()) points += 1;
    if (values.email.trim()) points += 1;
    if (values.password.length >= 8) points += 1;

    const base = step === 1 ? 20 : 70;
    const extra = step === 1 ? (points / 2) * 25 : (points / 4) * 25;
    return clamp(Math.round(base + extra), 10, progress);
  }, [values, step, progress]);

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-start ml-5">
        <h1 className="font-bold text-2xl tracking-wide mt-4 lg:mt-0">Регистрация</h1>
        <p className="text-base text-muted-foreground">
          {step === 1
            ? "Шаг 1: кто вы и как вас зовут"
            : "Шаг 2: доступ к аккаунту"}
        </p>
      </div>

      <div className="p-4">
        {/* top progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <SparklesIcon className="h-3.5 w-3.5" />
              Wizard
            </span>
            <span>Шаг {step}/2</span>
          </div>
          {/* чуть “живее” чем просто 45/100 */}
          <Progress value={fillHint} />
          <div className="mt-2 flex items-center gap-2">
            <StepPill active={step === 1} label="Профиль" />
            <div className="h-px flex-1 bg-border" />
            <StepPill active={step === 2} label="Доступ" />
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          {step === 1 ? (
            <>
              {/* Role selector */}
              <div className="space-y-2">
                <p className="text-start text-muted-foreground text-xs">
                  Кем регистрируемся?
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onChange.setRole("student")}
                    disabled={disabled}
                    className={[
                      "flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition",
                      values.role === "student"
                        ? "border-primary bg-primary/10"
                        : "hover:bg-muted/40",
                    ].join(" ")}
                  >
                    <GraduationCapIcon className="h-4 w-4" />
                    Обучающийся
                  </button>

                  <button
                    type="button"
                    onClick={() => onChange.setRole("teacher")}
                    disabled={disabled}
                    className={[
                      "flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition",
                      values.role === "teacher"
                        ? "border-primary bg-primary/10"
                        : "hover:bg-muted/40",
                    ].join(" ")}
                  >
                    <UserIcon className="h-4 w-4" />
                    Учитель
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <p className="text-start text-muted-foreground text-xs">
                    Имя
                  </p>
                  <InputGroup>
                    <InputGroupInput
                      placeholder="Ваше имя"
                      value={values.firstName}
                      onChange={(e) => onChange.setFirstName(e.target.value)}
                      disabled={disabled}
                      required
                    />
                    <InputGroupAddon>
                      <UserIcon className="h-4 w-4" />
                    </InputGroupAddon>
                  </InputGroup>
                </div>

                <div className="space-y-2">
                  <p className="text-start text-muted-foreground text-xs">
                    Фамилия
                  </p>
                  <InputGroup>
                    <InputGroupInput
                      placeholder="Ваша фамилия"
                      value={values.lastName}
                      onChange={(e) => onChange.setLastName(e.target.value)}
                      disabled={disabled}
                      required
                    />
                    <InputGroupAddon>
                      <UserIcon className="h-4 w-4" />
                    </InputGroupAddon>
                  </InputGroup>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-1/2"
                  disabled={true}
                  title="Это первый шаг"
                >
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Назад
                </Button>

                <Button type="submit" className="w-1/2" disabled={disabled}>
                  Далее
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3">
                <div className="space-y-2">
                  <p className="text-start text-muted-foreground text-xs">
                    Email
                  </p>
                  <InputGroup>
                    <InputGroupInput
                      placeholder="your.email@example.com"
                      type="email"
                      autoComplete="email"
                      value={values.email}
                      onChange={(e) => onChange.setEmail(e.target.value)}
                      disabled={disabled}
                      required
                    />
                    <InputGroupAddon>
                      <AtSignIcon className="h-4 w-4" />
                    </InputGroupAddon>
                  </InputGroup>
                </div>

                <div className="space-y-2">
                  <p className="text-start text-muted-foreground text-xs">
                    Пароль
                  </p>
                  <InputGroup>
                    <InputGroupInput
                      placeholder="Минимум 8 символов"
                      type="password"
                      autoComplete="new-password"
                      value={values.password}
                      onChange={(e) => onChange.setPassword(e.target.value)}
                      disabled={disabled}
                      required
                      minLength={8}
                    />
                    <InputGroupAddon>
                      <LockIcon className="h-4 w-4" />
                    </InputGroupAddon>
                  </InputGroup>

                  <p className="text-[11px] text-muted-foreground">
                    Подсказка: лучше пароль-фраза из 3–4 слов 😊
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-1/2"
                  onClick={goBack}
                  disabled={disabled}
                >
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Назад
                </Button>

                <Button type="submit" className="w-1/2" disabled={disabled}>
                  {submitting ? "Создаём аккаунт..." : "Зарегистрироваться"}
                </Button>
              </div>
            </>
          )}

          <div className="mt-4">
            <div className="h-px w-full bg-border" />
            <div className="mt-4 rounded-lg border bg-muted/30 p-4 text-center text-[12px] text-muted-foreground">
              Получите доступ ко всем возможностям платформы и сохраните
              прогресс обучения
            </div>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Уже есть аккаунт?{" "}
            </p>

            {/* ВАЖНО: не вкладывай Button в Link через Button внутри Link с type=submit */}
            <Button asChild className="w-full mt-2" size="lg" variant="outline">
              <Link href={signInHref}>Войти</Link>
            </Button>
          </div>
        </form>
      </div>

      <UnderAuth text="Зарегистрироваться" />
    </div>
  );
}

function StepPill({ active, label }: { active: boolean; label: string }) {
  return (
    <div
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition",
        active ? "border-primary bg-primary/10" : "text-muted-foreground",
      ].join(" ")}
    >
      <span
        className={[
          "h-2 w-2 rounded-full",
          active ? "bg-primary" : "bg-muted-foreground/30",
        ].join(" ")}
      />
      {label}
    </div>
  );
}
