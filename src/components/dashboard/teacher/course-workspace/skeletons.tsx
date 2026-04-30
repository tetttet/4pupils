import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function TeacherCourseMetricGridSkeleton() {
  return (
    <div className="grid gap-px border border-zinc-300 bg-zinc-300 sm:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="bg-white p-4">
          <Skeleton className="h-3 w-28 rounded-none bg-zinc-200" />
          <Skeleton className="mt-4 h-9 w-20 rounded-none bg-zinc-200" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-4 w-full rounded-none bg-zinc-100" />
            <Skeleton className="h-4 w-4/5 rounded-none bg-zinc-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TeacherCoursePipelineStatusGridSkeleton() {
  return (
    <div className="grid gap-px border border-zinc-300 bg-zinc-300 md:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Skeleton className="h-3 w-20 rounded-none bg-zinc-200" />
              <Skeleton className="mt-3 h-6 w-32 rounded-none bg-zinc-200" />
            </div>
            <Skeleton className="h-9 w-10 rounded-none bg-zinc-200" />
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-full rounded-none bg-zinc-100" />
            <Skeleton className="h-4 w-5/6 rounded-none bg-zinc-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TeacherCoursePanelCountSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <Skeleton
      className={cn("h-4 w-24 rounded-none bg-zinc-200", className)}
    />
  );
}

export function TeacherCourseTableRowsSkeleton({
  rows = 5,
}: {
  rows?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <tr key={index} className="border-b border-zinc-200 align-top">
          <td className="px-4 py-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-16 w-24 shrink-0 rounded-none bg-zinc-200" />
              <div className="min-w-0 flex-1 space-y-3">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-56 max-w-full rounded-none bg-zinc-200" />
                  <Skeleton className="h-3 w-36 rounded-none bg-zinc-100" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-20 rounded-none bg-zinc-100" />
                  <Skeleton className="h-6 w-16 rounded-none bg-zinc-100" />
                  <Skeleton className="h-6 w-20 rounded-none bg-zinc-100" />
                </div>
              </div>
            </div>
          </td>

          <td className="px-4 py-4">
            <div className="space-y-3">
              <Skeleton className="h-6 w-28 rounded-none bg-zinc-200" />
              <Skeleton className="h-4 w-48 max-w-full rounded-none bg-zinc-100" />
              <Skeleton className="h-4 w-36 rounded-none bg-zinc-100" />
            </div>
          </td>

          <td className="px-4 py-4">
            <div className="max-w-xs space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-3 w-24 rounded-none bg-zinc-100" />
                <Skeleton className="h-3 w-10 rounded-none bg-zinc-100" />
              </div>
              <Skeleton className="h-2 w-full rounded-none bg-zinc-200" />
              <Skeleton className="h-4 w-52 max-w-full rounded-none bg-zinc-100" />
            </div>
          </td>

          <td className="px-4 py-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 rounded-none bg-zinc-200" />
              <Skeleton className="h-3 w-28 rounded-none bg-zinc-100" />
            </div>
          </td>

          <td className="px-4 py-4">
            <div className="flex justify-end gap-2">
              <Skeleton className="h-9 w-20 rounded-none bg-zinc-100" />
              <Skeleton className="h-9 w-28 rounded-none bg-zinc-100" />
              <Skeleton className="h-9 w-28 rounded-none bg-zinc-200" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}
