import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { StudentGlassPanel } from "./student-surface";

type StudentPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function StudentPageShell({
  eyebrow,
  title,
  description,
  aside,
  children,
  className,
}: StudentPageShellProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <StudentGlassPanel className="px-6 py-6 sm:px-8 sm:py-8">
        <div
          aria-hidden
          className="absolute inset-0"
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex w-fit items-center gap-2 select-none text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              {eyebrow}
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {title}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                {description}
              </p>
            </div>
          </div>

          {aside ? (
            <div className="relative flex flex-wrap items-center gap-3 lg:justify-end">
              {aside}
            </div>
          ) : null}
        </div>
      </StudentGlassPanel>

      {children}
    </div>
  );
}
