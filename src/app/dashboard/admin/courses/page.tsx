"use client";

import ApprovedCoursesGrid from "@/components/dashboard/admin/courses/approved-courses-grid";
import ApprovedCoursesGridSkeleton from "@/components/dashboard/admin/courses/approved-courses-grid-skeleton";
import { AppBreadcrumb } from "@/components/ui/app-breadcrumb";
import DashHeader from "@/components/ui/dash-header";
import { useApprovedCourses } from "@/hooks/use-approved-courses";

export default function ApprovedCoursesPage() {
  const { courses, loading, error } = useApprovedCourses();

  return (
    <div className="bg-linear-to-b from-neutral-50 to-white">
      <AppBreadcrumb
        items={[
          { label: "Главная", href: "/dashboard" },
          { label: "Все Курсы", href: "/dashboard/admin/courses" },
          { label: `Одобренные курсы (курсы которые отображаются на сайте)` },
        ]}
      />
      <div className="space-y-4">
        <DashHeader
          title="Одобренные курсы"
          subtitle="Здесь отображаются курсы, которые были одобрены и опубликованы на сайте. Ты можешь просмотреть их и при необходимости отредактировать."
        />
        {loading ? (
          <ApprovedCoursesGridSkeleton />
        ) : error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : (
          <ApprovedCoursesGrid courses={courses} />
        )}
      </div>
    </div>
  );
}
