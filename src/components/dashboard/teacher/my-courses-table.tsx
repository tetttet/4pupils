"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  getUserFacingErrorMessage,
  toUserFacingErrorMessage,
} from "@/lib/error-messages";
import type { ApiErr, ApiOk, Course } from "@/types/course";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CourseDetailsDialog from "@/components/dashboard/teacher/course-details-dialog";

function fmtDate(v?: string | null) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleDateString();
  } catch {
    return v;
  }
}

async function readJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/** ---------- UI helpers (styles only) ---------- */

function statusMeta(s: Course["lifecycle_status"]): {
  label: string;
  className: string;
} {
  // Only Tailwind classes — no logic change elsewhere
  switch (s) {
    case "draft":
      return {
        label: "draft",
        className:
          "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200",
      };
    case "submitted":
      return {
        label: "submitted",
        className:
          "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-sky-200",
      };
    case "approved":
      return {
        label: "approved",
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200",
      };
    case "rejected":
      return {
        label: "rejected",
        className:
          "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200",
      };
    case "archived":
      return {
        label: "archived",
        className:
          "border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-200",
      };
    default:
      return {
        label: String(s),
        className:
          "border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-200",
      };
  }
}

function visibilityMeta(v: Course["visibility"]): {
  label: string;
  className: string;
} {
  switch (v) {
    case "public":
      return {
        label: "public",
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200",
      };
    case "private":
      return {
        label: "private",
        className:
          "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-200",
      };
    default:
      return {
        label: String(v),
        className:
          "border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-200",
      };
  }
}

