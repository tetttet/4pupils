"use client";

import * as React from "react";
import { Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { Course, CourseLifecycle } from "@/types/course";
import { cn } from "@/lib/utils";
import {
  fetchModerationCourses,
  getAvailableModerationActions,
  getModerationSuccessMessage,
  MODERATION_STATUSES,
  runModerationAction,
  type ModerationAction,
  type ModerationVisibilityFilter,
} from "@/services/course-moderation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import CourseDetailsDialog from "@/components/dashboard/teacher/course-details-dialog";
import AdminCourseActions from "@/components/dashboard/admin/courses/admin-course-actions";

const STATUS_META: Record<
  CourseLifecycle,
  {
    label: string;
    badgeClassName: string;
    emptyTitle: string;
    emptyDescription: string;
  }
> = {
  submitted: {
    label: "На проверке",
    badgeClassName:
      "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-sky-200",
    emptyTitle: "В очереди модерации пока пусто",
    emptyDescription:
      "Когда преподаватели отправят курсы на проверку, они появятся здесь.",
  },
  approved: {
    label: "Одобрено",
    badgeClassName:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200",
    emptyTitle: "Одобренных курсов не найдено",
    emptyDescription: "Пока ни один курс не находится в статусе approved.",
  },
  rejected: {
    label: "Отклонено",
    badgeClassName:
      "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200",
    emptyTitle: "Отклонённых курсов нет",
    emptyDescription:
      "Курсы со статусом rejected появятся здесь после решения модератора.",
  },
  archived: {
    label: "Архив",
    badgeClassName:
      "border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-200",
    emptyTitle: "Архив пока пуст",
    emptyDescription: "Архивированные курсы будут собираться в этом разделе.",
  },
  draft: {
    label: "Черновики",
    badgeClassName:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200",
    emptyTitle: "Черновиков нет",
    emptyDescription:
      "Курсы в статусе draft пока не найдены в moderation-потоке.",
  },
};

const VISIBILITY_META: Record<
  Course["visibility"],
  { label: string; badgeClassName: string }
> = {
  public: {
    label: "public",
    badgeClassName:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200",
  },
  private: {
    label: "private",
    badgeClassName:
      "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-200",
  },
};

function fmtDate(value?: string | null) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function matchesSearch(course: Course, query: string) {
  if (!query) return true;

  const haystack = [
    course.title,
    course.slug,
    course.user_id,
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

function reconcileRows(
  currentRows: Course[],
  nextCourse: Course,
  activeStatus: CourseLifecycle,
) {
  const nextRows = currentRows.filter(
    (course) => course.course_id !== nextCourse.course_id,
  );

  if (nextCourse.lifecycle_status !== activeStatus) {
    return nextRows;
  }

  const currentIndex = currentRows.findIndex(
    (course) => course.course_id === nextCourse.course_id,
  );

  if (currentIndex === -1) {
    return [nextCourse, ...nextRows];
  }

  nextRows.splice(currentIndex, 0, nextCourse);
  return nextRows;
}

export default function ModerationQueue() {
  const [status, setStatus] = React.useState<CourseLifecycle>("submitted");
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<Course[]>([]);

  const [query, setQuery] = React.useState("");
  const deferredQuery = React.useDeferredValue(query);
  const [visibilityFilter, setVisibilityFilter] =
    React.useState<ModerationVisibilityFilter>("all");

  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<Course | null>(null);
  const [pendingAction, setPendingAction] =
    React.useState<ModerationAction | null>(null);
  const [pendingCourseId, setPendingCourseId] = React.useState<string | null>(
    null,
  );
  const [lastLoadedAt, setLastLoadedAt] = React.useState<string | null>(null);
  const [isUiTransitionPending, startTransition] = React.useTransition();

  const requestIdRef = React.useRef(0);

  async function load(
    targetStatus: CourseLifecycle,
    options: { background?: boolean } = {},
  ) {
    const requestId = ++requestIdRef.current;
    const isBackgroundRefresh = !!options.background && rows.length > 0;

    if (isBackgroundRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    if (!options.background) {
      setErr(null);
    }

    try {
      const nextRows = await fetchModerationCourses(targetStatus);

      if (requestId !== requestIdRef.current) {
        return;
      }

      const nextActive = active
        ? nextRows.find((course) => course.course_id === active.course_id) ?? null
        : null;

      startTransition(() => {
        setRows(nextRows);
        setActive(nextActive);
      });

      if (active && !nextActive) {
        setOpen(false);
        setActionError(null);
      }

      setErr(null);
      setLastLoadedAt(new Date().toISOString());
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      const message =
        error instanceof Error ? error.message : "Не удалось загрузить модерацию";

      setErr(message);

      if (!options.background) {
        setRows([]);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }

  React.useEffect(() => {
    setOpen(false);
    setActive(null);
    setActionError(null);
    void load(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const filteredRows = rows.filter((course) => {
    if (visibilityFilter !== "all" && course.visibility !== visibilityFilter) {
      return false;
    }

    return matchesSearch(course, normalizedQuery);
  });

  const statusMeta = STATUS_META[status];
  const publicCount = rows.filter((course) => course.visibility === "public").length;
  const privateCount = rows.length - publicCount;
  const reviewedCount = rows.filter((course) => !!course.reviewed_at).length;
  const hasFilters = visibilityFilter !== "all" || query.trim().length > 0;

  async function performModerationAction(
    course: Course,
    action: ModerationAction,
    notes: string,
  ) {
    const isActiveCourse = active?.course_id === course.course_id;

    if (isActiveCourse) {
      setActionError(null);
    }

    setPendingAction(action);
    setPendingCourseId(course.course_id);

    try {
      const updatedCourse = await runModerationAction(course, action, notes);

      startTransition(() => {
        setRows((currentRows) => reconcileRows(currentRows, updatedCourse, status));
        setActive((currentActive) => {
          if (!currentActive || currentActive.course_id !== updatedCourse.course_id) {
            return currentActive;
          }

          return updatedCourse;
        });
      });

      toast.success(getModerationSuccessMessage(action));

      if (updatedCourse.lifecycle_status !== status) {
        if (isActiveCourse) {
          setOpen(false);
          setActive(null);
        }
      }

      void load(status, { background: true });
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Не удалось обновить курс";

      if (isActiveCourse) {
        setActionError(message);
      }

      toast.error(message);
      return false;
    } finally {
      setPendingAction(null);
      setPendingCourseId(null);
    }
  }

  async function handleAction(action: ModerationAction, notes: string) {
    if (!active) {
      return false;
    }

    return performModerationAction(active, action, notes);
  }

  return (
    <>
      <div className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="flex flex-wrap items-center gap-2">
            {MODERATION_STATUSES.map((nextStatus) => {
              const meta = STATUS_META[nextStatus];

              return (
                <Button
                  key={nextStatus}
                  variant={status === nextStatus ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatus(nextStatus)}
                  disabled={loading && status === nextStatus}
                >
                  {meta.label}
                </Button>
              );
            })}
          </div>

          <div className="flex items-center justify-start gap-2 lg:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void load(status, { background: true })}
              disabled={loading || refreshing}
            >
              <RefreshCw
                className={cn("mr-2 h-4 w-4", refreshing && "animate-spin")}
              />
              {refreshing ? "Обновляем..." : "Обновить"}
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border bg-card p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Текущий поток
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn("rounded-md px-2.5 py-1", statusMeta.badgeClassName)}
              >
                {statusMeta.label}
              </Badge>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Загружено
            </div>
            <div className="mt-2 text-2xl font-semibold">{rows.length}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              reviewed: {reviewedCount}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              После фильтров
            </div>
            <div className="mt-2 text-2xl font-semibold">{filteredRows.length}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {hasFilters ? "Активные фильтры применены" : "Показываем весь поток"}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Видимость
            </div>
            <div className="mt-2 text-2xl font-semibold">
              {publicCount} / {privateCount}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              public / private
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Поиск по названию, slug, автору, тегам и review notes"
                  className="pl-9"
                />
              </div>

              <Select
                value={visibilityFilter}
                onValueChange={(value) =>
                  setVisibilityFilter(value as ModerationVisibilityFilter)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Видимость" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все visibility</SelectItem>
                  <SelectItem value="public">Только public</SelectItem>
                  <SelectItem value="private">Только private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <div>
                {lastLoadedAt
                  ? `Последнее обновление: ${fmtDate(lastLoadedAt)}`
                  : "Очередь модерации ещё не загружалась"}
              </div>
              <div>
                {isUiTransitionPending
                  ? "Синхронизируем интерфейс..."
                  : "Локальное обновление включено"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {err ? (
              <div className="border-b p-4 text-sm text-destructive">{err}</div>
            ) : null}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40 text-left">
                  <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="p-4">Курс</th>
                    <th className="p-4">Состояние</th>
                    <th className="p-4">Даты</th>
                    <th className="p-4 text-right">Действия</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td className="p-6 text-muted-foreground" colSpan={4}>
                        Загружаем очередь модерации…
                      </td>
                    </tr>
                  ) : filteredRows.length === 0 ? (
                    <tr>
                      <td className="p-8" colSpan={4}>
                        <div className="mx-auto max-w-lg text-center">
                          <div className="text-base font-medium">
                            {rows.length === 0 || !hasFilters
                              ? statusMeta.emptyTitle
                              : "По фильтрам ничего не найдено"}
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            {rows.length === 0 || !hasFilters
                              ? statusMeta.emptyDescription
                              : "Сбрось поиск или visibility-фильтр и попробуй снова."}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((course) => {
                      const courseStatusMeta = STATUS_META[course.lifecycle_status];
                      const visibilityMeta = VISIBILITY_META[course.visibility];
                      const availableActions = getAvailableModerationActions(course);
                      const canApprove = availableActions.includes("approve");
                      const isPendingCourse =
                        pendingCourseId === course.course_id && pendingAction !== null;
                      const isApprovePending =
                        pendingCourseId === course.course_id &&
                        pendingAction === "approve";

                      return (
                        <tr
                          key={course.course_id}
                          className="border-b align-top transition-colors hover:bg-muted/25"
                        >
                          <td className="p-4">
                            <div className="space-y-2">
                              <div className="font-medium leading-tight">
                                {course.title}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                <span className="font-mono">{course.slug}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span>author: {course.user_id}</span>
                                {course.category ? <span>{course.category}</span> : null}
                                {course.level ? <span>{course.level}</span> : null}
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-2">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "rounded-md px-2.5 py-1 text-[11px] font-medium",
                                    courseStatusMeta.badgeClassName,
                                  )}
                                >
                                  {courseStatusMeta.label}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "rounded-md px-2.5 py-1 text-[11px] font-medium",
                                    visibilityMeta.badgeClassName,
                                  )}
                                >
                                  {visibilityMeta.label}
                                </Badge>
                              </div>

                              <div className="max-w-md text-xs leading-relaxed text-muted-foreground">
                                {course.review_notes ? (
                                  <span className="line-clamp-2">
                                    {course.review_notes}
                                  </span>
                                ) : (
                                  "Комментарий модератора пока не добавлен."
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="p-4 text-xs text-muted-foreground">
                            <div className="space-y-2">
                              <div>submitted: {fmtDate(course.submitted_at)}</div>
                              <div>reviewed: {fmtDate(course.reviewed_at)}</div>
                              <div>updated: {fmtDate(course.updated_at)}</div>
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="flex justify-end gap-2">
                              {canApprove ? (
                                <Button
                                  size="sm"
                                  disabled={isPendingCourse}
                                  onClick={() =>
                                    void performModerationAction(
                                      course,
                                      "approve",
                                      course.review_notes || "",
                                    )
                                  }
                                >
                                  {isApprovePending ? "Одобряем..." : "Approve"}
                                </Button>
                              ) : null}
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isPendingCourse}
                                onClick={() => {
                                  setActionError(null);
                                  setActive(course);
                                  setOpen(true);
                                }}
                              >
                                {isPendingCourse ? "Обновляем..." : "Открыть"}
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
          </CardContent>
        </Card>
      </div>

      <CourseDetailsDialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setActive(null);
            setActionError(null);
          }
        }}
        course={active}
        footer={
          active ? (
            <AdminCourseActions
              course={active}
              pendingAction={
                pendingCourseId === active.course_id ? pendingAction : null
              }
              error={actionError}
              onAction={handleAction}
            />
          ) : null
        }
      />
    </>
  );
}
