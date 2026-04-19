import { StudentGlassPanel } from "@/components/platform/student-surface";
import { Skeleton } from "@/components/ui/skeleton";

export function StudentLessonsWorkspaceSkeleton() {
  return (
    <div className="space-y-6">
      <StudentGlassPanel className="px-6 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <Skeleton className="h-3 w-32 rounded-full bg-slate-200" />
            <Skeleton className="h-10 w-full max-w-md rounded-[18px] bg-slate-200" />
            <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-slate-100" />
            <Skeleton className="h-5 w-full max-w-xl rounded-full bg-slate-100" />
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <Skeleton className="h-10 w-28 rounded-full bg-slate-100" />
            <Skeleton className="h-10 w-40 rounded-full bg-slate-100" />
          </div>
        </div>
      </StudentGlassPanel>

      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <StudentGlassPanel
            key={index}
            className="border-[#2d2d2d]/70 bg-[#2d2d2d] p-5"
          >
            <Skeleton className="h-3 w-24 rounded-full bg-white/15" />
            <Skeleton className="mt-4 h-10 w-16 rounded-[18px] bg-white/20" />
            <Skeleton className="mt-3 h-4 w-full rounded-full bg-white/10" />
            <Skeleton className="mt-2 h-4 w-4/5 rounded-full bg-white/10" />
          </StudentGlassPanel>
        ))}
      </div>

      <StudentGlassPanel className="p-3 sm:p-4">
        <div className="flex items-center justify-between gap-3 px-2 pb-3">
          <Skeleton className="h-3 w-24 rounded-full bg-slate-200" />
          <Skeleton className="h-8 w-10 rounded-full bg-slate-100" />
        </div>

        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[28px] border border-white/70 bg-white/76 p-5 shadow-[0_16px_38px_rgba(15,23,42,0.06)]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start gap-3">
                    <Skeleton className="h-11 w-11 rounded-[18px] bg-slate-100" />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Skeleton className="h-6 w-48 rounded-full bg-slate-200" />
                        <Skeleton className="h-7 w-28 rounded-full bg-slate-100" />
                      </div>

                      <Skeleton className="mt-2 h-4 w-36 rounded-full bg-slate-100" />
                    </div>
                  </div>

                  <Skeleton className="mt-4 h-4 w-full rounded-full bg-slate-100" />
                  <Skeleton className="mt-2 h-4 w-11/12 rounded-full bg-slate-100" />

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Skeleton className="h-7 w-32 rounded-full bg-slate-100" />
                    <Skeleton className="h-7 w-28 rounded-full bg-slate-100" />
                  </div>
                </div>

                <Skeleton className="h-10 w-40 rounded-xl bg-slate-900/10" />
              </div>
            </div>
          ))}
        </div>
      </StudentGlassPanel>
    </div>
  );
}
