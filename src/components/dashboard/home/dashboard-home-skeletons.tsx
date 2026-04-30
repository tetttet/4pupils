import type * as React from "react";

import { AppBreadcrumb } from "@/components/ui/app-breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function PanelFrame({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-zinc-300 bg-white">
      <div className="flex flex-col gap-3 border-b border-zinc-300 px-4 py-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-sm font-semibold text-zinc-950">{title}</div>
          {subtitle ? (
            <div className="mt-1 text-sm leading-6 text-zinc-600">
              {subtitle}
            </div>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      {children}
    </section>
  );
}

export function DashboardAuthSkeleton() {
  return (
    <>
      <AppBreadcrumb items={[{ label: "Главная" }]} />

      <div className="space-y-6 bg-[#f6f6f6] p-6 text-zinc-900">
        <section className="overflow-hidden border border-zinc-300 bg-zinc-950 text-white">
          <div className="grid gap-px bg-white/10 xl:grid-cols-[minmax(0,1.25fr)_360px]">
            <div className="relative overflow-hidden p-6 sm:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_45%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_60%)]" />

              <div className="relative max-w-2xl">
                <Skeleton className="h-6 w-36 rounded-full bg-white/20" />
                <Skeleton className="mt-5 h-10 w-full max-w-xl rounded-none bg-white/20" />
                <Skeleton className="mt-3 h-10 w-full max-w-lg rounded-none bg-white/16" />
                <div className="mt-5 space-y-2">
                  <Skeleton className="h-4 w-full rounded-none bg-white/12" />
                  <Skeleton className="h-4 w-5/6 rounded-none bg-white/12" />
                  <Skeleton className="h-4 w-2/3 rounded-none bg-white/12" />
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Skeleton className="h-11 w-44 rounded-none bg-white/20" />
                  <Skeleton className="h-11 w-40 rounded-none bg-white/12" />
                </div>
              </div>
            </div>

            <DashboardDarkSummarySkeleton />
          </div>
        </section>

        <DashboardQuickLinksSkeleton />
      </div>
    </>
  );
}

export function DashboardUpdatedBadgeSkeleton() {
  return <Skeleton className="h-6 w-36 rounded-full bg-white/12" />;
}

