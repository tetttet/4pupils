"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileText,
  GraduationCap,
  MessageSquare,
  Plus,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { readApiData } from "@/lib/api-response";
import { invalidateClientFetchCache } from "@/lib/client-fetch";
import { getUserFacingErrorMessage } from "@/lib/error-messages";
import { cn } from "@/lib/utils";
import { CourseApplicationsAPI } from "@/services/course-application";
import { EnrollmentsAPI } from "@/services/enrollment";
import type { Course } from "@/types/course";
import type { CourseApplication } from "@/types/course-application";
import type { Enrollment } from "@/types/enrollment";

type OverviewData = {
  courses: Course[];
  applications: CourseApplication[];
  enrollments: Enrollment[];
};

const COURSE_STATUS = {
  draft: { label: "Черновик", className: "bg-slate-100 text-slate-600" },
  submitted: { label: "На проверке", className: "bg-amber-50 text-amber-700" },
  approved: { label: "Опубликован", className: "bg-emerald-50 text-emerald-700" },
  rejected: { label: "Нужны правки", className: "bg-rose-50 text-rose-700" },
  archived: { label: "В архиве", className: "bg-slate-100 text-slate-500" },
} satisfies Record<Course["lifecycle_status"], { label: string; className: string }>;

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "short",
});

const countFormatter = new Intl.NumberFormat("ru-RU");

