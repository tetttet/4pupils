"use client";

import { Eye } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { COURSE_STATUS_META, COURSE_VISIBILITY_META } from "./constants";
import { CourseMetaBadge } from "./shared";
import type { CourseRow } from "./types";
import { formatCount, formatDateTime } from "./utils";

export default function CourseOverviewTable({
  rows,
  activeCourseId,
  onOpenCourse,
}: {
  rows: CourseRow[];
  activeCourseId: string | null;
  onOpenCourse: (courseId: string) => void;
}) {
  return (
    <div className="overflow-x-auto border border-zinc-300">
      <table className="w-full min-w-[980px] text-sm">
        <thead className="bg-zinc-100 text-left">
          <tr className="border-b border-zinc-300 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
            <th className="px-4 py-3">Курс</th>
            <th className="px-4 py-3">Поток</th>
            <th className="px-4 py-3">Видимость</th>
            <th className="px-4 py-3">Все заявки</th>
            <th className="px-4 py-3">Нужно посмотреть</th>
            <th className="px-4 py-3">Последняя активность</th>
            <th className="px-4 py-3 text-right">Sidebar</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => {
            const isActive = activeCourseId === row.course.course_id;
            const statusMeta = COURSE_STATUS_META[row.course.lifecycle_status];
            const visibilityMeta = COURSE_VISIBILITY_META[row.course.visibility];

            return (
              <tr
                key={row.course.course_id}
                className={cn(
                  "border-b border-zinc-200 align-top last:border-b-0 hover:bg-zinc-50",
                  isActive && "bg-zinc-50",
                )}
              >
                <td className="px-4 py-4">
                  <div className="space-y-2">
                    <div className="font-semibold text-zinc-950">
                      {row.course.title}
                    </div>
                    <div className="font-mono text-xs text-zinc-500">
                      {row.course.slug}
                    </div>
                    <div className="text-sm text-zinc-500">
                      {row.course.category || "Без категории"}
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <CourseMetaBadge className={statusMeta.className}>
                    {statusMeta.label}
                  </CourseMetaBadge>
                </td>

                <td className="px-4 py-4">
                  <CourseMetaBadge className={visibilityMeta.className}>
                    {visibilityMeta.label}
                  </CourseMetaBadge>
                </td>

                <td className="px-4 py-4 text-zinc-900">
                  {formatCount(row.totalApplications)}
                </td>

                <td className="px-4 py-4 text-zinc-900">
                  {formatCount(row.pendingCount)}
                </td>

                <td className="px-4 py-4 text-zinc-700">
                  {formatDateTime(row.latestApplicationAt)}
                </td>

                <td className="px-4 py-4 text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenCourse(row.course.course_id)}
                  >
                    <Eye className="h-4 w-4" />
                    Открыть справа
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
