import type { ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

import { StudentGlassPanel } from "@/components/platform/student-surface";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { CourseEntry } from "./types";
import {
  formatDate,
  getCourseHref,
  getEntryDateLabel,
  getEntryDescription,
  getPrimaryMeta,
} from "./utils";

export function StatusBadge({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex w-fit items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.02em]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  note,
  accent,
}: {
  label: string;
  value: string;
  note: string;
  accent: string;
}) {
  return (
    <StudentGlassPanel className="border-[#2d2d2d]/70 bg-[#2d2d2d] p-5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white">
        {label}
      </div>
      <div
        className={cn("mt-3 text-3xl font-semibold tracking-[-0.04em]", accent)}
      >
        {value}
      </div>
      <p className="mt-2 text-sm leading-6 text-white/50">{note}</p>
    </StudentGlassPanel>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  href,
  actionLabel,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  actionLabel: string;
}) {
  return (
    <StudentGlassPanel className="border-white/70 bg-white/76 p-8 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] border border-sky-100 bg-sky-50 text-sky-600 shadow-[0_18px_40px_rgba(56,189,248,0.16)]">
          <Icon className="h-8 w-8" />
        </div>
        <h3 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">
          {title}
        </h3>
        <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
          {description}
        </p>
        <Button
          asChild
          className="mt-6 rounded-full bg-slate-950 px-5 text-white shadow-[0_18px_45px_rgba(15,23,42,0.16)] hover:bg-slate-900"
        >
          <Link href={href}>
            {actionLabel}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </StudentGlassPanel>
  );
}

export function CourseListItem({ entry }: { entry: CourseEntry }) {
  const meta = getPrimaryMeta(entry);
  const updatedAtLabel = entry.updatedAt ? formatDate(entry.updatedAt) : "—";

  return (
    <div className="rounded-[28px] border border-black/10 bg-white/76 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border border-white/70 bg-white text-slate-700 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
              <meta.Icon className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-base font-semibold text-slate-950 sm:text-lg">
                  {entry.courseTitle}
                </h3>
                <StatusBadge className={meta.badgeClassName}>
                  {meta.label}
                </StatusBadge>
              </div>

              <div className="mt-1 text-sm text-slate-500">
                {getEntryDateLabel(entry)}
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-600">
            {getEntryDescription(entry)}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full border border-white/70 bg-white/85 px-3 py-1">
              Обновлено {updatedAtLabel}
            </span>
            {entry.enrollment?.last_activity_at ? (
              <span className="rounded-full border border-white/70 bg-white/85 px-3 py-1">
                Активность {formatDate(entry.enrollment.last_activity_at)}
              </span>
            ) : null}
            {!entry.enrollment && entry.application?.reviewed_at ? (
              <span className="rounded-full border border-white/70 bg-white/85 px-3 py-1">
                Решение {formatDate(entry.application.reviewed_at)}
              </span>
            ) : null}
          </div>
        </div>

        <Button
          asChild
          className="rounded-xl bg-[#202020] px-5 text-white hover:bg-[#1a1a1a]"
        >
          <Link
            href={getCourseHref(entry.courseSlug)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Перейти к курсу
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
