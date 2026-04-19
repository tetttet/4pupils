import { Skeleton } from "./skeleton";

export function ToolbarSkeleton() {
  return (
    <>
      <div className="flex items-center gap-3 xl:hidden">
        <Skeleton className="h-14 flex-1 rounded-xl border border-[#d0d0d0] bg-white" />
        <Skeleton className="h-14 w-14 rounded-xl border border-[#d0d0d0] bg-white" />
      </div>

      <div className="hidden xl:flex xl:items-start xl:justify-between">
        <div className="flex max-w-245 flex-wrap gap-2.5">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-12.5 w-35 rounded-xl border border-[#d0d0d0] bg-white"
            />
          ))}
        </div>

        <div className="w-full xl:max-w-98.5">
          <Skeleton className="h-14 rounded-xl border border-[#d0d0d0] bg-white" />
        </div>
      </div>
    </>
  );
}

export function SidebarSkeleton() {
  return (
    <aside className="hidden pt-1.5 xl:block">
      <div>
        <Skeleton className="mb-5 h-5 w-24 rounded bg-[#e5e5e5]" />
        <div className="space-y-3.5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="h-6.5 w-6.5 rounded-[5px] bg-[#e5e5e5]" />
              <Skeleton className="h-5 w-32 rounded bg-[#e5e5e5]" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-7.5">
        <Skeleton className="mb-5 h-5 w-28 rounded bg-[#e5e5e5]" />
        <div className="space-y-3.5">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="h-6.5 w-6.5 rounded-[5px] bg-[#e5e5e5]" />
              <Skeleton className="h-5 w-28 rounded bg-[#e5e5e5]" />
            </div>
          ))}
        </div>
      </div>

      <Skeleton className="mt-7.5 h-5 w-40 rounded bg-[#e5e5e5]" />
    </aside>
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="w-full">
      <Skeleton className="h-62.5 w-full rounded-4xl bg-[#ececec]" />
      <div className="space-y-3 px-2.5 pt-2.5">
        <Skeleton className="h-4 w-1/2 rounded bg-[#e5e5e5]" />
        <Skeleton className="h-6 w-4/5 rounded bg-[#e5e5e5]" />
        <Skeleton className="h-4 w-1/3 rounded bg-[#e5e5e5]" />
      </div>
    </div>
  );
}
