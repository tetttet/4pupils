import { StudentGlassPanel } from "./student-surface";
import { Button } from "../ui/button";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ENROLLMENT_META } from "./student-lessons-workspace/constants";
import { formatDate, getCourseHref } from "./student-lessons-workspace/utils";
import type { Enrollment } from "@/types/enrollment";

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

const StudentCoursesOverview = ({
  totalCourses,
  availableEnrollments,
}: {
  totalCourses: number;
  availableEnrollments: Enrollment[];
}) => {
  return (
    <StudentGlassPanel className="p-6 sm:p-7">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Ваши курсы
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Здесь собраны все курсы, к которым у вас уже есть доступ: активные
              программы, завершённые модули и текущий прогресс по каждому
              направлению.
            </p>
          </div>

          <div className="select-none inline-flex w-fit items-center rounded-full border border-black/10 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
            {totalCourses} {getCourseCountLabel(totalCourses)} в вашей подборке
          </div>
        </div>

        <div className="gap-4">
          {availableEnrollments.map((enrollment) => {
            const meta = ENROLLMENT_META[enrollment.status];
            const secondaryDateLabel =
              enrollment.status === "completed" && enrollment.completed_at
                ? `Завершён ${formatDate(enrollment.completed_at)}`
                : enrollment.last_activity_at
                  ? `Активность ${formatDate(enrollment.last_activity_at)}`
                  : `Обновлено ${formatDate(enrollment.updated_at)}`;

            return (
              <div
                key={enrollment.enrollment_id}
                className="rounded-2xl border border-black/10 p-4"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold leading-6 text-slate-950 sm:text-lg">
                        {enrollment.course_title}
                      </h3>
                      <p className="mt-1 text-sm leading-5 text-slate-600 line-clamp-2">
                        {meta.description}
                      </p>
                    </div>

                    <Button
                      asChild
                      size="sm"
                      className="h-9 shrink-0 rounded-lg bg-[#2d2d2d] px-4 text-sm text-white hover:bg-[#161616]"
                    >
                      <Link
                        href={getCourseHref(enrollment.course_slug)}
                        className="inline-flex items-center gap-2"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Открыть
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-1 lg:gap-2 text-[11px] text-slate-500">
                    <span className="rounded-full border border-white/80 bg-white/90">
                      Доступ с {formatDate(enrollment.enrolled_at)}
                    </span>
                    <span className="rounded-full border border-white/80 bg-white/90 px-0 lg:px-2.5">
                      {secondaryDateLabel}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </StudentGlassPanel>
  );
};

export default StudentCoursesOverview;
