"use client";

import * as React from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  Clock3,
  Image as ImageIcon,
  LoaderCircle,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { StudentGlassPanel } from "@/components/platform/student-surface";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { getUserFacingErrorMessage } from "@/lib/error-messages";
import { initials } from "@/lib/func";
import { http } from "@/lib/http";
import { cn } from "@/lib/utils";
import type { User } from "@/types/user";

type ProfileFormState = {
  first_name: string;
  last_name: string;
  phone: string;
  avatar_url: string;
};

type NormalizedProfileFormState = {
  first_name: string;
  last_name: string;
  phone: string | null;
  avatar_url: string | null;
};

type SaveFeedback = {
  tone: "success" | "error";
  message: string;
} | null;

const PROFILE_FIELDS_COUNT = 5;

const registrationDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const lastLoginDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

const lastSavedTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
});

function toFormState(user: User | null): ProfileFormState {
  return {
    first_name: user?.first_name ?? "",
    last_name: user?.last_name ?? "",
    phone: user?.phone ?? "",
    avatar_url: user?.avatar_url ?? "",
  };
}

function normalizeRequired(value: string) {
  return value.trim();
}

function normalizeOptional(value: string) {
  const next = value.trim();
  return next.length > 0 ? next : null;
}

function normalizeFormState(
  form: ProfileFormState,
): NormalizedProfileFormState {
  return {
    first_name: normalizeRequired(form.first_name),
    last_name: normalizeRequired(form.last_name),
    phone: normalizeOptional(form.phone),
    avatar_url: normalizeOptional(form.avatar_url),
  };
}

function isSameForm(
  a: NormalizedProfileFormState,
  b: NormalizedProfileFormState,
) {
  return (
    a.first_name === b.first_name &&
    a.last_name === b.last_name &&
    a.phone === b.phone &&
    a.avatar_url === b.avatar_url
  );
}

function formatDate(
  value: string | null | undefined,
  formatter: Intl.DateTimeFormat,
) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return formatter.format(date);
}

function getRoleLabel(role: User["role"] | undefined) {
  if (role === "teacher") return "Преподаватель";
  if (role === "admin") return "Администратор";
  return "Ученик";
}

function getStatusLabel(status: User["status"] | undefined) {
  if (status === "blocked") return "Ограничен";
  return "Активен";
}

function countCompletedFields(
  form: NormalizedProfileFormState,
  email: string | null | undefined,
) {
  return [
    form.first_name,
    form.last_name,
    email?.trim() ?? "",
    form.phone ?? "",
    form.avatar_url ?? "",
  ].filter(Boolean).length;
}

function buildLastSavedLabel(date: Date) {
  return lastSavedTimeFormatter.format(date);
}

type ProfileFieldProps = {
  id: keyof ProfileFormState;
  label: string;
  type?: React.ComponentProps<typeof Input>["type"];
  placeholder: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  invalid?: boolean;
};

const ProfileField = React.memo(function ProfileField({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  invalid = false,
}: ProfileFieldProps) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="text-[13px] font-medium tracking-[-0.01em] text-[#3b3b3b] sm:text-sm"
      >
        {label}
      </Label>
      <Input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        aria-invalid={invalid}
        placeholder={placeholder}
        className="h-11 rounded-[18px] border-[#d9d9d9] bg-[#fafafa] px-4 text-sm text-[#2d2d2d] shadow-none placeholder:text-slate-400 focus-visible:border-[#2d2d2d]/30 focus-visible:ring-[#2d2d2d]/10 md:text-sm"
      />
    </div>
  );
});

type DetailRowProps = {
  icon: LucideIcon;
  label: string;
  value: string;
};

const DetailRow = React.memo(function DetailRow({
  icon: Icon,
  label,
  value,
}: DetailRowProps) {
  return (
    <div className="flex items-start gap-3 rounded-[20px] border border-black/10 bg-[#fafafa] px-4 py-3.5">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#2d2d2d] text-white">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          {label}
        </div>
        <div className="mt-1 wrap-break-word text-[13px] font-medium leading-[1.35rem] text-[#2d2d2d] sm:text-sm sm:leading-6">
          {value}
        </div>
      </div>
    </div>
  );
});

