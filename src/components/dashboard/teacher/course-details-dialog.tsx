"use client";

import * as React from "react";
import { X } from "lucide-react";
import type { Course } from "@/types/course";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString("ru-RU");
  } catch {
    return value;
  }
}

function getChecklist(course: Course) {
  return [
    { label: "Обложка", value: !!course.image_url },
    { label: "Краткое описание", value: !!course.short_description?.trim() },
    { label: "Полное описание", value: !!course.description?.trim() },
    { label: "Категория", value: !!course.category },
    { label: "Уровень", value: !!course.level },
    { label: "Slug", value: !!course.slug?.trim() },
    { label: "Теги (3+)", value: (course.tags?.length ?? 0) >= 3 },
    { label: "Требования", value: (course.requirements?.length ?? 0) >= 1 },
    { label: "Результаты", value: (course.outcomes?.length ?? 0) >= 1 },
    {
      label: "Цена или free",
      value: !!course.is_free || Number(course.price ?? 0) > 0,
    },
  ];
}

function MetaTable({
  rows,
}: {
  rows: Array<{ label: string; value: React.ReactNode }>;
}) {
  return (
    <div className="overflow-x-auto border border-zinc-300">
      <table className="w-full text-sm">
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.label}
              className="border-b border-zinc-200 last:border-b-0"
            >
              <td className="w-48 border-r border-zinc-200 bg-zinc-100 px-3 py-2.5 text-xs uppercase tracking-[0.14em] text-zinc-500">
                {row.label}
              </td>
              <td className="px-3 py-2.5 text-zinc-800">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
        {title}
      </div>
      {children}
    </section>
  );
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
        "inline-flex items-center border px-2 py-1 text-[11px] font-medium uppercase tracking-[0.14em]",
        className,
      )}
    >
      {children}
    </span>
  );
}

