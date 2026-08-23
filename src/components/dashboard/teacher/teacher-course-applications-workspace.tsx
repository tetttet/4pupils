"use client";

import * as React from "react";
import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  Clipboard,
  LayoutGrid,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { TeacherSectionTabs } from "@/components/dashboard/teacher/teacher-section-tabs";
import { getUserFacingErrorMessage } from "@/lib/error-messages";
import { useTeacherCourseApplications } from "@/hooks/use-teacher-course-applications";
import type {
  CourseApplication,
  CourseApplicationStatus,
} from "@/types/course-application";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ApplicationDrawerView from "@/components/dashboard/teacher/course-applications/application-drawer-view";
import ApplicationsTable from "@/components/dashboard/teacher/course-applications/applications-table";
import {
  ACTION_META,
  APPLICATION_STATUS_META,
  APPLICATION_STATUS_ORDER,
  COURSE_STATUS_META,
  ENROLLMENT_STATUS_LABELS,
} from "@/components/dashboard/teacher/course-applications/constants";
import CourseDrawerView from "@/components/dashboard/teacher/course-applications/course-drawer-view";
import CourseOverviewTable from "@/components/dashboard/teacher/course-applications/course-overview-table";
import {
  ApplicationStatusBadge,
  CourseMetaBadge,
  StatCard,
} from "@/components/dashboard/teacher/course-applications/shared";
import type {
  ApplicationRow,
  ApplicationWorkflowAction,
  CourseRow,
  DrawerMode,
  StatusFilter,
} from "@/components/dashboard/teacher/course-applications/types";
import {
  formatCount,
  formatDateTime,
  getApplicantName,
  getAvailableApplicationActions,
  getSuccessMessage,
  matchesApplicationQuery,
  matchesCourseQuery,
  normalizeText,
} from "@/components/dashboard/teacher/course-applications/utils";

type TeacherCourseApplicationsWorkspaceMode =
  | "workspace"
  | "pipeline"
  | "analytics";

type HorizontalBarChartRow = {
  label: string;
  value: number;
  secondary?: string;
};

const integerFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 0,
});
const decimalFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 1,
});

type HistogramRow = {
  label: string;
  value: number;
  caption?: string;
};

type EnrollmentBucket = NonNullable<CourseApplication["enrollment_status"]> | "none";

const APPLICATION_STATUS_SEQUENCE: CourseApplicationStatus[] = [
  "pending",
  "reviewing",
  "approved",
  "rejected",
  "withdrawn",
];

const WEEKDAY_ORDER = [
  { day: 1, label: "Пн" },
  { day: 2, label: "Вт" },
  { day: 3, label: "Ср" },
  { day: 4, label: "Чт" },
  { day: 5, label: "Пт" },
  { day: 6, label: "Сб" },
  { day: 0, label: "Вс" },
];

const ENROLLMENT_SEQUENCE: EnrollmentBucket[] = [
  "active",
  "completed",
  "dropped",
  "blocked",
  "canceled",
  "none",
];

const ENROLLMENT_META: Record<
  EnrollmentBucket,
  { label: string; description: string }
> = {
  active: {
    label: ENROLLMENT_STATUS_LABELS.active,
    description: "Доступ уже открыт и обучение идет.",
  },
  completed: {
    label: ENROLLMENT_STATUS_LABELS.completed,
    description: "Студент завершил обучение.",
  },
  dropped: {
    label: ENROLLMENT_STATUS_LABELS.dropped,
    description: "Обучение было остановлено.",
  },
  blocked: {
    label: ENROLLMENT_STATUS_LABELS.blocked,
    description: "Доступ ограничен вручную.",
  },
  canceled: {
    label: ENROLLMENT_STATUS_LABELS.canceled,
    description: "Доступ был отменен.",
  },
  none: {
    label: "Без зачисления",
    description: "По заявке еще не появился enrollment.",
  },
};

const MODE_META: Record<
  TeacherCourseApplicationsWorkspaceMode,
  {
    badge: string;
    title: string;
    subtitle: string;
    icon: React.ElementType;
  }
> = {
  workspace: {
    badge: "Заявки",
    title: "Заявки на обучение",
    subtitle: "Просматривайте обращения и принимайте решения без лишних шагов.",
    icon: LayoutGrid,
  },
  pipeline: {
    badge: "Поток заявок",
    title: "Заявки по статусам",
    subtitle: "Быстро находите обращения, которые задержались в обработке.",
    icon: Clipboard,
  },
  analytics: {
    badge: "Аналитика заявок",
    title: "Аналитика заявок",
    subtitle: "Спрос, конверсия и скорость решений в понятном виде.",
    icon: BarChart3,
  },
};

function formatShare(part: number, whole: number) {
  if (!whole) return "0%";
  return `${Math.round((part / whole) * 100)}%`;
}

function formatAverage(value: number) {
  const normalized =
    value >= 10 ? Math.round(value) : Math.round(value * 10) / 10;

  return (normalized % 1 === 0 ? integerFormatter : decimalFormatter).format(
    normalized,
  );
}

function daysSince(value?: string | null) {
  if (!value) return Number.POSITIVE_INFINITY;

  const parsed = new Date(value).getTime();
  if (Number.isNaN(parsed)) return Number.POSITIVE_INFINITY;

  return Math.floor((Date.now() - parsed) / (1000 * 60 * 60 * 24));
}

function durationHours(from?: string | null, to?: string | null) {
  if (!from || !to) return null;

  const fromTime = new Date(from).getTime();
  const toTime = new Date(to).getTime();

  if (Number.isNaN(fromTime) || Number.isNaN(toTime) || toTime < fromTime) {
    return null;
  }

  return (toTime - fromTime) / (1000 * 60 * 60);
}

function formatDuration(value?: number | null) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }

  if (value < 24) {
    return `${Math.max(1, Math.round(value))} ч`;
  }

  const days = value / 24;

  return `${(days < 10 ? decimalFormatter : integerFormatter).format(days)} дн.`;
}

function formatAgeLabel(value?: string | null) {
  const days = daysSince(value);

  if (!Number.isFinite(days)) return "—";
  if (days <= 0) return "сегодня";
  if (days === 1) return "1 день";

  return `${days} дн.`;
}

function MonoPill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2 py-1 text-[11px] font-medium uppercase tracking-[0.12em]",
        className,
      )}
    >
      {children}
    </span>
  );
}

