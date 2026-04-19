import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function ApprovedCoursesGridSkeleton({
  count = 6,
}: {
  count?: number;
}) {
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
