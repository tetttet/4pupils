"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Inbox,
  LayoutGrid,
  Settings,
  UserRound,
  Users,
} from "lucide-react";

import { DashboardAuthSkeleton } from "@/components/dashboard/home/dashboard-home-skeletons";
import { TeacherDashboardHome } from "@/components/dashboard/teacher/teacher-dashboard-home";
import { AppBreadcrumb } from "@/components/ui/app-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

type QuickLink = {
  href: string;
  title: string;
  description: string;
  note: string;
  icon: React.ElementType;
  metric?: string;
};

function QuickLinkCard({
  href,
  title,
  description,
  note,
  icon: Icon,
  metric,
}: QuickLink) {
  return (
    <Link
      href={href}
      className="group border border-zinc-300 bg-white p-4 transition-colors hover:bg-zinc-50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-3">
          <div className="inline-flex h-10 w-10 items-center justify-center border border-zinc-300 bg-zinc-50 text-zinc-900">
            <Icon className="h-4.5 w-4.5" />
          </div>

          <div>
            <div className="text-sm font-semibold text-zinc-950">{title}</div>
            <div className="mt-1 text-sm leading-6 text-zinc-600">
              {description}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {metric ? (
            <div className="rounded-full border border-zinc-300 bg-zinc-50 px-3 py-1 text-[11px] font-semibold text-zinc-700">
              {metric}
            </div>
          ) : null}
          <ArrowUpRight className="h-4 w-4 text-zinc-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
      </div>

      <div className="mt-4 border-t border-zinc-200 pt-3 text-xs uppercase tracking-[0.16em] text-zinc-500">
        {note}
      </div>
    </Link>
  );
}

function RoleLanding({
  badge,
  title,
  description,
  primaryAction,
  secondaryAction,
  quickLinks,
  highlights,
}: {
  badge: string;
  title: string;
  description: string;
  primaryAction: { href: string; label: string };
  secondaryAction: { href: string; label: string };
  quickLinks: QuickLink[];
  highlights: Array<{ label: string; value: string; note: string }>;
}) {
  return (
    <>
      <AppBreadcrumb items={[{ label: "Главная" }]} />

      <div className="space-y-6 bg-[#f6f6f6] p-6 text-zinc-900">
        <section className="overflow-hidden border border-zinc-300 bg-zinc-950 text-white">
          <div className="grid gap-px bg-white/10 xl:grid-cols-[minmax(0,1.25fr)_360px]">
            <div className="relative overflow-hidden p-6 sm:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_45%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_60%)]" />

              <div className="relative">
                <Badge className="rounded-full bg-white text-zinc-950 hover:bg-white">
                  {badge}
                </Badge>
                <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                  {title}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72 sm:text-[15px]">
                  {description}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="rounded-none bg-white text-zinc-950 hover:bg-zinc-100"
                  >
                    <Link href={primaryAction.href}>
                      {primaryAction.label}
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="rounded-none border-white/20 bg-white/10 text-white hover:bg-white/16 hover:text-white"
                  >
                    <Link href={secondaryAction.href}>
                      {secondaryAction.label}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-px bg-white/10">
              {highlights.map((item) => (
                <div
                  key={item.label}
                  className="border border-transparent bg-white/6 p-4 backdrop-blur-sm"
                >
                  <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">
                    {item.label}
                  </div>
                  <div className="mt-3 text-3xl font-semibold tracking-tight">
                    {item.value}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-white/72">
                    {item.note}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid gap-px border border-zinc-300 bg-zinc-300 xl:grid-cols-3">
          {quickLinks.map((item) => (
            <QuickLinkCard key={item.href} {...item} />
          ))}
        </div>
      </div>
    </>
  );
}

export function DashboardHomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <DashboardAuthSkeleton />;
  }

  if (user?.role === "teacher") {
    return (
      <TeacherDashboardHome
        firstName={user.first_name || "Преподаватель"}
      />
    );
  }

  if (user?.role === "admin") {
    return (
      <RoleLanding
        badge="Admin Dashboard"
        title="Панель управления платформой"
        description="Здесь быстрый вход в управление пользователями, курсами и почтой. Основная логика уже разложена по разделам, а домашний экран оставляет только самые нужные переходы."
        primaryAction={{
          href: "/dashboard/admin/users/students",
          label: "Открыть пользователей",
        }}
        secondaryAction={{
          href: "/dashboard/admin/courses",
          label: "Перейти к курсам",
        }}
        highlights={[
          {
            label: "Роль",
            value: "Admin",
            note: "Доступ к модерации, почте и пользовательскому контуру.",
          },
          {
            label: "Рабочий поток",
            value: "3 зоны",
            note: "Пользователи, курсы и сообщения уже разнесены по отдельным разделам.",
          },
          {
            label: "Навигация",
            value: "Готова",
            note: "Sidebar и домашний экран теперь выглядят чище и собраннее.",
          },
        ]}
        quickLinks={[
          {
            href: "/dashboard/admin/users/students",
            title: "Пользователи",
            description:
              "Управление студентами, преподавателями и администраторами.",
            note: "люди и роли",
            icon: Users,
          },
          {
            href: "/dashboard/admin/courses",
            title: "Курсы",
            description:
              "Каталог, модерация и контроль публикуемых материалов.",
            note: "контент платформы",
            icon: BookOpen,
          },
          {
            href: "/dashboard/admin/inbox",
            title: "Почта",
            description:
              "Входящие, отправка, черновики и избранное в одном месте.",
            note: "коммуникация",
            icon: Inbox,
          },
        ]}
      />
    );
  }

  return (
    <RoleLanding
      badge="Student Workspace"
      title="Личное пространство студента"
      description="Для студента основная жизнь уже находится в платформе. Домашний экран оставляет только удобный вход в учебное пространство, профиль и настройки."
      primaryAction={{
        href: "/platform",
        label: "Открыть платформу",
      }}
      secondaryAction={{
        href: "/platform/profile",
        label: "Перейти в профиль",
      }}
      highlights={[
        {
          label: "Роль",
          value: "Student",
          note: "Учебное пространство, сообщения, профиль и личные настройки.",
        },
        {
          label: "Основной маршрут",
          value: "Platform",
          note: "Вся учебная активность вынесена в отдельный student workspace.",
        },
        {
          label: "Аккаунт",
          value: user?.first_name || "Готов",
          note: "Профиль и персональные настройки доступны в пару кликов.",
        },
      ]}
      quickLinks={[
        {
          href: "/platform",
          title: "Платформа",
          description:
            "Курсы, сообщения и весь учебный поток без лишнего шума.",
          note: "главное рабочее место",
          icon: LayoutGrid,
        },
        {
          href: "/platform/profile",
          title: "Профиль",
          description:
            "Имя, контакты и личные данные, которые видны внутри платформы.",
          note: "аккаунт",
          icon: UserRound,
        },
        {
          href: "/platform/settings",
          title: "Настройки",
          description: "Подстройка интерфейса и поведение платформы под себя.",
          note: "персонализация",
          icon: Settings,
        },
      ]}
    />
  );
}
