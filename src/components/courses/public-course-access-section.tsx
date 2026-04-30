"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  Clock3Icon,
  FileTextIcon,
  GraduationCapIcon,
  XCircleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getUserFacingErrorMessage } from "@/lib/error-messages";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/course";
import type {
  CourseApplication,
  CourseApplicationStatus,
} from "@/types/course-application";
import type { User } from "@/types/user";
import { CourseApplicationsAPI } from "@/services/course-application";

type Props = {
  course: Course;
  viewer: User | null;
  initialApplications: CourseApplication[];
  signInHref: string;
  signUpHref: string;
};

const APPLICATION_STATUS_META: Record<
  CourseApplicationStatus,
  {
    label: string;
    badgeClassName: string;
    panelClassName: string;
    description: string;
    Icon: React.ComponentType<{ className?: string }>;
  }
> = {
  pending: {
    label: "На рассмотрении",
    badgeClassName:
      "border-amber-200 bg-amber-50 text-amber-700 shadow-[inset_0_0_0_1px_rgba(251,191,36,0.1)]",
    panelClassName: "border-amber-200/70 bg-amber-50/80",
    description: "Заявка отправлена. Как только преподаватель посмотрит её, статус обновится здесь.",
    Icon: Clock3Icon,
  },
  reviewing: {
    label: "Смотрят сейчас",
    badgeClassName:
      "border-sky-200 bg-sky-50 text-sky-700 shadow-[inset_0_0_0_1px_rgba(56,189,248,0.1)]",
    panelClassName: "border-sky-200/70 bg-sky-50/80",
    description: "Курс уже в работе у команды. Можно следить за статусом прямо на этой странице.",
    Icon: FileTextIcon,
  },
  approved: {
    label: "Принята",
    badgeClassName:
      "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.1)]",
    panelClassName: "border-emerald-200/70 bg-emerald-50/80",
    description: "Доступ подтверждён. Если курс уже подключён к вашему аккаунту, можно переходить к урокам.",
    Icon: CheckCircle2Icon,
  },
  rejected: {
    label: "Не принята",
    badgeClassName:
      "border-rose-200 bg-rose-50 text-rose-700 shadow-[inset_0_0_0_1px_rgba(244,63,94,0.1)]",
    panelClassName: "border-rose-200/70 bg-rose-50/80",
    description: "Заявка отклонена. Причина и комментарий преподавателя, если он оставлен, показаны ниже.",
    Icon: XCircleIcon,
  },
  withdrawn: {
    label: "Отозвана",
    badgeClassName:
      "border-slate-200 bg-slate-100 text-slate-700 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.1)]",
    panelClassName: "border-slate-200/70 bg-slate-100/80",
    description: "Вы отозвали заявку. Она остаётся в истории, чтобы вы не теряли контекст.",
    Icon: FileTextIcon,
  },
};

const ENROLLMENT_STATUS_LABELS: Record<
  NonNullable<CourseApplication["enrollment_status"]>,
  string
> = {
  active: "Доступ открыт",
  completed: "Курс завершён",
  dropped: "Обучение остановлено",
  blocked: "Доступ заблокирован",
  canceled: "Доступ отменён",
};

