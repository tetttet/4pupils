"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  ClipboardCheck,
  Clock3,
  GraduationCap,
  Inbox,
  LayoutGrid,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  TriangleAlert,
  UserRound,
  Users,
} from "lucide-react";

import { AppBreadcrumb } from "@/components/ui/app-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DashboardAuthSkeleton,
  DashboardControlNumbersSkeleton,
  DashboardCourseTablePanelSkeleton,
  DashboardFocusSkeleton,
  DashboardHeroGaugesSkeleton,
  DashboardHistogramPanelSkeleton,
  DashboardOperationalSkeleton,
  DashboardQuickLinksSkeleton,
  DashboardSummaryTilesSkeleton,
  DashboardUpdatedBadgeSkeleton,
} from "@/components/dashboard/home/dashboard-home-skeletons";
import {
  TeacherDashboardWidgetLayout,
  type TeacherDashboardWidgetId,
} from "@/components/dashboard/teacher/teacherDashboardWidgets";
import { useAuth } from "@/context/auth-context";
import { useTeacherDashboardWidgets } from "@/hooks/use-teacher-dashboard-widgets";
import { apiFetch } from "@/lib/api";
import { readApiData } from "@/lib/api-response";
import { getUserFacingErrorMessage } from "@/lib/error-messages";
import { CourseApplicationsAPI } from "@/services/course-application";
import { EnrollmentsAPI } from "@/services/enrollment";
import type { Course } from "@/types/course";
import type {
  CourseApplication,
  CourseApplicationStatus,
} from "@/types/course-application";
import type { Enrollment, EnrollmentStatus } from "@/types/enrollment";
import { cn } from "@/lib/utils";

type TeacherDashboardData = {
  courses: Course[];
  applications: CourseApplication[];
  enrollments: Enrollment[];
};

type QuickLink = {
  href: string;
  title: string;
  description: string;
  note: string;
  icon: React.ElementType;
  metric?: string;
};

type SummaryTileProps = {
  label: string;
  value: string;
  note: string;
  emphasis?: "default" | "dark";
};

type PanelProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

type HorizontalBarChartRow = {
  label: string;
  value: number;
  secondary?: string;
};

type HistogramRow = {
  label: string;
  value: number;
  caption?: string;
};

type FocusItem = {
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: React.ElementType;
};

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const dateTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const COURSE_STATUS_META: Record<
  Course["lifecycle_status"],
  { label: string; note: string }
> = {
  draft: {
    label: "Черновики",
    note: "Материалы еще собираются.",
  },
  submitted: {
    label: "На модерации",
    note: "Нужно дождаться решения.",
  },
  approved: {
    label: "Одобрены",
    note: "Курсы готовы к работе.",
  },
  rejected: {
    label: "На доработке",
    note: "Есть замечания по карточке.",
  },
  archived: {
    label: "Архив",
    note: "Вне активного контура.",
  },
};

const APPLICATION_STATUS_META: Record<
  CourseApplicationStatus,
  { label: string; note: string }
> = {
  pending: {
    label: "Новые",
    note: "Еще не разобраны преподавателем.",
  },
  reviewing: {
    label: "В работе",
    note: "Уже взяты в обработку.",
  },
  approved: {
    label: "Одобрены",
    note: "Студенту открыт следующий шаг.",
  },
  rejected: {
    label: "Отклонены",
    note: "По ним уже принято решение.",
  },
  withdrawn: {
    label: "Отозваны",
    note: "Студент передумал продолжать.",
  },
};

const ENROLLMENT_STATUS_META: Record<
  EnrollmentStatus,
  { label: string; note: string }
> = {
  active: {
    label: "Активные",
    note: "Сейчас учатся и двигаются по урокам.",
  },
  completed: {
    label: "Завершили",
    note: "Дошли до финала курса.",
  },
  dropped: {
    label: "Остановились",
    note: "Выбыли из обучения раньше срока.",
  },
  blocked: {
    label: "Ограничены",
    note: "Доступ временно закрыт.",
  },
  canceled: {
    label: "Отменены",
    note: "Зачисление было закрыто вручную.",
  },
};

function formatCount(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value);
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function formatPercent(value: number) {
  return `${clampPercent(value)}%`;
}

function formatShare(part: number, whole: number) {
  if (!whole) return "0%";
  return `${Math.round((part / whole) * 100)}%`;
}

function formatAverage(value: number, digits = 0) {
  if (!Number.isFinite(value)) return "0";

  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return dateTimeFormatter.format(date);
}

function daysSince(value?: string | null) {
  if (!value) return Number.POSITIVE_INFINITY;

  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return Number.POSITIVE_INFINITY;

  return Math.floor((Date.now() - time) / (1000 * 60 * 60 * 24));
}

function hoursBetween(from?: string | null, to?: string | null) {
  if (!from || !to) return null;

  const fromTime = new Date(from).getTime();
  const toTime = new Date(to).getTime();

  if (Number.isNaN(fromTime) || Number.isNaN(toTime) || toTime < fromTime) {
    return null;
  }

  return (toTime - fromTime) / (1000 * 60 * 60);
}

function formatDurationHours(value?: number | null) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }

  if (value < 24) {
    return `${Math.max(1, Math.round(value))} ч`;
  }

  const days = value / 24;
  return `${formatAverage(days, days < 10 ? 1 : 0)} дн.`;
}

