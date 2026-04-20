import Link from "next/link";
import React from "react";
import { brand } from "@/lib/brand";
import { Logo } from "../layout/logo";

type FooterLinkItem = {
  label: string;
  href: string;
  external?: boolean;
};

type FooterColumnProps = {
  title: string;
  links: FooterLinkItem[];
};

const WorkspaceFooter = () => {
  const footerColumns: FooterColumnProps[] = [
    {
      title: `О платформе ${brand.name}`,
      links: [
        { label: "Главная", href: "/o" },
        { label: "Каталог курсов", href: "/courses" },
        { label: "Гайды и статьи", href: "/guides" },
        { label: "Подбор обучения", href: "/learning-fit" },
        { label: "Регистрация", href: "/auth/sign-up" },
        { label: "Войти", href: "/auth/sign-in" },
        { label: "Платформа", href: "/platform" },
        { label: "Уроки", href: "/platform/lessons" },
        { label: "Профиль", href: "/platform/profile" },
      ],
    },
    {
      title: "Быстрый старт и выбор курса",
      links: [
        { label: "Войти", href: "/auth/sign-in" },
        { label: "Выбрать курс", href: "/courses" },
        { label: "Рекомендации", href: "/learning-fit" },
        { label: "Материалы", href: "/guides" },
        { label: "Платформа", href: "/o" },
      ],
    },
    {
      title: "Контакты, полезные разделы",
      links: [
        {
          label: "Написать нам",
          href: `mailto:${brand.supportEmail}`,
          external: true,
        },
        { label: "Каталог", href: "/courses" },
        { label: "Материалы", href: "/guides" },
        { label: "Подобрать курс", href: "/learning-fit" },
        { label: "Создать аккаунт", href: "/auth/sign-up" },
      ],
    },
  ];

  return (
    <footer className="w-full bg-[#f0f0f0] text-[#2f2f2f]">
      <div className="mx-auto max-w-400 px-8 pb-16 pt-14 md:px-12 xl:px-20 2xl:px-24">
        <div className="grid grid-cols-1 gap-20 md:grid-cols-2">
          <div className="flex h-full max-w-180 flex-col">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <Logo />
              <span className="text-[14px] leading-none text-[#8b8b8b]">
                {`Команда ${brand.name} помогает с выбором курсов, стартом и навигацией по платформе`}
              </span>
            </div>

            <div className="mt-auto max-w-160 space-y-8 pt-10 text-[10px] leading-[1.35] text-[#444444] select-none">
              <p>
                {`${brand.name} подходит студентам, преподавателям, авторам курсов и небольшим образовательным командам, которым важны ясная структура, удобный старт, качественные материалы и единое пространство для обучения, практики, выбора курсов и долгосрочного развития.`}
              </p>

              <p>
                {`© 2026 ${brand.name}. Все права защищены. ${brand.name} объединяет каталог, рекомендации, обучающие материалы и понятную навигацию, чтобы обучение выглядело современно, объемно и уверенно на каждом этапе.`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {footerColumns.map((column) => (
              <FooterColumn
                key={column.title}
                title={column.title}
                links={column.links}
              />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div className="min-w-0">
      {title && (
        <h3 className="mb-6 text-[16px] font-medium leading-none text-[#7d7d7d]">
          {title}
        </h3>
      )}

      <ul className="space-y-3">
        {links.map((item) => (
          <li key={item.label}>
            {item.external ? (
              <a
                href={item.href}
                className="block max-w-70 text-[14px] font-normal leading-tight text-[#3a3a3a] transition-opacity hover:opacity-70"
              >
                {item.label}
              </a>
            ) : (
              <Link
                href={item.href}
                className="block max-w-70 text-[14px] font-normal leading-tight text-[#3a3a3a] transition-opacity hover:opacity-70"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default WorkspaceFooter;
