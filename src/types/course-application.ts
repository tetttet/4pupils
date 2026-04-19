import type { CourseLifecycle, CourseVisibility } from "@/types/course";

export type CourseApplicationStatus =
  | "pending"
  | "reviewing"
  | "approved"
  | "rejected"
  | "withdrawn";

export type CourseApplicationSortField =
  | "created_at"
  | "updated_at"
  | "reviewed_at"
  | "status";

export type SortDirection = "asc" | "desc";

export type CourseApplication = {
  application_id: string;
  course_id: string;
  user_id: string;
  status: CourseApplicationStatus;

  message: string | null;
  experience_text: string | null;
  motivation_text: string | null;
  portfolio_url: string | null;
  resume_url: string | null;
  internal_note: string | null;

  reviewed_at: string | null;
  reviewed_by: string | null;
  review_note: string | null;

  created_at: string;
  updated_at: string;

  course_title: string;
  course_slug: string;
  course_owner_id: string;
  course_lifecycle_status: CourseLifecycle;
  course_visibility: CourseVisibility;

  applicant_first_name: string | null;
  applicant_last_name: string | null;
  applicant_email: string | null;
  applicant_avatar_url: string | null;

  reviewer_first_name: string | null;
  reviewer_last_name: string | null;
  reviewer_email: string | null;

  enrollment_id: string | null;
  enrollment_status:
    | "active"
    | "completed"
    | "dropped"
    | "blocked"
    | "canceled"
    | null;
  enrolled_at: string | null;
};

export type CourseApplicationDraftPayload = {
  message?: string | null;
  experience_text?: string | null;
  motivation_text?: string | null;
  portfolio_url?: string | null;
  resume_url?: string | null;
};

export type CourseApplicationReviewPayload = {
  review_note?: string | null;
  internal_note?: string | null;
};

export type CourseApplicationRejectPayload = {
  review_note: string;
  internal_note?: string | null;
};

export type CourseApplicationListParams = {
  status?: CourseApplicationStatus;
  course_id?: string;
  user_id?: string;
  q?: string;
  sort?: CourseApplicationSortField;
  dir?: SortDirection;
  limit?: number;
  offset?: number;
};
