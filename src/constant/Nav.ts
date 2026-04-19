import {
  Archive,
  BarChart3,
  BookOpen,
  Check,
  Clipboard,
  FileText,
  GraduationCap,
  Inbox,
  LayoutGrid,
  PencilIcon,
  Send,
  Settings,
  TrendingUp,
  User,
  UserRound,
  UserPen,
  UserStar,
} from "lucide-react";

export const STUDENT_NAV = [
  { title: "Главная Студента", href: "/dashboard", icon: LayoutGrid },
  {
    title: "Почта",
    href: "/dashboard/student/inbox",
    icon: Inbox,
    subtitles: [
      { title: "Входящие", href: "/dashboard/student/inbox", icon: Inbox },
      { title: "Отправить", href: "/dashboard/student/inbox/send", icon: Send },
      {
        title: "Избранные",
        href: "/dashboard/student/inbox/favorites",
        icon: UserStar,
      },
      {
        title: "Архив",
        href: "/dashboard/student/inbox/archive",
        icon: Archive,
      },
    ],
  },
  // {
  //   title: "Настройки",
  //   href: "/dashboard/student/settings",
  //   icon: Settings,
  //   badge: "todo",
  // },
];

export const TEACHER_NAV = [
  { title: "Главная Преподавателя", href: "/dashboard", icon: LayoutGrid },
  {
    title: "Почта",
    href: "/dashboard/teacher/inbox",
    icon: Inbox,
    subtitles: [
      { title: "Входящие", href: "/dashboard/teacher/inbox", icon: Inbox },
      {
        title: "Отправленные",
        href: "/dashboard/teacher/inbox/sent",
        icon: Send,
      },
      {
        title: "Избранные",
        href: "/dashboard/teacher/inbox/favorites",
        icon: UserStar,
        badge: "Важно",
      },
      {
        title: "Черновики",
        href: "/dashboard/teacher/inbox/drafts",
        icon: Clipboard,
        badge: "В работе",
      },
      {
        title: "Архив",
        href: "/dashboard/teacher/inbox/archive",
        icon: Archive,
      },
    ],
  },
  {
    title: "Курсы",
    href: "/dashboard/teacher/courses",
    icon: BookOpen,
    subtitles: [
      {
        title: "Рабочая Зона",
        href: "/dashboard/teacher/courses",
        icon: LayoutGrid,
      },
      {
        title: "Поток Курсов",
        href: "/dashboard/teacher/courses/pipeline",
        icon: Clipboard,
      },
      {
        title: "Аналитика",
        href: "/dashboard/teacher/courses/insights",
        icon: BookOpen,
      },
      {
        title: "Чек-Лист",
        href: "/dashboard/teacher/courses/readiness",
        icon: Check,
      },
      {
        title: "Создать Курс",
        href: "/dashboard/teacher/courses/create",
        icon: Send,
      },
    ],
  },
  {
    title: "Заявки",
    href: "/dashboard/teacher/applications",
    icon: FileText,
    subtitles: [
      {
        title: "Рабочая Зона",
        href: "/dashboard/teacher/applications",
        icon: LayoutGrid,
      },
      {
        title: "Поток Заявок",
        href: "/dashboard/teacher/applications/pipeline",
        icon: Clipboard,
      },
      {
        title: "Аналитика",
        href: "/dashboard/teacher/applications/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Уроки",
    href: "/dashboard/teacher/lessons",
    icon: GraduationCap,
    subtitles: [
      {
        title: "Рабочая Зона",
        href: "/dashboard/teacher/lessons",
        icon: LayoutGrid,
      },
      {
        title: "Прогресс",
        href: "/dashboard/teacher/lessons/progress",
        icon: TrendingUp,
      },
      {
        title: "Аналитика",
        href: "/dashboard/teacher/lessons/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Профиль",
    href: "/dashboard/teacher/profile",
    icon: UserRound,
  },
  // {
  //   title: "Настройки",
  //   href: "/dashboard/teacher/settings",
  //   icon: Settings,
  //   badge: "todo",
  // },
];

export const ADMIN_NAV = [
  { title: "Главная Администратора", href: "/dashboard", icon: LayoutGrid },
  {
    title: "Пользователи",
    href: "/dashboard/admin/users/students",
    icon: User,
    subtitles: [
      {
        title: "Студенты",
        href: "/dashboard/admin/users/students",
        icon: UserPen,
      },
      {
        title: "Преподаватели",
        href: "/dashboard/admin/users/teachers",
        icon: BookOpen,
      },
      {
        title: "Администраторы",
        href: "/dashboard/admin/users/admins",
        icon: UserStar,
      },
    ],
  },
  {
    title: "Курсы",
    href: "/dashboard/admin/courses",
    icon: BookOpen,
    subtitles: [
      { title: "Все Курсы", href: "/dashboard/admin/courses", icon: BookOpen },
      {
        title: "Модерация",
        href: "/dashboard/admin/courses/moderation",
        icon: Check,
      },
    ],
  },
  {
    title: "Почта",
    href: "/dashboard/admin/inbox",
    icon: Inbox,
    subtitles: [
      { title: "Входящие", href: "/dashboard/admin/inbox", icon: Inbox },
      {
        title: "Отправить",
        href: "/dashboard/admin/inbox/send",
        icon: PencilIcon,
        badge: "+",
      },
      {
        title: "Отправленные",
        href: "/dashboard/admin/inbox/sent",
        icon: Send,
      },
      {
        title: "Избранные",
        href: "/dashboard/admin/inbox/favorites",
        icon: UserStar,
        badge: "Важно",
      },
      {
        title: "Черновики",
        href: "/dashboard/admin/inbox/drafts",
        icon: Clipboard,
        badge: "В работе",
      },
      { title: "Архив", href: "/dashboard/admin/inbox/archive", icon: Archive },
    ],
  },
  // {
  //   title: "Настройки",
  //   href: "/dashboard/admin/settings",
  //   icon: Settings,
  //   badge: "todo",
  // },
];
