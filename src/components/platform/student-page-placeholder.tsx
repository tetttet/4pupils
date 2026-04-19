import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDashed, Layers3 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { StudentPageShell } from "./student-page-shell";
import { StudentGlassPanel } from "./student-surface";

type StudentPagePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  launchNote: string;
  highlights: string[];
  primaryAction: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
};

export function StudentPagePlaceholder({
  eyebrow,
  title,
  description,
  launchNote,
  highlights,
  primaryAction,
  secondaryAction,
}: StudentPagePlaceholderProps) {
  return (
    <StudentPageShell
      eyebrow={eyebrow}
      title={title}
      description={description}
      aside={
        <>
          <div className="rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            Starter layout ready
          </div>
          <div className="rounded-full border border-emerald-200/70 bg-emerald-50/85 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm">
            Production-friendly baseline
          </div>
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <StudentGlassPanel className="p-6 sm:p-8">
          <div className="flex flex-col gap-6">
            <div className="space-y-3">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-500">
                <CircleDashed className="h-3.5 w-3.5 text-sky-500" />
                Ready for feature work
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Clean foundation for {title.toLowerCase()}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                {launchNote}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-white/70 bg-white/72 p-5 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">
                  Hero zone
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Use this area for summary stats, filters, segmented views, or
                  a strong first interaction for the page.
                </p>
              </div>
              <div className="rounded-[24px] border border-white/70 bg-white/72 p-5 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">
                  Primary content
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  The middle canvas is set up for tables, cards, timelines, or
                  list-detail layouts depending on the page purpose.
                </p>
              </div>
              <div className="rounded-[24px] border border-white/70 bg-white/72 p-5 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">
                  Side utilities
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Reserve the edge column for context panels, reminders, quick
                  actions, and lightweight secondary content.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                asChild
                className="rounded-full bg-slate-950 px-5 text-white shadow-lg shadow-slate-950/15 hover:bg-slate-900"
              >
                <Link href={primaryAction.href}>
                  {primaryAction.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              {secondaryAction ? (
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-white/70 bg-white/80 px-5 text-slate-700 shadow-sm hover:bg-white"
                >
                  <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
                </Button>
              ) : null}
            </div>
          </div>
        </StudentGlassPanel>

        <div className="grid gap-6">
          <StudentGlassPanel className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
                <Layers3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-950">
                  Suggested building blocks
                </h3>
                <p className="text-sm text-slate-600">
                  Strong next modules for this page.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="flex items-start gap-3 rounded-[22px] border border-white/70 bg-white/76 px-4 py-3"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                  <p className="text-sm leading-6 text-slate-600">{highlight}</p>
                </div>
              ))}
            </div>
          </StudentGlassPanel>

          <StudentGlassPanel className="p-6">
            <h3 className="text-lg font-semibold text-slate-950">
              Styling baseline
            </h3>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p>
                Glass panels, rounded corners, soft borders, and layered spacing
                are already in place so this page matches the rest of the
                student platform as it grows.
              </p>
              <p>
                The layout is responsive by default, keeps content readable on
                smaller screens, and is ready to evolve into real product states.
              </p>
            </div>
          </StudentGlassPanel>
        </div>
      </div>
    </StudentPageShell>
  );
}
