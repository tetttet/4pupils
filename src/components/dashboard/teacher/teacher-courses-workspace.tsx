"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Check,
  ChevronRight,
  Clipboard,
  LayoutGrid,
  RefreshCw,
  Search,
  Send,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { Course, CourseLifecycle } from "@/types/course";
import { useTeacherCourses } from "@/hooks/use-teacher-courses";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CourseDetailsDialog from "@/components/dashboard/teacher/course-details-dialog";
import {
  TeacherCourseMetricGridSkeleton,
  TeacherCoursePanelCountSkeleton,
  TeacherCoursePipelineStatusGridSkeleton,
  TeacherCourseTableRowsSkeleton,
} from "@/components/dashboard/teacher/course-workspace/skeletons";

type TeacherCoursesWorkspaceMode =
  | "workspace"
  | "pipeline"
  | "insights"
  | "readiness";

type StatusFilter = CourseLifecycle | "all";
type VisibilityFilter = Course["visibility"] | "all";

const STATUS_ORDER: CourseLifecycle[] = [
  "draft",
  "submitted",
  "approved",
  "rejected",
  "archived",
];

const STATUS_META: Record<
  CourseLifecycle,
  {
    label: string;
    shortLabel: string;
    className: string;
    note: string;
  }
> = {
  draft: {
    label: "Черновик",
    shortLabel: "draft",
    className: "border-zinc-300 bg-zinc-50 text-zinc-700",
    note: "Заполняется и готовится к отправке.",
  },
  submitted: {
    label: "На модерации",
    shortLabel: "submitted",
    className: "border-zinc-900 bg-zinc-900 text-white",
    note: "Ожидает решение администратора.",
  },
  approved: {
    label: "Одобрен",
    shortLabel: "approved",
    className: "border-zinc-900 bg-white text-zinc-900",
    note: "Можно развивать и держать в актуальном виде.",
  },
  rejected: {
    label: "На доработке",
    shortLabel: "rejected",
    className: "border-zinc-500 bg-zinc-100 text-zinc-900",
    note: "Есть замечания, нужен повторный проход.",
  },
  archived: {
    label: "Архив",
    shortLabel: "archived",
    className: "border-zinc-200 bg-white text-zinc-500",
    note: "Не участвует в активной работе.",
  },
};

const VISIBILITY_META: Record<
  Course["visibility"],
  { label: string; className: string }
> = {
  public: {
    label: "public",
    className: "border-zinc-900 bg-zinc-900 text-white",
  },
  private: {
    label: "private",
    className: "border-zinc-300 bg-white text-zinc-700",
  },
};

const MODE_META: Record<
  TeacherCoursesWorkspaceMode,
  { title: string; subtitle: string }
> = {
  workspace: {
    title: "Рабочая зона курсов",
    subtitle:
      "Здесь собран весь рабочий контур преподавателя: каталог, быстрые действия, контроль статусов и точки роста по каждому курсу.",
  },
  pipeline: {
    title: "Поток курсов",
    subtitle:
      "Смотри, на каком этапе находится каждый курс, где есть задержки, и какие позиции готовы к следующему шагу.",
  },
  insights: {
    title: "Аналитика курсов",
    subtitle:
      "Короткий, ясный срез по структуре каталога: статусы, языки, категории, качество наполнения и курсы с лучшей готовностью.",
  },
  readiness: {
    title: "Чек-лист качества",
    subtitle:
      "Проверка карточек перед отправкой: где не хватает обложки, описания, структуры и что именно ещё нужно довести до готовности.",
  },
};

function formatDate(value?: string | null) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleDateString("ru-RU");
  } catch {
    return value;
  }
}

function formatCount(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value);
}

function formatShare(part: number, whole: number) {
  if (!whole) return "0%";
  return `${Math.round((part / whole) * 100)}%`;
}

