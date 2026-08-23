"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import ApprovedCoursesGrid from "@/components/dashboard/admin/courses/approved-courses-grid";
import ApprovedCoursesGridSkeleton from "@/components/dashboard/admin/courses/approved-courses-grid-skeleton";
import { useApprovedCourses } from "@/hooks/use-approved-courses";

export default function ApprovedCoursesSection() {
  const { courses, loading, error } = useApprovedCourses();
  const previewCourses = courses.slice(0, 3);

  return (
    <section className="relative overflow-hidden bg-transparent py-20 sm:py-24 lg:py-28">
      <div className="pointer-events-none absolute -right-48 top-10 size-[520px] rounded-full bg-[#ECEFFF] blur-3xl" />
      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-5">
        <div className="grid gap-5 md:grid-cols-[0.95fr_1.05fr] md:items-end md:gap-10">
          <h2 className="text-[36px] font-medium leading-[1.04] tracking-[-0.045em] text-[#202858] sm:text-[44px] lg:text-[52px]">
            Начните обучение
            <span className="block text-[#5D75CB]">
              уже сегодня
            </span>
          </h2>
          <p className="max-w-[58ch] text-[14px] leading-7 text-[#68719B] sm:text-[15px] md:justify-self-end">
            Доступные курсы по ключевым направлениям — открывайте и учитесь в своем темпе
          </p>
        </div>

        <div className="relative mt-10 overflow-hidden md:mt-14">
          <div className="relative">
            {loading ? (
              <ApprovedCoursesGridSkeleton count={3} variant="home" />
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
                  variant="home"
                />

                {previewCourses.length ? (
                  <div className="flex justify-center pt-1">
                    <Link
                      href="/courses"
                      className="group inline-flex h-13 items-center gap-3 rounded-full bg-[#233067] pl-6 pr-2 text-[14px] font-medium text-white shadow-[0_12px_26px_rgba(35,48,103,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#19224c] hover:shadow-[0_16px_32px_rgba(35,48,103,0.24)]"
                    >
                      Все курсы
                      <span className="grid size-9 place-items-center rounded-full bg-white text-[#233067] transition-transform duration-300 group-hover:rotate-6">
                        <ArrowUpRight className="size-4" />
                      </span>
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
