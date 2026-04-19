"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Compass,
  RefreshCcw,
} from "lucide-react";

import {
  LearningFitRecommendationCard,
  LearningFitRecommendationCardSkeleton,
} from "@/components/learning-fit/learning-fit-recommendation-card";
import { useApprovedCourses } from "@/hooks/use-approved-courses";
import {
  LEARNING_FIT_STORAGE_KEY,
  buildLearningFitResultsHref,
  getLearningFitRecommendations,
  getLearningFitSummaryItems,
  hasCompleteLearningFitAnswers,
  parseLearningFitAnswers,
  type CompleteLearningFitAnswers,
  type LearningFitAnswers,
} from "@/lib/learning-fit";
import { brand } from "@/lib/brand";

function readStoredAnswers() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(LEARNING_FIT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as {
      answers?: LearningFitAnswers;
    } | null;

    const nextAnswers = parseLearningFitAnswers(parsed?.answers ?? null);
    return hasCompleteLearningFitAnswers(nextAnswers) ? nextAnswers : null;
  } catch {
    return null;
  }
}

function ActionLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-sm border border-[#d9d9d9] bg-white px-5 text-[15px] text-[#2f2f2f] transition hover:bg-[#f5f5f5]"
    >
      {icon}
      {label}
    </Link>
  );
}

