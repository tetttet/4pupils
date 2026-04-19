"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

import { useApprovedCourses } from "@/hooks/use-approved-courses";
import {
  buildRecommendedCourseItems,
  buildRecommendationReferencesFromEnrollments,
} from "@/lib/course-recommendations";
import type { Enrollment } from "@/types/enrollment";
import { CourseIcon } from "@/components/ui/course-icon";
import { Button } from "@/components/ui/button";
import { CourseCardSkeleton } from "@/components/ui/skeleton-ui";

import { StudentGlassPanel } from "./student-surface";

function StudentRecommendedCourseCard({
  item,
}: {
  item: ReturnType<typeof buildRecommendedCourseItems>[number];
}) {
  return (
    <Link
      href={`/o/courses/${item.course.slug}`}
      className="group block h-full"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-[22px] border border-slate-200/80 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-slate-300">
        <div className="relative overflow-hidden rounded-t-[22px]">
          <div className="absolute right-2.5 top-2.5 z-10 rounded-full bg-[#2d2d2d] px-2.5 py-1 text-[10px] font-medium text-white shadow-sm sm:right-3 sm:top-3 sm:text-[11px]">
            {item.priceBadge}
          </div>

          <CourseIcon
            type={item.type}
            animationMode="always"
            className="h-32 w-full sm:h-38"
          />
        </div>

        <div className="flex flex-1 flex-col px-3 pb-3 pt-3 sm:px-4 sm:pb-4 sm:pt-3.5">
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 sm:text-[11px]">
              {item.tagLine.split(", ").slice(0, 2).join(" • ")}
            </span>

            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium text-slate-600 sm:text-[11px]">
              {item.level}
            </span>
          </div>

          <h3 className="mt-2 line-clamp-2 text-[15px] font-semibold leading-5 tracking-[-0.02em] text-slate-950 sm:mt-3 sm:text-base sm:leading-6">
            {item.course.title}
          </h3>

          <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-600 sm:mt-2 sm:text-[13px]">
            {item.course.short_description ||
              "Курс из близкого направления, который хорошо дополнит вашу текущую учебную траекторию."}
          </p>

          <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-xs font-medium text-slate-900 sm:mt-4 sm:pt-4 sm:text-sm">
            <span>Смотреть курс</span>
            <span className="inline-flex items-center gap-1.5 text-slate-600 transition-transform duration-150 group-hover:translate-x-0.5">
              Перейти
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

const StudentRecommendedCourses = ({
  availableEnrollments,
}: {
  availableEnrollments: Enrollment[];
}) => {
  const { courses, loading, error } = useApprovedCourses();

  const recommendedCourses = React.useMemo(() => {
    const references = buildRecommendationReferencesFromEnrollments(
      availableEnrollments,
      courses,
    );

    return buildRecommendedCourseItems({
      references,
      courses,
      limit: 4,
    });
  }, [availableEnrollments, courses]);

  return (
    <StudentGlassPanel className="overflow-hidden p-6 sm:p-7">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
              Курсы, которые могут вам подойти дальше
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              На основе курсов, к которым у вас уже есть доступ, мы подобрали
              несколько направлений, которые могут помочь вам расширить знания и
              навыки в смежных областях. Эти курсы дополняют вашу текущую
              учебную траекторию и помогут вам достичь ваших целей обучения.
            </p>
          </div>

          <div className="inline-flex w-fit items-center rounded-full border border-[#e0e1e3] bg-[#f9fafc] px-4 py-2 text-sm font-medium text-[#324158]">
            Персональная подборка
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <CourseCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm leading-6 text-red-700">
            Рекомендации временно недоступны. Вы всё равно можете перейти в
            каталог и посмотреть все курсы.
          </div>
        ) : recommendedCourses.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {recommendedCourses.map((item) => (
              <StudentRecommendedCourseCard
                key={item.course.course_id}
                item={item}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-600">
            Пока не нашли дополнительных курсов рядом с вашей текущей
            программой. Ниже всё равно можно перейти в каталог и посмотреть
            остальные направления.
          </div>
        )}

        <div className="flex justify-center pt-2">
          <Button
            asChild
            size="lg"
            className="h-12 min-w-[35vh] rounded-lg bg-[#2d2d2d] px-6 text-sm font-medium text-white hover:bg-[#1a1a1a]"
          >
            <Link href="/courses" className="inline-flex items-center gap-2.5">
              <Compass className="h-4 w-4" />
              Перейти ко всем курсам
            </Link>
          </Button>
        </div>
      </div>
    </StudentGlassPanel>
  );
};

export default StudentRecommendedCourses;
