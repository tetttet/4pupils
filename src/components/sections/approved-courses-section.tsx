"use client";

import Link from "next/link";

import ApprovedCoursesGrid from "@/components/dashboard/admin/courses/approved-courses-grid";
import ApprovedCoursesGridSkeleton from "@/components/dashboard/admin/courses/approved-courses-grid-skeleton";
import { useApprovedCourses } from "@/hooks/use-approved-courses";

export default function ApprovedCoursesSection() {
  const { courses, loading, error } = useApprovedCourses();
  const previewCourses = courses.slice(0, 3);

  return (
    <section className="relative overflow-hidden bg-white py-18 sm:py-20 lg:py-24">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-(--frontier-home-ink) sm:text-4xl lg:text-5xl">
            Начните обучение
            <span className="block text-(--frontier-home-primary)">
              уже сегодня
            </span>
          </h2>
          <p className="text-sm leading-7 text-(--frontier-home-ink-muted) sm:text-base">
            Доступные курсы по ключевым направлениям — открывайте и учитесь в своем темпе
          </p>
        </div>

        <div className="relative mt-0 overflow-hidden lg:mt-5">
          <div className="relative">
            {loading ? (
              <ApprovedCoursesGridSkeleton count={3} />
            ) : error ? (
              <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
                {error}
              </div>
            ) : (
              <div className="space-y-8">
                <ApprovedCoursesGrid
                  courses={previewCourses}
                  emptyMessage="Пока нет опубликованных курсов."
                  eagerCount={3}
                />

                {previewCourses.length ? (
                  <div className="flex justify-center">
                    <Link
                      href="/courses"
                      className="inline-flex border rounded-lg items-center justify-center bg-[#233067] px-6 py-3 text-sm font-semibold text-[#ffffff] transition hover:bg-[#1a2350] hover:text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-(--frontier-home-primary)"
                    >
                      Все курсы
                    </Link>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
