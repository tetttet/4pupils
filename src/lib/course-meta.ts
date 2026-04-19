import type { Course, CourseLifecycle } from "@/types/course";
import type {
  CourseApplication,
  CourseApplicationStatus,
} from "@/types/course-application";

export const COURSE_STATUS_META: Record<
  CourseLifecycle,
  { label: string; className: string }
> = {
  draft: {
    label: "Черновик",
    className: "border-zinc-300 bg-zinc-50 text-zinc-700",
  },
  submitted: {
    label: "На модерации",
    className: "border-zinc-900 bg-zinc-900 text-white",
  },
  approved: {
    label: "Одобрен",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  rejected: {
    label: "На доработке",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  archived: {
    label: "Архив",
    className: "border-zinc-200 bg-white text-zinc-500",
  },
};

export const COURSE_VISIBILITY_META: Record<
  Course["visibility"],
  { label: string; className: string }
> = {
  public: {
    label: "public",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  private: {
    label: "private",
    className: "border-zinc-300 bg-white text-zinc-700",
  },
};

export const APPLICATION_STATUS_META: Record<
  CourseApplicationStatus,
  {
    label: string;
    className: string;
    description: string;
  }
> = {
  pending: {
    label: "На рассмотрении",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    description: "Заявка отправлена и ждёт первого решения преподавателя.",
  },
  reviewing: {
    label: "В работе",
    className: "border-sky-200 bg-sky-50 text-sky-700",
    description: "Преподаватель уже открыл заявку и работает с ней.",
  },
  approved: {
    label: "Одобрена",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    description: "Заявка принята, доступ к курсу подтверждён.",
  },
  rejected: {
    label: "Отклонена",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    description: "По заявке принято отрицательное решение.",
  },
  withdrawn: {
    label: "Отозвана",
    className: "border-slate-200 bg-slate-100 text-slate-700",
    description: "Студент сам отозвал обращение.",
  },
};

export const ENROLLMENT_STATUS_LABELS: Record<
  NonNullable<CourseApplication["enrollment_status"]>,
  string
> = {
  active: "Доступ открыт",
  completed: "Курс завершён",
  dropped: "Обучение остановлено",
  blocked: "Доступ заблокирован",
  canceled: "Доступ отменён",
};

export const APPLICATION_STATUS_ORDER: Record<CourseApplicationStatus, number> =
  {
    pending: 0,
    reviewing: 1,
    approved: 2,
    rejected: 3,
    withdrawn: 4,
  };