function Panel({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-zinc-300 bg-white">
      <div className="flex flex-col gap-3 border-b border-zinc-300 px-4 py-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-sm font-semibold text-zinc-950">{title}</div>
          {subtitle ? (
            <div className="mt-1 text-sm leading-5 text-zinc-600">
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
      <table className="w-full text-sm">
        <thead className="bg-zinc-100 text-left">
          <tr className="border-b border-zinc-300 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
            {headers.map((header) => (
              <th key={header} className="px-4 py-3">
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-8 text-sm text-zinc-500" colSpan={headers.length}>
                {emptyLabel}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-zinc-200 align-top last:border-b-0"
              >
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3 text-zinc-700">
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
            <div key={row.label} className="flex min-w-0 flex-col justify-end gap-2">
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

export default function TeacherCourseApplicationsWorkspace({
  mode = "workspace",
}: {
  mode?: TeacherCourseApplicationsWorkspaceMode;
}) {
  const {
    courses,
    applications,
    loading,
    refreshing,
    error,
    pendingAction,
    actionError,
    clearActionError,
    load,
    applyApplicationAction,
  } = useTeacherCourseApplications();

  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [drawerMode, setDrawerMode] = React.useState<DrawerMode>("course");
  const [selectedCourseId, setSelectedCourseId] = React.useState<string | null>(
    null,
  );
  const [selectedApplicationId, setSelectedApplicationId] = React.useState<
    string | null
  >(null);
  const [returnToApplicationOnClose, setReturnToApplicationOnClose] =
    React.useState(false);

  const [reviewNote, setReviewNote] = React.useState("");
  const [internalNote, setInternalNote] = React.useState("");
  const [confirmAction, setConfirmAction] =
    React.useState<ApplicationWorkflowAction | null>(null);

  const deferredQuery = React.useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const meta = MODE_META[mode];
  const initialLoading =
    loading && applications.length === 0 && courses.length === 0;

  const clearDrawerState = React.useCallback(() => {
    setDrawerOpen(false);
    setDrawerMode("course");
    setSelectedCourseId(null);
    setSelectedApplicationId(null);
    setReturnToApplicationOnClose(false);
    setReviewNote("");
    setInternalNote("");
    setConfirmAction(null);
    clearActionError();
  }, [clearActionError]);

  const applicationsByCourse = React.useMemo(() => {
    const map = new Map<string, CourseApplication[]>();

    applications.forEach((application) => {
      const current = map.get(application.course_id);
      if (current) {
        current.push(application);
      } else {
        map.set(application.course_id, [application]);
      }
    });

    map.forEach((items) => {
      items.sort(
        (left, right) =>
          new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime(),
      );
    });

    return map;
  }, [applications]);

  const allCourseRows = React.useMemo<CourseRow[]>(() => {
    return courses
      .map((course) => {
        const courseApplications = applicationsByCourse.get(course.course_id) ?? [];

        return {
          course,
          applications: courseApplications,
          totalApplications: courseApplications.length,
          pendingCount: courseApplications.filter(
            (application) =>
              application.status === "pending" ||
              application.status === "reviewing",
          ).length,
          approvedCount: courseApplications.filter(
            (application) => application.status === "approved",
          ).length,
          latestApplicationAt: courseApplications[0]?.updated_at ?? null,
          courseTextMatch: true,
          showCourse: true,
        };
      })
      .sort((left, right) => {
        if (left.totalApplications === 0 && right.totalApplications > 0) return 1;
        if (right.totalApplications === 0 && left.totalApplications > 0) return -1;

        return (
          new Date(right.latestApplicationAt ?? 0).getTime() -
            new Date(left.latestApplicationAt ?? 0).getTime() ||
          right.totalApplications - left.totalApplications ||
          left.course.title.localeCompare(right.course.title, "ru")
        );
      });
  }, [applicationsByCourse, courses]);

  const courseRows = React.useMemo<CourseRow[]>(() => {
    return allCourseRows
      .map((row) => {
        const courseTextMatch = matchesCourseQuery(row.course, normalizedQuery);
        const showCourse =
          !normalizedQuery ||
          courseTextMatch ||
          row.applications.some((application) =>
            matchesApplicationQuery(application, normalizedQuery),
          );

        return {
          ...row,
          courseTextMatch,
          showCourse,
        };
      })
      .filter((row) => row.showCourse);
  }, [allCourseRows, normalizedQuery]);

  const applicationRows = React.useMemo<ApplicationRow[]>(() => {
    return courseRows
      .flatMap((row) =>
        row.applications
          .filter((application) => {
            if (statusFilter !== "all" && application.status !== statusFilter) {
              return false;
            }

            if (!normalizedQuery) return true;
            if (row.courseTextMatch) return true;

            return matchesApplicationQuery(application, normalizedQuery);
          })
          .map((application) => ({
            course: row.course,
            application,
          })),
      )
      .sort((left, right) => {
        const statusDiff =
          APPLICATION_STATUS_ORDER[left.application.status] -
          APPLICATION_STATUS_ORDER[right.application.status];

        if (statusDiff !== 0) {
          return statusDiff;
        }

        return (
          new Date(right.application.updated_at).getTime() -
            new Date(left.application.updated_at).getTime() ||
          left.course.title.localeCompare(right.course.title, "ru")
        );
      });
  }, [courseRows, normalizedQuery, statusFilter]);

  const selectedApplication = React.useMemo(
    () =>
      selectedApplicationId
        ? applications.find(
            (application) => application.application_id === selectedApplicationId,
          ) ?? null
        : null,
    [applications, selectedApplicationId],
  );

  const selectedApplicationCourseId = selectedApplication?.course_id ?? null;

  const selectedCourse = React.useMemo(() => {
    const courseId = selectedCourseId ?? selectedApplicationCourseId;
    if (!courseId) return null;

    return courses.find((course) => course.course_id === courseId) ?? null;
  }, [courses, selectedApplicationCourseId, selectedCourseId]);

  const selectedCourseResolvedId = selectedCourse?.course_id ?? null;

  const relatedApplications = React.useMemo(() => {
    if (!selectedCourseResolvedId) return [];
    return applicationsByCourse.get(selectedCourseResolvedId) ?? [];
  }, [applicationsByCourse, selectedCourseResolvedId]);

  const availableActions = selectedApplication
    ? getAvailableApplicationActions(selectedApplication.status)
    : [];
  const notesLocked = !selectedApplication || availableActions.length === 0;
  const activeCourseId = selectedCourseResolvedId;
  const notesError =
    confirmAction === "reject" && !reviewNote.trim()
      ? "Для отклонения нужно обязательно указать причину."
      : null;

  const selectedApplicationKey = selectedApplication?.application_id ?? null;
  const selectedApplicationUpdatedAt = selectedApplication?.updated_at ?? null;

  React.useEffect(() => {
    if (!selectedApplication) {
      setReviewNote("");
      setInternalNote("");
      setConfirmAction(null);
      clearActionError();
      return;
    }

    setReviewNote(selectedApplication.review_note ?? "");
    setInternalNote(selectedApplication.internal_note ?? "");
    setConfirmAction(null);
    clearActionError();
  }, [
    clearActionError,
    selectedApplication,
    selectedApplicationKey,
    selectedApplicationUpdatedAt,
  ]);

  React.useEffect(() => {
    if (!selectedApplicationId || selectedApplication) {
      return;
    }

    setSelectedApplicationId(null);
    setReturnToApplicationOnClose(false);

    if (drawerMode === "application") {
      if (selectedCourseId) {
        setDrawerMode("course");
      } else {
        clearDrawerState();
      }
    }
  }, [
    clearDrawerState,
    drawerMode,
    selectedApplication,
    selectedApplicationId,
    selectedCourseId,
  ]);

  React.useEffect(() => {
    if (!selectedCourseId || selectedCourse) {
      return;
    }

    clearDrawerState();
  }, [clearDrawerState, selectedCourse, selectedCourseId]);

  const openCourseDrawer = React.useCallback(
    (courseId: string) => {
      setSelectedCourseId(courseId);
      setSelectedApplicationId(null);
      setDrawerMode("course");
      setReturnToApplicationOnClose(false);
      setDrawerOpen(true);
      clearActionError();
    },
    [clearActionError],
  );

  const openApplicationDrawer = React.useCallback(
    (applicationId: string) => {
      const application = applications.find(
        (item) => item.application_id === applicationId,
      );

      if (!application) return;

      setSelectedCourseId(application.course_id);
      setSelectedApplicationId(application.application_id);
      setDrawerMode("application");
      setReturnToApplicationOnClose(false);
      setDrawerOpen(true);
      clearActionError();
    },
    [applications, clearActionError],
  );

  const openCourseFromApplication = React.useCallback(() => {
    if (!selectedApplication) return;

    setSelectedCourseId(selectedApplication.course_id);
    setDrawerMode("course");
    setReturnToApplicationOnClose(true);
    setDrawerOpen(true);
    clearActionError();
  }, [clearActionError, selectedApplication]);

  const restoreApplicationDrawer = React.useCallback(() => {
    if (!selectedApplicationId || !selectedApplication) {
      clearDrawerState();
      return;
    }

    setDrawerMode("application");
    setReturnToApplicationOnClose(false);
    setDrawerOpen(true);
    clearActionError();
  }, [
    clearActionError,
    clearDrawerState,
    selectedApplication,
    selectedApplicationId,
  ]);

  const handleDrawerOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        setDrawerOpen(true);
        return;
      }

      if (
        drawerMode === "course" &&
        returnToApplicationOnClose &&
        selectedApplicationId
      ) {
        restoreApplicationDrawer();
        return;
      }

      clearDrawerState();
    },
    [
      clearDrawerState,
      drawerMode,
      restoreApplicationDrawer,
      returnToApplicationOnClose,
      selectedApplicationId,
    ],
  );

  const handleApplicationAction = React.useCallback(
    async (action: ApplicationWorkflowAction) => {
      if (!selectedApplication) return false;

      clearActionError();

      try {
        const nextApplication = await applyApplicationAction({
          action,
          applicationId: selectedApplication.application_id,
          reviewNote,
          internalNote,
        });

        setReviewNote(nextApplication.review_note ?? "");
        setInternalNote(nextApplication.internal_note ?? "");
        toast.success(getSuccessMessage(action));
        return true;
      } catch (actionLoadError) {
        toast.error(
          getUserFacingErrorMessage(actionLoadError, "Не удалось обновить заявку"),
        );
        return false;
      }
    },
    [
      applyApplicationAction,
      clearActionError,
      internalNote,
      reviewNote,
      selectedApplication,
    ],
  );

  async function handleConfirmAction(
    event: React.MouseEvent<HTMLButtonElement>,
  ) {
    event.preventDefault();

    if (!confirmAction || notesError) {
      return;
    }

    const success = await handleApplicationAction(confirmAction);
    if (success) {
      setConfirmAction(null);
    }
  }

  const statusCounts = React.useMemo(() => {
    const counts = {
      pending: 0,
      reviewing: 0,
      approved: 0,
      rejected: 0,
      withdrawn: 0,
    } satisfies Record<CourseApplicationStatus, number>;

    applications.forEach((application) => {
      counts[application.status] += 1;
    });

    return counts;
  }, [applications]);

  const enrollmentCounts = React.useMemo(() => {
    const counts = {
      active: 0,
      completed: 0,
      dropped: 0,
      blocked: 0,
      canceled: 0,
      none: 0,
    } satisfies Record<EnrollmentBucket, number>;

    applications.forEach((application) => {
      const key = application.enrollment_status ?? "none";
      counts[key] += 1;
    });

    return counts;
  }, [applications]);

  const totalApplications = applications.length;
  const openApplications = statusCounts.pending + statusCounts.reviewing;
  const approvedApplications = statusCounts.approved;
  const decidedApplications = statusCounts.approved + statusCounts.rejected;
  const coursesWithApplications = allCourseRows.filter(
    (course) => course.totalApplications > 0,
  ).length;
  const approvalRate = totalApplications
    ? Math.round((approvedApplications / totalApplications) * 100)
    : 0;
  const decisionCoverage = totalApplications
    ? Math.round((decidedApplications / totalApplications) * 100)
    : 0;

  const portfolioCount = applications.filter(
    (application) => !!application.portfolio_url,
  ).length;
  const resumeCount = applications.filter(
    (application) => !!application.resume_url,
  ).length;
  const materialsCount = applications.filter(
    (application) => !!application.portfolio_url || !!application.resume_url,
  ).length;
  const bothMaterialsCount = applications.filter(
    (application) => !!application.portfolio_url && !!application.resume_url,
  ).length;
  const reviewNoteCount = applications.filter((application) =>
    !!normalizeText(application.review_note ?? ""),
  ).length;
  const internalNoteCount = applications.filter((application) =>
    !!normalizeText(application.internal_note ?? ""),
  ).length;
  const materialsCoverage = totalApplications
    ? Math.round((materialsCount / totalApplications) * 100)
    : 0;

  const avgApplicationsPerActiveCourse = coursesWithApplications
    ? totalApplications / coursesWithApplications
    : 0;

  const decisionDurations = React.useMemo(
    () =>
      applications
        .map((application) =>
          durationHours(application.created_at, application.reviewed_at),
        )
        .filter((value): value is number => value !== null),
    [applications],
  );

  const avgDecisionHours = decisionDurations.length
    ? decisionDurations.reduce((sum, value) => sum + value, 0) /
      decisionDurations.length
    : null;

  const backlogOver3Days = React.useMemo(
    () =>
      applications.filter((application) => {
        if (
          application.status !== "pending" &&
          application.status !== "reviewing"
        ) {
          return false;
        }

        return daysSince(application.created_at) >= 3;
      }).length,
    [applications],
  );

  const backlogOver7Days = React.useMemo(
    () =>
      applications.filter((application) => {
        if (
          application.status !== "pending" &&
          application.status !== "reviewing"
        ) {
          return false;
        }

        return daysSince(application.created_at) >= 7;
      }).length,
    [applications],
  );

  const openApplicationRows = React.useMemo<ApplicationRow[]>(() => {
    return allCourseRows
      .flatMap((row) =>
        row.applications
          .filter(
            (application) =>
              application.status === "pending" ||
              application.status === "reviewing",
          )
          .map((application) => ({
            course: row.course,
            application,
          })),
      )
      .sort((left, right) => {
        return (
          new Date(left.application.created_at).getTime() -
            new Date(right.application.created_at).getTime() ||
          new Date(right.application.updated_at).getTime() -
            new Date(left.application.updated_at).getTime()
        );
      });
  }, [allCourseRows]);

  const resolvedApplicationRows = React.useMemo<ApplicationRow[]>(() => {
    return allCourseRows
      .flatMap((row) =>
        row.applications
          .filter((application) => !!application.reviewed_at)
          .map((application) => ({
            course: row.course,
            application,
          })),
      )
      .sort((left, right) => {
        return (
          new Date(right.application.reviewed_at ?? 0).getTime() -
            new Date(left.application.reviewed_at ?? 0).getTime() ||
          new Date(right.application.updated_at).getTime() -
            new Date(left.application.updated_at).getTime()
        );
      });
  }, [allCourseRows]);

  const demandBaseRows = React.useMemo(
    () => allCourseRows.filter((row) => row.totalApplications > 0),
    [allCourseRows],
  );

  const topDemandRows = React.useMemo(
    () =>
      [...demandBaseRows]
        .sort((left, right) => {
          return (
            right.totalApplications - left.totalApplications ||
            right.pendingCount - left.pendingCount ||
            left.course.title.localeCompare(right.course.title, "ru")
          );
        })
        .slice(0, 8),
    [demandBaseRows],
  );

  const conversionSourceRows = React.useMemo(() => {
    const withMoreSignal = demandBaseRows.filter((row) => row.totalApplications >= 2);
    return withMoreSignal.length > 0 ? withMoreSignal : demandBaseRows;
  }, [demandBaseRows]);

  const topConversionRows = React.useMemo(
    () =>
      [...conversionSourceRows]
        .sort((left, right) => {
          const leftRate = left.totalApplications
            ? left.approvedCount / left.totalApplications
            : 0;
          const rightRate = right.totalApplications
            ? right.approvedCount / right.totalApplications
            : 0;

          return (
            rightRate - leftRate ||
            right.totalApplications - left.totalApplications ||
            left.course.title.localeCompare(right.course.title, "ru")
          );
        })
        .slice(0, 8),
    [conversionSourceRows],
  );

  const queueLoadRows = React.useMemo(
    () =>
      [...allCourseRows]
        .filter((row) => row.pendingCount > 0)
        .sort((left, right) => {
          return (
            right.pendingCount - left.pendingCount ||
            new Date(right.latestApplicationAt ?? 0).getTime() -
              new Date(left.latestApplicationAt ?? 0).getTime()
          );
        })
        .slice(0, 8),
    [allCourseRows],
  );

  const statusChartRows = APPLICATION_STATUS_SEQUENCE.map((status) => ({
    label: APPLICATION_STATUS_META[status].label,
    value: statusCounts[status],
    secondary: `${formatShare(statusCounts[status], totalApplications)} всех заявок`,
  }));

  const enrollmentChartRows = ENROLLMENT_SEQUENCE.map((status) => ({
    label: ENROLLMENT_META[status].label,
    value: enrollmentCounts[status],
    secondary: `${formatShare(enrollmentCounts[status], totalApplications)} заявок`,
  }));

  const resourceCoverageChartRows = [
    {
      label: "Есть портфолио",
      value: portfolioCount,
      secondary: `${formatShare(portfolioCount, totalApplications)} всех заявок`,
    },
    {
      label: "Есть резюме",
      value: resumeCount,
      secondary: `${formatShare(resumeCount, totalApplications)} всех заявок`,
    },
    {
      label: "Оба материала",
      value: bothMaterialsCount,
      secondary: `${formatShare(bothMaterialsCount, totalApplications)} заявок`,
    },
    {
      label: "Есть любой материал",
      value: materialsCount,
      secondary: `${formatShare(materialsCount, totalApplications)} заявок`,
    },
    {
      label: "Есть review note",
      value: reviewNoteCount,
      secondary: `${formatShare(reviewNoteCount, totalApplications)} заявок`,
    },
    {
      label: "Есть internal note",
      value: internalNoteCount,
      secondary: `${formatShare(internalNoteCount, totalApplications)} заявок`,
    },
  ];

  const topDemandChartRows = topDemandRows.map((row) => ({
    label: row.course.title,
    value: row.totalApplications,
    secondary: `${formatShare(row.totalApplications, totalApplications)} всего потока`,
  }));

  const topConversionChartRows = topConversionRows.map((row) => ({
    label: row.course.title,
    value: row.totalApplications
      ? Math.round((row.approvedCount / row.totalApplications) * 100)
      : 0,
    secondary: `Одобрено ${formatCount(row.approvedCount)} из ${formatCount(row.totalApplications)}`,
  }));

  const queueLoadChartRows = queueLoadRows.map((row) => ({
    label: row.course.title,
    value: row.pendingCount,
    secondary: `${formatShare(row.pendingCount, openApplications)} открытой очереди`,
  }));

  const decisionSpeedHistogramRows = React.useMemo(() => {
    const buckets = [
      { label: "0-1 дн", min: 0, max: 24 },
      { label: "2-3 дн", min: 24, max: 72 },
      { label: "4-7 дн", min: 72, max: 168 },
      { label: "8-14 дн", min: 168, max: 336 },
      { label: "15+ дн", min: 336, max: Number.POSITIVE_INFINITY },
    ];

    return buckets.map((bucket) => {
      const count = decisionDurations.filter((value) => {
        if (bucket.max === Number.POSITIVE_INFINITY) {
          return value >= bucket.min;
        }

        return value >= bucket.min && value < bucket.max;
      }).length;

      return {
        label: bucket.label,
        value: count,
        caption: `${formatShare(count, decisionDurations.length)} решенных`,
      };
    });
  }, [decisionDurations]);

  const openQueueHistogramRows = React.useMemo(() => {
    const buckets = [
      { label: "0-1 дн", min: 0, max: 1 },
      { label: "2-3 дн", min: 2, max: 3 },
      { label: "4-7 дн", min: 4, max: 7 },
      { label: "8-14 дн", min: 8, max: 14 },
      { label: "15+ дн", min: 15, max: Number.POSITIVE_INFINITY },
    ];

    return buckets.map((bucket) => {
      const count = openApplicationRows.filter(({ application }) => {
        const age = daysSince(application.created_at);

        if (!Number.isFinite(age)) return false;
        if (bucket.max === Number.POSITIVE_INFINITY) {
          return age >= bucket.min;
        }

        return age >= bucket.min && age <= bucket.max;
      }).length;

      return {
        label: bucket.label,
        value: count,
        caption: `${formatShare(count, openApplicationRows.length)} очереди`,
      };
    });
  }, [openApplicationRows]);

  const weekdayRows = React.useMemo(() => {
    return WEEKDAY_ORDER.map((weekday) => {
      const count = applications.filter((application) => {
        const parsed = new Date(application.created_at);
        return !Number.isNaN(parsed.getTime()) && parsed.getDay() === weekday.day;
      }).length;

      return {
        label: weekday.label,
        count,
      };
    });
  }, [applications]);

  const weekdayChartRows = weekdayRows.map((row) => ({
    label: row.label,
    value: row.count,
    secondary: `${formatShare(row.count, totalApplications)} всех отправок`,
  }));

  const summaryMetrics = React.useMemo(() => {
    if (mode === "workspace") {
      return [
        {
          label: "Курсы",
          value: initialLoading ? "—" : formatCount(courses.length),
          note: "Все ваши курсы, включая те, где заявок пока еще не было.",
        },
        {
          label: "Все заявки",
          value: initialLoading ? "—" : formatCount(totalApplications),
          note: "Полная история входящих обращений по вашим программам.",
        },
        {
          label: "Нужно посмотреть",
          value: initialLoading ? "—" : formatCount(openApplications),
          note: "Pending и reviewing, где решение еще не доведено до финала.",
        },
        {
          label: "Одобрено",
          value: initialLoading ? "—" : formatCount(approvedApplications),
          note: "Заявки, которые уже дали студентам положительный исход.",
        },
      ];
    }

    if (mode === "pipeline") {
      return [
        {
          label: "Pending",
          value: initialLoading ? "—" : formatCount(statusCounts.pending),
          note: "Новые обращения, которые еще не брали в разбор.",
        },
        {
          label: "Reviewing",
          value: initialLoading ? "—" : formatCount(statusCounts.reviewing),
          note: "Заявки, по которым преподаватель уже работает.",
        },
        {
          label: "Старше 3 дней",
          value: initialLoading ? "—" : formatCount(backlogOver3Days),
          note: "Очередь, которая уже начинает требовать явного внимания.",
        },
        {
          label: "Среднее решение",
          value: initialLoading ? "—" : formatDuration(avgDecisionHours),
          note: "Среднее время от отправки заявки до принятия решения.",
        },
      ];
    }

    return [
      {
        label: "Approve rate",
        value: initialLoading ? "—" : `${approvalRate}%`,
        note: "Доля одобренных заявок от всего входящего потока.",
      },
      {
        label: "Решение принято",
        value: initialLoading ? "—" : `${decisionCoverage}%`,
        note: "Сколько заявок уже доведено до approve или reject.",
      },
      {
        label: "С материалами",
        value: initialLoading ? "—" : `${materialsCoverage}%`,
        note: "Есть хотя бы один приложенный материал: портфолио или резюме.",
      },
      {
        label: "Ср. заявок на курс",
        value: initialLoading ? "—" : formatAverage(avgApplicationsPerActiveCourse),
        note: "Средняя нагрузка на курсы, где уже действительно есть спрос.",
      },
    ];
  }, [
    approvalRate,
    approvedApplications,
    avgApplicationsPerActiveCourse,
    avgDecisionHours,
    backlogOver3Days,
    courses.length,
    decisionCoverage,
    initialLoading,
    materialsCoverage,
    mode,
    openApplications,
    statusCounts.pending,
    statusCounts.reviewing,
    totalApplications,
  ]);

  const renderToolbar = (
    <div className="grid gap-px border-b border-zinc-300 bg-zinc-300 lg:grid-cols-[minmax(0,1fr)_220px]">
      <div className="relative bg-white p-3">
        <Search className="pointer-events-none absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск по курсу, студенту, почте, заметкам и тексту заявки"
          className="h-11 rounded-none border-zinc-300 pl-10 shadow-none"
        />
      </div>

      <div className="bg-white p-3">
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as StatusFilter)}
        >
          <SelectTrigger className="h-11 w-full rounded-none border-zinc-300 shadow-none">
            <SelectValue placeholder="Статус заявки" />
          </SelectTrigger>
          <SelectContent className="rounded-none border-zinc-300">
            <SelectItem value="all">Все статусы</SelectItem>
            {APPLICATION_STATUS_SEQUENCE.map((status) => (
              <SelectItem key={status} value={status}>
                {APPLICATION_STATUS_META[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderFocusTable = initialLoading ? (
    <div className="px-4 py-8 text-sm text-zinc-500">
      Загружаем приоритетные заявки...
    </div>
  ) : (
    <CompactTable
      headers={["Студент", "Курс", "Статус", "Ожидание", "Материалы", "Открыть"]}
      rows={openApplicationRows.slice(0, 8).map(({ course, application }) => {
        const hasPortfolio = !!application.portfolio_url;
        const hasResume = !!application.resume_url;

        return [
          <div key={`${application.application_id}-student`} className="space-y-1">
            <div className="font-medium text-zinc-950">
              {getApplicantName(application)}
            </div>
            <div className="text-xs text-zinc-500">
              {application.applicant_email || "Почта не указана"}
            </div>
          </div>,
          <button
            key={`${application.application_id}-course`}
            type="button"
            className="text-left"
            onClick={() => openCourseDrawer(course.course_id)}
          >
            <div className="font-medium text-zinc-950">{course.title}</div>
            <div className="mt-1 font-mono text-xs text-zinc-500">
              {course.slug}
            </div>
          </button>,
          <ApplicationStatusBadge
            key={`${application.application_id}-status`}
            status={application.status}
          />,
          <div key={`${application.application_id}-age`} className="space-y-1">
            <div className="font-medium text-zinc-950">
              {formatAgeLabel(application.created_at)}
            </div>
            <div className="text-xs text-zinc-500">
              Обновлена {formatDateTime(application.updated_at)}
            </div>
          </div>,
          <div key={`${application.application_id}-materials`} className="space-y-1">
            <div className="flex flex-wrap gap-2">
              {hasPortfolio ? (
                <MonoPill className="border-zinc-300 bg-white text-zinc-700">
                  portfolio
                </MonoPill>
              ) : null}
              {hasResume ? (
                <MonoPill className="border-zinc-300 bg-white text-zinc-700">
                  resume
                </MonoPill>
              ) : null}
              {!hasPortfolio && !hasResume ? (
                <span className="text-xs text-zinc-400">Материалов нет</span>
              ) : null}
            </div>
          </div>,
          <Button
            key={`${application.application_id}-open`}
            type="button"
            variant="outline"
            size="sm"
            className="rounded-none border-zinc-300"
            onClick={() => openApplicationDrawer(application.application_id)}
          >
            Открыть
          </Button>,
        ];
      })}
      emptyLabel="Открытых заявок сейчас нет. Очередь выглядит чистой."
    />
  );

  const renderWorkspaceView = (
    <div className="space-y-6">
      <Panel
        title="Фокус на ближайшие решения"
        subtitle="Показываем самые старые открытые заявки, чтобы очередь не копилась и приоритетные обращения не терялись."
        actions={
          <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">
            open: {initialLoading ? "—" : formatCount(openApplicationRows.length)}
          </div>
        }
      >
        {renderFocusTable}
      </Panel>

      <Panel
        title="Операционная рабочая зона"
        subtitle="Поиск и фильтры управляют таблицей заявок, а обзор по курсам помогает быстро переключаться между направлениями."
        actions={
          <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">
            visible: {initialLoading ? "—" : formatCount(applicationRows.length)}
          </div>
        }
      >
        {renderToolbar}

        {initialLoading ? (
          <div className="px-5 py-14 text-sm text-zinc-600">
            Загружаем курсы и заявки преподавателя...
          </div>
        ) : (
          <div className="space-y-6 px-5 py-5">
            <section className="space-y-3">
              <div>
                <div className="text-sm font-semibold text-zinc-950">Все курсы</div>
                <div className="mt-1 text-sm leading-6 text-zinc-600">
                  Показано {formatCount(courseRows.length)} курсов. Из них с историей
                  заявок: {formatCount(coursesWithApplications)}.
                </div>
              </div>

              {courseRows.length === 0 ? (
                <div className="border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center">
                  <div className="text-base font-semibold text-zinc-950">
                    По вашему поиску курсы не найдены
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    Попробуйте сократить запрос или убрать лишние слова.
                  </p>
                </div>
              ) : (
                <CourseOverviewTable
                  rows={courseRows}
                  activeCourseId={activeCourseId}
                  onOpenCourse={openCourseDrawer}
                />
              )}
            </section>

            <section className="space-y-3">
              <div>
                <div className="text-sm font-semibold text-zinc-950">
                  Таблица заявок
                </div>
                <div className="mt-1 text-sm leading-6 text-zinc-600">
                  Сейчас показано {formatCount(applicationRows.length)} заявок по
                  выбранным фильтрам.
                </div>
              </div>

              {applicationRows.length === 0 ? (
                <div className="border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center">
                  <div className="text-base font-semibold text-zinc-950">
                    По выбранным фильтрам заявок не нашлось
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    Сбросьте поиск или выберите другой статус, чтобы увидеть остальные
                    обращения.
                  </p>
                </div>
              ) : (
                <ApplicationsTable
                  rows={applicationRows}
                  selectedApplicationId={selectedApplicationId}
                  onOpenApplication={openApplicationDrawer}
                />
              )}
            </section>
          </div>
        )}
      </Panel>
    </div>
  );

  const renderPipelineView = (
    <div className="space-y-6">
      <div className="grid gap-px border border-zinc-300 bg-zinc-300 md:grid-cols-2 xl:grid-cols-5">
        {APPLICATION_STATUS_SEQUENCE.map((status) => (
          <div key={status} className="bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                  {status}
                </div>
                <div className="mt-2 text-lg font-semibold text-zinc-950">
                  {APPLICATION_STATUS_META[status].label}
                </div>
              </div>

              <div className="text-3xl font-semibold text-zinc-950">
                {initialLoading ? "—" : formatCount(statusCounts[status])}
              </div>
            </div>

            <div className="mt-3 text-sm leading-6 text-zinc-600">
              {APPLICATION_STATUS_META[status].description}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-px border border-zinc-300 bg-zinc-300 xl:grid-cols-2">
        <Panel
          title="Возраст открытой очереди"
          subtitle="Чем правее и выше пики, тем больше заявок начинают висеть слишком долго."
        >
          {initialLoading ? (
            <div className="px-4 py-8 text-sm text-zinc-500">
              Собираем histogram по возрасту очереди...
            </div>
          ) : (
            <HistogramChart
              rows={openQueueHistogramRows}
              emptyLabel="Открытых заявок пока нет."
            />
          )}
        </Panel>

        <Panel
          title="Нагрузка по курсам"
          subtitle="Где именно открытые pending и reviewing заявки концентрируются сильнее всего."
        >
          {initialLoading ? (
            <div className="px-4 py-8 text-sm text-zinc-500">
              Считаем курсы с очередью...
            </div>
          ) : (
            <HorizontalBarChart
              rows={queueLoadChartRows}
              emptyLabel="Очередь по курсам пока пустая."
            />
          )}
        </Panel>
      </div>

      <Panel
        title="Таблица потока"
        subtitle="Фильтруйте очередь по статусу, ищите по студенту или курсу и открывайте заявку справа без выпадения из контекста."
        actions={
          <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">
            visible: {initialLoading ? "—" : formatCount(applicationRows.length)}
          </div>
        }
      >
        {renderToolbar}

        {initialLoading ? (
          <div className="px-5 py-14 text-sm text-zinc-600">
            Загружаем поток заявок...
          </div>
        ) : applicationRows.length === 0 ? (
          <div className="px-5 py-12">
            <div className="border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center">
              <div className="text-base font-semibold text-zinc-950">
                По текущим фильтрам поток пуст
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Смените статус или очистите поиск, чтобы увидеть другие заявки.
              </p>
            </div>
          </div>
        ) : (
          <ApplicationsTable
            rows={applicationRows}
            selectedApplicationId={selectedApplicationId}
            onOpenApplication={openApplicationDrawer}
          />
        )}
      </Panel>
    </div>
  );

  const renderAnalyticsView = (
    <div className="space-y-6">
      <div className="grid gap-px border border-zinc-300 bg-zinc-300 xl:grid-cols-2">
        <Panel
          title="Спрос по курсам"
          subtitle="Какие программы притягивают больше всего заявок и где спрос уже заметно выше среднего."
        >
          {initialLoading ? (
            <div className="px-4 py-8 text-sm text-zinc-500">
              Считаем спрос по курсам...
            </div>
          ) : (
            <div className="space-y-0">
              <CompactTable
                headers={["Курс", "Заявок", "Open", "Одобрено"]}
                rows={topDemandRows.map((row) => [
                  <button
                    key={`${row.course.course_id}-title`}
                    type="button"
                    className="text-left font-medium text-zinc-950"
                    onClick={() => openCourseDrawer(row.course.course_id)}
                  >
                    {row.course.title}
                  </button>,
                  formatCount(row.totalApplications),
                  formatCount(row.pendingCount),
                  formatCount(row.approvedCount),
                ])}
                emptyLabel="Заявки появятся здесь, когда по курсам накопится история."
              />

              <div className="border-t border-zinc-300">
                <div className="border-b border-zinc-300 bg-zinc-100 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
                  Бар-чарт спроса по курсам
                </div>
                <HorizontalBarChart
                  rows={topDemandChartRows}
                  emptyLabel="Пока нечего сравнивать."
                />
              </div>
            </div>
          )}
        </Panel>

        <Panel
          title="Конверсия по курсам"
          subtitle="Здесь видно, где преподаватель чаще принимает решения в пользу студента и где спрос уже качественный."
        >
          {initialLoading ? (
            <div className="px-4 py-8 text-sm text-zinc-500">
              Считаем конверсию по курсам...
            </div>
          ) : (
            <div className="space-y-0">
              <CompactTable
                headers={["Курс", "Approve rate", "Одобрено", "Всего"]}
                rows={topConversionRows.map((row) => [
                  <button
                    key={`${row.course.course_id}-title`}
                    type="button"
                    className="text-left font-medium text-zinc-950"
                    onClick={() => openCourseDrawer(row.course.course_id)}
                  >
                    {row.course.title}
                  </button>,
                  `${formatShare(row.approvedCount, row.totalApplications)}`,
                  formatCount(row.approvedCount),
                  formatCount(row.totalApplications),
                ])}
                emptyLabel="Нужны заявки, чтобы посчитать конверсию."
              />

              <div className="border-t border-zinc-300">
                <div className="border-b border-zinc-300 bg-zinc-100 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
                  Бар-чарт по approve rate
                </div>
                <HorizontalBarChart
                  rows={topConversionChartRows}
                  emptyLabel="Конверсия появится после первых решений."
                  valueFormatter={(value) => `${value}%`}
                />
              </div>
            </div>
          )}
        </Panel>
      </div>

      <div className="grid gap-px border border-zinc-300 bg-zinc-300 xl:grid-cols-2">
        <Panel
          title="Структура статусов и enrollment"
          subtitle="Операционный срез: как распределяется сам поток и во что он превращается после принятия решений."
        >
          {initialLoading ? (
            <div className="px-4 py-8 text-sm text-zinc-500">
              Готовим структурную аналитику...
            </div>
          ) : (
            <div className="grid gap-px border-t border-zinc-300 bg-zinc-300 lg:grid-cols-2">
              <div className="bg-white">
                <div className="border-b border-zinc-300 bg-zinc-100 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
                  Бар-чарт по статусам
                </div>
                <HorizontalBarChart
                  rows={statusChartRows}
                  emptyLabel="Статусы появятся после первых заявок."
                />
              </div>

              <div className="bg-white">
                <div className="border-b border-zinc-300 bg-zinc-100 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
                  Бар-чарт по enrollment
                </div>
                <HorizontalBarChart
                  rows={enrollmentChartRows}
                  emptyLabel="Enrollment-статусы появятся после обработки заявок."
                />
              </div>
            </div>
          )}
        </Panel>

        <Panel
          title="Материалы и заметки"
          subtitle="Понимание, насколько часто студенты прикладывают материалы и как полно преподаватель ведет рабочие заметки."
        >
          {initialLoading ? (
            <div className="px-4 py-8 text-sm text-zinc-500">
              Анализируем материалы и notes...
            </div>
          ) : (
            <div className="space-y-0">
              <CompactTable
                headers={["Метрика", "Число", "Доля"]}
                rows={[
                  ["Есть портфолио", formatCount(portfolioCount), formatShare(portfolioCount, totalApplications)],
                  ["Есть резюме", formatCount(resumeCount), formatShare(resumeCount, totalApplications)],
                  ["Есть любой материал", formatCount(materialsCount), formatShare(materialsCount, totalApplications)],
                  ["Оба материала", formatCount(bothMaterialsCount), formatShare(bothMaterialsCount, totalApplications)],
                  ["Есть review note", formatCount(reviewNoteCount), formatShare(reviewNoteCount, totalApplications)],
                  ["Есть internal note", formatCount(internalNoteCount), formatShare(internalNoteCount, totalApplications)],
                ]}
                emptyLabel="Метрики появятся после первых обращений."
              />

              <div className="border-t border-zinc-300">
                <div className="border-b border-zinc-300 bg-zinc-100 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
                  Бар-чарт по покрытиям
                </div>
                <HorizontalBarChart
                  rows={resourceCoverageChartRows}
                  emptyLabel="Пока нечего визуализировать."
                />
              </div>
            </div>
          )}
        </Panel>
      </div>

      <div className="grid gap-px border border-zinc-300 bg-zinc-300 xl:grid-cols-2">
        <Panel
          title="Скорость принятия решений"
          subtitle="Средняя скорость и histogram по времени до approve или reject помогают понять, где тормозит процесс."
        >
          {initialLoading ? (
            <div className="px-4 py-8 text-sm text-zinc-500">
              Считаем скорость решений...
            </div>
          ) : (
            <div className="space-y-0">
              <CompactTable
                headers={["Метрика", "Значение", "Что показывает"]}
                rows={[
                  [
                    "Среднее до решения",
                    formatDuration(avgDecisionHours),
                    "Среднее время от отправки заявки до финального решения.",
                  ],
                  [
                    "Решено финально",
                    formatCount(decidedApplications),
                    "Approve и reject как доля закрытого процесса.",
                  ],
                  [
                    "Очередь старше 3 дней",
                    formatCount(backlogOver3Days),
                    "Сигнал, что открытые заявки начинают задерживаться.",
                  ],
                  [
                    "Очередь старше 7 дней",
                    formatCount(backlogOver7Days),
                    "Заявки, которые уже точно требуют отдельного внимания.",
                  ],
                ]}
                emptyLabel="Скорость решений появится после первых review."
              />

              <div className="border-t border-zinc-300">
                <div className="border-b border-zinc-300 bg-zinc-100 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
                  Histogram по времени до решения
                </div>
                <HistogramChart
                  rows={decisionSpeedHistogramRows}
                  emptyLabel="Пока нет решенных заявок."
                />
              </div>
            </div>
          )}
        </Panel>

        <Panel
          title="Когда приходят заявки"
          subtitle="Распределение по дням недели помогает понять ритм входящего потока и лучше планировать обработку."
        >
          {initialLoading ? (
            <div className="px-4 py-8 text-sm text-zinc-500">
              Строим ритм входящего потока...
            </div>
          ) : (
            <div className="space-y-0">
              <CompactTable
                headers={["День", "Заявок", "Доля"]}
                rows={weekdayRows.map((row) => [
                  row.label,
                  formatCount(row.count),
                  formatShare(row.count, totalApplications),
                ])}
                emptyLabel="Пока нет заявок для распределения по дням."
              />

              <div className="border-t border-zinc-300">
                <div className="border-b border-zinc-300 bg-zinc-100 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
                  Бар-чарт по дням недели
                </div>
                <HorizontalBarChart
                  rows={weekdayChartRows}
                  emptyLabel="Пока нечего сравнивать."
                />
              </div>
            </div>
          )}
        </Panel>
      </div>

      <div className="grid gap-px border border-zinc-300 bg-zinc-300 xl:grid-cols-2">
        <Panel
          title="Открытая очередь"
          subtitle="Список заявок, по которым решения еще нет и где есть смысл зайти в sidebar прямо из аналитики."
        >
          {renderFocusTable}
        </Panel>

        <Panel
          title="Последние решения"
          subtitle="Свежие approve и reject, чтобы быстро сверять недавнюю работу и возвращаться к важным кейсам."
        >
          {initialLoading ? (
            <div className="px-4 py-8 text-sm text-zinc-500">
              Загружаем последние решения...
            </div>
          ) : (
            <CompactTable
              headers={["Студент", "Курс", "Решение", "Скорость", "Открыть"]}
              rows={resolvedApplicationRows.slice(0, 8).map(({ course, application }) => [
                <div key={`${application.application_id}-student`} className="space-y-1">
                  <div className="font-medium text-zinc-950">
                    {getApplicantName(application)}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {application.applicant_email || "Почта не указана"}
                  </div>
                </div>,
                <button
                  key={`${application.application_id}-course`}
                  type="button"
                  className="text-left font-medium text-zinc-950"
                  onClick={() => openCourseDrawer(course.course_id)}
                >
                  {course.title}
                </button>,
                <div key={`${application.application_id}-decision`} className="space-y-1">
                  <ApplicationStatusBadge status={application.status} />
                  <div className="text-xs text-zinc-500">
                    {formatDateTime(application.reviewed_at)}
                  </div>
                </div>,
                <span key={`${application.application_id}-speed`}>
                  {formatDuration(
                    durationHours(application.created_at, application.reviewed_at),
                  )}
                </span>,
                <Button
                  key={`${application.application_id}-open`}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-none border-zinc-300"
                  onClick={() => openApplicationDrawer(application.application_id)}
                >
                  Открыть
                </Button>,
              ])}
              emptyLabel="Пока нет финально решенных заявок."
            />
          )}
        </Panel>
      </div>
    </div>
  );

  const mainContent =
    mode === "workspace"
      ? renderWorkspaceView
      : mode === "pipeline"
        ? renderPipelineView
        : renderAnalyticsView;

  return (
    <>
      <div className="min-h-full">
        <div className="teacher-workspace flex w-full flex-col gap-5 bg-[#f7f8fa] px-4 py-6 sm:px-6 lg:px-8">
          <TeacherSectionTabs section="applications" />
          <section className="border border-zinc-300 bg-white">
            <div className="grid gap-6 p-5 lg:grid-cols-[1.15fr_0.85fr] lg:p-6">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 border border-zinc-300 bg-zinc-50 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-zinc-600">
                  <meta.icon className="h-3.5 w-3.5" />
                  {meta.badge}
                </div>

                <div>
                  <h1 className="text-[28px] font-semibold tracking-tight text-zinc-950">
                    {meta.title}
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
                    {meta.subtitle}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void load({ background: true })}
                    disabled={refreshing}
                  >
                    <RefreshCw
                      className={cn("h-4 w-4", refreshing && "animate-spin")}
                    />
                    Обновить
                  </Button>

                  <Button asChild variant="ghost">
                    <Link href="/dashboard/teacher/courses">
                      <BookOpen className="h-4 w-4" />
                      К рабочей зоне курсов
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {summaryMetrics.slice(0, 3).map((metric) => (
                  <StatCard
                    key={metric.label}
                    label={metric.label}
                    value={metric.value}
                    note={metric.note}
                  />
                ))}
              </div>
            </div>
          </section>

          {error ? (
            <div className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {mainContent}
        </div>
      </div>

      <Dialog
        open={drawerOpen && !!selectedCourse}
        onOpenChange={handleDrawerOpenChange}
      >
        <DialogContent
          showCloseButton={false}
          className={cn(
            "left-auto right-0 top-0 h-screen w-full max-w-none min-w-365 translate-x-0 translate-y-0 gap-0 rounded-none border-y-0 border-r-0 border-l border-zinc-300 bg-white p-0 shadow-2xl duration-300",
            "data-[state=open]:slide-in-from-right-8 data-[state=closed]:slide-out-to-right-8",
            "sm:w-[88vw] md:w-[50vw]",
          )}
        >
          {!selectedCourse ? (
            <div className="flex h-full items-center justify-center p-8 text-sm text-zinc-500">
              Нет данных для показа.
            </div>
          ) : (
            <div className="flex h-full min-h-0 flex-col bg-white text-zinc-900">
              <div className="border-b border-zinc-300 px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-2">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                      {drawerMode === "application"
                        ? "Заявка студента"
                        : "Курс и заявки"}
                    </div>

                    <DialogTitle className="truncate text-2xl font-semibold tracking-tight text-zinc-950">
                      {drawerMode === "application" && selectedApplication
                        ? selectedApplication.applicant_first_name ||
                          selectedApplication.applicant_email ||
                          "Заявка"
                        : selectedCourse.title}
                    </DialogTitle>

                    <div className="text-sm text-zinc-500">
                      {drawerMode === "application" && selectedApplication
                        ? selectedCourse.title
                        : selectedCourse.slug}
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    {drawerMode === "application" && selectedApplication ? (
                      <ApplicationStatusBadge status={selectedApplication.status} />
                    ) : (
                      <CourseMetaBadge
                        className={
                          COURSE_STATUS_META[selectedCourse.lifecycle_status].className
                        }
                      >
                        {COURSE_STATUS_META[selectedCourse.lifecycle_status].label}
                      </CourseMetaBadge>
                    )}

                    <DialogClose asChild>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="border-zinc-300"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Закрыть</span>
                      </Button>
                    </DialogClose>
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {drawerMode === "application" && selectedApplication ? (
                  <ApplicationDrawerView
                    course={selectedCourse}
                    application={selectedApplication}
                    relatedApplications={relatedApplications}
                    reviewNote={reviewNote}
                    internalNote={internalNote}
                    notesLocked={notesLocked}
                    pendingAction={pendingAction}
                    actionError={actionError}
                    onReviewNoteChange={setReviewNote}
                    onInternalNoteChange={setInternalNote}
                    onOpenCourse={openCourseFromApplication}
                    onOpenApplication={openApplicationDrawer}
                  />
                ) : (
                  <CourseDrawerView
                    course={selectedCourse}
                    applications={relatedApplications}
                    onOpenApplication={openApplicationDrawer}
                    onBackToApplication={
                      returnToApplicationOnClose ? restoreApplicationDrawer : undefined
                    }
                  />
                )}
              </div>

              {drawerMode === "application" && selectedApplication ? (
                <div className="border-t border-zinc-300 bg-white px-5 py-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-3xl text-sm leading-6 text-zinc-600">
                      {availableActions.length > 0
                        ? ACTION_META[availableActions[0]].notesHint
                        : "У заявки уже финальный статус. Здесь остаются сохраненные заметки, ссылки и история для удобного просмотра."}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {availableActions.length > 0 ? (
                        availableActions.map((action) => {
                          const actionMeta = ACTION_META[action];

                          return (
                            <Button
                              key={action}
                              variant={actionMeta.buttonVariant}
                              disabled={pendingAction !== null}
                              onClick={() => setConfirmAction(action)}
                            >
                              {pendingAction === action
                                ? "Сохраняем..."
                                : actionMeta.buttonLabel}
                            </Button>
                          );
                        })
                      ) : (
                        <div className="text-sm text-zinc-500">
                          Финальный статус, действия недоступны.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!confirmAction}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && pendingAction === null) {
            setConfirmAction(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction ? ACTION_META[confirmAction].confirmTitle : ""}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction ? ACTION_META[confirmAction].confirmDescription : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {confirmAction ? (
            <div className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
              {ACTION_META[confirmAction].notesHint}
            </div>
          ) : null}

          {notesError ? (
            <div className="text-sm text-destructive">{notesError}</div>
          ) : null}

          {actionError ? (
            <div className="text-sm text-destructive">{actionError}</div>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={pendingAction !== null}>
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              variant={
                confirmAction ? ACTION_META[confirmAction].buttonVariant : "default"
              }
              disabled={pendingAction !== null || !!notesError}
              onClick={handleConfirmAction}
            >
              {pendingAction !== null
                ? "Сохраняем..."
                : confirmAction
                  ? ACTION_META[confirmAction].confirmLabel
                  : "Подтвердить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
