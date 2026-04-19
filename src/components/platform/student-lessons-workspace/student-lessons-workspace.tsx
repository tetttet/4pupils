import { GraduationCap } from "lucide-react";

import { StudentPageShell } from "@/components/platform/student-page-shell";
import { StudentGlassPanel } from "@/components/platform/student-surface";

import type { StudentLessonsWorkspaceProps } from "./types";
import {
  CourseListItem,
  EmptyState,
  MetricCard,
} from "./student-lessons-workspace-parts";
import { buildCourseEntries, getLessonsSummary } from "./utils";

export function StudentLessonsWorkspace({
  initialApplications,
  initialEnrollments,
}: StudentLessonsWorkspaceProps) {
  const courseEntries = buildCourseEntries(
    initialApplications,
    initialEnrollments,
  );
  const summary = getLessonsSummary(courseEntries);
  const awaitingLabel =
    summary.awaiting > 0 ? `${summary.awaiting} ждут решения` : "Новых ожиданий нет";

  return (
    <StudentPageShell
      eyebrow="Платформа / Уроки"
      title="Мои курсы и заявки"
      description="Здесь собраны все курсы, где у вас уже есть доступ, и все заявки, которые ещё находятся в работе. Лента собирает последнее состояние по каждому курсу без дублирования."
      aside={
        <>
          <div className="rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            {summary.total} в ленте
          </div>
          <div
            className={
              summary.awaiting > 0
                ? "rounded-full border border-amber-200/70 bg-amber-50/85 px-4 py-2 text-sm font-medium text-amber-700 shadow-sm"
                : "rounded-full border border-emerald-200/70 bg-emerald-50/85 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm"
            }
          >
            {awaitingLabel}
          </div>
        </>
      }
    >
      {courseEntries.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Пока здесь пусто"
          description="Когда у вас появится доступ к курсу или будет отправлена первая заявка, всё соберётся в одном списке на этой странице."
          href="/courses"
          actionLabel="Посмотреть каталог"
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              label="Всего курсов"
              value={String(summary.total)}
              note="Все курсы, где у вас уже есть доступ или сохранена заявка."
              accent="text-white"
            />
            <MetricCard
              label="С доступом"
              value={String(summary.withAccess)}
              note="Курсы, которые уже привязаны к вашему аккаунту."
              accent="text-white"
            />
            <MetricCard
              label="На рассмотрении"
              value={String(summary.awaiting)}
              note="Курсы, по которым заявка ещё ждёт решения преподавателя."
              accent="text-white"
            />
          </div>

          <StudentGlassPanel className="p-3 sm:p-4">
            <div className="flex items-center justify-between gap-3 px-2 pb-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Мои курсы
                </div>
              </div>
              <div className="rounded-full border border-white/70 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-600">
                {summary.total}
              </div>
            </div>

            <div className="space-y-3">
              {courseEntries.map((entry) => (
                <CourseListItem key={entry.courseId} entry={entry} />
              ))}
            </div>
          </StudentGlassPanel>
        </>
      )}
    </StudentPageShell>
  );
}
