import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function ApprovedCoursesGridSkeleton({
  count = 6,
  variant = "default",
}: {
  count?: number;
  variant?: "default" | "home";
}) {
  if (variant === "home") {
    return (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: count }, (_, index) => (
          <div
            className="flex min-h-[520px] flex-col rounded-[30px] border border-white bg-white p-3"
            key={index}
          >
            <Skeleton className="h-[250px] w-full rounded-[24px] bg-[#ECEFFF]" />
            <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
              <Skeleton className="h-3 w-28 rounded-full bg-[#ECEFFF]" />
              <Skeleton className="mt-3 h-7 w-full rounded-full bg-[#ECEFFF]" />
              <Skeleton className="mt-2 h-7 w-3/4 rounded-full bg-[#ECEFFF]" />
              <Skeleton className="mt-5 h-3 w-full rounded-full bg-[#F3F5FF]" />
              <Skeleton className="mt-2 h-3 w-5/6 rounded-full bg-[#F3F5FF]" />
              <div className="mt-auto flex items-end justify-between border-t border-[#ECEFFF] pt-5">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24 rounded-full bg-[#ECEFFF]" />
                  <Skeleton className="h-3 w-28 rounded-full bg-[#F3F5FF]" />
                </div>
                <Skeleton className="size-10 rounded-full bg-[#ECEFFF]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <Card
          key={index}
          className="overflow-hidden rounded-2xl border-[rgba(var(--frontier-home-border-rgb),0.8)] bg-white/90"
        >
          <Skeleton className="aspect-video w-full rounded-none" />

          <CardContent className="space-y-4 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-6 w-44" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>

            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-16 rounded-full" />
            </div>
          </CardContent>

          <Separator className="bg-muted/60" />

          <CardFooter className="flex items-center justify-between gap-3 p-4">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-9 w-28 rounded-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