function formatDate(value?: string | null) {
  if (!value) return "—";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

function getViewerName(viewer: User | null) {
  if (!viewer) return "Гость";

  const fullName = `${viewer.first_name} ${viewer.last_name}`.trim();
  return fullName || viewer.email;
}

function upsertApplication(
  applications: CourseApplication[],
  nextApplication: CourseApplication,
) {
  return [
    nextApplication,
    ...applications.filter(
      (application) => application.application_id !== nextApplication.application_id,
    ),
  ];
}

function ApplicationBadge({ status }: { status: CourseApplicationStatus }) {
  const meta = APPLICATION_STATUS_META[status];

  return (
    <Badge
      variant="outline"
      className={cn("rounded-full border px-3 py-1 text-[11px] font-semibold", meta.badgeClassName)}
    >
      {meta.label}
    </Badge>
  );
}

export default function PublicCourseAccessSection({
  course,
  viewer,
  initialApplications,
  signInHref,
  signUpHref,
}: Props) {
  const [applications, setApplications] =
    React.useState<CourseApplication[]>(initialApplications);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [pendingAction, setPendingAction] = React.useState<"withdraw" | null>(null);

  const currentApplication =
    applications.find((application) => application.course_id === course.course_id) ??
    null;

  const currentStatusMeta = currentApplication
    ? APPLICATION_STATUS_META[currentApplication.status]
    : null;

  const sortedApplications = [...applications].sort((left, right) => {
    if (left.course_id === course.course_id && right.course_id !== course.course_id) {
      return -1;
    }

    if (right.course_id === course.course_id && left.course_id !== course.course_id) {
      return 1;
    }

    return new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime();
  });

  async function handleWithdraw() {
    if (!currentApplication) return;

    setError(null);
    setSuccessMessage(null);
    setPendingAction("withdraw");

    try {
      const withdrawn = await CourseApplicationsAPI.withdraw(
        currentApplication.application_id,
      );

      setApplications((current) => upsertApplication(current, withdrawn));
      setSuccessMessage(
        "Заявка отозвана. История осталась ниже, чтобы вы видели, что происходило с доступом.",
      );
    } catch (withdrawError) {
      setError(
        getUserFacingErrorMessage(
          withdrawError,
          "Не удалось отозвать заявку.",
        ),
      );
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <section id="course-access" className="scroll-mt-24 px-4 pb-4 md:px-8 md:pb-8">
      <div className="mx-auto max-w-340">
        <div className="relative overflow-hidden rounded-[32px] border border-black/5 bg-white/90 shadow-[0_26px_90px_rgba(33,46,89,0.12)] backdrop-blur">
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(62,126,223,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(160,160,217,0.14),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(246,249,255,0.98))]"
          />

          <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center rounded-full border border-[#d9e3ff] bg-white/80 px-4 py-2 text-[12px] font-semibold tracking-[0.02em] text-[#3359a8] uppercase">
                  Доступ к курсу
                </div>

                <div className="space-y-3">
                  <h2 className="max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-[#16213d] sm:text-4xl">
                    Подайте заявку и следите за решением по курсу
                  </h2>
                  <p className="max-w-3xl text-[15px] leading-7 text-[#4d5f86] sm:text-[16px]">
                    Заявка на <span className="font-semibold text-[#16213d]">{course.title}</span> теперь
                    открывается на отдельной странице, а здесь остаются текущий
                    статус, решение преподавателя и история всех ваших заявок.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-3xl border border-white/60 bg-white/75 p-4 shadow-[0_14px_35px_rgba(29,52,94,0.08)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6d7da1]">
                      Курс
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#16213d]">
                      {course.title}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-white/60 bg-white/75 p-4 shadow-[0_14px_35px_rgba(29,52,94,0.08)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6d7da1]">
                      Аккаунт
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#16213d]">
                      {getViewerName(viewer)}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-white/60 bg-white/75 p-4 shadow-[0_14px_35px_rgba(29,52,94,0.08)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6d7da1]">
                      Статус
                    </p>
                    <div className="mt-2">
                      {currentApplication ? (
                        <ApplicationBadge status={currentApplication.status} />
                      ) : (
                        <span className="text-sm font-semibold text-[#16213d]">
                          Заявка ещё не отправлена
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {error ? (
                <div className="rounded-3xl border border-rose-200 bg-rose-50/90 px-5 py-4 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              {successMessage ? (
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50/90 px-5 py-4 text-sm text-emerald-700">
                  {successMessage}
                </div>
              ) : null}

              {!viewer ? (
                <div className="rounded-[28px] border border-[#dce7ff] bg-white/85 p-6 shadow-[0_16px_40px_rgba(29,52,94,0.08)]">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="max-w-2xl space-y-2">
                      <p className="text-lg font-semibold text-[#16213d]">
                        Сначала войдите или создайте аккаунт
                      </p>
                      <p className="text-sm leading-6 text-[#546684]">
                        После авторизации вы сможете открыть отдельную страницу
                        заявки и затем вернуться сюда уже со статусом.
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:min-w-52">
                      <Button asChild size="lg" className="rounded-2xl">
                        <Link href={signUpHref}>Создать аккаунт</Link>
                      </Button>
                      <Button asChild size="lg" variant="outline" className="rounded-2xl">
                        <Link href={signInHref}>Уже есть аккаунт</Link>
                      </Button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-[#edf2ff] bg-[#f8fbff] p-4 text-sm text-[#4d5f86]">
                      1. Войдите в аккаунт или зарегистрируйтесь.
                    </div>
                    <div className="rounded-2xl border border-[#edf2ff] bg-[#f8fbff] p-4 text-sm text-[#4d5f86]">
                      2. Откройте отдельную страницу заявки.
                    </div>
                    <div className="rounded-2xl border border-[#edf2ff] bg-[#f8fbff] p-4 text-sm text-[#4d5f86]">
                      3. После отправки вы вернётесь сюда и увидите статус.
                    </div>
                  </div>
                </div>
              ) : currentApplication ? (
                <div
                  className={cn(
                    "rounded-[28px] border p-6 shadow-[0_16px_40px_rgba(29,52,94,0.08)]",
                    currentStatusMeta?.panelClassName,
                  )}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <ApplicationBadge status={currentApplication.status} />
                        <span className="text-sm text-[#556784]">
                          Отправлено {formatDate(currentApplication.created_at)}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          {currentStatusMeta ? (
                            <currentStatusMeta.Icon className="h-5 w-5 text-[#244287]" />
                          ) : null}
                          <p className="text-xl font-semibold text-[#16213d]">
                            Заявка по этому курсу уже существует
                          </p>
                        </div>
                        <p className="max-w-2xl text-sm leading-6 text-[#4d5f86]">
                          {currentStatusMeta?.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:min-w-52">
                      {currentApplication.status === "approved" ? (
                        <Button asChild size="lg" className="rounded-2xl">
                          <Link href="/platform/lessons">
                            Перейти к урокам
                            <ArrowRightIcon className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {(currentApplication.status === "pending" ||
                        currentApplication.status === "reviewing") ? (
                        <Button
                          type="button"
                          size="lg"
                          variant="outline"
                          className="rounded-2xl"
                          onClick={handleWithdraw}
                          disabled={pendingAction !== null}
                        >
                          {pendingAction === "withdraw"
                            ? "Отзываем..."
                            : "Отозвать заявку"}
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6d7da1]">
                        Последнее обновление
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[#16213d]">
                        {formatDate(currentApplication.updated_at)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6d7da1]">
                        Доступ
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[#16213d]">
                        {currentApplication.enrollment_status
                          ? ENROLLMENT_STATUS_LABELS[
                              currentApplication.enrollment_status
                            ]
                          : "Пока не открыт"}
                      </p>
                    </div>
                  </div>

                  {(currentApplication.message ||
                    currentApplication.motivation_text ||
                    currentApplication.experience_text ||
                    currentApplication.portfolio_url ||
                    currentApplication.resume_url) && (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {currentApplication.motivation_text ? (
                        <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6d7da1]">
                            Почему вы подали заявку
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[#3f5274]">
                            {currentApplication.motivation_text}
                          </p>
                        </div>
                      ) : null}

                      {currentApplication.experience_text ? (
                        <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6d7da1]">
                            Опыт
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[#3f5274]">
                            {currentApplication.experience_text}
                          </p>
                        </div>
                      ) : null}

                      {currentApplication.message ? (
                        <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6d7da1]">
                            Дополнительное сообщение
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[#3f5274]">
                            {currentApplication.message}
                          </p>
                        </div>
                      ) : null}

                      {currentApplication.portfolio_url ? (
                        <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6d7da1]">
                            Портфолио
                          </p>
                          <Link
                            href={currentApplication.portfolio_url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex text-sm font-semibold text-[#3359a8] underline decoration-[#c6d5ff] underline-offset-4"
                          >
                            Открыть ссылку
                          </Link>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {currentApplication.review_note ? (
                    <div className="mt-5 rounded-2xl border border-white/60 bg-white/75 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6d7da1]">
                        Комментарий по решению
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#3f5274]">
                        {currentApplication.review_note}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-[28px] border border-[#dce7ff] bg-white/85 p-6 shadow-[0_16px_40px_rgba(29,52,94,0.08)]">
                  <div className="flex flex-col gap-2">
                    <p className="text-xl font-semibold text-[#16213d]">
                      Оставить заявку на отдельной странице
                    </p>
                    <p className="text-sm leading-6 text-[#546684]">
                      Форма заявки теперь открывается отдельно. После отправки вы
                      автоматически вернётесь сюда и сразу увидите статус по курсу.
                    </p>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-[#edf2ff] bg-[#f8fbff] p-4 text-sm text-[#4d5f86]">
                      1. Откройте страницу заявки.
                    </div>
                    <div className="rounded-2xl border border-[#edf2ff] bg-[#f8fbff] p-4 text-sm text-[#4d5f86]">
                      2. Заполните форму и отправьте заявку.
                    </div>
                    <div className="rounded-2xl border border-[#edf2ff] bg-[#f8fbff] p-4 text-sm text-[#4d5f86]">
                      3. После отправки вы автоматически вернётесь сюда.
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm leading-6 text-[#4d5f86]">
                      На отдельной странице удобнее заполнить длинную заявку, а
                      блок доступа здесь остаётся чистым и понятным.
                    </p>

                    <Button asChild size="lg" className="rounded-2xl px-6">
                      <Link href={`/o/courses/${course.slug}/apply`}>
                        Оставить заявку
                        <ArrowRightIcon className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <aside className="rounded-[28px] border border-[#dce7ff] bg-[#f8fbff]/88 p-5 shadow-[0_16px_40px_rgba(29,52,94,0.06)] sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#3359a8] shadow-[0_10px_30px_rgba(29,52,94,0.08)]">
                  <GraduationCapIcon className="h-5 w-5" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#16213d]">
                    Ваши заявки и доступы
                  </h3>
                  <p className="text-sm leading-6 text-[#546684]">
                    Здесь видно, куда вы уже отправили заявку, какой сейчас
                    статус и есть ли доступ к материалам.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {!viewer ? (
                  <div className="rounded-3xl border border-dashed border-[#ccd9f8] bg-white/70 p-5 text-sm leading-6 text-[#5d6f8f]">
                    Войдите в аккаунт, и здесь появится вся история ваших заявок.
                  </div>
                ) : sortedApplications.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-[#ccd9f8] bg-white/70 p-5 text-sm leading-6 text-[#5d6f8f]">
                    Пока заявок нет. Как только вы отправите первую, она сразу
                    появится в этом списке.
                  </div>
                ) : (
                  sortedApplications.map((application) => (
                    <div
                      key={application.application_id}
                      className={cn(
                        "rounded-3xl border bg-white/82 p-4 shadow-[0_12px_28px_rgba(29,52,94,0.05)]",
                        application.course_id === course.course_id
                          ? "border-[#bcd1ff]"
                          : "border-white/70",
                      )}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-[#16213d]">
                              {application.course_title}
                            </p>
                            {application.course_id === course.course_id ? (
                              <Badge
                                variant="outline"
                                className="rounded-full border-[#d8e3ff] bg-[#edf3ff] px-2.5 py-0.5 text-[11px] text-[#3359a8]"
                              >
                                Этот курс
                              </Badge>
                            ) : null}
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <ApplicationBadge status={application.status} />
                            {application.enrollment_status ? (
                              <Badge
                                variant="outline"
                                className="rounded-full border-[#dce7ff] bg-[#f6f9ff] px-2.5 py-0.5 text-[11px] text-[#4f6486]"
                              >
                                {ENROLLMENT_STATUS_LABELS[application.enrollment_status]}
                              </Badge>
                            ) : null}
                          </div>
                        </div>

                        <Button asChild size="sm" variant="outline" className="rounded-xl">
                          <Link href={`/o/courses/${application.course_slug}#course-access`}>
                            Открыть
                          </Link>
                        </Button>
                      </div>

                      <div className="mt-4 grid gap-3 text-sm text-[#536684] sm:grid-cols-2">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7c8cb0]">
                            Отправлено
                          </p>
                          <p className="mt-1">{formatDate(application.created_at)}</p>
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7c8cb0]">
                            Обновлено
                          </p>
                          <p className="mt-1">{formatDate(application.updated_at)}</p>
                        </div>

                        {application.reviewed_at ? (
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7c8cb0]">
                              Решение
                            </p>
                            <p className="mt-1">{formatDate(application.reviewed_at)}</p>
                          </div>
                        ) : null}

                        {application.review_note ? (
                          <div className="sm:col-span-2">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7c8cb0]">
                              Комментарий
                            </p>
                            <p className="mt-1 leading-6">{application.review_note}</p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
