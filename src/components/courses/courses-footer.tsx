import Link from "next/link";
import React from "react";
import { brand } from "@/lib/brand";

type FooterLinkItem = {
  label: string;
  href: string;
  external?: boolean;
};

type FooterColumnProps = {
  title: string;
  links: FooterLinkItem[];
};

const CoursesFooter = () => {
  const featuredLinks: FooterLinkItem[] = [
    { label: `Каталог курсов ${brand.name}`, href: "/courses" },
    { label: "Гайды и полезные материалы", href: "/guides" },
    { label: "Подбор обучения", href: "/learning-fit" },
    { label: "Создать аккаунт", href: "/auth/sign-up" },
  ];

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
    <footer className="w-full bg-[#f0f0f0] text-[#2f2f2f] -mt-10 pb-8">
      <div className="mx-auto max-w-400 px-8 pb-16 pt-14 md:px-12 xl:px-20 2xl:px-24">
        <div className="grid grid-cols-1 gap-20 md:grid-cols-2">
          <div className="max-w-180">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <a
                href={`mailto:${brand.supportEmail}`}
                className="text-[24px] font-normal leading-none tracking-[-0.03em] text-[#222222] transition-opacity hover:opacity-70"
              >
                {brand.supportEmail}
              </a>
              <span className="text-[14px] leading-none text-[#8b8b8b]">
                {`Команда ${brand.name} помогает с выбором курсов, стартом и навигацией по платформе`}
              </span>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-5">
              <Link
                href="/o"
                className="flex items-center text-[#222222]"
                aria-label={brand.name}
              >
                <svg
                  viewBox="0 0 685 210"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-auto w-40 sm:w-55 md:w-75 lg:w-95 xl:w-115"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <rect width="685" height="210" fill="#00206B" />

                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontFamily="Impact, 'Arial Black', 'Roboto Slab', serif"
                    fontSize="118"
                    fontWeight="900"
                    letterSpacing="4"
                    fill="#00206B"
                    stroke="white"
                    strokeWidth="12"
                    paintOrder="stroke fill"
                  >
                    {brand.upper}
                  </text>

                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontFamily="Impact, 'Arial Black', 'Roboto Slab', serif"
                    fontSize="118"
                    fontWeight="900"
                    letterSpacing="4"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                  >
                    {brand.upper}
                  </text>
                </svg>
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
              {featuredLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-[16px] font-medium leading-none text-[#2d2d2d] transition-opacity hover:opacity-70"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-10 max-w-160 space-y-8 text-[14px] leading-[1.35] text-[#444444] select-none">
              <p>
                {brand.name} — это современная образовательная платформа, в
                которой удобно выстраивать понятный маршрут обучения, изучать
                новые навыки в своем темпе и возвращаться к материалам тогда,
                когда это действительно нужно для роста, практики и уверенного
                следующего шага.
              </p>

              <p>
                Если вы хотите быстро определиться с направлением, можно начать
                с{" "}
                <Link
                  href="/learning-fit"
                  className="underline underline-offset-2 transition-opacity hover:opacity-70"
                >
                  подбора обучения
                </Link>
                , затем открыть{" "}
                <Link
                  href="/guides"
                  className="underline underline-offset-2 transition-opacity hover:opacity-70"
                >
                  {`гайды ${brand.name}`}
                </Link>{" "}
                и перейти в{" "}
                <Link
                  href="/courses"
                  className="underline underline-offset-2 transition-opacity hover:opacity-70"
                >
                  каталог курсов
                </Link>
                , чтобы собрать маршрут под свой уровень, интерес и будущую
                учебную цель.
              </p>

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

export default CoursesFooter;