function useTeacherOverview() {
  const [data, setData] = React.useState<OverviewData>({
    courses: [],
    applications: [],
    enrollments: [],
  });
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const requestIdRef = React.useRef(0);

  const load = React.useCallback(async (background = false) => {
    const requestId = ++requestIdRef.current;
    if (background) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    if (!background) {
      setError(null);
    } else {
      invalidateClientFetchCache();
    }

    try {
      const [courses, applications, enrollments] = await Promise.all([
        readApiData<Course[]>(
          await apiFetch("/api/courses/my"),
          "Не удалось загрузить курсы",
        ),
        CourseApplicationsAPI.listTeaching({ sort: "updated_at", dir: "desc" }),
        EnrollmentsAPI.listTeaching({ sort: "last_activity_at", dir: "desc" }),
      ]);
      if (requestId !== requestIdRef.current) return;

      const updateData = () => {
        setData({ courses, applications, enrollments });
      };

      if (background) {
        React.startTransition(updateData);
      } else {
        updateData();
      }
    } catch (loadError) {
      if (requestId !== requestIdRef.current) return;

      setError(
        getUserFacingErrorMessage(loadError, "Не удалось загрузить сводку"),
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  React.useEffect(() => {
    void load();

    return () => {
      requestIdRef.current += 1;
    };
  }, [load]);

  const reload = React.useCallback(() => load(true), [load]);

  return { ...data, loading, refreshing, error, reload };
}

function getCourseReadiness(course: Course) {
  const checks = [
    course.title,
    course.short_description,
    course.description,
    course.image_url,
    course.category,
    course.level,
    course.tags?.length >= 3,
    course.outcomes?.length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function formatCount(value: number) {
  return countFormatter.format(value);
}

function MetricCard({
  label,
  value,
  note,
  icon: Icon,
  href,
}: {
  label: string;
  value: string;
  note: string;
  icon: React.ElementType;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
        </div>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-700 transition-colors group-hover:bg-sky-100">
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500">{note}</p>
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white"
        />
      ))}
    </div>
  );
}

export function TeacherDashboardHome({ firstName }: { firstName: string }) {
  const {
    courses,
    applications,
    enrollments,
    loading,
    refreshing,
    error,
    reload,
  } = useTeacherOverview();

  const analytics = React.useMemo(() => {
    const activeStudents = enrollments.filter((item) => item.status === "active");
    const openApplications = applications.filter(
      (item) => item.status === "pending" || item.status === "reviewing",
    );
    const lowProgressStudents = activeStudents.filter(
      (item) => Number(item.progress_percent) < 35,
    );
    const coursesNeedingWork = courses.filter(
      (course) =>
        course.lifecycle_status === "rejected" ||
        (course.lifecycle_status === "draft" && getCourseReadiness(course) < 75),
    );
    const averageProgress = activeStudents.length
      ? Math.round(
          activeStudents.reduce(
            (sum, item) => sum + Number(item.progress_percent || 0),
            0,
          ) / activeStudents.length,
        )
      : 0;
    const recentCourses = [...courses]
      .sort(
        (left, right) =>
          new Date(right.updated_at).getTime() -
          new Date(left.updated_at).getTime(),
      )
      .slice(0, 5);

    const attentionItems = [
      openApplications.length
        ? {
            title: `${formatCount(openApplications.length)} ${
              openApplications.length === 1 ? "заявка ждёт" : "заявок ждут"
            } решения`,
            note: "Начните с самых ранних обращений.",
            href: "/dashboard/teacher/applications",
            icon: FileText,
            tone: "amber" as const,
          }
        : null,
      coursesNeedingWork.length
        ? {
            title: `${formatCount(coursesNeedingWork.length)} ${
              coursesNeedingWork.length === 1 ? "курс требует" : "курса требуют"
            } внимания`,
            note: "Дополните карточки или исправьте замечания.",
            href: "/dashboard/teacher/courses/readiness",
            icon: CircleAlert,
            tone: "rose" as const,
          }
        : null,
      lowProgressStudents.length
        ? {
            title: `${formatCount(lowProgressStudents.length)} ${
              lowProgressStudents.length === 1
                ? "студент замедлился"
                : "студента замедлились"
            }`,
            note: "Проверьте прогресс и последнюю активность.",
            href: "/dashboard/teacher/lessons/progress",
            icon: Clock3,
            tone: "sky" as const,
          }
        : null,
    ].filter((item): item is NonNullable<typeof item> => item !== null);

    return {
      activeStudents,
      openApplications,
      lowProgressStudents,
      averageProgress,
      recentCourses,
      attentionItems,
    };
  }, [applications, courses, enrollments]);

  const {
    activeStudents,
    openApplications,
    lowProgressStudents,
    averageProgress,
    recentCourses,
    attentionItems,
  } = analytics;

  return (
    <div className="teacher-workspace min-h-full bg-[#f7f8fa] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px] space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-sky-700">
              <Sparkles className="h-4 w-4" />
              Кабинет преподавателя
            </div>
            <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.025em] text-slate-950 sm:text-[32px]">
              Добрый день, {firstName}
            </h1>
            <p className="mt-2 max-w-2xl text-[15px] leading-6 text-slate-500">
              Здесь только главное: текущие курсы, новые заявки и студенты,
              которым нужна ваша помощь.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void reload()}
              disabled={loading || refreshing}
              className="rounded-xl text-slate-500"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              Обновить
            </Button>
            <Button asChild className="rounded-xl bg-[#0f3b57] shadow-sm hover:bg-[#123f5b]">
              <Link href="/dashboard/teacher/courses/create">
                <Plus className="h-4 w-4" />
                Создать курс
              </Link>
            </Button>
          </div>
        </header>

        {error ? (
          <div className="flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <span>{error}</span>
            <button type="button" onClick={() => void reload()} className="font-semibold">
              Повторить
            </button>
          </div>
        ) : null}

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Курсы"
              value={formatCount(courses.length)}
              note={`${courses.filter((item) => item.lifecycle_status === "approved").length} опубликовано`}
              icon={BookOpen}
              href="/dashboard/teacher/courses"
            />
            <MetricCard
              label="Новые заявки"
              value={formatCount(openApplications.length)}
              note="ожидают вашего решения"
              icon={FileText}
              href="/dashboard/teacher/applications"
            />
            <MetricCard
              label="Активные студенты"
              value={formatCount(activeStudents.length)}
              note={`${lowProgressStudents.length} требуют внимания`}
              icon={Users}
              href="/dashboard/teacher/lessons"
            />
            <MetricCard
              label="Средний прогресс"
              value={`${averageProgress}%`}
              note="по активным студентам"
              icon={GraduationCap}
              href="/dashboard/teacher/lessons/progress"
            />
          </div>
        )}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-slate-950">Недавние курсы</h2>
                <p className="mt-1 text-sm text-slate-500">Продолжите с того места, где остановились.</p>
              </div>
              <Link
                href="/dashboard/teacher/courses"
                className="flex shrink-0 items-center gap-1 text-sm font-medium text-sky-700 hover:text-sky-900"
              >
                Все курсы <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-[76px] animate-pulse bg-slate-50/70" />
                ))
              ) : recentCourses.length ? (
                recentCourses.map((course) => {
                  const status = COURSE_STATUS[course.lifecycle_status];
                  const readiness = getCourseReadiness(course);
                  return (
                    <Link
                      key={course.course_id}
                      href={
                        course.lifecycle_status === "draft" ||
                        course.lifecycle_status === "rejected"
                          ? `/dashboard/teacher/courses/${course.course_id}/edit`
                          : "/dashboard/teacher/courses"
                      }
                      className="group grid gap-3 px-5 py-4 transition-colors hover:bg-slate-50 sm:grid-cols-[minmax(0,1fr)_130px_92px] sm:items-center"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900 group-hover:text-sky-800">
                          {course.title}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          Обновлён {dateFormatter.format(new Date(course.updated_at))}
                        </div>
                      </div>
                      <div>
                        <div className="mb-1.5 flex items-center justify-between text-[11px] text-slate-500">
                          <span>Готовность</span><span>{readiness}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-sky-600" style={{ width: `${readiness}%` }} />
                        </div>
                      </div>
                      <span className={cn("w-fit rounded-full px-2.5 py-1 text-[11px] font-medium", status.className)}>
                        {status.label}
                      </span>
                    </Link>
                  );
                })
              ) : (
                <div className="px-5 py-12 text-center">
                  <BookOpen className="mx-auto h-6 w-6 text-slate-300" />
                  <p className="mt-3 text-sm font-medium text-slate-700">Курсов пока нет</p>
                  <p className="mt-1 text-sm text-slate-500">Создайте первый курс — это займёт несколько минут.</p>
                  <Button asChild size="sm" className="mt-4 rounded-xl">
                    <Link href="/dashboard/teacher/courses/create">Создать курс</Link>
                  </Button>
                </div>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-950">На сегодня</h2>
              <p className="mt-1 text-sm text-slate-500">Короткий список приоритетов.</p>
            </div>
            <div className="space-y-2 p-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-20 animate-pulse rounded-xl bg-slate-50" />
                ))
              ) : attentionItems.length ? (
                attentionItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50"
                    >
                      <span className={cn(
                        "mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl",
                        item.tone === "amber" && "bg-amber-50 text-amber-700",
                        item.tone === "rose" && "bg-rose-50 text-rose-700",
                        item.tone === "sky" && "bg-sky-50 text-sky-700",
                      )}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-slate-900">{item.title}</span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">{item.note}</span>
                      </span>
                      <ArrowRight className="mt-2 h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
                    </Link>
                  );
                })
              ) : (
                <div className="px-4 py-10 text-center">
                  <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-500" />
                  <p className="mt-3 text-sm font-semibold text-slate-800">Всё под контролем</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Срочных задач сейчас нет.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="grid gap-3 sm:grid-cols-3">
          {[
            {
              href: "/dashboard/teacher/courses/create",
              label: "Новый курс",
              note: "Создать с нуля",
              icon: Plus,
            },
            {
              href: "/dashboard/teacher/applications",
              label: "Разобрать заявки",
              note: "Открыть очередь",
              icon: FileText,
            },
            {
              href: "/dashboard/teacher/inbox",
              label: "Написать сообщение",
              note: "Связаться со студентом",
              icon: MessageSquare,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition duration-200 hover:border-slate-300 hover:shadow-sm"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-900">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {item.note}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5" />
              </Link>
            );
          })}
        </section>
      </div>
    </div>
  );
}
