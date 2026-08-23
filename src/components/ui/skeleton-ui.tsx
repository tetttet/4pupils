import { Skeleton } from "./skeleton";

export function ToolbarSkeleton() {
  return (
    <>
      <div className="flex items-center gap-3 xl:hidden">
        <Skeleton className="h-14 flex-1 rounded-[18px] bg-[#F3F5FF]" />
        <Skeleton className="h-14 w-14 rounded-[18px] bg-[#ECEFFF]" />
      </div>

      <div className="hidden xl:flex xl:items-start xl:justify-between">
        <div className="flex max-w-[920px] flex-wrap gap-2.5">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-10 w-32 rounded-full bg-[#ECEFFF]"
            />
          ))}
        </div>

        <div className="w-full xl:max-w-[360px]">
          <Skeleton className="h-14 rounded-[18px] bg-[#F3F5FF]" />
        </div>
      </div>
    </>
  );
}

export function SidebarSkeleton() {
  return (
    <aside className="hidden rounded-[28px] border border-white bg-white p-6 xl:block">
      <div>
        <Skeleton className="mb-5 h-4 w-24 rounded-full bg-[#D7DDF8]" />
        <div className="space-y-3.5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="size-5.5 rounded-[7px] bg-[#ECEFFF]" />
              <Skeleton className="h-4 w-32 rounded-full bg-[#ECEFFF]" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-7.5">
        <Skeleton className="mb-5 h-4 w-28 rounded-full bg-[#D7DDF8]" />
        <div className="space-y-3.5">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="size-5.5 rounded-[7px] bg-[#ECEFFF]" />
              <Skeleton className="h-4 w-28 rounded-full bg-[#ECEFFF]" />
            </div>
          ))}
        </div>
      </div>

      <Skeleton className="mt-8 h-4 w-40 rounded-full bg-[#ECEFFF]" />
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