export default function LearningFitResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const parsedFromUrl = parseLearningFitAnswers(searchParams);
  const [restoredAnswers, setRestoredAnswers] =
    React.useState<CompleteLearningFitAnswers | null>(null);
  const { courses, loading, error, refresh } = useApprovedCourses();
  const deferredCourses = React.useDeferredValue(courses);

  React.useEffect(() => {
    const nextAnswers = parseLearningFitAnswers(new URLSearchParams(searchKey));

    if (hasCompleteLearningFitAnswers(nextAnswers)) {
      setRestoredAnswers(null);
      return;
    }

    const stored = readStoredAnswers();
    if (!stored) return;

    setRestoredAnswers(stored);
    router.replace(buildLearningFitResultsHref(stored));
  }, [router, searchKey]);

  const answers = hasCompleteLearningFitAnswers(parsedFromUrl)
    ? parsedFromUrl
    : restoredAnswers;

  const summaryItems = getLearningFitSummaryItems(
    answers ?? parseLearningFitAnswers(null),
  ).filter((item) => {
    if (!answers) return true;
    if (item.key === "language") return answers.language !== "any";
    if (item.key === "budget") return answers.budget !== "any";
    return true;
  });

  const recommendations = answers
    ? getLearningFitRecommendations(deferredCourses, answers)
    : null;

  if (!answers) {
    return (
      <div className="min-h-screen bg-white text-[#252525]">
        <div className="mx-auto max-w-355 px-4 pb-28 pt-6 sm:px-8 lg:px-10 xl:px-12 2xl:px-0">
          <div className="max-w-230">
            <p className="text-[34px] font-normal leading-[1.08] tracking-[-0.04em] text-[#2a2a2a] sm:text-[48px]">
              Сначала нужен learning fit
            </p>
            <p className="mt-0.5 text-[26px] font-normal leading-[1.12] tracking-[-0.04em] text-[#bdbdbd] sm:text-[48px]">
              Без ответов подбор будет слишком общим и неточным
            </p>
          </div>

          <div className="mt-8 rounded-[32px] border border-[#e5e5e5] bg-white p-6 sm:p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[#f1f1f1] text-[#242424]">
              <Compass className="h-8 w-8" />
            </div>

            <p className="mt-6 max-w-2xl text-[16px] leading-normal text-[#666666]">
              Пройдите короткий опрос, и мы соберём рекомендации в том же
              аккуратном стиле, что и каталог: по теме, уровню, цели, языку и
              бюджету.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/learning-fit"
                className="inline-flex h-12 items-center justify-center rounded-sm bg-[#242424] px-5 text-[15px] text-white transition hover:bg-black"
              >
                Пройти подбор
              </Link>
              <ActionLink href="/courses" label="Открыть каталог" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#252525]">
      <div className="mx-auto max-w-355 px-4 pb-28 pt-6 sm:px-8 lg:px-10 xl:px-12 2xl:px-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/learning-fit"
            className="inline-flex items-center gap-2 text-[15px] text-[#5c5c5c] transition hover:text-[#242424]"
          >
            <ArrowLeft className="h-4 w-4" />
            Изменить ответы
          </Link>

          <div className="flex flex-col gap-3 sm:flex-row">
            <ActionLink
              href="/learning-fit"
              label="Пройти заново"
              icon={<RefreshCcw className="h-4 w-4" />}
            />
            <ActionLink href="/courses" label="Каталог курсов" />
          </div>
        </div>

        <header className="mt-6 max-w-260">
          <p className="text-[34px] font-normal leading-[1.08] tracking-[-0.04em] text-[#2a2a2a] sm:text-[48px]">
            {recommendations?.usedFallback
              ? `Подобрали самые близкие варианты ${brand.upper}`
              : "Вот курсы, которые лучше всего подходят вам"}
          </p>
          <p className="mt-0.5 text-[26px] font-normal leading-[1.12] tracking-[-0.04em] text-[#bdbdbd] sm:text-[48px]">
            Подбор собран в логике каталога, но уже с учётом ваших ответов
          </p>
        </header>

        <section className="mt-8 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-[32px] bg-[#f1f1f1] p-6 sm:p-7">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-[14px] text-[#7a7a7a]">Подобрано курсов</p>
                <p className="mt-2 text-[34px] font-normal leading-none tracking-[-0.05em] text-[#222222]">
                  {recommendations?.items.length ?? 0}
                </p>
              </div>
              <div>
                <p className="text-[14px] text-[#7a7a7a]">Сильных совпадений</p>
                <p className="mt-2 text-[34px] font-normal leading-none tracking-[-0.05em] text-[#222222]">
                  {recommendations?.totalStrongMatches ?? 0}
                </p>
              </div>
              <div>
                <p className="text-[14px] text-[#7a7a7a]">Режим выдачи</p>
                <p className="mt-2 text-[22px] font-normal leading-[1.05] tracking-[-0.04em] text-[#222222]">
                  {recommendations?.usedFallback
                    ? "Ближайшие варианты"
                    : "Точные совпадения"}
                </p>
              </div>
            </div>

            <p className="mt-6 max-w-3xl text-[15px] leading-normal text-[#666666]">
              Оценка смотрит на тему, цель, уровень, язык, бюджет и отклик
              учеников. Если точных попаданий мало, подбор мягко расширяет выдачу
              и показывает самые близкие по смыслу курсы.
            </p>
          </div>

          <div className="rounded-[32px] border border-[#e5e5e5] bg-white p-6">
            <p className="text-[15px] text-[#7a7a7a]">Ваш профиль подбора</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {summaryItems.map((item) => (
                <span
                  key={item.key}
                  className="rounded-sm bg-[#f1f1f1] px-3 py-2 text-[13px] leading-none text-[#4f4f4f]"
                >
                  {item.label}: {item.value}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <LearningFitRecommendationCardSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-[32px] border border-[#e4c3c3] bg-[#fff4f4] p-6">
              <p className="text-[22px] font-normal tracking-[-0.04em] text-[#222222]">
                Не удалось загрузить курсы
              </p>
              <p className="mt-3 max-w-2xl text-[15px] leading-normal text-[#666666]">
                {error}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={refresh}
                  className="inline-flex h-12 items-center justify-center rounded-sm bg-[#242424] px-5 text-[15px] text-white transition hover:bg-black"
                >
                  Повторить попытку
                </button>
                <ActionLink href="/learning-fit" label="Вернуться к подбору" />
              </div>
            </div>
          ) : recommendations?.items.length ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {recommendations.items.map((item) => (
                <LearningFitRecommendationCard
                  key={item.course.course_id}
                  recommendation={item}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[32px] border border-[#e5e5e5] bg-white p-8">
              <p className="text-[22px] font-normal tracking-[-0.04em] text-[#222222]">
                Пока нет опубликованных курсов
              </p>
              <p className="mt-3 max-w-2xl text-[15px] leading-normal text-[#666666]">
                Как только они появятся, подбор автоматически начнёт собирать
                рекомендации по вашим ответам.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <ActionLink href="/learning-fit" label="Изменить ответы" />
                <ActionLink href="/courses" label="Открыть каталог" />
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