export default function MyCoursesTable() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<Course[]>([]);

  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<Course | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await apiFetch("/api/courses/my");
      const json = (await readJsonSafe(res)) as ApiOk<Course[]> | ApiErr | null;

      if (!res.ok) {
        const msg = toUserFacingErrorMessage(
          (json as ApiErr | null)?.error?.message,
          "Не удалось загрузить курсы",
          {
            code: (json as ApiErr | null)?.error?.code,
            status: res.status,
          },
        );
        setErr(msg);
        return;
      }

      const data = (json as ApiOk<Course[]>)?.data ?? [];
      setRows(data);
    } catch (e: unknown) {
      setErr(getUserFacingErrorMessage(e, "Не удалось загрузить курсы"));
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, []);

  async function submitCourse(courseId: string) {
    setErr(null);
    const res = await apiFetch(`/api/courses/${courseId}/submit`, {
      method: "POST",
    });
    if (!res.ok) {
      const json = (await readJsonSafe(res)) as ApiErr | null;
      setErr(
        toUserFacingErrorMessage(
          json?.error?.message,
          "Не удалось отправить курс",
          {
            code: json?.error?.code,
            status: res.status,
          },
        ),
      );
      return;
    }
    await load();
  }

  async function deleteCourse(courseId: string) {
    setErr(null);
    const res = await apiFetch(`/api/courses/${courseId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const json = (await readJsonSafe(res)) as ApiErr | null;
      setErr(
        toUserFacingErrorMessage(
          json?.error?.message,
          "Не удалось удалить курс",
          {
            code: json?.error?.code,
            status: res.status,
          },
        ),
      );
      return;
    }
    setOpen(false);
    setActive(null);
    await load();
  }

  function openCourseEditor(courseId: string) {
    setOpen(false);
    setActive(null);
    router.push(`/dashboard/teacher/courses/${courseId}/edit`);
  }

  return (
    <>
      <Card className="overflow-hidden border-muted/60 shadow-sm">
        <CardContent className="p-0">
          {err && (
            <div className="flex items-start gap-3 border-b bg-destructive/5 p-4 text-sm text-destructive">
              <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-destructive" />
              <div className="leading-relaxed">{err}</div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 border-b bg-background/70 text-left backdrop-blur supports-backdrop-filter:bg-background/60">
                <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="p-4">Курсы</th>
                  <th className="p-4">Название</th>
                  <th className="p-4">Статус</th>
                  <th className="p-4">Видимость</th>
                  <th className="p-4">Обновлено</th>
                  <th className="p-4 text-right">Действия</th>
                </tr>
              </thead>

              <tbody className="[&_tr:last-child]:border-b-0">
                {loading ? (
                  <tr className="border-b">
                    <td className="p-6" colSpan={6}>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
                        <span>Загрузка…</span>
                      </div>
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr className="border-b">
                    <td className="p-10 text-center" colSpan={6}>
                      <div className="mx-auto max-w-md">
                        <div className="text-base font-medium">
                          Пока нет курсов
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          Создайте курс и отправьте на модерацию — он появится в
                          списке.
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((c) => {
                    const st = statusMeta(c.lifecycle_status);
                    const vis = visibilityMeta(c.visibility);
                    const canEdit = c.lifecycle_status === "rejected";
                    const canSubmit =
                      c.lifecycle_status === "draft" ||
                      c.lifecycle_status === "rejected";

                    return (
                      <tr
                        key={c.course_id}
                        className="border-b transition-colors hover:bg-muted/30"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="relative h-14 w-24 overflow-hidden rounded-lg border bg-muted/40 shadow-sm">
                              <Image
                                src={c.image_url ?? "/placeholder.png"}
                                alt={c.title}
                                fill
                                sizes="96px"
                                className="object-cover"
                                unoptimized={false}
                                priority={false}
                              />
                            </div>

                            <div className="hidden sm:block">
                              <div className="text-xs text-muted-foreground">
                                ID
                              </div>
                              <div className="font-mono text-xs text-muted-foreground/90">
                                {c.course_id.slice(0, 8)}…
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="max-w-105">
                            <div className="truncate font-medium leading-tight">
                              {c.title}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                                {c.slug}
                              </span>

                              {c.category ? (
                                <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] text-muted-foreground">
                                  {c.category}
                                </span>
                              ) : null}

                              {c.level ? (
                                <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] text-muted-foreground">
                                  {c.level}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <Badge
                            variant="outline"
                            className={[
                              "gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium capitalize",
                              st.className,
                            ].join(" ")}
                          >
                            <span className="inline-block h-1.5 w-1.5 rounded-md bg-current opacity-70" />
                            {st.label}
                          </Badge>
                        </td>

                        <td className="p-4">
                          <Badge
                            variant="outline"
                            className={[
                              "rounded-md px-2.5 py-1 text-[11px] font-medium capitalize",
                              vis.className,
                            ].join(" ")}
                          >
                            {vis.label}
                          </Badge>
                        </td>

                        <td className="p-4 text-muted-foreground">
                          <div className="whitespace-nowrap">
                            {fmtDate(c.updated_at)}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 px-4"
                              onClick={() => {
                                setActive(c);
                                setOpen(true);
                              }}
                            >
                              Открыть
                            </Button>

                            {canEdit ? (
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="h-9 px-4"
                                onClick={() => openCourseEditor(c.course_id)}
                              >
                                Редактировать
                              </Button>
                            ) : null}

                            <Button
                              size="sm"
                              className="h-9 px-4 shadow-sm"
                              disabled={!canSubmit}
                              onClick={() => submitCourse(c.course_id)}
                            >
                              На модерацию
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

      <CourseDetailsDialog
        open={open}
        onOpenChange={setOpen}
        course={active}
        footer={
          active ? (
            <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:gap-3">
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
                <Button
                  variant="destructive"
                  className="h-10 rounded-md"
                  onClick={() => deleteCourse(active.course_id)}
                >
                  Удалить
                </Button>

                {active.lifecycle_status === "rejected" ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-10 rounded-md"
                    onClick={() => openCourseEditor(active.course_id)}
                  >
                    Редактировать
                  </Button>
                ) : null}
              </div>

              <Button
                className="h-10 rounded-md shadow-sm"
                onClick={() => submitCourse(active.course_id)}
                disabled={
                  active.lifecycle_status !== "draft" &&
                  active.lifecycle_status !== "rejected"
                }
              >
                На модерацию
              </Button>
            </div>
          ) : null
        }
      />
    </>
  );
}
