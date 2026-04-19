import {
  BookOpen,
  CheckCircle2,
  CircleOff,
  Clock3,
  GraduationCap,
  XCircle,
} from "lucide-react";

import {
  APPLICATION_STATUS_META,
  ENROLLMENT_STATUS_LABELS,
} from "@/lib/course-meta";
import type { CourseApplicationStatus } from "@/types/course-application";
import type { EnrollmentStatus } from "@/types/enrollment";

import type { StudentLessonsStatusMeta } from "./types";

const BADGE_TONE_CLASS_NAMES = {
  amber:
    "border-amber-200/80 bg-amber-50/90 text-amber-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]",
  emerald:
    "border-emerald-200/80 bg-emerald-50/90 text-emerald-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]",
  indigo:
    "border-indigo-200/80 bg-indigo-50/90 text-indigo-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]",
  rose: "border-rose-200/80 bg-rose-50/90 text-rose-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]",
  sky: "border-sky-200/80 bg-sky-50/90 text-sky-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]",
  slate:
    "border-slate-200/80 bg-slate-100/90 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]",
} as const;

type BadgeTone = keyof typeof BADGE_TONE_CLASS_NAMES;

function createApplicationMeta(
  status: CourseApplicationStatus,
  tone: BadgeTone,
  Icon: StudentLessonsStatusMeta["Icon"],
): StudentLessonsStatusMeta {
  const meta = APPLICATION_STATUS_META[status];

  return {
    label: meta.label,
    description: meta.description,
    badgeClassName: BADGE_TONE_CLASS_NAMES[tone],
    Icon,
  };
}

function createEnrollmentMeta(
  status: EnrollmentStatus,
  tone: BadgeTone,
  Icon: StudentLessonsStatusMeta["Icon"],
  description: string,
): StudentLessonsStatusMeta {
  return {
    label: ENROLLMENT_STATUS_LABELS[status],
    description,
    badgeClassName: BADGE_TONE_CLASS_NAMES[tone],
    Icon,
  };
}

export const DEFAULT_COURSE_META: StudentLessonsStatusMeta = {
  label: "Курс",
  description: "Курс доступен в вашем списке.",
  badgeClassName: BADGE_TONE_CLASS_NAMES.slate,
  Icon: BookOpen,
};

export const APPLICATION_META: Record<
  CourseApplicationStatus,
  StudentLessonsStatusMeta
> = {
  pending: createApplicationMeta("pending", "amber", Clock3),
  reviewing: createApplicationMeta("reviewing", "sky", BookOpen),
  approved: createApplicationMeta("approved", "emerald", CheckCircle2),
  rejected: createApplicationMeta("rejected", "rose", XCircle),
  withdrawn: createApplicationMeta("withdrawn", "slate", CircleOff),
};

export const ENROLLMENT_META: Record<
  EnrollmentStatus,
  StudentLessonsStatusMeta
> = {
  active: createEnrollmentMeta(
    "active",
    "emerald",
    GraduationCap,
    "Доступ к курсу открыт.",
  ),
  completed: createEnrollmentMeta(
    "completed",
    "indigo",
    CheckCircle2,
    "Курс уже завершён.",
  ),
  dropped: createEnrollmentMeta(
    "dropped",
    "amber",
    Clock3,
    "Обучение по курсу остановлено.",
  ),
  blocked: createEnrollmentMeta(
    "blocked",
    "rose",
    XCircle,
    "Доступ к курсу ограничен.",
  ),
  canceled: createEnrollmentMeta(
    "canceled",
    "slate",
    CircleOff,
    "Доступ к курсу закрыт.",
  ),
};
