export type CourseLifecycle =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "archived";

export type CourseVisibility = "private" | "public";

export type Course = {
  course_id: string;
  user_id: string;

  title: string;
  slug: string;

  short_description: string | null;
  description: string | null;

  image_url: string | null;
  image_public_id?: string | null;

  language: string;
  level: string | null;
  category: string | null;

  tags: string[];
  requirements: string[];
  outcomes: string[];

  price: number;
  currency: string;
  is_free?: boolean;

  rating_avg?: number | null;
  rating_count?: number | null;
  students_count?: number | null;

  visibility: CourseVisibility;
  lifecycle_status: CourseLifecycle;

  submitted_at?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  review_notes?: string | null;
  published_at?: string | null;

  created_at: string;
  updated_at: string;
};

export type { ApiOk, ApiErr } from "./api";

export const ICON_TYPES = [
  "blue",
  "orange",
  "mint",
  "pink",
  "indigo",
  "amber",
] as const;

export type CourseIconType = (typeof ICON_TYPES)[number];

export type PreparedCourse = {
  course: Course;
  href: string;
  badge: string;
  tag: string;
  level: string;
  category: string;
  priceType: string;
  searchText: string;
  type: CourseIconType;
};
