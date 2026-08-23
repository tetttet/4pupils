"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  AtSignIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  GraduationCapIcon,
  LockIcon,
  UserIcon,
} from "lucide-react";

import UnderAuth from "../under-auth";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

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

const inputGroupClassName =
  "h-12 rounded-lg border-slate-300 bg-white shadow-none has-[[data-slot=input-group-control]:focus-visible]:border-[#0F3B57] has-[[data-slot=input-group-control]:focus-visible]:ring-[#0F3B57]/10";

const inputClassName =
  "h-full px-3 text-[14px] text-slate-900 placeholder:text-slate-400";

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
  const [showPassword, setShowPassword] = React.useState(false);

  const disabled = submitting || loading;
  const step1Valid =
    values.firstName.trim().length > 0 &&
    values.lastName.trim().length > 0 &&
    (values.role === "student" || values.role === "teacher");
  const step2Valid =
    values.email.trim().length > 0 &&
    values.password.length >= 8 &&
    values.email.includes("@");

  const passwordStrength = React.useMemo(() => {
    let strength = 0;
    if (values.password.length >= 8) strength += 1;
    if (/[a-zа-я]/i.test(values.password)) strength += 1;
    if (/\d/.test(values.password)) strength += 1;
    if (values.password.length >= 12 || /[^\p{L}\d]/u.test(values.password)) {
      strength += 1;
    }
    return strength;
  }, [values.password]);

  function goNext() {
    onErrorChange(null);
    if (!step1Valid) {
      onErrorChange("Заполните имя и фамилию, затем выберите роль.");
      return;
    }
    setStep(2);
  }

  function goBack() {
    onErrorChange(null);
    setStep(1);
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
      onErrorChange("Сначала заполните данные профиля.");
      return;
    }

    if (!step2Valid) {
      onErrorChange("Проверьте email и пароль — в пароле должно быть минимум 8 символов.");
      return;
    }

    await onFinalSubmit();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0F3B57]">
          Личный кабинет
        </p>
        <h1 className="mt-3 text-[32px] font-semibold leading-tight tracking-[-0.03em] text-slate-950 sm:text-[38px]">
          Создание аккаунта
        </h1>
        <p className="mt-3 text-[14px] leading-6 text-slate-500">
          {step === 1
            ? "Расскажите немного о себе — это займёт меньше минуты."
            : "Осталось создать данные для безопасного входа."}
        </p>
      </div>

      <div aria-label={`Шаг ${step} из 2`}>
        <div className="grid grid-cols-2 gap-5">
          <StepItem
            number="01"
            label="Профиль"
            state={step === 1 ? "active" : "complete"}
            onClick={step === 2 ? goBack : undefined}
          />
          <StepItem
            number="02"
            label="Доступ"
            state={step === 2 ? "active" : "upcoming"}
          />
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] leading-5 text-red-700"
        >
          {error}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        {step === 1 ? (
          <>
            <fieldset className="space-y-2.5">
              <legend className="text-[12px] font-semibold text-slate-700">
                Выберите роль
              </legend>
              <div className="grid grid-cols-2 gap-2.5">
                <RoleCard
                  active={values.role === "student"}
                  disabled={disabled}
                  icon={<GraduationCapIcon aria-hidden="true" />}
                  label="Ученик"
                  description="Учиться и расти"
                  onClick={() => onChange.setRole("student")}
                />
                <RoleCard
                  active={values.role === "teacher"}
                  disabled={disabled}
                  icon={<UserIcon aria-hidden="true" />}
                  label="Преподаватель"
                  description="Создавать курсы"
                  onClick={() => onChange.setRole("teacher")}
                />
              </div>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  className="text-[12px] font-semibold text-slate-700"
                  htmlFor="sign-up-first-name"
                >
                  Имя
                </label>
                <InputGroup className={inputGroupClassName}>
                  <InputGroupAddon className="pl-4 text-slate-400">
                    <UserIcon aria-hidden="true" className="size-[17px]" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="sign-up-first-name"
                    className={inputClassName}
                    placeholder="Ваше имя"
                    autoComplete="given-name"
                    value={values.firstName}
                    onChange={(e) => onChange.setFirstName(e.target.value)}
                    disabled={disabled}
                    required
                  />
                </InputGroup>
              </div>

              <div className="space-y-2">
                <label
                  className="text-[12px] font-semibold text-slate-700"
                  htmlFor="sign-up-last-name"
                >
                  Фамилия
                </label>
                <InputGroup className={inputGroupClassName}>
                  <InputGroupAddon className="pl-4 text-slate-400">
                    <UserIcon aria-hidden="true" className="size-[17px]" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="sign-up-last-name"
                    className={inputClassName}
                    placeholder="Ваша фамилия"
                    autoComplete="family-name"
                    value={values.lastName}
                    onChange={(e) => onChange.setLastName(e.target.value)}
                    disabled={disabled}
                    required
                  />
                </InputGroup>
              </div>
            </div>

            <Button
              type="submit"
              className="group h-12 w-full rounded-lg bg-[#0F3B57] px-5 text-[14px] text-white shadow-none transition-colors hover:bg-[#0A2D43]"
              disabled={disabled}
            >
              <span>Продолжить</span>
              <ArrowRightIcon
                aria-hidden="true"
                className="size-4 transition-transform group-hover:translate-x-0.5"
              />
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <label
                className="text-[12px] font-semibold text-slate-700"
                htmlFor="sign-up-email"
              >
                Email
              </label>
              <InputGroup className={inputGroupClassName}>
                <InputGroupAddon className="pl-4 text-slate-400">
                  <AtSignIcon aria-hidden="true" className="size-[17px]" />
                </InputGroupAddon>
                <InputGroupInput
                  id="sign-up-email"
                  className={inputClassName}
                  placeholder="name@example.com"
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={(e) => onChange.setEmail(e.target.value)}
                  disabled={disabled}
                  required
                />
              </InputGroup>
            </div>

            <div className="space-y-2">
              <label
                className="text-[12px] font-semibold text-slate-700"
                htmlFor="sign-up-password"
              >
                Пароль
              </label>
              <InputGroup className={inputGroupClassName}>
                <InputGroupAddon className="pl-4 text-slate-400">
                  <LockIcon aria-hidden="true" className="size-[17px]" />
                </InputGroupAddon>
                <InputGroupInput
                  id="sign-up-password"
                  className={inputClassName}
                  placeholder="Минимум 8 символов"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={values.password}
                  onChange={(e) => onChange.setPassword(e.target.value)}
                  disabled={disabled}
                  required
                  minLength={8}
                />
                <InputGroupAddon align="inline-end" className="pr-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    disabled={disabled}
                    className="grid size-8 place-items-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                    aria-label={
                      showPassword ? "Скрыть пароль" : "Показать пароль"
                    }
                  >
                    {showPassword ? (
                      <EyeOffIcon aria-hidden="true" className="size-[17px]" />
                    ) : (
                      <EyeIcon aria-hidden="true" className="size-[17px]" />
                    )}
                  </button>
                </InputGroupAddon>
              </InputGroup>

              <div className="flex items-center gap-3 pt-1">
                <div className="flex flex-1 gap-1.5" aria-hidden="true">
                  {[1, 2, 3, 4].map((level) => (
                    <span
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        passwordStrength >= level
                          ? "bg-[#0F3B57]"
                          : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-slate-400">
                  Минимум 8 символов
                </p>
              </div>
            </div>

            <div className="grid grid-cols-[0.75fr_1.25fr] gap-2.5">
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-lg border-slate-300 bg-white text-[13px] font-semibold text-slate-700 shadow-none hover:border-slate-400 hover:bg-slate-50"
                onClick={goBack}
                disabled={disabled}
              >
                <ArrowLeftIcon aria-hidden="true" className="size-4" />
                Назад
              </Button>
              <Button
                type="submit"
                className="h-12 rounded-lg bg-[#0F3B57] px-5 text-[13px] text-white shadow-none transition-colors hover:bg-[#0A2D43]"
                disabled={disabled}
              >
                {submitting ? "Создаём..." : "Создать аккаунт"}
              </Button>
            </div>
          </>
        )}

        <div className="border-t border-slate-200 pt-5 text-center">
          <p className="text-[12px] text-slate-500">
            Уже есть аккаунт?{" "}
            <Link
              href={signInHref}
              className="font-semibold text-[#0F3B57] underline-offset-4 hover:underline"
            >
              Войти
            </Link>
          </p>
        </div>
      </form>

      <UnderAuth
        text="Зарегистрироваться"
        className="text-center text-[11px] text-slate-400"
      />
    </div>
  );
}

