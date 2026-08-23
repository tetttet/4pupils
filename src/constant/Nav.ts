import {
  Archive,
  BookOpen,
  Check,
  Clipboard,
  FileText,
  GraduationCap,
  Inbox,
  LayoutGrid,
  PencilIcon,
  Send,
  User,
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
  { title: "Главная", href: "/dashboard", icon: LayoutGrid },
  { title: "Курсы", href: "/dashboard/teacher/courses", icon: BookOpen },
  { title: "Заявки", href: "/dashboard/teacher/applications", icon: FileText },
  { title: "Студенты", href: "/dashboard/teacher/lessons", icon: GraduationCap },
  { title: "Сообщения", href: "/dashboard/teacher/inbox", icon: Inbox },
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
