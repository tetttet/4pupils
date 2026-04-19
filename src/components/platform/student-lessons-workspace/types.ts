import type { LucideIcon } from "lucide-react";

import type { CourseApplication } from "@/types/course-application";
import type { Enrollment } from "@/types/enrollment";

export type StudentLessonsWorkspaceProps = {
  initialApplications: CourseApplication[];
  initialEnrollments: Enrollment[];
};

export type CourseEntry = {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  application: CourseApplication | null;
  enrollment: Enrollment | null;
  updatedAt: number;
};

export type StudentLessonsStatusMeta = {
  label: string;
  description: string;
  badgeClassName: string;
  Icon: LucideIcon;
};
