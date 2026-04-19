import type { CourseLifecycle, CourseVisibility } from "@/types/course";
import type {
  CourseApplicationStatus,
  SortDirection,
} from "@/types/course-application";

export type EnrollmentStatus =
  | "active"
  | "completed"
  | "dropped"
  | "blocked"
  | "canceled";

export type EnrollmentSource =
  | "application"
  | "manual"
  | "purchase"
  | "invite"
  | "admin";

export type EnrollmentSortField =
  | "enrolled_at"
  | "created_at"
  | "updated_at"
  | "completed_at"
  | "last_activity_at"
  | "progress_percent"
  | "status";

export type Enrollment = {
  enrollment_id: string;
  course_id: string;
  user_id: string;
  application_id: string | null;

  status: EnrollmentStatus;
  enrollment_source: EnrollmentSource;
  progress_percent: number | string;

  enrolled_at: string;
  started_at: string | null;
  completed_at: string | null;
  last_activity_at: string | null;
  note: string | null;

  created_at: string;
  updated_at: string;

  course_title: string;
  course_slug: string;
  course_owner_id: string;
  course_lifecycle_status: CourseLifecycle;
  course_visibility: CourseVisibility;

  student_first_name: string | null;
  student_last_name: string | null;
  student_email: string | null;
  student_avatar_url: string | null;

  application_status: CourseApplicationStatus | null;
  application_review_note: string | null;
  application_created_at: string | null;
};

export type ManualEnrollmentPayload = {
  user_id: string;
  enrollment_source?: Exclude<EnrollmentSource, "application">;
  progress_percent?: number;
  note?: string | null;
};

export type EnrollmentListParams = {
  status?: EnrollmentStatus;
  course_id?: string;
  user_id?: string;
  q?: string;
  sort?: EnrollmentSortField;
  dir?: SortDirection;
  limit?: number;
  offset?: number;
};

export type EnrollmentNotePayload = {
  note: string | null;
};

export type EnrollmentActionPayload = {
  note?: string | null;
};
