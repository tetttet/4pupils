"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type TeacherSection = "courses" | "applications" | "lessons";

const SECTION_TABS: Record<
  TeacherSection,
  Array<{ label: string; href: string }>
> = {
  courses: [
    { label: "Все курсы", href: "/dashboard/teacher/courses" },
    { label: "Этапы", href: "/dashboard/teacher/courses/pipeline" },
    { label: "Аналитика", href: "/dashboard/teacher/courses/insights" },
    { label: "Готовность", href: "/dashboard/teacher/courses/readiness" },
  ],
  applications: [
    { label: "Все заявки", href: "/dashboard/teacher/applications" },
    { label: "По статусам", href: "/dashboard/teacher/applications/pipeline" },
    { label: "Аналитика", href: "/dashboard/teacher/applications/analytics" },
  ],
  lessons: [
    { label: "Все студенты", href: "/dashboard/teacher/lessons" },
    { label: "Прогресс", href: "/dashboard/teacher/lessons/progress" },
    { label: "Аналитика", href: "/dashboard/teacher/lessons/analytics" },
  ],
};

export function TeacherSectionTabs({ section }: { section: TeacherSection }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Представления раздела"
      className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-1"
    >
      {SECTION_TABS[section].map((tab) => {
        const active = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
              active
                ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
                : "text-slate-500 hover:bg-white/70 hover:text-slate-900",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
