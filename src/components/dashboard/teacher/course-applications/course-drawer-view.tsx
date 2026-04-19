"use client";

import Link from "next/link";
import { ExternalLink, Eye, GraduationCap } from "lucide-react";

import type { Course } from "@/types/course";
import type { CourseApplication } from "@/types/course-application";

import { Button } from "@/components/ui/button";

import { COURSE_STATUS_META, COURSE_VISIBILITY_META } from "./constants";
import {
  ApplicationStatusBadge,
  CourseMetaBadge,
  StatCard,
} from "./shared";
import { formatCount, formatDateTime, getApplicantName } from "./utils";

export default function CourseDrawerView({
  course,
  applications,
  onOpenApplication,
  onBackToApplication,
}: {
  course: Course;
  applications: CourseApplication[];
  onOpenApplication: (applicationId: string) => void;
  onBackToApplication?: () => void;
}) {
  const statusMeta = COURSE_STATUS_META[course.lifecycle_status];
  const visibilityMeta = COURSE_VISIBILITY_META[course.visibility];
  const latestApplicationAt = applications[0]?.updated_at ?? null;
  const pendingCount = applications.filter(
    (application) =>
      application.status === "pending" || application.status === "reviewing",
  ).length;
  const approvedCount = applications.filter(
    (application) => application.status === "approved",
  ).length;

  return (
    <div className="grid min-h-full xl:grid-cols-[350px_minmax(0,1fr)]">
      <aside className="border-b border-zinc-300 bg-zinc-50 p-5 xl:border-r xl:border-b-0">
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="inline-flex h-11 w-11 items-center justify-center border border-zinc-300 bg-white text-zinc-700">
              <GraduationCap className="h-4 w-4" />
            </div>

            <div>
              <div className="text-sm font-semibold text-zinc-950">
                {course.title}
              </div>
              <div className="mt-1 font-mono text-xs text-zinc-500">
                {course.slug}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <CourseMetaBadge className={statusMeta.className}>
                {statusMeta.label}
              </CourseMetaBadge>
              <CourseMetaBadge className={visibilityMeta.className}>
                {visibilityMeta.label}
              </CourseMetaBadge>
            </div>
          </div>

          <div className="space-y-3 border border-zinc-200 bg-white p-4">
            <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              Быстрая сводка
            </div>

            <div className="grid gap-3 text-sm text-zinc-700">
              <div className="flex items-start justify-between gap-3">
                <span className="text-zinc-500">Категория</span>
                <span className="text-right font-medium">
                  {course.category || "—"}
                </span>
              </div>

              <div className="flex items-start justify-between gap-3">
                <span className="text-zinc-500">Уровень</span>
                <span className="text-right font-medium">{course.level || "—"}</span>
              </div>

              <div className="flex items-start justify-between gap-3">
                <span className="text-zinc-500">Язык</span>
                <span className="text-right font-medium">{course.language}</span>
              </div>

              <div className="flex items-start justify-between gap-3">
                <span className="text-zinc-500">Обновлён</span>
                <span className="text-right font-medium">
                  {formatDateTime(course.updated_at)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <StatCard
              label="Все заявки"
              value={formatCount(applications.length)}
              note="Сколько обращений пришло по этому курсу."
            />
            <StatCard
              label="Нужно посмотреть"
              value={formatCount(pendingCount)}
              note="Сюда попали pending и reviewing."
            />
            <StatCard
              label="Одобрено"
              value={formatCount(approvedCount)}
              note="Столько заявок уже привели к доступу."
            />
          </div>
        </div>
      </aside>

      <div className="min-h-0 space-y-6 p-5">
        <section className="space-y-3">
          <div className="text-sm font-semibold text-zinc-950">Описание курса</div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="border border-zinc-200 bg-white p-4">
              <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Краткое описание
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
                {course.short_description?.trim() || "Краткое описание пока пустое."}
              </p>
            </div>

            <div className="border border-zinc-200 bg-white p-4">
              <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Полное описание
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
                {course.description?.trim() || "Полное описание пока пустое."}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-zinc-950">
                Заявки по этому курсу
              </div>
              <div className="mt-1 text-sm leading-6 text-zinc-600">
                Последняя активность: {formatDateTime(latestApplicationAt)}.
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {onBackToApplication ? (
                <Button type="button" variant="ghost" size="sm" onClick={onBackToApplication}>
                  Назад к заявке
                </Button>
              ) : null}

              <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/teacher/courses/${course.course_id}/edit`}>
                  Открыть курс
                </Link>
              </Button>

              <Button asChild variant="ghost" size="sm">
                <Link href={`/o/courses/${course.slug}`} target="_blank">
                  Публичная страница
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center">
              <div className="text-base font-semibold text-zinc-950">
                По этому курсу заявок ещё не было
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Как только студент отправит первую заявку, она появится здесь и в
                общей таблице входящих обращений.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-zinc-300">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-zinc-100 text-left">
                  <tr className="border-b border-zinc-300 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
                    <th className="px-4 py-3">Студент</th>
                    <th className="px-4 py-3">Статус</th>
                    <th className="px-4 py-3">Отправлена</th>
                    <th className="px-4 py-3">Обновлена</th>
                    <th className="px-4 py-3 text-right">Детали</th>
                  </tr>
                </thead>

                <tbody>
                  {applications.map((application) => (
                    <tr
                      key={application.application_id}
                      className="border-b border-zinc-200 align-top last:border-b-0 hover:bg-zinc-50"
                    >
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="font-medium text-zinc-950">
                            {getApplicantName(application)}
                          </div>
                          <div className="text-sm text-zinc-500">
                            {application.applicant_email || "Почта не указана"}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <ApplicationStatusBadge status={application.status} />
                      </td>

                      <td className="px-4 py-4 text-zinc-700">
                        {formatDateTime(application.created_at)}
                      </td>

                      <td className="px-4 py-4 text-zinc-700">
                        {formatDateTime(application.updated_at)}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onOpenApplication(application.application_id)}
                        >
                          <Eye className="h-4 w-4" />
                          Открыть справа
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
