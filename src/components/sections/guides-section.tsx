"use client";

import Link from "next/link";
import Image from "next/image";
import type { GuideListItem } from "@/lib/guides";
import { brand } from "@/lib/brand";
import { GuideCard } from "../cards/guide-card";
import H2Text from "../text/h2-text";

type Props = {
  title?: string;
  items: GuideListItem[];
  moreHref?: string;
  moreText?: string;
  coverSrc?: string;
  subtitle?: string;
};

export function GuidesSection({
  title = `${brand.name} проводник <br /> к уверенному старту`,
  subtitle = "Практичные руководства, чтобы быстрее разобраться, выбрать маршрут и уверенно начать.",
  items,
  moreHref = "/guides",
  moreText = "Смотреть все руководства",
  coverSrc = "/images/bg/bg-article.jpg",
}: Props) {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* HERO */}
      <div className="relative isolate overflow-hidden">
        <div className="relative h-80 w-full sm:h-95 lg:h-130">
          <Image
            src={coverSrc}
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>

        {/* CONTENT OVER HERO */}
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-7xl px-0 pb-0 lg:px-6 lg:pb-14">
            <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
              {/* Text block */}
              <div className="lg:col-span-8">
                <div className="inline-flex w-full flex-col gap-4 rounded-2xl border border-white/15 bg-[rgba(var(--frontier-home-primary-deep-rgb),0.30)] p-5 backdrop-blur-md sm:p-6">
                  <H2Text
                    title={title}
                    className="text-[34px]! leading-[1.05] text-white sm:text-[44px]! lg:text-[52px]!"
                  />

                  <p className="max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
                    {subtitle}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <Link
                      href={moreHref}
                      className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[var(--frontier-home-primary-deep)] shadow-[0_14px_30px_rgba(var(--frontier-home-primary-deep-rgb),0.16)] transition hover:bg-white/92 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    >
                      {moreText}
                    </Link>

                    <Link
                      href={moreHref}
                      className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/0 px-5 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    >
                      Перейти в раздел
                      <span aria-hidden className="text-white/70">
                        →
                      </span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Small meta / hint */}
              <div className="lg:col-span-4 lg:justify-self-end">
                <div className="hidden max-w-sm rounded-2xl border border-white/15 bg-[rgba(var(--frontier-home-primary-deep-rgb),0.28)] p-5 text-white backdrop-blur-md lg:block">
                  <div className="text-xs font-semibold uppercase tracking-wide text-white">
                    Подборка
                  </div>
                  <div className="mt-2 text-sm leading-relaxed">
                    {items.length} материалов — от базовых шагов до продвинутых
                    сценариев.
                  </div>
                  <div className="mt-3 h-px w-full bg-white/55" />
                  <div className="mt-3 text-xs text-white">
                    Обновляем регулярно, чтобы всё было актуально.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade into section background */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-linear-to-b from-transparent to-white" />
      </div>

      {/* BODY */}
      <div className="relative bg-transparent">
        <div className="mx-auto max-w-7xl px-6 pb-14 pt-10 lg:pb-18">
          {/* Header line above grid */}
          <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="text-sm font-medium text-[var(--frontier-home-ink)]">
                Рекомендуем начать с этих материалов
              </div>
              <div className="mt-1 text-sm text-[var(--frontier-home-ink-muted)]">
                Короткие, понятные и полезные — чтобы быстро получить результат.
              </div>
            </div>

            <Link
              href={moreHref}
              className="text-sm font-medium text-[var(--frontier-home-primary)] underline decoration-[rgba(var(--frontier-home-primary-rgb),0.3)] underline-offset-4 transition hover:text-[var(--frontier-home-primary-deep)] hover:decoration-[rgba(var(--frontier-home-primary-rgb),0.55)]"
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
                {/* subtle border/hover glow */}
                <div className="pointer-events-none absolute -inset-px rounded-3xl bg-linear-to-b from-[rgba(var(--frontier-home-border-rgb),0.95)] to-[rgba(var(--frontier-home-border-rgb),0.45)] opacity-100" />
                <div className="pointer-events-none absolute -inset-px rounded-3xl bg-linear-to-b from-[rgba(var(--frontier-home-primary-rgb),0.18)] to-[rgba(var(--frontier-home-primary-deep-rgb),0.02)] opacity-0 blur transition-opacity duration-200 group-hover:opacity-100" />

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
          <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-[rgba(var(--frontier-home-border-rgb),0.85)] bg-[var(--frontier-home-surface)] px-5 py-4 sm:flex-row sm:items-center">
            <div className="text-sm text-[var(--frontier-home-ink-muted)]">
              Не нашли то, что нужно? Загляните в полный каталог — там больше
              тем и фильтры по направлениям.
            </div>

            <Link
              href={moreHref}
              className="inline-flex items-center justify-center rounded-full border border-[rgba(var(--frontier-home-border-rgb),0.9)] bg-white px-4 py-2 text-sm font-semibold text-[var(--frontier-home-primary-deep)] shadow-sm transition hover:bg-[rgba(var(--frontier-home-primary-rgb),0.06)]"
            >
              Открыть каталог →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
