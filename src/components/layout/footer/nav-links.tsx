import type { ComponentType } from "react";
import {
  BookOpenIcon,
  Building2Icon,
  LogInIcon,
  MailIcon,
} from "lucide-react";

import { brand } from "@/lib/brand";

type FooterLink = {
  title: string;
  href: string;
  icon?: ComponentType<{ className?: string }>;
};

type FooterLinkGroup = {
  label: string;
  links: FooterLink[];
};

type FooterActionLink = Omit<FooterLink, "icon"> & {
  icon: ComponentType<{ className?: string }>;
};

export const footerLinkGroups: FooterLinkGroup[] = [
  {
    label: "4Pupils",
    links: [
      { title: "Главная", href: "/o" },
      { title: "Каталог курсов", href: "/courses" },
      { title: "Подбор обучения", href: "/learning-fit" },
      { title: "Гайды и статьи", href: "/guides" },
      { title: "Корпоративное обучение", href: "/workspace/company" },
    ],
  },
  {
    label: "Обучение",
    links: [
      { title: "Все курсы", href: "/courses" },
      { title: "Рекомендации", href: "/learning-fit" },
      { title: "Руководства", href: "/guides" },
      { title: "Личный кабинет", href: "/platform" },
      { title: "Уроки", href: "/platform/lessons" },
      { title: "Сообщения", href: "/platform/messages" },
    ],
  },
  {
    label: "Аккаунт и поддержка",
    links: [
      { title: "Создать аккаунт", href: "/auth/sign-up" },
      { title: "Войти", href: "/auth/sign-in" },
      { title: "Профиль студента", href: "/platform/profile" },
      { title: "Настройки", href: "/platform/settings" },
      { title: "Политика конфиденциальности", href: "/docs/privacy-policy" },
      { title: "Написать нам", href: `mailto:${brand.supportEmail}` },
    ],
  },
];

export const footerActionLinks: FooterActionLink[] = [
  {
    title: "Написать нам",
    href: `mailto:${brand.supportEmail}`,
    icon: MailIcon,
  },
  { title: "Каталог курсов", href: "/courses", icon: BookOpenIcon },
  { title: "Для компаний", href: "/workspace/company", icon: Building2Icon },
  { title: "Войти", href: "/auth/sign-in", icon: LogInIcon },
];
