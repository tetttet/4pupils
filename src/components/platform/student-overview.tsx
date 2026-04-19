"use client";

import * as React from "react";
import { GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";

import { StudentPageShell } from "@/components/platform/student-page-shell";
import { StudentGlassPanel } from "@/components/platform/student-surface";
import { useAuth } from "@/context/auth-context";
import { useStudentPlatformPreferences } from "@/hooks/use-student-platform-preferences";
import type { Enrollment, EnrollmentStatus } from "@/types/enrollment";

import { EmptyState } from "./student-lessons-workspace/student-lessons-workspace-parts";
import StudentCoursesOverview from "./student-courses-overview";
import StudentRecommendedCourses from "./student-recommended-courses";

type StudentOverviewProps = {
  initialEnrollments: Enrollment[];
};

const AVAILABLE_STATUSES: EnrollmentStatus[] = ["active", "completed"];

const ENROLLMENT_STATUS_ORDER: Record<EnrollmentStatus, number> = {
  active: 0,
  completed: 1,
  dropped: 2,
  blocked: 3,
  canceled: 4,
};

function getEnrollmentTimestamp(enrollment: Enrollment) {
  return Math.max(
    new Date(enrollment.last_activity_at || 0).getTime() || 0,
    new Date(enrollment.updated_at).getTime() || 0,
    new Date(enrollment.enrolled_at).getTime() || 0,
    new Date(enrollment.created_at).getTime() || 0,
  );
}

function getLatestEnrollments(enrollments: Enrollment[]) {
  const latestByCourseId = new Map<string, Enrollment>();

  for (const enrollment of enrollments) {
    const current = latestByCourseId.get(enrollment.course_id);

    if (!current) {
      latestByCourseId.set(enrollment.course_id, enrollment);
      continue;
    }

    if (getEnrollmentTimestamp(enrollment) >= getEnrollmentTimestamp(current)) {
      latestByCourseId.set(enrollment.course_id, enrollment);
    }
  }

  return Array.from(latestByCourseId.values());
}

function getCourseCountLabel(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return "курс";
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return "курса";
  }

  return "курсов";
}

export function StudentOverview({ initialEnrollments }: StudentOverviewProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { preferences, hydrated } = useStudentPlatformPreferences();

  const firstName = user?.first_name || "Learner";

  const todayLabel = React.useMemo(
    () =>
      new Intl.DateTimeFormat("ru-RU", {
        weekday: "long",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      }).format(new Date()),
    [],
  );

  const availableEnrollments = React.useMemo(
    () =>
      getLatestEnrollments(initialEnrollments)
        .filter((enrollment) => AVAILABLE_STATUSES.includes(enrollment.status))
        .sort((left, right) => {
          const statusDiff =
            ENROLLMENT_STATUS_ORDER[left.status] -
            ENROLLMENT_STATUS_ORDER[right.status];

          if (statusDiff !== 0) {
            return statusDiff;
          }

          return getEnrollmentTimestamp(right) - getEnrollmentTimestamp(left);
        }),
    [initialEnrollments],
  );

  const totalCourses = availableEnrollments.length;
  const shouldRedirectToPreferredPage =
    hydrated && preferences.defaultPage !== "/platform";

  React.useEffect(() => {
    if (!shouldRedirectToPreferredPage) {
      return;
    }

    router.replace(preferences.defaultPage);
  }, [preferences.defaultPage, router, shouldRedirectToPreferredPage]);

  if (shouldRedirectToPreferredPage) {
    return (
      <StudentPageShell
        eyebrow="Главная / Обзор"
        title="Открываем ваш выбранный раздел"
        description="Для этой учётной записи включена персональная стартовая страница. Перенаправляем туда автоматически."
      >
        <StudentGlassPanel className="p-6 sm:p-8">
          <div className="text-sm leading-6 text-slate-600">
            Переход выполняется автоматически.
          </div>
        </StudentGlassPanel>
      </StudentPageShell>
    );
  }

  return (
    <StudentPageShell
      eyebrow="Главная / Обзор"
      title={`Добро пожаловать, ${firstName}`}
      description="Ваш учебный пространство объединяет уроки, живые сессии, задания и сообщество в одном премиальном потоке. Все ниже перечисленное организовано, чтобы помочь вам перейти от вдохновения к действию без усилий."
      aside={
        <>
          <div className="select-none px-4 py-2 text-sm font-medium text-slate-600">
            {todayLabel}
          </div>
          <div className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600">
            {totalCourses > 0
              ? `${totalCourses} ${getCourseCountLabel(totalCourses)} доступно`
              : "Доступных курсов пока нет"}
          </div>
        </>
      }
    >
      <div className="space-y-6">
        {totalCourses === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="Пока нет доступных курсов"
            description="Как только вам откроют доступ к обучению, здесь появятся карточки курсов с прогрессом, статусом и быстрым переходом к материалам."
            href="/courses"
            actionLabel="Открыть каталог"
          />
        ) : (
          <>
            <StudentCoursesOverview
              totalCourses={totalCourses}
              availableEnrollments={availableEnrollments}
            />
            {preferences.showRecommendedCourses ? (
              <StudentRecommendedCourses
                availableEnrollments={availableEnrollments}
              />
            ) : null}
          </>
        )}
      </div>
    </StudentPageShell>
  );
}
