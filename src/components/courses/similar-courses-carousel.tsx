"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import { useApprovedCourses } from "@/hooks/use-approved-courses";
import { getCourseCategoryLabel } from "@/lib/func";
import {
  buildRecommendedCourseItems,
  buildRecommendationReferenceFromCourse,
} from "@/lib/course-recommendations";
import { CourseCardSkeleton } from "@/components/ui/skeleton-ui";
import { CourseIcon } from "@/components/ui/course-icon";
import type { Course } from "@/types/course";

type SimilarCoursesCarouselProps = {
  course: Course;
};

function SimilarCourseCard({
  item,
}: {
  item: ReturnType<typeof buildRecommendedCourseItems>[number];
}) {
  return (
    <Link
      href={`/o/courses/${item.course.slug}`}
      className="group block h-full min-w-[290px] shrink-0 snap-start sm:min-w-[320px] lg:min-w-[340px]"
    >
      <article className="flex h-full flex-col rounded-[28px] border border-[#e5e5e5] bg-white p-3 shadow-[0_24px_70px_rgba(34,34,34,0.04)] transition-colors duration-150 hover:bg-[#f7f7f7]">
        <div className="relative overflow-hidden rounded-sm">
          <div className="absolute right-3 top-3 z-10 rounded-sm bg-[#3e82ef] px-2.5 py-1 text-[13px] font-medium leading-none text-white shadow-sm">
            {item.priceBadge}
          </div>

          <div className="transition-transform duration-300 ease-out group-hover:scale-[1.08]">
            <CourseIcon type={item.type} />
          </div>
        </div>

        <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
          <p className="text-[14px] leading-[1.2] text-[#747474] lg:text-[16px]">
            {item.tagLine.split(", ").slice(0, 3).join(", ")}
          </p>
          <h3 className="mt-1 line-clamp-2 text-[18px] font-medium leading-[1.08] tracking-[-0.035em] text-[#222222] lg:text-[20px]">
            {item.course.title}
          </h3>
          <p className="mt-2 text-[14px] leading-none text-[#6b6b6b] lg:text-[16px]">
            {item.level}
          </p>

          {item.course.short_description ? (
            <p className="mt-3 line-clamp-3 text-[14px] leading-[1.45] text-[#666666]">
              {item.course.short_description}
            </p>
          ) : null}

          <div className="mt-auto flex items-center justify-between border-t border-[#ebebeb] pt-5 select-none">
            <span className="text-[15px] font-medium text-[#222222]">
              Перейти к курсу
            </span>
            <span className="inline-flex items-center gap-1.5 text-[15px] text-[#2f2f2f] transition-transform duration-150 group-hover:translate-x-0.5">
              Смотреть
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function SimilarCoursesCarousel({
  course,
}: SimilarCoursesCarouselProps) {
  const { courses, loading, error } = useApprovedCourses();
  const [pageIndex, setPageIndex] = React.useState(0);

  const relatedCourses = React.useMemo(
    () =>
      buildRecommendedCourseItems({
        references: [buildRecommendationReferenceFromCourse(course)],
        courses,
        limit: 8,
      }),
    [course, courses],
  );

  const pageCount = Math.ceil(relatedCourses.length / 3);
  const visibleCourses = relatedCourses.slice(pageIndex * 3, pageIndex * 3 + 3);
  const canGoPrev = pageIndex > 0;
  const canGoNext = pageIndex < pageCount - 1;

  React.useEffect(() => {
    setPageIndex(0);
  }, [course.course_id]);

  React.useEffect(() => {
    if (pageIndex > Math.max(pageCount - 1, 0)) {
      setPageIndex(Math.max(pageCount - 1, 0));
    }
  }, [pageCount, pageIndex]);

  if (!loading && !error && relatedCourses.length === 0) {
    return null;
  }

  const categoryLabel = getCourseCategoryLabel(course);

  return (
    <section className="w-full p-4">
      <div className="mx-auto max-w-355 px-4 md:px-6 lg:px-8">
        <div className="pt-10 md:pt-14">
          <div className="max-w-2xl">
            <h2 className="text-[28px] font-semibold leading-none tracking-[-0.04em] text-[#242424] md:text-[42px]">
              Похожие курсы
            </h2>
            <p className="mt-4 max-w-[720px] text-[16px] leading-[1.45] tracking-[-0.02em] text-[#5e5e5e] md:text-[18px]">
              Подобрали программы рядом с направлением «{categoryLabel}»,
              чтобы можно было сразу продолжить поиск в похожем ритме и
              формате.
            </p>
          </div>

          <div className="mt-8">
            {loading ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index}>
                    <CourseCardSkeleton />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="rounded-[28px] border border-[#e5e5e5] bg-white px-6 py-5 text-[15px] leading-[1.5] text-[#5a5a5a]">
                Похожие курсы временно недоступны. Попробуйте открыть каталог
                чуть позже.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {visibleCourses.map((item) => (
                    <SimilarCourseCard
                      key={item.course.course_id}
                      item={item}
                    />
                  ))}
                </div>

                {pageCount > 1 ? (
                  <div className="mt-8 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      aria-label="Показать предыдущие похожие курсы"
                      onClick={() => setPageIndex((value) => Math.max(value - 1, 0))}
                      disabled={!canGoPrev}
                      className="flex h-12 w-12 items-center justify-center rounded-full border border-[#dddddd] bg-white text-[#2d2d2d] transition disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="min-w-16 text-center text-[14px] font-medium text-[#666666]">
                      {pageIndex + 1} / {pageCount}
                    </div>

                    <button
                      type="button"
                      aria-label="Показать следующие похожие курсы"
                      onClick={() =>
                        setPageIndex((value) => Math.min(value + 1, pageCount - 1))
                      }
                      disabled={!canGoNext}
                      className="flex h-12 w-12 items-center justify-center rounded-full border border-[#dddddd] bg-white text-[#2d2d2d] transition disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