function getProgressNumber(value: number | string) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(100, parsed));
}

function getCourseReadiness(course: Course) {
  const checks = [
    !!course.image_url,
    !!course.short_description?.trim(),
    !!course.description?.trim(),
    !!course.category,
    !!course.level,
    !!course.slug?.trim(),
    (course.tags?.length ?? 0) >= 3,
    (course.requirements?.length ?? 0) >= 1,
    (course.outcomes?.length ?? 0) >= 1,
    !!course.is_free || Number(course.price ?? 0) > 0,
  ];

  const done = checks.filter(Boolean).length;

  return {
    done,
    total: checks.length,
    score: Math.round((done / checks.length) * 100),
  };
}

function buildCourseAction(course: Course, readinessScore: number) {
  if (course.lifecycle_status === "submitted") {
    return "Проверить очередь модерации и держать материалы под рукой.";
  }

  if (course.lifecycle_status === "rejected") {
    return "Вернуться к замечаниям и подготовить курс к повторной отправке.";
  }

  if (readinessScore === 100 && course.lifecycle_status === "draft") {
    return "Карточка собрана, можно отправлять курс на модерацию.";
  }

  if (readinessScore < 60) {
    return "Есть смысл добрать обязательные поля и усилить описание.";
  }

  if (course.lifecycle_status === "approved") {
    return "Поддерживать описание, цену и программу в актуальном состоянии.";
  }

  return "Обновить карточку и проверить, что следующий шаг понятен.";
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function useTeacherDashboardOverview() {
  const [data, setData] = React.useState<TeacherDashboardData>({
    courses: [],
    applications: [],
    enrollments: [],
  });
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(
    async (options: { background?: boolean } = {}) => {
      const background = !!options.background;

      if (background) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      if (!background) {
        setError(null);
      }

      try {
        const [courses, applications, enrollments] = await Promise.all([
          readApiData<Course[]>(
            await apiFetch("/api/courses/my"),
            "Не удалось загрузить курсы преподавателя",
          ),
          CourseApplicationsAPI.listTeaching({
            sort: "updated_at",
            dir: "desc",
          }),
          EnrollmentsAPI.listTeaching({
            sort: "last_activity_at",
            dir: "desc",
          }),
        ]);

        setData({
          courses,
          applications,
          enrollments,
        });
      } catch (loadError) {
        setError(
          getUserFacingErrorMessage(
            loadError,
            "Не удалось собрать сводку преподавателя",
          ),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  React.useEffect(() => {
    void load();
  }, [load]);

  return {
    ...data,
    loading,
    refreshing,
    error,
    reload: () => load({ background: true }),
  };
}

function Panel({ title, subtitle, actions, children }: PanelProps) {
  return (
    <section className="border border-zinc-300 bg-white">
      <div className="flex flex-col gap-3 border-b border-zinc-300 px-4 py-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-sm font-semibold text-zinc-950">{title}</div>
          {subtitle ? (
            <div className="mt-1 text-sm leading-6 text-zinc-600">
              {subtitle}
            </div>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>

      {children}
    </section>
  );
}

function QuickLinkCard({
  href,
  title,
  description,
  note,
  icon: Icon,
  metric,
}: QuickLink) {
  return (
    <Link
      href={href}
      className="group border border-zinc-300 bg-white p-4 transition-colors hover:bg-zinc-50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-3">
          <div className="inline-flex h-10 w-10 items-center justify-center border border-zinc-300 bg-zinc-50 text-zinc-900">
            <Icon className="h-4.5 w-4.5" />
          </div>

          <div>
            <div className="text-sm font-semibold text-zinc-950">{title}</div>
            <div className="mt-1 text-sm leading-6 text-zinc-600">
              {description}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {metric ? (
            <div className="rounded-full border border-zinc-300 bg-zinc-50 px-3 py-1 text-[11px] font-semibold text-zinc-700">
              {metric}
            </div>
          ) : null}
          <ArrowUpRight className="h-4 w-4 text-zinc-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
      </div>

      <div className="mt-4 border-t border-zinc-200 pt-3 text-xs uppercase tracking-[0.16em] text-zinc-500">
        {note}
      </div>
    </Link>
  );
}

function SummaryTile({
  label,
  value,
  note,
  emphasis = "default",
}: SummaryTileProps) {
  return (
    <div
      className={cn(
        "border p-4",
        emphasis === "dark"
          ? "border-zinc-900 bg-zinc-900 text-white"
          : "border-zinc-300 bg-white text-zinc-900",
      )}
    >
      <div
        className={cn(
          "text-[11px] uppercase tracking-[0.16em]",
          emphasis === "dark" ? "text-white/60" : "text-zinc-500",
        )}
      >
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
      <div
        className={cn(
          "mt-2 text-sm leading-6",
          emphasis === "dark" ? "text-white/72" : "text-zinc-600",
        )}
      >
        {note}
      </div>
    </div>
  );
}

function GaugeRing({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  const normalized = clampPercent(value);

  return (
    <div className="border border-white/12 bg-white/6 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div
          className="relative shrink-0 rounded-full"
          style={{
            width: 80,
            height: 80,
            background: `conic-gradient(rgb(255 255 255) ${normalized}%, rgba(255,255,255,0.12) 0)`,
          }}
        >
          <div
            className="absolute rounded-full bg-[#161616]"
            style={{ inset: 7 }}
          />
          <div className="absolute inset-0 grid place-items-center text-sm font-semibold text-white">
            {normalized}%
          </div>
        </div>

        <div className="min-w-0">
          <div className="text-xs uppercase tracking-[0.16em] text-white/55">
            {label}
          </div>
          <div className="mt-2 text-sm font-semibold text-white">
            {description}
          </div>
        </div>
      </div>
    </div>
  );
}

function HorizontalBarChart({
  rows,
  emptyLabel = "Нет данных",
  valueFormatter = formatCount,
}: {
  rows: HorizontalBarChartRow[];
  emptyLabel?: string;
  valueFormatter?: (value: number) => string;
}) {
  const maxValue = rows.reduce((max, row) => Math.max(max, row.value), 0);

  if (rows.length === 0) {
    return <div className="p-4 text-sm text-zinc-500">{emptyLabel}</div>;
  }

  return (
    <div className="space-y-3 p-4">
      {rows.map((row) => {
        const width =
          maxValue > 0 ? Math.max((row.value / maxValue) * 100, 2) : 0;

        return (
          <div key={row.label} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-zinc-950">
                  {row.label}
                </div>
                {row.secondary ? (
                  <div className="mt-0.5 text-xs text-zinc-500">
                    {row.secondary}
                  </div>
                ) : null}
              </div>
              <div className="shrink-0 text-sm font-semibold text-zinc-900">
                {valueFormatter(row.value)}
              </div>
            </div>

            <div className="h-3 border border-zinc-300 bg-zinc-100">
              <div
                className="h-full bg-zinc-900 transition-all"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HistogramChart({
  rows,
  emptyLabel = "Нет данных",
}: {
  rows: HistogramRow[];
  emptyLabel?: string;
}) {
  const maxValue = rows.reduce((max, row) => Math.max(max, row.value), 0);

  if (rows.length === 0) {
    return <div className="p-4 text-sm text-zinc-500">{emptyLabel}</div>;
  }

  return (
    <div className="p-4">
      <div
        className="grid h-72 gap-3"
        style={{
          gridTemplateColumns: `repeat(${rows.length}, minmax(0, 1fr))`,
        }}
      >
        {rows.map((row) => {
          const height =
            maxValue > 0 ? Math.max((row.value / maxValue) * 100, 4) : 4;

          return (
            <div
              key={row.label}
              className="flex min-w-0 flex-col justify-end gap-2"
            >
              <div className="flex-1 border border-zinc-300 bg-zinc-100 p-2">
                <div className="flex h-full flex-col justify-end">
                  <div
                    className="w-full bg-zinc-900 transition-all"
                    style={{ height: `${height}%` }}
                  />
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm font-semibold text-zinc-950">
                  {formatCount(row.value)}
                </div>
                <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                  {row.label}
                </div>
                {row.caption ? (
                  <div className="mt-1 text-[11px] leading-4 text-zinc-500">
                    {row.caption}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CompactTable({
  headers,
  rows,
  emptyLabel = "Нет данных",
}: {
  headers: string[];
  rows: React.ReactNode[][];
  emptyLabel?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 text-[10px] uppercase tracking-[0.12em] text-zinc-400">
            {headers.map((header) => (
              <th key={header} className="px-2.5 py-1.5 text-left font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                className="px-2.5 py-4 text-xs text-zinc-400"
                colSpan={headers.length}
              >
                {emptyLabel}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-zinc-100 align-top last:border-b-0"
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={`px-2.5 py-1 ${cellIndex === 0 ? "text-zinc-800" : "text-zinc-500"}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function FocusList({ items }: { items: FocusItem[] }) {
  return (
    <div className="divide-y divide-zinc-200">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div key={item.title} className="flex gap-4 px-4 py-4">
            <div className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center border border-zinc-300 bg-zinc-50 text-zinc-900">
              <Icon className="h-4.5 w-4.5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-zinc-950">
                {item.title}
              </div>
              <p className="mt-1 text-sm leading-6 text-zinc-600">
                {item.description}
              </p>
              <div className="mt-3">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-none border-zinc-300"
                >
                  <Link href={item.href}>
                    {item.cta}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TeacherDashboardHome({ firstName }: { firstName: string }) {
  const {
    courses,
    applications,
    enrollments,
    loading,
    refreshing,
    error,
    reload,
  } = useTeacherDashboardOverview();

  const analytics = React.useMemo(() => {
    const readinessMap = new Map(
      courses.map((course) => [course.course_id, getCourseReadiness(course)]),
    );

    const courseSummaries = courses
      .map((course) => {
        const courseApplications = applications.filter(
          (application) => application.course_id === course.course_id,
        );
        const courseEnrollments = enrollments.filter(
          (enrollment) => enrollment.course_id === course.course_id,
        );
        const activeStudents = courseEnrollments.filter(
          (enrollment) => enrollment.status === "active",
        ).length;
        const completedStudents = courseEnrollments.filter(
          (enrollment) => enrollment.status === "completed",
        ).length;
        const openApplications = courseApplications.filter((application) =>
          ["pending", "reviewing"].includes(application.status),
        ).length;
        const avgProgress = average(
          courseEnrollments.map((enrollment) =>
            getProgressNumber(enrollment.progress_percent),
          ),
        );
        const readiness =
          readinessMap.get(course.course_id) ?? getCourseReadiness(course);

        return {
          course,
          applicationsCount: courseApplications.length,
          openApplications,
          activeStudents,
          completedStudents,
          studentsCount: courseEnrollments.length,
          averageProgress: avgProgress,
          readiness,
          action: buildCourseAction(course, readiness.score),
        };
      })
      .sort((a, b) => {
        const scoreA =
          a.activeStudents * 4 +
          a.openApplications * 3 +
          a.applicationsCount * 2 +
          a.readiness.score / 10;
        const scoreB =
          b.activeStudents * 4 +
          b.openApplications * 3 +
          b.applicationsCount * 2 +
          b.readiness.score / 10;

        return scoreB - scoreA;
      });

    const reviewedApplications = applications.filter((application) =>
      ["approved", "rejected"].includes(application.status),
    );
    const approvedApplications = applications.filter(
      (application) => application.status === "approved",
    );
    const openApplications = applications.filter((application) =>
      ["pending", "reviewing"].includes(application.status),
    );
    const agingApplications = openApplications.filter(
      (application) => daysSince(application.updated_at) > 2,
    ).length;

    const activeEnrollments = enrollments.filter(
      (enrollment) => enrollment.status === "active",
    );
    const completedEnrollments = enrollments.filter(
      (enrollment) => enrollment.status === "completed",
    );
    const staleStudents = activeEnrollments.filter(
      (enrollment) =>
        daysSince(
          enrollment.last_activity_at ??
            enrollment.updated_at ??
            enrollment.enrolled_at,
        ) > 7,
    ).length;
    const lowMomentumStudents = activeEnrollments.filter((enrollment) => {
      const progress = getProgressNumber(enrollment.progress_percent);
      const age = daysSince(
        enrollment.last_activity_at ??
          enrollment.updated_at ??
          enrollment.enrolled_at,
      );

      return progress < 35 && age > 4;
    }).length;

    const readinessScores = courses.map(
      (course) => readinessMap.get(course.course_id)?.score ?? 0,
    );
    const averageReadiness = average(readinessScores);
    const readyToSubmit = courses.filter((course) => {
      const readiness =
        readinessMap.get(course.course_id) ?? getCourseReadiness(course);

      return (
        readiness.score === 100 &&
        (course.lifecycle_status === "draft" ||
          course.lifecycle_status === "rejected")
      );
    }).length;
    const lowReadinessCourses = courses.filter((course) => {
      const readiness =
        readinessMap.get(course.course_id) ?? getCourseReadiness(course);
      return readiness.score < 60;
    }).length;

    const uniqueStudents = new Set(
      enrollments.map((enrollment) => enrollment.user_id),
    ).size;
    const averageProgress = average(
      enrollments.map((enrollment) =>
        getProgressNumber(enrollment.progress_percent),
      ),
    );
    const averageReviewTime = average(
      reviewedApplications
        .map((application) =>
          hoursBetween(application.created_at, application.reviewed_at),
        )
        .filter((value): value is number => value !== null),
    );
    const completionRate = enrollments.length
      ? (completedEnrollments.length / enrollments.length) * 100
      : 0;
    const approvalRate = applications.length
      ? (approvedApplications.length / applications.length) * 100
      : 0;

    const focusItems: FocusItem[] = [];

    if (readyToSubmit > 0) {
      focusItems.push({
        title: `${formatCount(readyToSubmit)} курсов готовы к следующему шагу`,
        description:
          "Карточки уже собраны. Осталось быстро пройти чек-лист и отправить их дальше без лишней паузы.",
        href: "/dashboard/teacher/courses/readiness",
        cta: "Открыть чек-лист",
        icon: ShieldCheck,
      });
    }

    if (agingApplications > 0) {
      focusItems.push({
        title: `${formatCount(agingApplications)} заявок ждут решения дольше двух дней`,
        description:
          "Очередь начинает стареть. Лучше быстро разобрать приоритетные обращения и не копить хвост.",
        href: "/dashboard/teacher/applications/pipeline",
        cta: "Разобрать очередь",
        icon: Clock3,
      });
    }

    if (staleStudents > 0) {
      focusItems.push({
        title: `${formatCount(staleStudents)} учеников выпали из темпа`,
        description:
          "Есть группа, у которой давно не было активности. Это хороший момент для точечного касания.",
        href: "/dashboard/teacher/lessons/progress",
        cta: "Посмотреть прогресс",
        icon: TrendingUp,
      });
    }

    if (lowReadinessCourses > 0) {
      focusItems.push({
        title: `${formatCount(lowReadinessCourses)} курсов выглядят сыровато`,
        description:
          "В карточках не хватает базовых блоков. Их стоит подтянуть, чтобы каталог выглядел ровно и убедительно.",
        href: "/dashboard/teacher/courses/readiness",
        cta: "Доработать карточки",
        icon: TriangleAlert,
      });
    }

    if (focusItems.length === 0) {
      focusItems.push({
        title: "Контур выглядит стабильно",
        description:
          "Критичных хвостов сейчас не видно. Можно идти в развитие: усиливать курсы, коммуникацию и темп обучения.",
        href: "/dashboard/teacher/courses",
        cta: "Открыть рабочую зону",
        icon: Sparkles,
      });
    }

    const courseStatusRows = (
      ["draft", "submitted", "approved", "rejected", "archived"] as const
    ).map((status) => {
      const value = courses.filter(
        (course) => course.lifecycle_status === status,
      ).length;

      return {
        label: COURSE_STATUS_META[status].label,
        value,
        secondary: COURSE_STATUS_META[status].note,
      };
    });

    const applicationStatusRows = (
      ["pending", "reviewing", "approved", "rejected", "withdrawn"] as const
    ).map((status) => {
      const value = applications.filter(
        (application) => application.status === status,
      ).length;

      return {
        label: APPLICATION_STATUS_META[status].label,
        value,
        secondary: APPLICATION_STATUS_META[status].note,
      };
    });

    const enrollmentStatusRows = (
      ["active", "completed", "dropped", "blocked", "canceled"] as const
    ).map((status) => {
      const value = enrollments.filter(
        (enrollment) => enrollment.status === status,
      ).length;

      return {
        label: ENROLLMENT_STATUS_META[status].label,
        value,
        secondary: ENROLLMENT_STATUS_META[status].note,
      };
    });

    const readinessHistogramRows: HistogramRow[] = [
      {
        label: "0-39",
        value: readinessScores.filter((score) => score < 40).length,
        caption: "Нужна базовая сборка",
      },
      {
        label: "40-59",
        value: readinessScores.filter((score) => score >= 40 && score < 60)
          .length,
        caption: "Каркас есть, но слабый",
      },
      {
        label: "60-79",
        value: readinessScores.filter((score) => score >= 60 && score < 80)
          .length,
        caption: "Можно быстро усилить",
      },
      {
        label: "80-99",
        value: readinessScores.filter((score) => score >= 80 && score < 100)
          .length,
        caption: "Почти готово",
      },
      {
        label: "100",
        value: readinessScores.filter((score) => score === 100).length,
        caption: "Готово к шагу дальше",
      },
    ];

    const topCourseRows = courseSummaries.slice(0, 6);

    const lastUpdatedAt = [
      ...courses.map((course) => course.updated_at),
      ...applications.map((application) => application.updated_at),
      ...enrollments.map(
        (enrollment) =>
          enrollment.last_activity_at ??
          enrollment.updated_at ??
          enrollment.enrolled_at,
      ),
    ]
      .filter(Boolean)
      .sort()
      .at(-1);

    return {
      totalCourses: courses.length,
      uniqueStudents,
      totalApplications: applications.length,
      totalEnrollments: enrollments.length,
      openApplications: openApplications.length,
      activeStudents: activeEnrollments.length,
      completedStudents: completedEnrollments.length,
      averageReadiness,
      averageProgress,
      averageReviewTime,
      completionRate,
      approvalRate,
      readyToSubmit,
      agingApplications,
      staleStudents,
      lowMomentumStudents,
      courseStatusRows,
      applicationStatusRows,
      enrollmentStatusRows,
      readinessHistogramRows,
      topCourseRows,
      focusItems,
      lastUpdatedAt,
    };
  }, [applications, courses, enrollments]);

  const quickLinks: QuickLink[] = React.useMemo(
    () => [
      {
        href: "/dashboard/teacher/courses",
        title: "Курсы",
        description:
          "Каталог, статусы, готовность карточек и вся операционная работа по курсам.",
        note: "рабочая зона каталога",
        icon: BookOpen,
        metric: `${formatCount(analytics.totalCourses)} всего`,
      },
      {
        href: "/dashboard/teacher/applications",
        title: "Заявки",
        description:
          "Очередь обращений, pipeline решений и аналитика по спросу на ваши программы.",
        note: "входящие и конверсия",
        icon: ClipboardCheck,
        metric: `${formatCount(analytics.openApplications)} открыто`,
      },
      {
        href: "/dashboard/teacher/lessons",
        title: "Уроки",
        description:
          "Прогресс учеников, активность групп и точки, где нужно вернуть темп.",
        note: "уроки и студенты",
        icon: GraduationCap,
        metric: `${formatCount(analytics.activeStudents)} активных`,
      },
    ],
    [
      analytics.activeStudents,
      analytics.openApplications,
      analytics.totalCourses,
    ],
  );

  const heroDateLabel = dateFormatter.format(new Date());
  const lastUpdatedLabel = formatDateTime(analytics.lastUpdatedAt);
  const { visibleWidgets } = useTeacherDashboardWidgets();

  const renderDashboardWidget = React.useCallback(
    (widgetId: TeacherDashboardWidgetId) => {
      switch (widgetId) {
        case "quick-links":
          return loading ? (
            <DashboardQuickLinksSkeleton />
          ) : (
            <div className="grid gap-px border border-zinc-300 bg-zinc-300 xl:grid-cols-3">
              {quickLinks.map((item) => (
                <QuickLinkCard key={item.href} {...item} />
              ))}
            </div>
          );

        case "summary-tiles":
          return loading ? (
            <DashboardSummaryTilesSkeleton darkFirst />
          ) : (
            <div className="grid gap-px border border-zinc-300 bg-zinc-300 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryTile
                label="Курсов"
                value={formatCount(analytics.totalCourses)}
                note={`${formatCount(analytics.readyToSubmit)} готовы к отправке дальше.`}
                emphasis="dark"
              />
              <SummaryTile
                label="Студентов"
                value={formatCount(analytics.uniqueStudents)}
                note={`${formatCount(analytics.activeStudents)} сейчас в активном обучении.`}
              />
              <SummaryTile
                label="Открытых заявок"
                value={formatCount(analytics.openApplications)}
                note={`${formatCount(analytics.agingApplications)} уже начинают стареть.`}
              />
              <SummaryTile
                label="Средний прогресс"
                value={formatPercent(analytics.averageProgress)}
                note={`${formatCount(analytics.lowMomentumStudents)} учеников идут слишком медленно.`}
              />
            </div>
          );

        case "operational-slice":
          return loading ? (
            <DashboardOperationalSkeleton />
          ) : (
            <Panel
              title="Операционный срез"
              subtitle="Быстрый взгляд на три главных потока: карточки курсов, очередь заявок и обучение студентов."
              actions={
                <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                  live dashboard
                </div>
              }
            >
              <div className="grid gap-px border-t border-zinc-300 bg-zinc-300 xl:grid-cols-3">
                <div className="bg-white">
                  <div className="border-b border-zinc-300 bg-zinc-100 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
                    Курсы
                  </div>
                  <HorizontalBarChart
                    rows={analytics.courseStatusRows}
                    emptyLabel="Статусы появятся после создания курсов."
                  />
                </div>

                <div className="bg-white">
                  <div className="border-b border-zinc-300 bg-zinc-100 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
                    Заявки
                  </div>
                  <HorizontalBarChart
                    rows={analytics.applicationStatusRows}
                    emptyLabel="Как только придут обращения, здесь появится очередь."
                  />
                </div>

                <div className="bg-white">
                  <div className="border-b border-zinc-300 bg-zinc-100 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
                    Уроки
                  </div>
                  <HorizontalBarChart
                    rows={analytics.enrollmentStatusRows}
                    emptyLabel="После enrollments здесь будет видна структура учеников."
                  />
                </div>
              </div>
            </Panel>
          );

        case "today-focus":
          return loading ? (
            <DashboardFocusSkeleton />
          ) : (
            <Panel
              title="Фокус на сегодня"
              subtitle="Конкретные точки, которые лучше не откладывать. Всё ведет сразу в нужный раздел."
            >
              <FocusList items={analytics.focusItems} />
            </Panel>
          );

        case "readiness-histogram":
          return loading ? (
            <DashboardHistogramPanelSkeleton />
          ) : (
            <Panel
              title="Гистограмма готовности курсов"
              subtitle="Показывает, насколько ровно собран каталог и где карточки еще проседают по базовым полям."
              actions={
                <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                  avg: {formatPercent(analytics.averageReadiness)}
                </div>
              }
            >
              <HistogramChart
                rows={analytics.readinessHistogramRows}
                emptyLabel="Когда появятся курсы, здесь построится распределение по готовности."
              />
            </Panel>
          );

        case "course-demand":
          return loading ? (
            <DashboardCourseTablePanelSkeleton />
          ) : (
            <Panel
              title="Курсы по нагрузке и спросу"
              subtitle="Верхняя часть рабочего пула: где уже есть движение, заявки и ученики."
              actions={
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-none border-zinc-300"
                >
                  <Link href="/dashboard/teacher/courses">
                    Вся рабочая зона
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              }
            >
              <CompactTable
                headers={[
                  "Курс",
                  "Ученики",
                  "Заявки",
                  "Готовность",
                  "Следующий шаг",
                ]}
                rows={analytics.topCourseRows.map((item) => [
                  <div
                    key={`${item.course.course_id}-course`}
                    className="space-y-1"
                  >
                    <div className="font-semibold text-zinc-950">
                      {item.course.title}
                    </div>
                    <div className="font-mono text-xs text-zinc-500">
                      {item.course.slug}
                    </div>
                  </div>,
                  <div
                    key={`${item.course.course_id}-students`}
                    className="space-y-1"
                  >
                    <div className="font-medium text-zinc-950">
                      {formatCount(item.studentsCount)}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {formatCount(item.activeStudents)} активных /{" "}
                      {formatCount(item.completedStudents)} завершили
                    </div>
                  </div>,
                  <div
                    key={`${item.course.course_id}-applications`}
                    className="space-y-1"
                  >
                    <div className="font-medium text-zinc-950">
                      {formatCount(item.applicationsCount)}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {formatCount(item.openApplications)} ждут решения
                    </div>
                  </div>,
                  <div
                    key={`${item.course.course_id}-readiness`}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs uppercase tracking-[0.14em] text-zinc-500">
                      <span>{item.readiness.score}%</span>
                      <span>{formatPercent(item.averageProgress)}</span>
                    </div>
                    <div className="h-2 bg-zinc-200">
                      <div
                        className="h-full bg-zinc-900"
                        style={{ width: `${item.readiness.score}%` }}
                      />
                    </div>
                    <div className="text-xs text-zinc-500">
                      Прогресс группы: {formatPercent(item.averageProgress)}
                    </div>
                  </div>,
                  <div
                    key={`${item.course.course_id}-action`}
                    className="max-w-md leading-6"
                  >
                    {item.action}
                  </div>,
                ])}
                emptyLabel="Когда появятся курсы, здесь соберется верхняя часть по нагрузке."
              />
            </Panel>
          );

        case "control-numbers":
          return loading ? (
            <DashboardControlNumbersSkeleton />
          ) : (
            <Panel
              title="Контрольные цифры"
              subtitle="Короткий свод по времени реакции, конверсии и прогрессу без перехода в глубину."
            >
              <div className="grid gap-px border-t border-zinc-300 bg-zinc-300 md:grid-cols-2 xl:grid-cols-4">
                <SummaryTile
                  label="Всего заявок"
                  value={formatCount(analytics.totalApplications)}
                  note={`Approval rate: ${formatPercent(analytics.approvalRate)}.`}
                />
                <SummaryTile
                  label="Средний разбор"
                  value={formatDurationHours(analytics.averageReviewTime)}
                  note="Считается по заявкам, где уже было принято решение."
                />
                <SummaryTile
                  label="Всего enrollments"
                  value={formatCount(analytics.totalEnrollments)}
                  note={`Completion rate: ${formatShare(
                    analytics.completedStudents,
                    analytics.totalEnrollments,
                  )}.`}
                />
                <SummaryTile
                  label="Просевший темп"
                  value={formatCount(analytics.staleStudents)}
                  note="Ученики без активности больше недели."
                />
              </div>
            </Panel>
          );
      }
    },
    [analytics, loading, quickLinks],
  );

  return (
    <>
      <AppBreadcrumb items={[{ label: "Главная" }]} />

      <div className="space-y-6 bg-[#f6f6f6] p-6 text-zinc-900">
        <section className="overflow-hidden border border-zinc-300 bg-zinc-950 text-white">
          <div className="grid gap-px bg-white/10 xl:grid-cols-[minmax(0,1.3fr)_420px]">
            <div className="relative overflow-hidden p-6 sm:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_45%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_55%)]" />

              <div className="relative flex h-full flex-col justify-between gap-8">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="rounded-full bg-white text-zinc-950 hover:bg-white">
                      Teacher Dashboard
                    </Badge>
                    <Badge
                      variant="outline"
                      className="rounded-full border-white/20 bg-white/10 text-white"
                    >
                      {heroDateLabel}
                    </Badge>
                    {loading ? (
                      <DashboardUpdatedBadgeSkeleton />
                    ) : (
                      <Badge
                        variant="outline"
                        className="rounded-full border-white/20 bg-white/10 text-white"
                      >
                        Обновлено: {lastUpdatedLabel}
                      </Badge>
                    )}
                  </div>

                  <div>
                    <div className="text-[11px] uppercase tracking-[0.22em] text-white/55">
                      Командный центр преподавателя
                    </div>
                    <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                      {firstName}, здесь весь рабочий контур по курсам, заявкам
                      и урокам в одном месте.
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72 sm:text-[15px]">
                      Домашний экран собирает живую картину по вашим курсам:
                      сколько карточек готовы, где скапливаются заявки, как
                      чувствуют себя ученики и где сегодня есть смысл вмешаться
                      в первую очередь.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="rounded-none bg-white text-zinc-950 hover:bg-zinc-100"
                  >
                    <Link href="/dashboard/teacher/courses">
                      Открыть курсы
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="rounded-none border-white/20 bg-white/10 text-white hover:bg-white/16 hover:text-white"
                  >
                    <Link href="/dashboard/teacher/applications">
                      Перейти к заявкам
                    </Link>
                  </Button>

                  <Button
                    type="button"
                    size="lg"
                    variant="ghost"
                    onClick={() => void reload()}
                    disabled={loading || refreshing}
                    className="rounded-none border border-white/12 bg-white/6 text-white hover:bg-white/12 hover:text-white"
                  >
                    <RefreshCw
                      className={cn(
                        "h-4 w-4",
                        (loading || refreshing) && "animate-spin",
                      )}
                    />
                    Обновить сводку
                  </Button>
                </div>
              </div>
            </div>

            {loading ? (
              <DashboardHeroGaugesSkeleton />
            ) : (
              <div className="grid gap-px bg-white/10">
                <GaugeRing
                  label="Готовность каталога"
                  value={analytics.averageReadiness}
                  description="Средний уровень готовности карточек курса."
                />
                <GaugeRing
                  label="Одобрение заявок"
                  value={analytics.approvalRate}
                  description="Какой процент обращений заканчивается approve."
                />
                <GaugeRing
                  label="Завершение обучения"
                  value={analytics.completionRate}
                  description="Сколько enrollments доходят до финала курса."
                />
              </div>
            )}
          </div>
        </section>

        {error ? (
          <Panel
            title="Не удалось собрать полную картину"
            subtitle={error}
            actions={
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void reload()}
                className="rounded-none border-zinc-300"
              >
                Повторить
              </Button>
            }
          >
            <div className="px-4 py-6 text-sm leading-6 text-zinc-600">
              Часть источников сейчас не ответила. Домашний экран уже готов к
              повторной загрузке, чтобы подтянуть свежие данные.
            </div>
          </Panel>
        ) : null}

        <TeacherDashboardWidgetLayout
          widgets={visibleWidgets}
          renderWidget={renderDashboardWidget}
        />
      </div>
    </>
  );
}

function RoleLanding({
  badge,
  title,
  description,
  primaryAction,
  secondaryAction,
  quickLinks,
  highlights,
}: {
  badge: string;
  title: string;
  description: string;
  primaryAction: {
    href: string;
    label: string;
  };
  secondaryAction: {
    href: string;
    label: string;
  };
  quickLinks: QuickLink[];
  highlights: Array<{ label: string; value: string; note: string }>;
}) {
  return (
    <>
      <AppBreadcrumb items={[{ label: "Главная" }]} />

      <div className="space-y-6 bg-[#f6f6f6] p-6 text-zinc-900">
        <section className="overflow-hidden border border-zinc-300 bg-zinc-950 text-white">
          <div className="grid gap-px bg-white/10 xl:grid-cols-[minmax(0,1.25fr)_360px]">
            <div className="relative overflow-hidden p-6 sm:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_45%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_60%)]" />

              <div className="relative">
                <Badge className="rounded-full bg-white text-zinc-950 hover:bg-white">
                  {badge}
                </Badge>
                <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                  {title}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72 sm:text-[15px]">
                  {description}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="rounded-none bg-white text-zinc-950 hover:bg-zinc-100"
                  >
                    <Link href={primaryAction.href}>
                      {primaryAction.label}
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="rounded-none border-white/20 bg-white/10 text-white hover:bg-white/16 hover:text-white"
                  >
                    <Link href={secondaryAction.href}>
                      {secondaryAction.label}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-px bg-white/10">
              {highlights.map((item) => (
                <div
                  key={item.label}
                  className="border border-transparent bg-white/6 p-4 backdrop-blur-sm"
                >
                  <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">
                    {item.label}
                  </div>
                  <div className="mt-3 text-3xl font-semibold tracking-tight">
                    {item.value}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-white/72">
                    {item.note}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid gap-px border border-zinc-300 bg-zinc-300 xl:grid-cols-3">
          {quickLinks.map((item) => (
            <QuickLinkCard key={item.href} {...item} />
          ))}
        </div>
      </div>
    </>
  );
}

export function DashboardHomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <DashboardAuthSkeleton />;
  }

  if (user?.role === "teacher") {
    return (
      <TeacherDashboardHome firstName={user.first_name || "Преподаватель"} />
    );
  }

  if (user?.role === "admin") {
    return (
      <RoleLanding
        badge="Admin Dashboard"
        title="Панель управления платформой"
        description="Здесь быстрый вход в управление пользователями, курсами и почтой. Основная логика уже разложена по разделам, а домашний экран оставляет только самые нужные переходы."
        primaryAction={{
          href: "/dashboard/admin/users/students",
          label: "Открыть пользователей",
        }}
        secondaryAction={{
          href: "/dashboard/admin/courses",
          label: "Перейти к курсам",
        }}
        highlights={[
          {
            label: "Роль",
            value: "Admin",
            note: "Доступ к модерации, почте и пользовательскому контуру.",
          },
          {
            label: "Рабочий поток",
            value: "3 зоны",
            note: "Пользователи, курсы и сообщения уже разнесены по отдельным разделам.",
          },
          {
            label: "Навигация",
            value: "Готова",
            note: "Sidebar и домашний экран теперь выглядят чище и собраннее.",
          },
        ]}
        quickLinks={[
          {
            href: "/dashboard/admin/users/students",
            title: "Пользователи",
            description:
              "Управление студентами, преподавателями и администраторами.",
            note: "люди и роли",
            icon: Users,
          },
          {
            href: "/dashboard/admin/courses",
            title: "Курсы",
            description:
              "Каталог, модерация и контроль публикуемых материалов.",
            note: "контент платформы",
            icon: BookOpen,
          },
          {
            href: "/dashboard/admin/inbox",
            title: "Почта",
            description:
              "Входящие, отправка, черновики и избранное в одном месте.",
            note: "коммуникация",
            icon: Inbox,
          },
        ]}
      />
    );
  }

  return (
    <RoleLanding
      badge="Student Workspace"
      title="Личное пространство студента"
      description="Для студента основная жизнь уже находится в платформе. Домашний экран оставляет только удобный вход в учебное пространство, профиль и настройки."
      primaryAction={{
        href: "/platform",
        label: "Открыть платформу",
      }}
      secondaryAction={{
        href: "/platform/profile",
        label: "Перейти в профиль",
      }}
      highlights={[
        {
          label: "Роль",
          value: "Student",
          note: "Учебное пространство, сообщения, профиль и личные настройки.",
        },
        {
          label: "Основной маршрут",
          value: "Platform",
          note: "Вся учебная активность вынесена в отдельный student workspace.",
        },
        {
          label: "Аккаунт",
          value: user?.first_name || "Готов",
          note: "Профиль и персональные настройки доступны в пару кликов.",
        },
      ]}
      quickLinks={[
        {
          href: "/platform",
          title: "Платформа",
          description:
            "Курсы, сообщения и весь учебный поток без лишнего шума.",
          note: "главное рабочее место",
          icon: LayoutGrid,
        },
        {
          href: "/platform/profile",
          title: "Профиль",
          description:
            "Имя, контакты и личные данные, которые видны внутри платформы.",
          note: "аккаунт",
          icon: UserRound,
        },
        {
          href: "/platform/settings",
          title: "Настройки",
          description: "Подстройка интерфейса и поведение платформы под себя.",
          note: "персонализация",
          icon: Settings,
        },
      ]}
    />
  );
}
