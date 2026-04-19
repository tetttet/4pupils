"use client";

import type { Course } from "@/types/course";
import ApprovedCourseCard from "./approved-course-card";

export default function ApprovedCoursesGrid({
  courses,
  emptyMessage = "Одобренные курсы пока не найдены.",
  eagerCount = 2,
}: {
  courses: Course[];
  emptyMessage?: string;
  eagerCount?: number;
}) {
  if (!courses.length) {
    return <div className="text-muted-foreground">{emptyMessage}</div>;
  }

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
      {courses.map((c, index) => (
        <ApprovedCourseCard
          key={c.course_id}
          course={c}
          imagePriority={index < eagerCount}
        />
      ))}
    </div>
  );
}