const ProfileBenefits = React.memo(function ProfileBenefits() {
  return (
    <StudentGlassPanel className="p-5 sm:p-6">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
        Профиль звучит лучше, когда
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-[20px] border border-black/5 bg-[#fafafa] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2d2d2d] text-white">
            <UserRound className="h-4.5 w-4.5" />
          </div>
          <div className="mt-4 text-[14px] font-semibold text-slate-900 sm:text-sm">
            Имя считывается мгновенно
          </div>
          <p className="mt-2 text-[13px] leading-[1.35rem] text-slate-600 sm:text-sm sm:leading-6">
            Полное имя помогает сделать сообщения, шапку и карточки курса более
            живыми.
          </p>
        </div>

        <div className="rounded-[20px] border border-black/5 bg-[#fafafa] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2d2d2d] text-white">
            <ImageIcon className="h-4.5 w-4.5" />
          </div>
          <div className="mt-4 text-[14px] font-semibold text-slate-900 sm:text-sm">
            Есть узнаваемый аватар
          </div>
          <p className="mt-2 text-[13px] leading-[1.35rem] text-slate-600 sm:text-sm sm:leading-6">
            Фото или иллюстрация моментально делают профиль визуально цельным по
            всей платформе.
          </p>
        </div>

        <div className="rounded-[20px] border border-black/5 bg-[#fafafa] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2d2d2d] text-white">
            <Phone className="h-4.5 w-4.5" />
          </div>
          <div className="mt-4 text-[14px] font-semibold text-slate-900 sm:text-sm">
            Контакт под рукой
          </div>
          <p className="mt-2 text-[13px] leading-[1.35rem] text-slate-600 sm:text-sm sm:leading-6">
            Телефон делает ваш аккаунт завершённым и упрощает коммуникацию по
            важным учебным моментам.
          </p>
        </div>
      </div>
    </StudentGlassPanel>
  );
});

const SaveHint = React.memo(function SaveHint() {
  return (
    <div className="rounded-[22px] bg-[#f7f7f7] p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#2d2d2d] shadow-sm">
          <ShieldCheck className="h-4.5 w-4.5" />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-slate-900 sm:text-sm">
            Что происходит после сохранения?
          </div>
          <p className="mt-1 text-[13px] leading-[1.35rem] text-slate-600 sm:text-sm sm:leading-6">
            Все изменения моментально применяются в вашем профиле и
            отображаются в шапке платформы, карточках курсов и при общении с
            преподавателями. Это помогает поддерживать актуальность и
            узнаваемость вашего аккаунта.
          </p>
        </div>
      </div>
    </div>
  );
});

const QuickLinks = React.memo(function QuickLinks() {
  return (
    <StudentGlassPanel className="p-5 sm:p-6">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
        Быстрые переходы
      </div>
      <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-950 sm:text-xl">
        Продолжить работу
      </h3>
      <p className="mt-2 text-[13px] leading-[1.35rem] text-slate-600 sm:text-sm sm:leading-6">
        После настройки профиля можно сразу вернуться в учебный поток или
        открыть персональные настройки.
      </p>

      <div className="mt-5 flex flex-col gap-3">
        <Button
          asChild
          className="h-10 rounded-full bg-[#2d2d2d] text-white shadow-[0_14px_30px_-18px_rgba(17,17,17,0.55)] hover:bg-[#181818] sm:h-11"
        >
          <Link href="/platform">
            В обзор платформы
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="h-10 rounded-full border-[#d7d7d7] bg-white text-[#2d2d2d] hover:bg-[#f6f6f6] sm:h-11"
        >
          <Link href="/platform/settings">
            Открыть настройки
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </StudentGlassPanel>
  );
});

export function StudentProfilePageContent() {
  const { user, updateCurrentUser } = useAuth();

  const baseline = React.useMemo(() => toFormState(user), [user]);
  const normalizedBaseline = React.useMemo(
    () => normalizeFormState(baseline),
    [baseline],
  );
  const [form, setForm] = React.useState<ProfileFormState>(baseline);
  const [isSaving, setIsSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<SaveFeedback>(null);
  const [lastSavedAt, setLastSavedAt] = React.useState<string | null>(null);

  React.useEffect(() => {
    setForm(baseline);
  }, [baseline]);

  const normalizedForm = React.useMemo(() => normalizeFormState(form), [form]);

  const previewFullName = React.useMemo(
    () =>
      [normalizedForm.first_name, normalizedForm.last_name]
        .filter(Boolean)
        .join(" ") || "Ваш профиль",
    [normalizedForm.first_name, normalizedForm.last_name],
  );

  const avatarPreviewUrl =
    normalizedForm.avatar_url ?? user?.avatar_url ?? undefined;

  const hasRequiredNames = Boolean(
    normalizedForm.first_name && normalizedForm.last_name,
  );

  const completedFields = React.useMemo(
    () => countCompletedFields(normalizedForm, user?.email),
    [normalizedForm, user?.email],
  );

  const completion = React.useMemo(
    () => Math.round((completedFields / PROFILE_FIELDS_COUNT) * 100),
    [completedFields],
  );

  const isDirty = React.useMemo(
    () => !isSameForm(normalizedForm, normalizedBaseline),
    [normalizedBaseline, normalizedForm],
  );

  const joinedLong = React.useMemo(
    () => formatDate(user?.created_at, registrationDateFormatter),
    [user?.created_at],
  );

  const lastLoginLong = React.useMemo(
    () => formatDate(user?.last_login_at, lastLoginDateFormatter),
    [user?.last_login_at],
  );

  const roleLabel = getRoleLabel(user?.role);
  const statusLabel = getStatusLabel(user?.status);

  const handleFieldChange = React.useCallback(
    (field: keyof ProfileFormState) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const nextValue = event.target.value;

        setForm((current) => ({ ...current, [field]: nextValue }));
        setFeedback(null);
      },
    [],
  );

  const handleFirstNameChange = React.useMemo(
    () => handleFieldChange("first_name"),
    [handleFieldChange],
  );

  const handleLastNameChange = React.useMemo(
    () => handleFieldChange("last_name"),
    [handleFieldChange],
  );

  const handlePhoneChange = React.useMemo(
    () => handleFieldChange("phone"),
    [handleFieldChange],
  );

  const handleReset = React.useCallback(() => {
    setForm(baseline);
    setFeedback(null);
  }, [baseline]);

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!user?.id) {
        return;
      }

      const { first_name, last_name, phone, avatar_url } = normalizedForm;

      if (!first_name || !last_name) {
        setFeedback({
          tone: "error",
          message: "Имя и фамилия должны быть заполнены.",
        });
        return;
      }

      setIsSaving(true);
      setFeedback(null);

      try {
        const response = await http("/api/users/me", {
          method: "PATCH",
          body: JSON.stringify({
            first_name,
            last_name,
            phone,
            avatar_url,
          }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(
            getUserFacingErrorMessage(data, "Не удалось обновить профиль", {
              status: response.status,
            }),
          );
        }

        const data = await response.json().catch(() => ({}));
        const updatedUser = (data?.user ?? null) as User | null;

        if (updatedUser) {
          updateCurrentUser(updatedUser);
          setForm(toFormState(updatedUser));
        }

        setLastSavedAt(buildLastSavedLabel(new Date()));
        setFeedback({
          tone: "success",
          message:
            "Профиль сохранён. Имя, аватар и контакты уже обновились в интерфейсе.",
        });
      } catch (error) {
        setFeedback({
          tone: "error",
          message: getUserFacingErrorMessage(
            error,
            "Не удалось обновить профиль",
          ),
        });
      } finally {
        setIsSaving(false);
      }
    },
    [normalizedForm, updateCurrentUser, user?.id],
  );

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <section>
        <StudentGlassPanel className="overflow-hidden p-0">
          <div className="relative overflow-hidden px-5 py-5 sm:px-7 sm:py-7">
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-28 bg-linear-to-r from-transparent via-[#2d2d2d]/[0.04] to-transparent"
            />

            <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="relative">
                  <Avatar className="h-[4.5rem] w-[4.5rem] border border-black/10 shadow-sm sm:h-20 sm:w-20">
                    {user.avatar_url ? (
                      <AvatarImage
                        src={user.avatar_url}
                        alt={previewFullName}
                        className="rounded-2xl object-cover"
                      />
                    ) : (
                      <AvatarFallback className="rounded-2xl bg-[#2d2d2d] text-white">
                        {initials(previewFullName)}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-white/80 bg-white text-[#2d2d2d] shadow-sm">
                    <BadgeCheck className="h-4 w-4" />
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="rounded-full bg-[#2d2d2d] px-3 py-1 text-white">
                      {roleLabel}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="rounded-full border-black/10 bg-white px-3 py-1 text-[#2d2d2d]"
                    >
                      {statusLabel}
                    </Badge>
                  </div>

                  <h2 className="mt-3 text-[28px] font-semibold leading-[1.05] tracking-[-0.04em] text-[#1f1f1f] sm:text-[36px]">
                    {previewFullName}
                  </h2>

                  <p className="mt-2 max-w-2xl text-[13px] leading-[1.35rem] text-slate-600 sm:text-sm sm:leading-6">
                    Редактируйте профиль без переходов в отдельные модалки:
                    изменения сохраняются прямо здесь и сразу отражаются в
                    верхней панели платформы.
                  </p>

                  <div className="mt-5 max-w-xl rounded-[22px] border border-black/10 bg-white/85 p-4 sm:p-5">
                    <div className="mb-2 flex items-center justify-between text-[13px] font-medium text-slate-600 sm:text-sm">
                      <span>Заполненность профиля</span>
                      <span>{completion}%</span>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-black/5">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-[#2d2d2d] via-[#4a4a4a] to-[#777777]"
                        style={{ width: `${completion}%` }}
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <div className="rounded-full border border-black/10 bg-[#f5f5f5] px-3 py-1 text-[11px] font-semibold text-[#3b3b3b] sm:text-xs">
                        {completedFields}/{PROFILE_FIELDS_COUNT} ключевых полей
                      </div>
                      <div className="rounded-full border border-transparent bg-[#2d2d2d] px-3 py-1 text-[11px] font-semibold text-white sm:text-xs">
                        В едином тоне платформы
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </StudentGlassPanel>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <div className="space-y-6">
          <StudentGlassPanel className="p-5 sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Редактирование
                </div>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-2xl">
                  Основные данные профиля
                </h3>
                <p className="mt-2 max-w-2xl text-[13px] leading-[1.35rem] text-slate-600 sm:text-sm sm:leading-6">
                  Здесь управляются поля, которые уже поддерживаются API: имя,
                  фамилия, телефон и ссылка на аватар.
                </p>
              </div>

              <Badge
                variant="outline"
                className="rounded-full border-[#2d2d2d]/10 bg-[#2d2d2d]/[0.06] px-3 py-1 text-[11px] font-medium text-[#2d2d2d]"
              >
                Редактируется сейчас
              </Badge>
            </div>

            {feedback ? (
              <div
                className={cn(
                  "mt-5 rounded-[22px] border px-4 py-3 text-[13px] font-medium leading-5 sm:text-sm",
                  feedback.tone === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-rose-200 bg-rose-50 text-rose-700",
                )}
              >
                {feedback.message}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-5 space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <ProfileField
                  id="first_name"
                  label="Имя"
                  value={form.first_name}
                  onChange={handleFirstNameChange}
                  placeholder="Например, Аружан"
                  invalid={!normalizedForm.first_name}
                />
                <ProfileField
                  id="last_name"
                  label="Фамилия"
                  value={form.last_name}
                  onChange={handleLastNameChange}
                  placeholder="Например, Серикова"
                  invalid={!normalizedForm.last_name}
                />
                <ProfileField
                  id="phone"
                  label="Телефон"
                  type="tel"
                  value={form.phone}
                  onChange={handlePhoneChange}
                  placeholder="+7 700 000 00 00"
                />
              </div>

              <SaveHint />

              <div className="flex flex-col gap-4 border-t border-black/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1 text-[11px] text-slate-500 sm:text-xs">
                  <p>
                    После сохранения шапка и сайдбар обновляются автоматически.
                  </p>
                  {lastSavedAt ? (
                    <p className="font-medium text-[#2d2d2d]">
                      Последнее сохранение в {lastSavedAt}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={!isDirty || isSaving}
                    className="h-10 rounded-full border-[#d7d7d7] bg-white px-5 text-[#2d2d2d] hover:bg-[#f6f6f6] sm:h-11"
                  >
                    Вернуть как было
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSaving || !isDirty || !hasRequiredNames}
                    className="h-10 rounded-full bg-[#2d2d2d] px-5 text-white shadow-[0_14px_30px_-18px_rgba(17,17,17,0.55)] hover:bg-[#181818] sm:h-11"
                  >
                    {isSaving ? (
                      <LoaderCircle className="h-4 w-4" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isSaving ? "Сохраняем..." : "Сохранить изменения"}
                  </Button>
                </div>
              </div>
            </form>
          </StudentGlassPanel>

          <ProfileBenefits />
        </div>

        <div className="space-y-6">
          <StudentGlassPanel className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Живой preview
                </div>
                <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-950 sm:text-xl">
                  Карточка профиля
                </h3>
              </div>

              <div className="rounded-full border border-black/5 bg-[#f5f5f5] px-3 py-1 text-[11px] font-semibold text-[#2d2d2d] sm:text-xs">
                {completion}% готово
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-[24px] bg-[#2d2d2d] p-4 text-white shadow-[0_18px_36px_-28px_rgba(15,23,42,0.45)] sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14 border border-white/10 sm:h-16 sm:w-16">
                    <AvatarImage src={avatarPreviewUrl} alt={previewFullName} />
                    <AvatarFallback className="bg-white/10 text-sm font-semibold text-white sm:text-base">
                      {initials(previewFullName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
                      Профиль ученика
                    </div>
                    <div className="mt-2 text-lg font-semibold tracking-[-0.03em] sm:text-[22px]">
                      {previewFullName}
                    </div>
                    <div className="mt-1 truncate text-[13px] text-white/65 sm:text-sm">
                      {user.email}
                    </div>
                  </div>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 sm:h-10 sm:w-10">
                  <BadgeCheck className="h-4.5 w-4.5" />
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="rounded-[20px] border border-white/10 bg-white/[0.06] px-4 py-3">
                  <div className="text-[11px] text-white/45">Телефон</div>
                  <div className="mt-1 text-[13px] font-medium leading-5 text-white/85 sm:text-sm">
                    {normalizedForm.phone ||
                      "Добавьте контакт, чтобы профиль стал увереннее."}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/75 sm:text-xs">
                  {statusLabel}
                </div>
                <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/75 sm:text-xs">
                  Профиль готов к общению
                </div>
              </div>
            </div>
          </StudentGlassPanel>

          <StudentGlassPanel className="p-5 sm:p-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Данные аккаунта
            </div>
            <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-950 sm:text-xl">
              То, что уже есть в системе
            </h3>

            <div className="mt-5 space-y-3">
              <DetailRow icon={Mail} label="Email" value={user.email} />
              <DetailRow
                icon={Phone}
                label="Телефон"
                value={normalizedForm.phone || "Пока не добавлен"}
              />
              <DetailRow
                icon={CalendarDays}
                label="Дата регистрации"
                value={joinedLong}
              />
              <DetailRow
                icon={Clock3}
                label="Последний вход"
                value={
                  lastLoginLong === "—" ? "Пока без активности" : lastLoginLong
                }
              />
            </div>
          </StudentGlassPanel>

          <QuickLinks />
        </div>
      </div>
    </div>
  );
}
