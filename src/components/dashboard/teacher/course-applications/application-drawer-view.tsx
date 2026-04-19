"use client";

import { Mail, User2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Course } from "@/types/course";
import type { CourseApplication } from "@/types/course-application";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  APPLICATION_STATUS_META,
  COURSE_STATUS_META,
  COURSE_VISIBILITY_META,
  ENROLLMENT_STATUS_LABELS,
} from "./constants";
import {
  ApplicationStatusBadge,
  CourseMetaBadge,
  LinkField,
} from "./shared";
import type { ApplicationWorkflowAction } from "./types";
import { formatDate, formatDateTime, getApplicantName } from "./utils";

export default function ApplicationDrawerView({
  course,
  application,
  relatedApplications,
  reviewNote,
  internalNote,
  notesLocked,
  pendingAction,
  actionError,
  onReviewNoteChange,
  onInternalNoteChange,
  onOpenCourse,
  onOpenApplication,
}: {
  course: Course;
  application: CourseApplication;
  relatedApplications: CourseApplication[];
  reviewNote: string;
  internalNote: string;
  notesLocked: boolean;
  pendingAction: ApplicationWorkflowAction | null;
  actionError: string | null;
  onReviewNoteChange: (value: string) => void;
  onInternalNoteChange: (value: string) => void;
  onOpenCourse: () => void;
  onOpenApplication: (applicationId: string) => void;
}) {
  const statusMeta = APPLICATION_STATUS_META[application.status];
  const otherApplications = relatedApplications.filter(
    (item) => item.application_id !== application.application_id,
  );

  return (
    <div className="grid min-h-full xl:grid-cols-[350px_minmax(0,1fr)]">
      <aside className="border-b border-zinc-300 bg-zinc-50 p-5 xl:border-r xl:border-b-0">
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="inline-flex h-11 w-11 items-center justify-center border border-zinc-300 bg-white text-zinc-700">
              <User2 className="h-4 w-4" />
            </div>

            <div>
              <div className="text-sm font-semibold text-zinc-950">
                {getApplicantName(application)}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                {application.applicant_email ? (
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {application.applicant_email}
                  </span>
                ) : (
                  <span>Почта не указана</span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <ApplicationStatusBadge status={application.status} />
              {application.enrollment_status ? (
                <Badge
                  variant="outline"
                  className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-[11px] text-zinc-700"
                >
                  {ENROLLMENT_STATUS_LABELS[application.enrollment_status]}
                </Badge>
              ) : null}
            </div>
          </div>

          <div className="space-y-3 border border-zinc-200 bg-white p-4">
            <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              Ключевые даты
            </div>

            <div className="grid gap-3 text-sm text-zinc-700">
              <div className="flex items-start justify-between gap-3">
                <span className="text-zinc-500">Отправлена</span>
                <span className="text-right font-medium">
                  {formatDateTime(application.created_at)}
                </span>
              </div>

              <div className="flex items-start justify-between gap-3">
                <span className="text-zinc-500">Обновлена</span>
                <span className="text-right font-medium">
                  {formatDateTime(application.updated_at)}
                </span>
              </div>

              <div className="flex items-start justify-between gap-3">
                <span className="text-zinc-500">Решение</span>
                <span className="text-right font-medium">
                  {formatDate(application.reviewed_at)}
                </span>
              </div>

              <div className="flex items-start justify-between gap-3">
                <span className="text-zinc-500">ID заявки</span>
                <span className="text-right font-mono text-xs">
                  {application.application_id}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 border border-zinc-200 bg-white p-4">
            <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              Курс
            </div>

            <div>
              <div className="font-semibold text-zinc-950">{course.title}</div>
              <div className="mt-1 font-mono text-xs text-zinc-500">
                {course.slug}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <CourseMetaBadge
                className={COURSE_STATUS_META[course.lifecycle_status].className}
              >
                {COURSE_STATUS_META[course.lifecycle_status].label}
              </CourseMetaBadge>

              <CourseMetaBadge
                className={COURSE_VISIBILITY_META[course.visibility].className}
              >
                {COURSE_VISIBILITY_META[course.visibility].label}
              </CourseMetaBadge>
            </div>

            <Button type="button" variant="outline" size="sm" onClick={onOpenCourse}>
              Открыть курс в sidebar
            </Button>
          </div>

          <div className="space-y-3">
            <LinkField label="Портфолио" href={application.portfolio_url} />
            <LinkField label="Резюме" href={application.resume_url} />
          </div>
        </div>
      </aside>

      <div className="min-h-0 space-y-6 p-5">
        <section className="space-y-3">
          <div className="text-sm font-semibold text-zinc-950">
            Что написал студент
          </div>
          <p className="text-sm leading-6 text-zinc-600">{statusMeta.description}</p>

          <div className="grid gap-4 xl:grid-cols-3">
            <div className="border border-zinc-200 bg-white p-4">
              <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Сообщение
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
                {application.message?.trim() ||
                  "Студент оставил заявку без отдельного сообщения."}
              </p>
            </div>

            <div className="border border-zinc-200 bg-white p-4">
              <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Опыт
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
                {application.experience_text?.trim() || "Опыт не описан."}
              </p>
            </div>

            <div className="border border-zinc-200 bg-white p-4">
              <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Мотивация
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
                {application.motivation_text?.trim() || "Мотивация не указана."}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="text-sm font-semibold text-zinc-950">
            Решение преподавателя
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="border border-zinc-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                  Комментарий для решения
                </div>
                <div className="text-xs text-zinc-400">
                  {reviewNote.trim().length} символов
                </div>
              </div>

              <Textarea
                value={reviewNote}
                onChange={(event) => onReviewNoteChange(event.target.value)}
                readOnly={notesLocked}
                disabled={pendingAction !== null}
                placeholder="Напишите понятный комментарий: почему принимаете, что делать дальше или почему заявка отклоняется."
                className={cn("mt-3 min-h-32 resize-y", notesLocked && "bg-zinc-50")}
              />
            </div>

            <div className="border border-zinc-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                  Внутренняя заметка
                </div>
                <div className="text-xs text-zinc-400">
                  {internalNote.trim().length} символов
                </div>
              </div>

              <Textarea
                value={internalNote}
                onChange={(event) => onInternalNoteChange(event.target.value)}
                readOnly={notesLocked}
                disabled={pendingAction !== null}
                placeholder="Любая внутренняя заметка: на что обратить внимание, что проверить позже, какие материалы пришли."
                className={cn("mt-3 min-h-32 resize-y", notesLocked && "bg-zinc-50")}
              />
            </div>
          </div>

          {actionError ? (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {actionError}
            </div>
          ) : null}
        </section>

        {otherApplications.length > 0 ? (
          <section className="space-y-3">
            <div className="text-sm font-semibold text-zinc-950">
              Другие заявки по этому курсу
            </div>

            <div className="overflow-x-auto border border-zinc-300">
              <table className="w-full min-w-[680px] text-sm">
                <thead className="bg-zinc-100 text-left">
                  <tr className="border-b border-zinc-300 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
                    <th className="px-4 py-3">Студент</th>
                    <th className="px-4 py-3">Статус</th>
                    <th className="px-4 py-3">Обновлена</th>
                    <th className="px-4 py-3 text-right">Открыть</th>
                  </tr>
                </thead>

                <tbody>
                  {otherApplications.map((item) => (
                    <tr
                      key={item.application_id}
                      className="border-b border-zinc-200 last:border-b-0 hover:bg-zinc-50"
                    >
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="font-medium text-zinc-950">
                            {getApplicantName(item)}
                          </div>
                          <div className="text-sm text-zinc-500">
                            {item.applicant_email || "Почта не указана"}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <ApplicationStatusBadge status={item.status} />
                      </td>

                      <td className="px-4 py-4 text-zinc-700">
                        {formatDateTime(item.updated_at)}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onOpenApplication(item.application_id)}
                        >
                          Открыть
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
