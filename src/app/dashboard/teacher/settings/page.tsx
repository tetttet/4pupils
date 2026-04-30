import type { Metadata } from "next";

import { AppBreadcrumb } from "@/components/ui/app-breadcrumb";
import { TeacherWidgetSettings } from "@/components/dashboard/teacher/TeacherWidgetSettings";

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

      <div className="space-y-6 bg-[#f6f6f6] p-6 text-zinc-900">
        <section className="border border-zinc-300 bg-white p-5">
          <div className="text-xs uppercase tracking-[0.16em] text-zinc-500">
            Teacher Dashboard
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-zinc-950">
            Настройки
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Управляйте тем, как выглядит главный экран преподавателя: порядок
            блоков, видимость и быстрый возврат к стандартной раскладке.
          </p>
        </section>

        <TeacherWidgetSettings />
      </div>
    </>
  );
}
