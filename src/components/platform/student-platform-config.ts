import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  LayoutDashboard,
  MessageSquare,
  Settings2,
  UserRound,
} from "lucide-react";

export type StudentNavItem = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

export const STUDENT_PLATFORM_NAV: StudentNavItem[] = [
  {
    title: "Главная",
    description:
      "Яркий обзор вашего дня, прогресса и следующих шагов в обучении.",
    href: "/platform",
    icon: LayoutDashboard,
  },
  {
    title: "Мои уроки",
    description:
      "Возвращайтесь к активным курсам, недавним модулям, сохранённым урокам и учебным трекам.",
    href: "/platform/lessons",
    icon: BookOpen,
  },
  {
    title: "Сообщения",
    description:
      "Смотрите входящие сообщения от преподавателей, команды платформы и системных уведомлений в одном списке.",
    href: "/platform/messages",
    icon: MessageSquare,
  },
  {
    title: "Профиль",
    description:
      "Управляйте своим профилем ученика, достижениями, настройками и публичной информацией.",
    href: "/platform/profile",
    icon: UserRound,
  },
  {
    title: "Настройки",
    description:
      "Настраивайте уведомления, доступность, приватность и общие параметры платформы.",
    href: "/platform/settings",
    icon: Settings2,
  },
];

export function isStudentPlatformPathActive(
  pathname: string | null,
  href: string,
) {
  if (!pathname) return false;
  if (href === "/platform") return pathname === "/platform";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getStudentPlatformItem(pathname: string | null) {
  return (
    STUDENT_PLATFORM_NAV.find((item) =>
      isStudentPlatformPathActive(pathname, item.href),
    ) ?? STUDENT_PLATFORM_NAV[0]
  );
}
