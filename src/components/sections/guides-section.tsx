"use client";

import Link from "next/link";
import type { GuideListItem } from "@/lib/guides";
import { brand } from "@/lib/brand";
import { GuideCard } from "../cards/guide-card";
import H2Text from "../text/h2-text";

type Props = {
  title?: string;
  items: GuideListItem[];
  moreHref?: string;
  moreText?: string;
  subtitle?: string;
};

export function GuidesSection({
  items,
  moreHref = "/guides",
  moreText = "Смотреть все руководства",
}: Props) {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="relative bg-transparent">
        <div className="mx-auto max-w-7xl px-6 pb-14 pt-10 lg:pb-18">
           <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-[var(--frontier-home-ink)] md:text-5xl">
              {`${brand.name} проводник`}
              <span className="block text-[var(--frontier-home-primary)]">
                к уверенному старту
              </span>
            </h1>
          {/* Header line above grid */}
          <div className="mt-10 mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
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
