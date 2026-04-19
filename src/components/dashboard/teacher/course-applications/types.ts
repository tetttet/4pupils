import type { Course } from "@/types/course";
import type {
  CourseApplication,
  CourseApplicationStatus,
} from "@/types/course-application";

export type StatusFilter = CourseApplicationStatus | "all";
export type ApplicationWorkflowAction = "reviewing" | "approve" | "reject";
export type DrawerMode = "course" | "application";

export type ActionMeta = {
  buttonLabel: string;
  buttonVariant: "default" | "destructive" | "outline" | "secondary";
  confirmTitle: string;
  confirmDescription: string;
  confirmLabel: string;
  notesHint: string;
  notesRequired?: boolean;
};

export type CourseRow = {
  course: Course;
  applications: CourseApplication[];
  totalApplications: number;
  pendingCount: number;
  approvedCount: number;
  latestApplicationAt: string | null;
  courseTextMatch: boolean;
  showCourse: boolean;
};

export type ApplicationRow = {
  course: Course;
  application: CourseApplication;
};
