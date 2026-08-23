import type { Metadata } from "next";
import Link from "next/link";
import { Bell, UserRound } from "lucide-react";

import { AppBreadcrumb } from "@/components/ui/app-breadcrumb";

export const metadata: Metadata = {
  title: "Настройки",
};

export default function SettingsPage() {
  return (
    <>
      <AppBreadcrumb
        items={[
          { label: "Главная", href: "/dashboard" },
          { label: "Настройки" },
        ]}
      />

      <div className="teacher-workspace space-y-5 bg-[#f7f8fa] p-4 text-zinc-900 sm:p-6">
        <section className="border border-zinc-300 bg-white p-5">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-zinc-950">
            Настройки
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Основные параметры аккаунта и коммуникаций собраны в двух понятных
            разделах.
          </p>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/dashboard/teacher/profile"
            className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-sky-700">
              <UserRound className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-base font-semibold text-slate-950">
              Профиль и контакты
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Проверьте имя, фотографию и контактные данные преподавателя.
            </p>
          </Link>

          <Link
            href="/dashboard/teacher/inbox"
            className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-700">
              <Bell className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-base font-semibold text-slate-950">
              Сообщения
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Откройте входящие, отправленные сообщения и архив переписки.
            </p>
          </Link>
        </div>
      </div>
    </>
  );
}