export function DashboardHeroGaugesSkeleton() {
  return (
    <div className="grid gap-px bg-white/10">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="border border-white/12 bg-white/6 p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 shrink-0 rounded-full bg-white/16" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-3 w-32 rounded-none bg-white/12" />
              <Skeleton className="mt-3 h-4 w-full rounded-none bg-white/16" />
              <Skeleton className="mt-2 h-4 w-4/5 rounded-none bg-white/12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardQuickLinksSkeleton() {
  return (
    <div className="grid gap-px border border-zinc-300 bg-zinc-300 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="border border-zinc-300 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-3">
              <Skeleton className="h-10 w-10 rounded-none bg-zinc-200" />
              <div>
                <Skeleton className="h-5 w-28 rounded-none bg-zinc-200" />
                <div className="mt-3 space-y-2">
                  <Skeleton className="h-4 w-64 max-w-full rounded-none bg-zinc-100" />
                  <Skeleton className="h-4 w-52 max-w-full rounded-none bg-zinc-100" />
                </div>
              </div>
            </div>
            <Skeleton className="h-6 w-20 rounded-full bg-zinc-100" />
          </div>
          <Skeleton className="mt-5 h-px w-full rounded-none bg-zinc-200" />
          <Skeleton className="mt-3 h-3 w-32 rounded-none bg-zinc-100" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSummaryTilesSkeleton({
  darkFirst = false,
}: {
  darkFirst?: boolean;
}) {
  return (
    <div className="grid gap-px border border-zinc-300 bg-zinc-300 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => {
        const dark = darkFirst && index === 0;

        return (
          <div
            key={index}
            className={cn(
              "border p-4",
              dark
                ? "border-zinc-900 bg-zinc-900"
                : "border-zinc-300 bg-white",
            )}
          >
            <Skeleton
              className={cn(
                "h-3 w-28 rounded-none",
                dark ? "bg-white/16" : "bg-zinc-200",
              )}
            />
            <Skeleton
              className={cn(
                "mt-4 h-9 w-20 rounded-none",
                dark ? "bg-white/20" : "bg-zinc-200",
              )}
            />
            <div className="mt-3 space-y-2">
              <Skeleton
                className={cn(
                  "h-4 w-full rounded-none",
                  dark ? "bg-white/12" : "bg-zinc-100",
                )}
              />
              <Skeleton
                className={cn(
                  "h-4 w-4/5 rounded-none",
                  dark ? "bg-white/12" : "bg-zinc-100",
                )}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DashboardPanelActionSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <Skeleton
      className={cn("h-4 w-28 rounded-none bg-zinc-200", className)}
    />
  );
}

export function DashboardOperationalSkeleton() {
  return (
    <PanelFrame
      title="Операционный срез"
      subtitle="Быстрый взгляд на три главных потока: карточки курсов, очередь заявок и обучение студентов."
      action={<DashboardPanelActionSkeleton />}
    >
      <div className="grid gap-px border-t border-zinc-300 bg-zinc-300 xl:grid-cols-3">
        {["Курсы", "Заявки", "Уроки"].map((title) => (
          <div key={title} className="bg-white">
            <div className="border-b border-zinc-300 bg-zinc-100 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
              {title}
            </div>
            <DashboardBarsSkeleton />
          </div>
        ))}
      </div>
    </PanelFrame>
  );
}

export function DashboardFocusSkeleton() {
  return (
    <PanelFrame
      title="Фокус на сегодня"
      subtitle="Конкретные точки, которые лучше не откладывать. Всё ведет сразу в нужный раздел."
    >
      <div className="divide-y divide-zinc-200">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex gap-4 px-4 py-4">
            <Skeleton className="mt-0.5 h-10 w-10 shrink-0 rounded-none bg-zinc-200" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-5 w-52 max-w-full rounded-none bg-zinc-200" />
              <div className="mt-3 space-y-2">
                <Skeleton className="h-4 w-full rounded-none bg-zinc-100" />
                <Skeleton className="h-4 w-4/5 rounded-none bg-zinc-100" />
              </div>
              <Skeleton className="mt-4 h-9 w-36 rounded-none bg-zinc-100" />
            </div>
          </div>
        ))}
      </div>
    </PanelFrame>
  );
}

export function DashboardHistogramPanelSkeleton() {
  return (
    <PanelFrame
      title="Гистограмма готовности курсов"
      subtitle="Показывает, насколько ровно собран каталог и где карточки еще проседают по базовым полям."
      action={<DashboardPanelActionSkeleton className="w-20" />}
    >
      <DashboardHistogramSkeleton />
    </PanelFrame>
  );
}

export function DashboardCourseTablePanelSkeleton() {
  return (
    <PanelFrame
      title="Курсы по нагрузке и спросу"
      subtitle="Верхняя часть рабочего пула: где уже есть движение, заявки и ученики."
      action={<Skeleton className="h-9 w-40 rounded-none bg-zinc-100" />}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              {Array.from({ length: 5 }).map((_, index) => (
                <th key={index} className="px-2.5 py-1.5 text-left">
                  <Skeleton className="h-3 w-20 rounded-none bg-zinc-200" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-zinc-100 align-top last:border-b-0"
              >
                {Array.from({ length: 5 }).map((_, cellIndex) => (
                  <td key={cellIndex} className="px-2.5 py-2">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full max-w-36 rounded-none bg-zinc-200" />
                      <Skeleton className="h-3 w-24 rounded-none bg-zinc-100" />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PanelFrame>
  );
}

export function DashboardControlNumbersSkeleton() {
  return (
    <PanelFrame
      title="Контрольные цифры"
      subtitle="Короткий свод по времени реакции, конверсии и прогрессу без перехода в глубину."
    >
      <DashboardSummaryTilesSkeleton />
    </PanelFrame>
  );
}

function DashboardBarsSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-28 rounded-none bg-zinc-200" />
              <Skeleton className="mt-2 h-3 w-44 max-w-full rounded-none bg-zinc-100" />
            </div>
            <Skeleton className="h-4 w-8 rounded-none bg-zinc-200" />
          </div>
          <Skeleton className="h-3 w-full rounded-none bg-zinc-100" />
        </div>
      ))}
    </div>
  );
}

function DashboardHistogramSkeleton() {
  return (
    <div className="p-4">
      <div className="grid h-72 grid-cols-5 gap-3">
        {[42, 64, 88, 55, 76].map((height, index) => (
          <div key={index} className="flex min-w-0 flex-col justify-end gap-2">
            <div className="flex-1 border border-zinc-300 bg-zinc-100 p-2">
              <div className="flex h-full flex-col justify-end">
                <Skeleton
                  className="w-full rounded-none bg-zinc-200"
                  style={{ height: `${height}%` }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="mx-auto h-4 w-8 rounded-none bg-zinc-200" />
              <Skeleton className="mx-auto h-3 w-12 rounded-none bg-zinc-100" />
              <Skeleton className="mx-auto h-3 w-full rounded-none bg-zinc-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardDarkSummarySkeleton() {
  return (
    <div className="grid gap-px bg-white/10">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="border border-transparent bg-white/6 p-4">
          <Skeleton className="h-3 w-24 rounded-none bg-white/12" />
          <Skeleton className="mt-4 h-9 w-20 rounded-none bg-white/20" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-4 w-full rounded-none bg-white/12" />
            <Skeleton className="h-4 w-4/5 rounded-none bg-white/12" />
          </div>
        </div>
      ))}
    </div>
  );
}
