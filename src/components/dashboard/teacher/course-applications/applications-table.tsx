"use client";

import { ExternalLink, Eye } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { ENROLLMENT_STATUS_LABELS } from "./constants";
import { ApplicationStatusBadge } from "./shared";
import type { ApplicationRow } from "./types";
import {
  formatDateTime,
  getApplicantName,
  getApplicationExcerpt,
} from "./utils";

function ApplicationResourceLink({
  label,
  href,
}: {
  label: string;
  href?: string | null;
}) {
  if (!href) {
    return null;
  }

  return (
    <Button
      asChild
      variant="outline"
      size="xs"
      className="h-7 rounded-full border-zinc-200 bg-white px-2.5 text-zinc-700 hover:bg-zinc-50"
    >
      <a href={href} target="_blank" rel="noreferrer">
        {label}
        <ExternalLink className="h-3 w-3" />
      </a>
    </Button>
  );
}

export default function ApplicationsTable({
  rows,
  selectedApplicationId,
  onOpenApplication,
}: {
  rows: ApplicationRow[];
  selectedApplicationId: string | null;
  onOpenApplication: (applicationId: string) => void;
}) {
  return (
    <div className="overflow-x-auto border border-zinc-300 bg-white">
      <table className="w-full min-w-[980px] text-sm">
        <thead className="bg-zinc-50 text-left">
          <tr className="border-b border-zinc-300 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
            <th className="px-4 py-3">Заявка</th>
            <th className="px-4 py-3">Статус</th>
            <th className="px-4 py-3">Суть заявки</th>
            <th className="px-4 py-3">Активность</th>
            <th className="px-4 py-3 text-right">Открыть</th>
          </tr>
        </thead>

        <tbody>
          {rows.map(({ course, application }) => {
            const isActive = selectedApplicationId === application.application_id;
            const excerpt = getApplicationExcerpt(application);
            const hasResources =
              !!application.portfolio_url || !!application.resume_url;

            return (
              <tr
                key={application.application_id}
                className={cn(
                  "border-b border-zinc-200 align-top last:border-b-0 hover:bg-zinc-50/80",
                  isActive && "bg-zinc-50",
                )}
              >
                <td className="px-4 py-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="font-semibold text-zinc-950">
                        {getApplicantName(application)}
                      </div>
                      <div className="truncate text-sm text-zinc-500">
                        {application.applicant_email || "Почта не указана"}
                      </div>
                    </div>

                    <div className="space-y-1 border-l-2 border-zinc-200 pl-3">
                      <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                        Курс
                      </div>
                      <div
                        title={course.title}
                        className="line-clamp-2 font-medium leading-5 text-zinc-950"
                      >
                        {course.title}
                      </div>
                      <div className="truncate font-mono text-[11px] text-zinc-500">
                        {course.slug}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div className="space-y-2">
                    <ApplicationStatusBadge status={application.status} />
                    {application.enrollment_status ? (
                      <div className="max-w-[180px] text-xs leading-5 text-zinc-500">
                        {ENROLLMENT_STATUS_LABELS[application.enrollment_status]}
                      </div>
                    ) : null}
                  </div>
                </td>

                <td className="max-w-[360px] px-4 py-4">
                  <div className="space-y-3">
                    <p
                      title={excerpt}
                      className="line-clamp-3 whitespace-normal text-sm leading-6 text-zinc-700"
                    >
                      {excerpt}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <ApplicationResourceLink
                        label="Портфолио"
                        href={application.portfolio_url}
                      />
                      <ApplicationResourceLink
                        label="Резюме"
                        href={application.resume_url}
                      />
                      {!hasResources ? (
                        <span className="text-xs text-zinc-400">
                          Материалов нет
                        </span>
                      ) : null}
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div className="space-y-3 text-sm text-zinc-700">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                        Отправлена
                      </div>
                      <div className="mt-1">{formatDateTime(application.created_at)}</div>
                    </div>

                    <div>
                      <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                        Обновлена
                      </div>
                      <div className="mt-1">{formatDateTime(application.updated_at)}</div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4 text-right">
                  <Button
                    type="button"
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className="min-w-[104px]"
                    onClick={() => onOpenApplication(application.application_id)}
                  >
                    <Eye className="h-4 w-4" />
                    Открыть
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
