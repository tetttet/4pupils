export type HeaderNavLink = {
  label: string;
  href: string;
  submenu?: HeaderNavSubLink[];
};

export type HeaderNavSubLink = {
  label: string;
  href: string;
};

export const headerLinks: HeaderNavLink[] = [
  {
    label: "Главная",
    href: "/o",
  },
   {
    label: "Корпоративный",
    href: "/workspace/company",
  },
  {
    label: "Курсы",
    href: "/courses",
    submenu: [
      {
        label: "Все курсы",
        href: "/courses",
      },
      {
        label: "Руководства",
        href: "/guides",
      },
    ],
  },
  {
    label: "Гайды",
    href: "/guides",
  },
  {
    label: "Платформа",
    href: "/platform",
    submenu: [
      {
        label: "Уроки",
        href: "/platform/lessons",
      },
      {
        label: "Расписание",
        href: "/platform/schedule",
      },
      {
        label: "Профиль",
        href: "/platform/profile",
      },
    ],
  },
];

export const authLink: HeaderNavLink = {
  label: "Войти",
  href: "/auth/sign-in",
};
