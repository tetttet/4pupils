"use client";

import type { ReactNode } from "react";
import {
  CalendarDays,
  type LucideIcon,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { AppBreadcrumb } from "@/components/ui/app-breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth-context";
import { initials } from "@/lib/func";
import type { User } from "@/types/user";

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return dateFormatter.format(date);
}

function getRoleLabel(role?: User["role"] | null) {
  if (role === "teacher") return "Преподаватель";
  if (role === "admin") return "Администратор";
  if (role === "student") return "Студент";
  return "Пользователь";
}

function getStatusLabel(status?: User["status"] | null) {
  if (status === "blocked") return "Ограничен";
  return "Активен";
}

function getStatusNote(status?: User["status"] | null) {
  if (status === "blocked") {
    return "Доступ к части возможностей ограничен.";
  }

  return "Аккаунт работает в обычном режиме.";
}

function MetricCell({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="bg-white px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold leading-6 text-zinc-950 sm:text-base">
        {value}
      </div>
      <div className="mt-1 text-xs leading-5 text-zinc-500">{note}</div>
    </div>
  );
}

function FieldCard({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="border border-zinc-300 bg-zinc-50 p-3">
      <div className="flex items-start gap-3">
        <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-zinc-300 bg-white text-zinc-900">
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
            {label}
          </div>
          <div className="mt-1 wrap-break-word text-sm font-medium leading-6 text-zinc-950">
            {value}
          </div>
          {note ? (
            <div className="mt-1 text-xs leading-5 text-zinc-500">{note}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function InfoPanel({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="border border-zinc-300 bg-white">
      <div className="border-b border-zinc-300 px-4 py-3">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          {eyebrow}
        </div>
        <h2 className="mt-2 text-lg font-semibold tracking-tight text-zinc-950">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            {description}
          </p>
        ) : null}
      </div>

      <div className="p-4">{children}</div>
    </section>
  );
}

export function TeacherProfilePage() {
  const { user } = useAuth();

  const fullName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    "Преподаватель";
  const roleLabel = getRoleLabel(user?.role);
  const statusLabel = getStatusLabel(user?.status);
  const statusNote = getStatusNote(user?.status);
  const hasPhone = Boolean(user?.phone);
  const createdAt = formatDate(user?.created_at);
  const lastLoginAt = formatDate(user?.last_login_at);

  return (
    <div className="w-full bg-background">
      <AppBreadcrumb
        items={[{ label: "Главная", href: "/dashboard" }, { label: "Профиль" }]}
      />

      <div className="teacher-workspace space-y-4 bg-[#f7f8fa] px-4 py-4 md:px-6 md:py-5">
        <section className="border border-zinc-300 bg-white p-4 md:p-5">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-3">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
                    Профиль преподавателя
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
                    Собранный обзор аккаунта без лишних блоков: основные данные,
                    контакты и текущее состояние профиля.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="border border-zinc-300 bg-zinc-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-700">
                  {roleLabel}
                </div>
                <div className="border border-zinc-300 bg-zinc-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-700">
                  {statusLabel}
                </div>
                <div className="border border-zinc-300 bg-zinc-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-700">
                  Только просмотр
                </div>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)] xl:items-center">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border border-zinc-300">
                  <AvatarImage
                    src={user?.avatar_url ?? undefined}
                    alt={fullName}
                  />
                  <AvatarFallback className="bg-zinc-100 text-base font-semibold text-zinc-900">
                    {initials(fullName)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <div className="truncate text-lg font-semibold text-zinc-950">
                    {fullName}
                  </div>
                  <div className="mt-1 wrap-break-word text-sm leading-6 text-zinc-600">
                    {user?.email ?? "Email не указан"}
                  </div>
                </div>
              </div>

              <div className="grid gap-px border border-zinc-300 bg-zinc-300 sm:grid-cols-3">
                <MetricCell
                  label="Статус"
                  value={statusLabel}
                  note={statusNote}
                />
                <MetricCell
                  label="Последний вход"
                  value={lastLoginAt}
                  note="Последняя активность в системе."
                />
                <MetricCell
                  label="Создан"
                  value={createdAt}
                  note="Дата регистрации аккаунта."
                />
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_0.85fr]">
          <InfoPanel
            eyebrow="Личные данные"
            title="Основная информация"
            description="То, что уже сохранено в профиле преподавателя."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <FieldCard
                icon={UserRound}
                label="Имя"
                value={user?.first_name || "—"}
              />
              <FieldCard
                icon={UserRound}
                label="Фамилия"
                value={user?.last_name || "—"}
              />
              <FieldCard icon={Mail} label="Email" value={user?.email || "—"} />
              <FieldCard
                icon={Phone}
                label="Телефон"
                value={user?.phone || "—"}
                note={
                  hasPhone ? "Контакт уже указан." : "Контакт пока не добавлен."
                }
              />
            </div>
          </InfoPanel>

          <InfoPanel
            eyebrow="Состояние аккаунта"
            title="Короткая сводка"
            description="Что важно быстро проверить перед работой в кабинете."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <FieldCard
                icon={ShieldCheck}
                label="Статус"
                value={statusLabel}
                note={statusNote}
              />
              <FieldCard icon={UserRound} label="Роль" value={roleLabel} />
              <FieldCard icon={UserRound} label="ФИО" value={fullName} />
              <FieldCard
                icon={CalendarDays}
                label="Последний вход"
                value={lastLoginAt}
              />
              <FieldCard
                icon={CalendarDays}
                label="Дата регистрации"
                value={createdAt}
              />
              <div className="border border-dashed border-zinc-300 bg-zinc-50 p-3 sm:col-span-2">
                <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                  Примечание
                </div>
                <div className="mt-2 text-sm leading-6 text-zinc-600">
                  {hasPhone
                    ? "Профиль выглядит заполненным и читается цельно."
                    : "Если добавить телефон, карточка станет полнее и понятнее."}
                </div>
              </div>
            </div>
          </InfoPanel>
        </div>
      </div>
    </div>
  );
}
