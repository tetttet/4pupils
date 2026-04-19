import type { Course } from "@/types/course";
import type {
  CourseApplication,
  CourseApplicationStatus,
} from "@/types/course-application";

import type { ApplicationWorkflowAction } from "./types";

export function formatDate(value?: string | null) {
  if (!value) return "—";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

export function formatDateTime(value?: string | null) {
  if (!value) return "—";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

export function formatCount(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value);
}

export function normalizeText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function getApplicantName(application: CourseApplication) {
  const fullName = [
    application.applicant_first_name,
    application.applicant_last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || application.applicant_email || "Неизвестный студент";
}

export function matchesCourseQuery(course: Course, query: string) {
  if (!query) return true;

  const haystack = [
    course.title,
    course.slug,
    course.category,
    course.level,
    course.language,
    course.short_description,
    course.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export function matchesApplicationQuery(application: CourseApplication, query: string) {
  if (!query) return true;

  const haystack = [
    application.applicant_first_name,
    application.applicant_last_name,
    application.applicant_email,
    application.message,
    application.experience_text,
    application.motivation_text,
    application.portfolio_url,
    application.resume_url,
    application.review_note,
    application.internal_note,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export function getApplicationExcerpt(application: CourseApplication) {
  return (
    normalizeText(application.motivation_text ?? "") ||
    normalizeText(application.message ?? "") ||
    normalizeText(application.experience_text ?? "") ||
    "Студент не добавил текстовое описание."
  );
}

export function getUrlPreview(value?: string | null) {
  if (!value) return "—";

  try {
    const url = new URL(value);
    return `${url.host}${url.pathname === "/" ? "" : url.pathname}`;
  } catch {
    return value;
  }
}

export function getAvailableApplicationActions(status: CourseApplicationStatus) {
  switch (status) {
    case "pending":
      return ["reviewing", "approve", "reject"] as ApplicationWorkflowAction[];
    case "reviewing":
      return ["approve", "reject"] as ApplicationWorkflowAction[];
    default:
      return [] as ApplicationWorkflowAction[];
  }
}

export function getSuccessMessage(action: ApplicationWorkflowAction) {
  switch (action) {
    case "reviewing":
      return "Заявка переведена в работу";
    case "approve":
      return "Заявка одобрена";
    case "reject":
      return "Заявка отклонена";
    default:
      return "Статус заявки обновлён";
  }
}

export function upsertApplication(
  applications: CourseApplication[],
  nextApplication: CourseApplication,
) {
  const exists = applications.some(
    (application) => application.application_id === nextApplication.application_id,
  );

  if (!exists) {
    return [nextApplication, ...applications];
  }

  return applications.map((application) =>
    application.application_id === nextApplication.application_id
      ? nextApplication
      : application,
  );
}