function StepItem({
  number,
  label,
  state,
  onClick,
}: {
  number: string;
  label: string;
  state: "active" | "complete" | "upcoming";
  onClick?: () => void;
}) {
  const content = (
    <>
      <span
        className={`grid size-6 place-items-center rounded-full border text-[9px] font-semibold ${
          state === "upcoming"
            ? "border-slate-300 bg-white text-slate-400"
            : "border-[#0F3B57] bg-[#0F3B57] text-white"
        }`}
      >
        {state === "complete" ? (
          <CheckIcon aria-hidden="true" className="size-3.5" />
        ) : (
          number
        )}
      </span>
      <span
        className={`text-[11px] font-semibold sm:text-[12px] ${
          state === "upcoming" ? "text-slate-400" : "text-slate-700"
        }`}
      >
        {label}
      </span>
    </>
  );

  const className = `flex items-center gap-2 px-0.5 text-left transition-colors ${
    onClick ? "hover:text-slate-950" : ""
  }`;

  return onClick ? (
    <button type="button" className={className} onClick={onClick}>
      {content}
    </button>
  ) : (
    <div className={className}>{content}</div>
  );
}

function RoleCard({
  active,
  disabled,
  icon,
  label,
  description,
  onClick,
}: {
  active: boolean;
  disabled: boolean;
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`relative flex min-h-20 items-center gap-3 rounded-lg border px-3 text-left transition-colors disabled:opacity-50 ${
        active
          ? "border-[#0F3B57] bg-slate-50"
          : "border-slate-300 bg-white hover:border-slate-500 hover:bg-slate-50"
      }`}
    >
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-md [&_svg]:size-[17px] ${
          active
            ? "bg-[#0F3B57] text-white"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[12px] font-semibold text-slate-800">
          {label}
        </span>
        <span className="mt-1 block text-[10px] text-slate-400">
          {description}
        </span>
      </span>
      {active && (
        <CheckIcon
          aria-hidden="true"
          className="absolute right-2.5 top-2.5 size-3.5 text-[#0F3B57]"
        />
      )}
    </button>
  );
}
