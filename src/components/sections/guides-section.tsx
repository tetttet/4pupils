"use client";

import Link from "next/link";
import type { GuideListItem } from "@/lib/guides";
import { brand } from "@/lib/brand";
import { GuideCard } from "../cards/guide-card";
import { ArrowUpRight } from "lucide-react";

type Props = {
  title?: string;
  items: GuideListItem[];
  moreHref?: string;
  moreText?: string;
  subtitle?: string;
  home?: boolean;
};

export function GuidesSection({
  items,
  moreHref = "/guides",
  moreText = "Смотреть все руководства",
  home = false,
}: Props) {
  if (home) {
    return (
      <section className="relative overflow-hidden bg-transparent py-20 sm:py-24 lg:py-28">
        <div className="pointer-events-none absolute -left-52 bottom-0 size-[540px] rounded-full bg-[#ECEFFF] blur-3xl" />
        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-5">
          <div className="grid gap-6 md:grid-cols-[0.95fr_1.05fr] md:items-end md:gap-10">
            <h2 className="max-w-[14ch] text-[36px] font-medium leading-[1.04] tracking-[-0.045em] text-[#202858] sm:text-[44px] lg:text-[52px]">
              {`${brand.name} проводник`}
              <span className="block text-[#5D75CB]">
                к уверенному старту
              </span>
            </h2>

            <div className="md:justify-self-end">
              <p className="text-[14px] font-medium text-[#3F4568] sm:text-[15px]">
                Рекомендуем начать с этих материалов
              </p>
              <p className="mt-2 max-w-[54ch] text-[13px] leading-6 text-[#68719B] sm:text-[14px]">
                Короткие, понятные и полезные — чтобы быстро получить результат.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-5 md:mt-14">
            {items.map((guide) => (
              <GuideCard
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                title={guide.frontmatter.title}
                cover={guide.frontmatter.cover}
                date={guide.frontmatter.date}
                description={guide.frontmatter.description}
                home
              />
            ))}
          </div>

          <div className="mt-5 flex flex-col items-start justify-between gap-5 rounded-[26px] border border-white bg-white px-5 py-5 shadow-[0_10px_30px_rgba(35,48,103,0.045)] sm:flex-row sm:items-center sm:px-7">
            <p className="max-w-[62ch] text-[13px] leading-6 text-[#68719B] sm:text-[14px]">
              Не нашли то, что нужно? Загляните в полный каталог — там больше
              тем и фильтры по направлениям.
            </p>

            <Link
              href={moreHref}
              className="group inline-flex h-12 shrink-0 items-center gap-3 rounded-full bg-[#233067] pl-5 pr-2 text-[13px] font-medium text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#19224c]"
            >
              Открыть каталог
              <span className="grid size-8 place-items-center rounded-full bg-white text-[#233067] transition-transform duration-300 group-hover:rotate-6">
                <ArrowUpRight className="size-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="relative bg-transparent">
        <div className="mx-auto max-w-7xl px-6 pb-14 pt-10 lg:pb-18">
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-[#233067] md:text-5xl">
            {`${brand.name} проводник`}
            <span className="block text-[#233067]">к уверенному старту</span>
          </h1>
          {/* Header line above grid */}
          <div className="mt-10 mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="text-sm font-medium text-[#233067]">
                Рекомендуем начать с этих материалов
              </div>
              <div className="mt-1 text-sm text-[#6b7280]">
                Короткие, понятные и полезные — чтобы быстро получить результат.
              </div>
            </div>

            <Link
              href={moreHref}
              className="text-sm font-medium text-[#233067] underline decoration-[rgba(var(--frontier-home-primary-rgb),0.3)] underline-offset-4 transition hover:text-[#1d4ed8] hover:decoration-[rgba(var(--frontier-home-primary-rgb),0.55)]"
            >
              {moreText}
            </Link>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((g) => (
              <div
                key={g.slug}
                className="group relative rounded-3xl transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div className="relative rounded-3xl bg-white">
                  <GuideCard
                    href={`/guides/${g.slug}`}
                    title={g.frontmatter.title}
                    cover={g.frontmatter.cover}
                    date={g.frontmatter.date}
                    description={g.frontmatter.description}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-[26px] border border-gray-300 bg-[#f9fafb] px-5 py-4 sm:flex-row sm:items-center">
            <div className="text-sm text-gray-700">
              Не нашли то, что нужно? Загляните в полный каталог — там больше
              тем и фильтры по направлениям.
            </div>

            <Link
              href={moreHref}
              className="inline-flex items-center justify-center rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-[#233067] transition hover:bg-[#f3f4f6]"
            >
              Открыть каталог →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
