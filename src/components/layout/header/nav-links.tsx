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
    label: "Наша команда",
    href: "/o/team/introduction",
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
    label: "Попробуйте Atlas",
    href: "/ai/homemade/atlas",
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
