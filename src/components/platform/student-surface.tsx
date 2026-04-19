import * as React from "react";

import { cn } from "@/lib/utils";

export function StudentGlassPanel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-white bg-white",
        className,
      )}
      {...props}
    />
  );
}