export default function CourseDetailsDialog({
  open,
  onOpenChange,
  course,
  footer,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  course: Course | null;
  footer?: React.ReactNode;
}) {
  const checklist = course ? getChecklist(course) : [];
  const completedChecklist = checklist.filter((item) => item.value).length;
  const checklistScore = course
    ? Math.round((completedChecklist / checklist.length) * 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "left-auto right-0 top-0 h-screen w-full min-w-[60vw] translate-x-0 translate-y-0 gap-0 rounded-none border-y-0 border-r-0 border-l border-zinc-300 bg-white p-0 shadow-2xl duration-300",
          "data-[state=open]:slide-in-from-right-8 data-[state=closed]:slide-out-to-right-8",
        )}
      >
        {!course ? (
          <div className="flex h-full items-center justify-center p-8 text-sm text-zinc-500">
            Нет данных по курсу.
          </div>
        ) : (
          <div className="flex h-full min-h-0 flex-col bg-white text-zinc-900">
            <div className="border-b border-zinc-300 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-2">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                    Course Workspace
                  </div>
                  <DialogTitle asChild>
                    <h2 className="truncate text-2xl font-semibold tracking-tight text-zinc-950">
                      {course.title}
                    </h2>
                  </DialogTitle>
                  <div className="font-mono text-xs text-zinc-500">
                    {course.slug}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="flex flex-wrap justify-end gap-2">
                    <MonoPill className="border-zinc-900 bg-zinc-900 text-white">
                      {course.lifecycle_status}
                    </MonoPill>
                    <MonoPill className="border-zinc-300 bg-white text-zinc-700">
                      {course.visibility}
                    </MonoPill>
                    <MonoPill className="border-zinc-300 bg-white text-zinc-700">
                      {checklistScore}%
                    </MonoPill>
                  </div>

                  <DialogClose asChild>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="rounded-none border-zinc-300"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Закрыть</span>
                    </Button>
                  </DialogClose>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="grid min-h-full lg:grid-cols-[320px_minmax(0,1fr)]">
                <aside className="border-b border-zinc-300 bg-zinc-50 p-5 lg:border-b-0 lg:border-r">
                  <div className="space-y-5">
                    <div className="overflow-hidden border border-zinc-300 bg-white">
                      {course.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={course.image_url}
                          alt={course.title}
                          className="h-44 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-44 items-center justify-center text-sm text-zinc-500">
                          Нет обложки
                        </div>
                      )}
                    </div>

                    <Block title="Краткая сводка">
                      <MetaTable
                        rows={[
                          {
                            label: "Категория",
                            value: course.category || "—",
                          },
                          {
                            label: "Уровень",
                            value: course.level || "—",
                          },
                          {
                            label: "Язык",
                            value: course.language || "—",
                          },
                          {
                            label: "Цена",
                            value: course.is_free
                              ? "Free"
                              : `${course.price ?? "—"} ${course.currency ?? ""}`.trim(),
                          },
                        ]}
                      />
                    </Block>

                    <Block title="Чек-лист карточки">
                      <div className="overflow-hidden border border-zinc-300 bg-white">
                        <table className="w-full text-sm">
                          <tbody>
                            {checklist.map((item) => (
                              <tr
                                key={item.label}
                                className="border-b border-zinc-200 last:border-b-0"
                              >
                                <td className="px-3 py-2.5 text-zinc-800">
                                  {item.label}
                                </td>
                                <td className="w-20 px-3 py-2.5 text-right">
                                  <MonoPill
                                    className={
                                      item.value
                                        ? "border-zinc-900 bg-zinc-900 text-white"
                                        : "border-zinc-300 bg-white text-zinc-500"
                                    }
                                  >
                                    {item.value ? "ok" : "нет"}
                                  </MonoPill>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Block>

                    <Block title="Теги">
                      <div className="flex flex-wrap gap-2 border border-zinc-300 bg-white p-3">
                        {(course.tags || []).length ? (
                          course.tags.map((tag) => (
                            <MonoPill
                              key={tag}
                              className="border-zinc-300 bg-white text-zinc-700"
                            >
                              {tag}
                            </MonoPill>
                          ))
                        ) : (
                          <div className="text-sm text-zinc-500">
                            Теги не указаны.
                          </div>
                        )}
                      </div>
                    </Block>
                  </div>
                </aside>

                <div className="space-y-6 p-5">
                  <Block title="Паспорт курса">
                    <MetaTable
                      rows={[
                        {
                          label: "ID",
                          value: (
                            <span className="font-mono text-xs text-zinc-600">
                              {course.course_id}
                            </span>
                          ),
                        },
                        {
                          label: "Автор",
                          value: (
                            <span className="font-mono text-xs text-zinc-600">
                              {course.user_id}
                            </span>
                          ),
                        },
                        { label: "Slug", value: course.slug },
                        { label: "Visibility", value: course.visibility },
                        { label: "Lifecycle", value: course.lifecycle_status },
                        {
                          label: "Published",
                          value: formatDateTime(course.published_at),
                        },
                      ]}
                    />
                  </Block>

                  <Block title="Описание">
                    <div className="overflow-hidden border border-zinc-300 bg-white">
                      <div className="border-b border-zinc-300 bg-zinc-100 px-3 py-2 text-xs uppercase tracking-[0.14em] text-zinc-500">
                        Short Description
                      </div>
                      <div className="px-3 py-3 text-sm leading-6 text-zinc-700">
                        {course.short_description || "—"}
                      </div>
                      <div className="border-y border-zinc-300 bg-zinc-100 px-3 py-2 text-xs uppercase tracking-[0.14em] text-zinc-500">
                        Full Description
                      </div>
                      <div className="px-3 py-3 text-sm leading-6 text-zinc-700">
                        {course.description || "—"}
                      </div>
                    </div>
                  </Block>

                  <div className="grid gap-6 xl:grid-cols-2">
                    <Block title="Требования">
                      <div className="overflow-hidden border border-zinc-300 bg-white">
                        <table className="w-full text-sm">
                          <tbody>
                            {(course.requirements || []).length ? (
                              course.requirements.map((item, index) => (
                                <tr
                                  key={`${item}-${index}`}
                                  className="border-b border-zinc-200 last:border-b-0"
                                >
                                  <td className="w-14 border-r border-zinc-200 bg-zinc-100 px-3 py-2.5 text-xs uppercase tracking-[0.14em] text-zinc-500">
                                    {index + 1}
                                  </td>
                                  <td className="px-3 py-2.5 leading-6 text-zinc-700">
                                    {item}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td className="px-3 py-4 text-zinc-500">
                                  Требования не указаны.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </Block>

                    <Block title="Результаты">
                      <div className="overflow-hidden border border-zinc-300 bg-white">
                        <table className="w-full text-sm">
                          <tbody>
                            {(course.outcomes || []).length ? (
                              course.outcomes.map((item, index) => (
                                <tr
                                  key={`${item}-${index}`}
                                  className="border-b border-zinc-200 last:border-b-0"
                                >
                                  <td className="w-14 border-r border-zinc-200 bg-zinc-100 px-3 py-2.5 text-xs uppercase tracking-[0.14em] text-zinc-500">
                                    {index + 1}
                                  </td>
                                  <td className="px-3 py-2.5 leading-6 text-zinc-700">
                                    {item}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td className="px-3 py-4 text-zinc-500">
                                  Результаты не указаны.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </Block>
                  </div>

                  <Block title="Даты и модерация">
                    <MetaTable
                      rows={[
                        {
                          label: "Создан",
                          value: formatDateTime(course.created_at),
                        },
                        {
                          label: "Обновлён",
                          value: formatDateTime(course.updated_at),
                        },
                        {
                          label: "Отправлен",
                          value: formatDateTime(course.submitted_at),
                        },
                        {
                          label: "Проверен",
                          value: formatDateTime(course.reviewed_at),
                        },
                        {
                          label: "Кем проверен",
                          value: course.reviewed_by || "—",
                        },
                      ]}
                    />
                  </Block>

                  {course.review_notes ? (
                    <Block title="Комментарий модерации">
                      <div className="border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm leading-6 text-zinc-700">
                        {course.review_notes}
                      </div>
                    </Block>
                  ) : null}
                </div>
              </div>
            </div>

            {footer ? (
              <div className="border-t border-zinc-300 bg-white px-5 py-4">
                {footer}
              </div>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
