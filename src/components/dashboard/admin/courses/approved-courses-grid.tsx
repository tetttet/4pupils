"use client";

import type { Course } from "@/types/course";
import ApprovedCourseCard from "./approved-course-card";

export default function ApprovedCoursesGrid({
  courses,
  emptyMessage = "Одобренные курсы пока не найдены.",
  eagerCount = 2,
  variant = "default",
}: {
  courses: Course[];
  emptyMessage?: string;
  eagerCount?: number;
  variant?: "default" | "home";
}) {
  if (!courses.length) {
    return <div className="text-muted-foreground">{emptyMessage}</div>;
  }

  return (
    <div
      className={
        variant === "home"
          ? "grid gap-5 md:grid-cols-2 xl:grid-cols-3"
          : "grid gap-6 md:grid-cols-2 xl:grid-cols-3"
      }
    >
      {courses.map((c, index) => (
        <ApprovedCourseCard
          key={c.course_id}
          course={c}
          imagePriority={index < eagerCount}
          variant={variant === "home" ? "home" : "grid"}
        />
      ))}
    </div>
  );
}