function daysSince(value?: string | null) {
  if (!value) return Number.POSITIVE_INFINITY;

  const parsed = new Date(value).getTime();
  if (Number.isNaN(parsed)) return Number.POSITIVE_INFINITY;

  const diff = Date.now() - parsed;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function isCourseSearchMatch(course: Course, query: string) {
  if (!query) return true;

  const haystack = [
    course.title,
    course.slug,
    course.category,
    course.level,
    course.language,
    course.short_description,
    course.description,
    course.review_notes,
    ...(course.tags || []),
    ...(course.requirements || []),
    ...(course.outcomes || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function getChecklist(course: Course) {
  return [
    { label: "Обложка", done: !!course.image_url },
    { label: "Краткое описание", done: !!course.short_description?.trim() },
    { label: "Полное описание", done: !!course.description?.trim() },
    { label: "Категория", done: !!course.category },
    { label: "Уровень", done: !!course.level },
    { label: "Slug", done: !!course.slug?.trim() },
    { label: "Теги (3+)", done: (course.tags?.length ?? 0) >= 3 },
    { label: "Требования", done: (course.requirements?.length ?? 0) >= 1 },
    { label: "Результаты", done: (course.outcomes?.length ?? 0) >= 1 },
    {
      label: "Цена или free",
      done: !!course.is_free || Number(course.price ?? 0) > 0,
    },
  ];
}

function getReadiness(course: Course) {
  const checklist = getChecklist(course);
  const completed = checklist.filter((item) => item.done).length;
  const score = Math.round((completed / checklist.length) * 100);
  const missing = checklist
    .filter((item) => !item.done)
    .map((item) => item.label);

  return {
    score,
    missing,
    readyToSubmit:
      missing.length === 0 &&
      (course.lifecycle_status === "draft" ||
        course.lifecycle_status === "rejected"),
  };
}

function getNextStep(course: Course, score: number, missing: string[]) {
  if (course.lifecycle_status === "rejected") {
    return "Разобрать замечания модератора и отправить повторно.";
  }

  if (course.lifecycle_status === "submitted") {
    return "Ожидать решение модерации и держать материалы под рукой.";
  }

  if (course.lifecycle_status === "archived") {
    return "Вернуть в активную работу, если курс снова нужен.";
  }

  if (course.lifecycle_status === "approved" && course.visibility === "private") {
    return "Проверить публикацию, чтобы курс был виден в каталоге.";
  }

  if (missing.length > 0) {
    return `Дозаполнить: ${missing.slice(0, 2).join(", ")}${
      missing.length > 2 ? " и ещё" : ""
    }.`;
  }

  if (score >= 100 && course.lifecycle_status === "draft") {
    return "Курс готов, можно отправлять на модерацию.";
  }

  if (course.lifecycle_status === "approved") {
    return "Поддерживать описание, цену и программу в актуальном состоянии.";
  }

  return "Проверить карточку и обновить материалы при необходимости.";
}

function aggregateCounts(values: Array<string | null | undefined>) {
  const map = new Map<string, number>();

  values.forEach((value) => {
    const normalized = value?.trim() || "Не указано";
    map.set(normalized, (map.get(normalized) ?? 0) + 1);
  });

  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
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

function MetricCell({
  label,
  value,
  note,
}: {
  label: string;
  value: string | number;
  note: string;
}) {
  return (
    <div className="bg-white p-4">
      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
        {value}
      </div>
      <div className="mt-2 text-sm leading-5 text-zinc-600">{note}</div>
    </div>
  );
}

function WorkspaceLink({
  href,
  title,
  description,
  note,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  note: React.ReactNode;
  icon: React.ElementType;
}) {
  return (
    <Link
      href={href}
      className="group bg-white p-4 transition-colors hover:bg-zinc-50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-3">
          <div className="inline-flex h-9 w-9 items-center justify-center border border-zinc-300 bg-white text-zinc-900">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-zinc-950">{title}</div>
            <div className="mt-1 text-sm leading-5 text-zinc-600">
              {description}
            </div>
          </div>
        </div>
        <ChevronRight className="mt-1 h-4 w-4 text-zinc-400 transition-transform group-hover:translate-x-0.5" />
      </div>
      <div className="mt-4 border-t border-zinc-200 pt-3 text-xs uppercase tracking-[0.16em] text-zinc-500">
        {note}
      </div>
    </Link>
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

function WorkspaceTable({
  rows,
  loading,
  pendingCourseId,
  pendingAction,
  onOpen,
  onEdit,
  onSubmit,
  emptyTitle,
  emptyDescription,
}: {
  rows: Course[];
  loading: boolean;
  pendingCourseId: string | null;
  pendingAction: "submit" | "delete" | null;
  onOpen: (course: Course) => void;
  onEdit: (courseId: string) => void;
  onSubmit: (courseId: string) => Promise<boolean>;
  emptyTitle: string;
  emptyDescription: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] text-sm">
        <thead className="bg-zinc-100 text-left">
          <tr className="border-b border-zinc-300 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
            <th className="px-4 py-3">Курс</th>
            <th className="px-4 py-3">Поток</th>
            <th className="px-4 py-3">Готовность</th>
            <th className="px-4 py-3">Обновлено</th>
            <th className="px-4 py-3 text-right">Действия</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <TeacherCourseTableRowsSkeleton />
          ) : rows.length === 0 ? (
            <tr>
              <td className="px-4 py-10" colSpan={5}>
                <div className="mx-auto max-w-xl text-center">
                  <div className="text-base font-semibold text-zinc-950">
                    {emptyTitle}
                  </div>
                  <div className="mt-1 text-sm leading-6 text-zinc-600">
                    {emptyDescription}
                  </div>
                </div>
              </td>
            </tr>
          ) : (
            rows.map((course) => {
              const statusMeta = STATUS_META[course.lifecycle_status];
              const visibilityMeta = VISIBILITY_META[course.visibility];
              const readiness = getReadiness(course);
              const canEdit =
                course.lifecycle_status === "draft" ||
                course.lifecycle_status === "rejected";
              const canSubmit =
                course.lifecycle_status === "draft" ||
                course.lifecycle_status === "rejected";
              const isSubmitPending =
                pendingCourseId === course.course_id && pendingAction === "submit";
              const updatedDays = daysSince(course.updated_at);

              return (
                <tr
                  key={course.course_id}
                  className="border-b border-zinc-200 align-top transition-colors hover:bg-zinc-50"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="relative h-16 w-24 shrink-0 overflow-hidden border border-zinc-300 bg-zinc-100">
                        <Image
                          src={course.image_url ?? "/placeholder.png"}
                          alt={course.title}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>

                      <div className="min-w-0 space-y-2">
                        <div>
                          <div className="font-semibold leading-5 text-zinc-950">
                            {course.title}
                          </div>
                          <div className="mt-1 font-mono text-xs text-zinc-500">
                            {course.slug}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {course.category ? (
                            <MonoPill className="border-zinc-300 bg-white text-zinc-700">
                              {course.category}
                            </MonoPill>
                          ) : null}
                          {course.level ? (
                            <MonoPill className="border-zinc-300 bg-white text-zinc-700">
                              {course.level}
                            </MonoPill>
                          ) : null}
                          <MonoPill
                            className={cn(
                              "border-zinc-300",
                              visibilityMeta.className,
                            )}
                          >
                            {visibilityMeta.label}
                          </MonoPill>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      <MonoPill className={statusMeta.className}>
                        {statusMeta.label}
                      </MonoPill>
                      <div className="max-w-xs text-xs leading-5 text-zinc-600">
                        {statusMeta.note}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="max-w-xs space-y-2">
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.14em] text-zinc-500">
                        <span>Заполнено</span>
                        <span>{readiness.score}%</span>
                      </div>
                      <div className="h-2 bg-zinc-200">
                        <div
                          className="h-full bg-zinc-900 transition-all"
                          style={{ width: `${readiness.score}%` }}
                        />
                      </div>
                      <div className="text-xs leading-5 text-zinc-600">
                        {readiness.missing.length
                          ? `Не хватает: ${readiness.missing.join(", ")}.`
                          : "Карточка выглядит полной и готовой к следующему шагу."}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-sm text-zinc-600">
                    <div>{formatDate(course.updated_at)}</div>
                    <div className="mt-1 text-xs text-zinc-500">
                      {!Number.isFinite(updatedDays)
                        ? "Без точной даты"
                        : updatedDays === 0
                        ? "Обновлён сегодня"
                        : `${updatedDays} дн. назад`}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-none border-zinc-300"
                        onClick={() => onOpen(course)}
                      >
                        Открыть
                      </Button>

                      {canEdit ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-none border-zinc-300"
                          onClick={() => onEdit(course.course_id)}
                        >
                          Редактировать
                        </Button>
                      ) : null}

                      <Button
                        size="sm"
                        className="rounded-none bg-zinc-900 text-white hover:bg-zinc-800"
                        disabled={!canSubmit || isSubmitPending}
                        onClick={() => void onSubmit(course.course_id)}
                      >
                        {isSubmitPending ? "Отправляем..." : "На модерацию"}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
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
              <td
                className="px-4 py-8 text-sm text-zinc-500"
                colSpan={headers.length}
              >
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

type HorizontalBarChartRow = {
  label: string;
  value: number;
  secondary?: string;
};

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
        const width = maxValue > 0 ? Math.max((row.value / maxValue) * 100, 2) : 0;

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

type HistogramRow = {
  label: string;
  value: number;
  caption?: string;
};

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
      <div className="grid h-72 grid-cols-5 gap-3">
        {rows.map((row) => {
          const height = maxValue > 0 ? Math.max((row.value / maxValue) * 100, 4) : 4;

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

export default function TeacherCoursesWorkspace({
  mode,
}: {
  mode: TeacherCoursesWorkspaceMode;
}) {
  const {
    rows,
    loading,
    refreshing,
    error,
    open,
    active,
    pendingCourseId,
    pendingAction,
    load,
    openCourse,
    closeCourse,
    submitCourse,
    deleteCourse,
    openCourseEditor,
  } = useTeacherCourses();

  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [visibilityFilter, setVisibilityFilter] =
    React.useState<VisibilityFilter>("all");
  const deferredQuery = React.useDeferredValue(query);

  const meta = MODE_META[mode];
  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const sortedRows = React.useMemo(
    () =>
      [...rows].sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      ),
    [rows],
  );

  const filteredRows = React.useMemo(
    () =>
      sortedRows.filter((course) => {
        if (statusFilter !== "all" && course.lifecycle_status !== statusFilter) {
          return false;
        }

        if (visibilityFilter !== "all" && course.visibility !== visibilityFilter) {
          return false;
        }

        return isCourseSearchMatch(course, normalizedQuery);
      }),
    [normalizedQuery, sortedRows, statusFilter, visibilityFilter],
  );

  const readinessMap = React.useMemo(() => {
    return new Map(
      rows.map((course) => [course.course_id, getReadiness(course)] as const),
    );
  }, [rows]);

  const statusCounts = React.useMemo(() => {
    return STATUS_ORDER.reduce(
      (acc, status) => {
        acc[status] = rows.filter(
          (course) => course.lifecycle_status === status,
        ).length;
        return acc;
      },
      {} as Record<CourseLifecycle, number>,
    );
  }, [rows]);

  const publicCount = rows.filter((course) => course.visibility === "public").length;
  const privateCount = rows.length - publicCount;
  const readyToSubmitCount = rows.filter(
    (course) => readinessMap.get(course.course_id)?.readyToSubmit === true,
  ).length;
  const attentionRows = React.useMemo(
    () =>
      [...sortedRows]
        .filter((course) => {
          const readiness = readinessMap.get(course.course_id);
          return (
            !!readiness &&
            (course.lifecycle_status === "rejected" ||
              readiness.missing.length > 0 ||
              course.lifecycle_status === "draft")
          );
        })
        .sort((a, b) => {
          const scoreA = readinessMap.get(a.course_id)?.score ?? 0;
          const scoreB = readinessMap.get(b.course_id)?.score ?? 0;
          return scoreA - scoreB;
        }),
    [readinessMap, sortedRows],
  );

  const updatedRecentlyCount = rows.filter(
    (course) => daysSince(course.updated_at) <= 14,
  ).length;

  const averageReadiness = rows.length
    ? Math.round(
        rows.reduce(
          (sum, course) => sum + (readinessMap.get(course.course_id)?.score ?? 0),
          0,
        ) / rows.length,
      )
    : 0;

  const categoryRows = React.useMemo(
    () => aggregateCounts(rows.map((course) => course.category)).slice(0, 8),
    [rows],
  );
  const languageRows = React.useMemo(
    () => aggregateCounts(rows.map((course) => course.language)).slice(0, 8),
    [rows],
  );
  const levelRows = React.useMemo(
    () => aggregateCounts(rows.map((course) => course.level)).slice(0, 8),
    [rows],
  );

  const avgTags = rows.length
    ? Math.round(
        rows.reduce((sum, course) => sum + (course.tags?.length ?? 0), 0) /
          rows.length,
      )
    : 0;
  const avgRequirements = rows.length
    ? Math.round(
        rows.reduce(
          (sum, course) => sum + (course.requirements?.length ?? 0),
          0,
        ) / rows.length,
      )
    : 0;
  const avgOutcomes = rows.length
    ? Math.round(
        rows.reduce((sum, course) => sum + (course.outcomes?.length ?? 0), 0) /
          rows.length,
      )
    : 0;

  const topReadyRows = [...sortedRows]
    .sort(
      (a, b) =>
        (readinessMap.get(b.course_id)?.score ?? 0) -
        (readinessMap.get(a.course_id)?.score ?? 0),
    )
    .slice(0, 8);

  const categoryChartRows = categoryRows.map((item) => ({
    label: item.label,
    value: item.count,
    secondary: `${formatShare(item.count, rows.length)} каталога`,
  }));

  const languageChartRows = languageRows.map((item) => ({
    label: item.label,
    value: item.count,
    secondary: `${formatShare(item.count, rows.length)} курсов`,
  }));

  const levelChartRows = levelRows.map((item) => ({
    label: item.label,
    value: item.count,
    secondary: `${formatShare(item.count, rows.length)} курсов`,
  }));

  const contentDepthChartRows = [
    {
      label: "Среднее число тегов",
      value: avgTags,
      secondary: "Маркер глубины классификации карточек",
    },
    {
      label: "Среднее число требований",
      value: avgRequirements,
      secondary: "Насколько ясно описан входной порог",
    },
    {
      label: "Среднее число результатов",
      value: avgOutcomes,
      secondary: "Насколько чётко обозначен итог обучения",
    },
  ];

  const statusChartRows = STATUS_ORDER.map((status) => ({
    label: STATUS_META[status].label,
    value: statusCounts[status],
    secondary: `${formatShare(statusCounts[status], rows.length)} каталога`,
  }));

  const visibilityChartRows = [
    {
      label: "Public",
      value: publicCount,
      secondary: `${formatShare(publicCount, rows.length)} каталога`,
    },
    {
      label: "Private",
      value: privateCount,
      secondary: `${formatShare(privateCount, rows.length)} каталога`,
    },
  ];

  const readinessHistogramRows = React.useMemo(() => {
    const buckets = [
      { label: "0-39", min: 0, max: 39 },
      { label: "40-59", min: 40, max: 59 },
      { label: "60-79", min: 60, max: 79 },
      { label: "80-89", min: 80, max: 89 },
      { label: "90-100", min: 90, max: 100 },
    ];

    return buckets.map((bucket) => {
      const count = rows.filter((course) => {
        const score = readinessMap.get(course.course_id)?.score ?? 0;
        return score >= bucket.min && score <= bucket.max;
      }).length;

      return {
        label: bucket.label,
        value: count,
        caption: `${formatShare(count, rows.length)} курсов`,
      };
    });
  }, [readinessMap, rows]);

  const courseLinks = [
    {
      href: "/dashboard/teacher/courses",
      title: "Рабочая зона",
      description: "Главная панель со сводкой, фокусом и всем каталогом курсов.",
      note: loading ? (
        <TeacherCoursePanelCountSkeleton className="h-3 w-32 bg-zinc-200" />
      ) : (
        `${formatCount(rows.length)} курсов в кабинете`
      ),
      icon: LayoutGrid,
    },
    {
      href: "/dashboard/teacher/courses/pipeline",
      title: "Поток курсов",
      description: "Контроль очереди: черновики, модерация, доработки и архив.",
      note: loading ? (
        <TeacherCoursePanelCountSkeleton className="h-3 w-32 bg-zinc-200" />
      ) : (
        `${formatCount(
          statusCounts.draft + statusCounts.submitted + statusCounts.rejected,
        )} активных статусов`
      ),
      icon: Clipboard,
    },
    {
      href: "/dashboard/teacher/courses/insights",
      title: "Аналитика",
      description:
        "Распределение по языкам, категориям, наполнению и общему качеству.",
      note: loading ? (
        <TeacherCoursePanelCountSkeleton className="h-3 w-32 bg-zinc-200" />
      ) : (
        `${averageReadiness}% средняя готовность`
      ),
      icon: BookOpen,
    },
    {
      href: "/dashboard/teacher/courses/readiness",
      title: "Чек-лист",
      description: "Список пробелов по каждой карточке перед отправкой и публикацией.",
      note: loading ? (
        <TeacherCoursePanelCountSkeleton className="h-3 w-32 bg-zinc-200" />
      ) : (
        `${formatCount(attentionRows.length)} требуют внимания`
      ),
      icon: Check,
    },
    {
      href: "/dashboard/teacher/courses/create",
      title: "Создать курс",
      description: "Открыть новый черновик и собрать курс с нуля.",
      note: "Новый курс за один проход",
      icon: Send,
    },
  ];

  const renderToolbar = (
    <div className="grid gap-px border-b border-zinc-300 bg-zinc-300 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
      <div className="relative bg-white p-3">
        <Search className="pointer-events-none absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск по названию, slug, описанию, тегам и замечаниям"
          className="h-11 rounded-none border-zinc-300 pl-10 shadow-none"
        />
      </div>

      <div className="bg-white p-3">
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as StatusFilter)}
        >
          <SelectTrigger className="h-11 w-full rounded-none border-zinc-300 shadow-none">
            <SelectValue placeholder="Все статусы" />
          </SelectTrigger>
          <SelectContent className="rounded-none border-zinc-300">
            <SelectItem value="all">Все статусы</SelectItem>
            {STATUS_ORDER.map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_META[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white p-3">
        <Select
          value={visibilityFilter}
          onValueChange={(value) =>
            setVisibilityFilter(value as VisibilityFilter)
          }
        >
          <SelectTrigger className="h-11 w-full rounded-none border-zinc-300 shadow-none">
            <SelectValue placeholder="Все visibility" />
          </SelectTrigger>
          <SelectContent className="rounded-none border-zinc-300">
            <SelectItem value="all">Все visibility</SelectItem>
            <SelectItem value="public">Только public</SelectItem>
            <SelectItem value="private">Только private</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderWorkspaceView = (
    <div className="space-y-6">
      <div className="grid gap-px border border-zinc-300 bg-zinc-300 lg:grid-cols-5">
        {courseLinks.map((link) => (
          <WorkspaceLink key={link.href} {...link} />
        ))}
      </div>

      <Panel
        title="Фокус на ближайшие действия"
        subtitle="Показываем курсы, где прямо сейчас есть смысл что-то сделать: доработать, отправить или проверить публикацию."
      >
        <CompactTable
          headers={["Курс", "Следующий шаг", "Готовность", "Обновлено"]}
          rows={attentionRows.slice(0, 8).map((course) => {
            const readiness = readinessMap.get(course.course_id) ?? getReadiness(course);

            return [
              <button
                key={`${course.course_id}-title`}
                type="button"
                className="text-left"
                onClick={() => openCourse(course)}
              >
                <div className="font-semibold text-zinc-950">{course.title}</div>
                <div className="mt-1 font-mono text-xs text-zinc-500">
                  {course.slug}
                </div>
              </button>,
              <div key={`${course.course_id}-step`} className="max-w-md leading-6">
                {getNextStep(course, readiness.score, readiness.missing)}
              </div>,
              <div key={`${course.course_id}-score`} className="space-y-2">
                <div className="flex items-center gap-2">
                  <MonoPill className={STATUS_META[course.lifecycle_status].className}>
                    {readiness.score}%
                  </MonoPill>
                  <span className="text-xs text-zinc-500">
                    {readiness.missing.length
                      ? `${readiness.missing.length} пробелов`
                      : "готов"}
                  </span>
                </div>
                <div className="text-xs leading-5 text-zinc-500">
                  {readiness.missing.length
                    ? readiness.missing.join(", ")
                    : "Карточка заполнена полностью."}
                </div>
              </div>,
              <div key={`${course.course_id}-updated`} className="text-sm">
                {formatDate(course.updated_at)}
              </div>,
            ];
          })}
          emptyLabel="Курсы с пробелами пока не найдены."
        />
      </Panel>

      <Panel
        title="Все курсы"
        subtitle="Основная таблица по каталогу преподавателя. Открытие курса выводит правую рабочую панель вместо popup."
        actions={
          loading ? (
            <TeacherCoursePanelCountSkeleton />
          ) : (
            <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">
              Показано: {formatCount(filteredRows.length)}
            </div>
          )
        }
      >
        {renderToolbar}
        <WorkspaceTable
          rows={filteredRows}
          loading={loading}
          pendingCourseId={pendingCourseId}
          pendingAction={pendingAction}
          onOpen={openCourse}
          onEdit={openCourseEditor}
          onSubmit={submitCourse}
          emptyTitle="По текущим фильтрам курсы не найдены"
          emptyDescription="Сбрось фильтры или создай новый курс, чтобы наполнить рабочую таблицу."
        />
      </Panel>
    </div>
  );

  const renderPipelineView = (
    <div className="space-y-6">
      {loading ? (
        <TeacherCoursePipelineStatusGridSkeleton />
      ) : (
        <div className="grid gap-px border border-zinc-300 bg-zinc-300 md:grid-cols-2 xl:grid-cols-5">
          {STATUS_ORDER.map((status) => (
            <div key={status} className="bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                    {STATUS_META[status].shortLabel}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-zinc-950">
                    {STATUS_META[status].label}
                  </div>
                </div>
                <div className="text-3xl font-semibold text-zinc-950">
                  {formatCount(statusCounts[status])}
                </div>
              </div>
              <div className="mt-3 text-sm leading-6 text-zinc-600">
                {STATUS_META[status].note}
              </div>
            </div>
          ))}
        </div>
      )}

      <Panel
        title="Таблица потока"
        subtitle="Сравнивай этапы, фильтруй очередь и открывай курс в правой панели, не выпадая из контекста."
        actions={
          loading ? (
            <TeacherCoursePanelCountSkeleton />
          ) : (
            <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">
              active: {formatCount(filteredRows.length)}
            </div>
          )
        }
      >
        {renderToolbar}
        <WorkspaceTable
          rows={filteredRows}
          loading={loading}
          pendingCourseId={pendingCourseId}
          pendingAction={pendingAction}
          onOpen={openCourse}
          onEdit={openCourseEditor}
          onSubmit={submitCourse}
          emptyTitle="В этом этапе пока ничего нет"
          emptyDescription="Попробуй переключить статус или visibility, чтобы увидеть другие позиции."
        />
      </Panel>
    </div>
  );

  const renderInsightsView = (
    <div className="space-y-6">
      <div className="grid gap-px border border-zinc-300 bg-zinc-300 xl:grid-cols-2">
        <Panel
          title="Категории"
          subtitle="В каких темах сейчас сосредоточен каталог."
        >
          <div className="space-y-0">
            <CompactTable
              headers={["Категория", "Курсов", "Доля"]}
              rows={categoryRows.map((item) => [
                <span
                  key={`${item.label}-label`}
                  className="font-medium text-zinc-950"
                >
                  {item.label}
                </span>,
                <span key={`${item.label}-count`}>
                  {formatCount(item.count)}
                </span>,
                <span key={`${item.label}-share`}>
                  {formatShare(item.count, rows.length)}
                </span>,
              ])}
            />
            <div className="border-t border-zinc-300">
              <div className="border-b border-zinc-300 bg-zinc-100 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
                Бар-чарт по категориям
              </div>
              <HorizontalBarChart
                rows={categoryChartRows}
                emptyLabel="Категории появятся после создания курсов."
              />
            </div>
          </div>
        </Panel>

        <Panel
          title="Языки и уровни"
          subtitle="Понимание, для какой аудитории собраны материалы."
        >
          <div className="space-y-0">
            <div className="grid gap-px border-t border-zinc-300 bg-zinc-300 lg:grid-cols-2">
              <div className="bg-white">
                <CompactTable
                  headers={["Язык", "Курсов", "Доля"]}
                  rows={languageRows.map((item) => [
                    item.label,
                    formatCount(item.count),
                    formatShare(item.count, rows.length),
                  ])}
                />
              </div>
              <div className="bg-white">
                <CompactTable
                  headers={["Уровень", "Курсов", "Доля"]}
                  rows={levelRows.map((item) => [
                    item.label,
                    formatCount(item.count),
                    formatShare(item.count, rows.length),
                  ])}
                />
              </div>
            </div>
            <div className="grid gap-px border-t border-zinc-300 bg-zinc-300 lg:grid-cols-2">
              <div className="bg-white">
                <div className="border-b border-zinc-300 bg-zinc-100 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
                  Бар-чарт по языкам
                </div>
                <HorizontalBarChart
                  rows={languageChartRows}
                  emptyLabel="Появится после создания курсов."
                />
              </div>
              <div className="bg-white">
                <div className="border-b border-zinc-300 bg-zinc-100 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
                  Бар-чарт по уровням
                </div>
                <HorizontalBarChart
                  rows={levelChartRows}
                  emptyLabel="Появится после создания курсов."
                />
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-px border border-zinc-300 bg-zinc-300 xl:grid-cols-2">
        <Panel
          title="Контент-матрица"
          subtitle="Насколько наполнены карточки и как выглядит структура каталога."
        >
          <div className="space-y-0">
            <CompactTable
              headers={["Метрика", "Значение", "Что это значит"]}
              rows={[
                [
                  "Средняя готовность",
                  `${averageReadiness}%`,
                  "Сколько из ключевых полей обычно заполнено.",
                ],
                [
                  "Среднее число тегов",
                  String(avgTags),
                  "Помогает понять глубину классификации карточек.",
                ],
                [
                  "Среднее число требований",
                  String(avgRequirements),
                  "Насколько чётко описан порог входа в курс.",
                ],
                [
                  "Среднее число результатов",
                  String(avgOutcomes),
                  "Показывает ясность обещаемого результата обучения.",
                ],
                [
                  "Обновлены за 14 дней",
                  formatCount(updatedRecentlyCount),
                  "Живые курсы, над которыми недавно работали.",
                ],
                [
                  "Готовы к отправке",
                  formatCount(readyToSubmitCount),
                  "Черновики и доработки, которые можно продвинуть дальше.",
                ],
              ]}
            />
            <div className="border-t border-zinc-300">
              <div className="border-b border-zinc-300 bg-zinc-100 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
                Бар-чарт глубины контента
              </div>
              <HorizontalBarChart
                rows={contentDepthChartRows}
                emptyLabel="Появится после наполнения курсов."
                valueFormatter={(value) => String(value)}
              />
            </div>
          </div>
        </Panel>

        <Panel
          title="Лидеры по готовности"
          subtitle="Самые цельные карточки на текущий момент."
        >
          <CompactTable
            headers={["Курс", "Счёт", "Статус"]}
            rows={topReadyRows.map((course) => {
              const readiness = readinessMap.get(course.course_id) ?? getReadiness(course);

              return [
                <button
                  key={`${course.course_id}-open`}
                  type="button"
                  className="text-left font-medium text-zinc-950"
                  onClick={() => openCourse(course)}
                >
                  {course.title}
                </button>,
                <span key={`${course.course_id}-score`}>{readiness.score}%</span>,
                <MonoPill
                  key={`${course.course_id}-status`}
                  className={STATUS_META[course.lifecycle_status].className}
                >
                  {STATUS_META[course.lifecycle_status].label}
                </MonoPill>,
              ];
            })}
          />
        </Panel>
      </div>

      <div className="grid gap-px border border-zinc-300 bg-zinc-300 xl:grid-cols-2">
        <Panel
          title="Гистограмма готовности"
          subtitle="Показывает, как распределены курсы по уровню заполненности карточки."
        >
          <HistogramChart
            rows={readinessHistogramRows}
            emptyLabel="Гистограмма появится после создания курсов."
          />
        </Panel>

        <Panel
          title="Операционная структура"
          subtitle="Быстрый взгляд на статусы и текущую visibility каталога."
        >
          <div className="grid gap-px border-t border-zinc-300 bg-zinc-300 lg:grid-cols-2">
            <div className="bg-white">
              <div className="border-b border-zinc-300 bg-zinc-100 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
                Бар-чарт по статусам
              </div>
              <HorizontalBarChart
                rows={statusChartRows}
                emptyLabel="Статусы появятся после создания курсов."
              />
            </div>
            <div className="bg-white">
              <div className="border-b border-zinc-300 bg-zinc-100 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
                Бар-чарт по visibility
              </div>
              <HorizontalBarChart
                rows={visibilityChartRows}
                emptyLabel="Visibility появится после создания курсов."
              />
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );

  const readinessRules = [
    ["Обложка", "Карточка выглядит полной и не теряется в списке."],
    ["Краткое описание", "Даёт быстрый контекст без открытия полного текста."],
    ["Полное описание", "Объясняет содержание и ценность курса."],
    ["Категория и уровень", "Помогают ориентироваться и фильтровать каталог."],
    ["Slug", "Нужен для стабильной ссылки и чистого URL."],
    ["Теги", "Добавляют гибкость поиска и тематическую структуру."],
    ["Требования", "Снимают вопросы о входном уровне знаний."],
    ["Результаты", "Показывают, что студент получит в конце."],
    ["Цена или free", "Карточка готова к показу без пробелов в коммерческой части."],
  ];

  const renderReadinessView = (
    <div className="space-y-6">
      <Panel
        title="Правила проверки"
        subtitle="Базовый список, по которому оценивается готовность каждой карточки."
      >
        <CompactTable
          headers={["Критерий", "Зачем нужен"]}
          rows={readinessRules.map(([label, explanation]) => [label, explanation])}
        />
      </Panel>

      <Panel
        title="Курсы и пробелы"
        subtitle="Список курсов отсортирован по уровню готовности. Чем ниже процент, тем выше смысл заняться курсом в первую очередь."
        actions={
          <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">
            issues: {formatCount(attentionRows.length)}
          </div>
        }
      >
        <CompactTable
          headers={["Курс", "Счёт", "Не хватает", "Статус", "Следующий шаг"]}
          rows={[...sortedRows]
            .sort(
              (a, b) =>
                (readinessMap.get(a.course_id)?.score ?? 0) -
                (readinessMap.get(b.course_id)?.score ?? 0),
            )
            .map((course) => {
              const readiness = readinessMap.get(course.course_id) ?? getReadiness(course);

              return [
                <button
                  key={`${course.course_id}-open`}
                  type="button"
                  className="text-left"
                  onClick={() => openCourse(course)}
                >
                  <div className="font-semibold text-zinc-950">{course.title}</div>
                  <div className="mt-1 font-mono text-xs text-zinc-500">
                    {course.slug}
                  </div>
                </button>,
                <span key={`${course.course_id}-readiness`}>{readiness.score}%</span>,
                <div key={`${course.course_id}-missing`} className="max-w-sm leading-6">
                  {readiness.missing.length
                    ? readiness.missing.join(", ")
                    : "Все ключевые поля заполнены."}
                </div>,
                <MonoPill
                  key={`${course.course_id}-status`}
                  className={STATUS_META[course.lifecycle_status].className}
                >
                  {STATUS_META[course.lifecycle_status].label}
                </MonoPill>,
                <div key={`${course.course_id}-next`} className="max-w-md leading-6">
                  {getNextStep(course, readiness.score, readiness.missing)}
                </div>,
              ];
            })}
          emptyLabel="Когда появятся курсы, здесь сформируется проверочный список."
        />
      </Panel>
    </div>
  );

  return (
    <>
      <div className="space-y-6 bg-white p-6 text-zinc-900">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
              Teacher Courses
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
              {meta.title}
            </h1>
            <p className="max-w-4xl text-sm leading-6 text-zinc-600">
              {meta.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              asChild
              className="rounded-none bg-zinc-900 text-white hover:bg-zinc-800"
            >
              <Link href="/dashboard/teacher/courses/create">Создать курс</Link>
            </Button>

            <Button
              variant="outline"
              className="rounded-none border-zinc-300"
              onClick={() => void load({ background: true })}
              disabled={loading || refreshing}
            >
              <RefreshCw
                className={cn("h-4 w-4", refreshing && "animate-spin")}
              />
              {refreshing ? "Обновляем..." : "Обновить"}
            </Button>
          </div>
        </div>

        {error ? (
          <div className="border border-zinc-900 bg-zinc-100 px-4 py-3 text-sm text-zinc-900">
            {error}
          </div>
        ) : null}

        {loading ? (
          <TeacherCourseMetricGridSkeleton />
        ) : (
          <div className="grid gap-px border border-zinc-300 bg-zinc-300 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCell
              label="Всего курсов"
              value={formatCount(rows.length)}
              note="Весь каталог преподавателя в одном месте."
            />
            <MetricCell
              label="Готовы к отправке"
              value={formatCount(readyToSubmitCount)}
              note="Карточки без базовых пробелов, которые можно продвигать дальше."
            />
            <MetricCell
              label="На модерации"
              value={formatCount(statusCounts.submitted)}
              note="Курсы, которые сейчас ждут решения администратора."
            />
            <MetricCell
              label="Public / Private"
              value={`${formatCount(publicCount)} / ${formatCount(privateCount)}`}
              note="Баланс видимых и внутренних курсов."
            />
            <MetricCell
              label="Средняя готовность"
              value={`${averageReadiness}%`}
              note="Суммарный индикатор качества наполнения карточек."
            />
          </div>
        )}

        {mode === "workspace" ? renderWorkspaceView : null}
        {mode === "pipeline" ? renderPipelineView : null}
        {mode === "insights" ? renderInsightsView : null}
        {mode === "readiness" ? renderReadinessView : null}
      </div>

      <CourseDetailsDialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            closeCourse();
          }
        }}
        course={active}
        footer={
          active ? (
            <div className="flex w-full flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                Курс: {active.course_id.slice(0, 8)}...
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  className="rounded-none border-zinc-300"
                  onClick={() => void deleteCourse(active.course_id)}
                  disabled={
                    pendingCourseId === active.course_id &&
                    pendingAction === "delete"
                  }
                >
                  {pendingCourseId === active.course_id &&
                  pendingAction === "delete"
                    ? "Удаляем..."
                    : "Удалить"}
                </Button>

                {(active.lifecycle_status === "draft" ||
                  active.lifecycle_status === "rejected") && (
                  <Button
                    variant="outline"
                    className="rounded-none border-zinc-300"
                    onClick={() => openCourseEditor(active.course_id)}
                  >
                    Редактировать
                  </Button>
                )}

                <Button
                  className="rounded-none bg-zinc-900 text-white hover:bg-zinc-800"
                  onClick={() => void submitCourse(active.course_id)}
                  disabled={
                    (active.lifecycle_status !== "draft" &&
                      active.lifecycle_status !== "rejected") ||
                    (pendingCourseId === active.course_id &&
                      pendingAction === "submit")
                  }
                >
                  {pendingCourseId === active.course_id &&
                  pendingAction === "submit"
                    ? "Отправляем..."
                    : "На модерацию"}
                </Button>
              </div>
            </div>
          ) : null
        }
      />
    </>
  );
}
