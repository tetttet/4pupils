"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  LayoutGrid,
  LoaderCircle,
  RefreshCw,
  Search,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";

import {
  COURSE_STATUS_META,
  ENROLLMENT_STATUS_LABELS,
} from "@/components/dashboard/teacher/course-applications/constants";
import StudentDetailsDialog, {
  type TeacherStudentContact,
} from "@/components/dashboard/teacher/lessons/student-details-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTeacherLessons } from "@/hooks/use-teacher-lessons";
import { getUserFacingErrorMessage } from "@/lib/error-messages";
import { normalizeText } from "@/lib/func";
import { cn } from "@/lib/utils";
import { TeacherSectionTabs } from "@/components/dashboard/teacher/teacher-section-tabs";
import { fetchUserById } from "@/services/user";
import type { Course } from "@/types/course";
import type {
  Enrollment,
  EnrollmentSource,
  EnrollmentStatus,
} from "@/types/enrollment";
import type { User } from "@/types/user";

type TeacherLessonsWorkspaceMode = "workspace" | "progress" | "analytics";
type EnrollmentFilter = EnrollmentStatus | "all";

type StudentProfileState = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

type CourseRow = {
  course: Course;
  students: Enrollment[];
  visibleStudents: Enrollment[];
  totalStudents: number;
  activeCount: number;
  completedCount: number;
  averageProgress: number;
  completionRate: number;
  lastActivityAt: string | null;
  courseTextMatch: boolean;
};

type HorizontalBarChartRow = {
  label: string;
  value: number;
  secondary?: string;
};

type HistogramRow = {
  label: string;
  value: number;
  caption?: string;
};

const ENROLLMENT_STATUS_SEQUENCE: EnrollmentStatus[] = [
  "active",
  "completed",
  "dropped",
  "blocked",
  "canceled",
];

const ENROLLMENT_STATUS_ORDER: Record<EnrollmentStatus, number> = {
  active: 0,
  completed: 1,
  dropped: 2,
  blocked: 3,
  canceled: 4,
};

const ENROLLMENT_STATUS_META: Record<
  EnrollmentStatus,
  { label: string; className: string }
> = {
  active: {
    label: ENROLLMENT_STATUS_LABELS.active,
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  completed: {
    label: ENROLLMENT_STATUS_LABELS.completed,
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  dropped: {
    label: ENROLLMENT_STATUS_LABELS.dropped,
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  blocked: {
    label: ENROLLMENT_STATUS_LABELS.blocked,
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  canceled: {
    label: ENROLLMENT_STATUS_LABELS.canceled,
    className: "border-zinc-300 bg-zinc-100 text-zinc-700",
  },
};

const ENROLLMENT_SOURCE_META: Record<
  EnrollmentSource,
  { label: string; description: string }
> = {
  application: {
    label: "По заявке",
    description: "Студент попал в уроки после application flow.",
  },
  manual: {
    label: "Вручную",
    description: "Преподаватель или команда добавили доступ вручную.",
  },
  purchase: {
    label: "Покупка",
    description: "Доступ был открыт после оплаты.",
  },
  invite: {
    label: "Инвайт",
    description: "Студент пришел через приглашение.",
  },
  admin: {
    label: "Админ",
    description: "Доступ выдан административно.",
  },
};

const MODE_META: Record<
  TeacherLessonsWorkspaceMode,
  {
    badge: string;
    title: string;
    subtitle: string;
    icon: React.ElementType;
  }
> = {
  workspace: {
    badge: "Студенты",
    title: "Студенты",
    subtitle: "Список учеников, их курсы, контакты и текущий статус обучения.",
    icon: LayoutGrid,
  },
  progress: {
    badge: "Прогресс обучения",
    title: "Прогресс студентов",
    subtitle: "Посмотрите, кто учится активно, а кому нужна помощь.",
    icon: TrendingUp,
  },
  analytics: {
    badge: "Аналитика уроков",
    title: "Аналитика обучения",
    subtitle: "Общая картина по прогрессу, активности и нагрузке на курсы.",
    icon: BarChart3,
  },
};

const countFormatter = new Intl.NumberFormat("ru-RU");
const integerFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 0,
});
const decimalFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 1,
});
const dateTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatCount(value: number) {
  return countFormatter.format(value);
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return dateTimeFormatter.format(date);
}

function formatProgress(value: number | string) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return "0%";
  }

  return `${Math.max(0, Math.min(100, Math.round(parsed)))}%`;
}

function getProgressNumber(value: number | string) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(100, parsed));
}

function formatAverage(value: number) {
  const normalized =
    value >= 10 ? Math.round(value) : Math.round(value * 10) / 10;

  return (normalized % 1 === 0 ? integerFormatter : decimalFormatter).format(
    normalized,
  );
}

function formatShare(part: number, whole: number) {
  if (!whole) return "0%";
  return `${Math.round((part / whole) * 100)}%`;
}

function getEffectiveActivityAt(enrollment: Enrollment) {
  return enrollment.last_activity_at ?? enrollment.updated_at ?? enrollment.enrolled_at;
}

function daysSince(value?: string | null) {
  if (!value) return Number.POSITIVE_INFINITY;

  const parsed = new Date(value).getTime();
  if (Number.isNaN(parsed)) return Number.POSITIVE_INFINITY;

  return Math.floor((Date.now() - parsed) / (1000 * 60 * 60 * 24));
}

function formatAgeLabel(value?: string | null) {
  const days = daysSince(value);

  if (!Number.isFinite(days)) return "—";
  if (days <= 0) return "сегодня";
  if (days === 1) return "1 день";

  return `${days} дн.`;
}

function getProfileStatusLabel(status?: User["status"]) {
  if (status === "blocked") return "Ограничен";
  if (status === "active") return "Активен";
  return "—";
}

function getStudentName(enrollment: Enrollment) {
  return (
    [enrollment.student_first_name, enrollment.student_last_name]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    enrollment.student_email ||
    "Студент без имени"
  );
}

function matchesCourseQuery(course: Course, normalizedQuery: string) {
  if (!normalizedQuery) return true;

  return normalizeText(
    [
      course.title,
      course.slug,
      course.category,
      course.level,
      course.language,
      course.short_description,
    ]
      .filter(Boolean)
      .join(" "),
  ).includes(normalizedQuery);
}

function matchesEnrollmentQuery(enrollment: Enrollment, normalizedQuery: string) {
  if (!normalizedQuery) return true;

  return normalizeText(
    [
      getStudentName(enrollment),
      enrollment.student_email,
      enrollment.note,
      enrollment.status,
      enrollment.application_status,
      enrollment.course_title,
      enrollment.course_slug,
      ENROLLMENT_SOURCE_META[enrollment.enrollment_source].label,
    ]
      .filter(Boolean)
      .join(" "),
  ).includes(normalizedQuery);
}

function getUniqueStudentCount(enrollments: Enrollment[]) {
  return new Set(enrollments.map((item) => item.user_id)).size;
}

function getStudentFirstName(enrollment: Enrollment, user?: User | null) {
  return user?.first_name || enrollment.student_first_name || "—";
}

function getStudentLastName(enrollment: Enrollment, user?: User | null) {
  return user?.last_name || enrollment.student_last_name || "—";
}

function buildFallbackStudent(enrollment: Enrollment): TeacherStudentContact {
  return {
    id: enrollment.user_id,
    first_name: enrollment.student_first_name ?? "",
    last_name: enrollment.student_last_name ?? "",
    email: enrollment.student_email ?? "",
    phone: null,
    avatar_url: enrollment.student_avatar_url ?? null,
    role: "student",
    status: "active",
  };
}

function MetricCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="border border-zinc-300 bg-white p-4">
      <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
        {value}
      </div>
      <div className="mt-2 text-sm leading-5 text-zinc-600">{note}</div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-zinc-300 bg-white">
      <div className="flex flex-col gap-3 border-b border-zinc-300 px-4 py-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-sm font-semibold text-zinc-950">{title}</div>
          {subtitle ? (
            <div className="mt-1 text-sm leading-5 text-zinc-600">
              {subtitle}
            </div>
          ) : null}
        </div>

        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>

      {children}
    </section>
  );
}

function CompactTable({
  headers,
  rows,
  emptyLabel = "Нет данных",
}: {
  headers: string[];
  rows: React.ReactNode[][];
  emptyLabel?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-zinc-100 text-left">
          <tr className="border-b border-zinc-300 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
            {headers.map((header) => (
              <th key={header} className="px-4 py-3">
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-8 text-sm text-zinc-500" colSpan={headers.length}>
                {emptyLabel}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-zinc-200 align-top last:border-b-0"
              >
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3 text-zinc-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function HorizontalBarChart({
  rows,
  emptyLabel = "Нет данных",
  valueFormatter = formatCount,
}: {
  rows: HorizontalBarChartRow[];
  emptyLabel?: string;
  valueFormatter?: (value: number) => string;
}) {
  const maxValue = rows.reduce((max, row) => Math.max(max, row.value), 0);

  if (rows.length === 0) {
    return <div className="p-4 text-sm text-zinc-500">{emptyLabel}</div>;
  }

  return (
    <div className="space-y-3 p-4">
      {rows.map((row) => {
        const width =
          maxValue > 0 ? Math.max((row.value / maxValue) * 100, 2) : 0;

        return (
          <div key={row.label} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-zinc-950">
                  {row.label}
                </div>
                {row.secondary ? (
                  <div className="mt-0.5 text-xs text-zinc-500">
                    {row.secondary}
                  </div>
                ) : null}
              </div>
              <div className="shrink-0 text-sm font-semibold text-zinc-900">
                {valueFormatter(row.value)}
              </div>
            </div>
            <div className="h-3 border border-zinc-300 bg-zinc-100">
              <div
                className="h-full bg-zinc-900 transition-all"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HistogramChart({
  rows,
  emptyLabel = "Нет данных",
}: {
  rows: HistogramRow[];
  emptyLabel?: string;
}) {
  const maxValue = rows.reduce((max, row) => Math.max(max, row.value), 0);

  if (rows.length === 0) {
    return <div className="p-4 text-sm text-zinc-500">{emptyLabel}</div>;
  }

  return (
    <div className="p-4">
      <div
        className="grid h-72 gap-3"
        style={{
          gridTemplateColumns: `repeat(${rows.length}, minmax(0, 1fr))`,
        }}
      >
        {rows.map((row) => {
          const height =
            maxValue > 0 ? Math.max((row.value / maxValue) * 100, 4) : 4;

          return (
            <div key={row.label} className="flex min-w-0 flex-col justify-end gap-2">
              <div className="flex-1 border border-zinc-300 bg-zinc-100 p-2">
                <div className="flex h-full flex-col justify-end">
                  <div
                    className="w-full bg-zinc-900 transition-all"
                    style={{ height: `${height}%` }}
                  />
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-zinc-950">
                  {formatCount(row.value)}
                </div>
                <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                  {row.label}
                </div>
                {row.caption ? (
                  <div className="mt-1 text-[11px] leading-4 text-zinc-500">
                    {row.caption}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProgressMeter({
  value,
}: {
  value: number;
}) {
  return (
    <div className="max-w-[180px] space-y-2">
      <div className="flex items-center justify-between gap-2 text-xs uppercase tracking-[0.14em] text-zinc-500">
        <span>Прогресс</span>
        <span>{formatProgress(value)}</span>
      </div>
      <div className="h-2 bg-zinc-200">
        <div className="h-full bg-zinc-900 transition-all" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function TeacherLessonsWorkspace({
  mode = "workspace",
}: {
  mode?: TeacherLessonsWorkspaceMode;
}) {
  const { courses, enrollments, loading, refreshing, error, load } =
    useTeacherLessons();

  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<EnrollmentFilter>("all");
  const [selectedCourseId, setSelectedCourseId] = React.useState<string | null>(
    null,
  );
  const [selectedEnrollmentId, setSelectedEnrollmentId] = React.useState<
    string | null
  >(null);
  const [studentProfiles, setStudentProfiles] = React.useState<
    Record<string, StudentProfileState>
  >({});
  const pendingProfileUpdatesRef = React.useRef<
    Record<string, StudentProfileState>
  >({});
  const profileUpdateFrameRef = React.useRef<number | null>(null);

  const queueProfileUpdate = React.useCallback(
    (userId: string, profileState: StudentProfileState) => {
      pendingProfileUpdatesRef.current[userId] = profileState;

      if (profileUpdateFrameRef.current !== null) return;

      profileUpdateFrameRef.current = window.requestAnimationFrame(() => {
        profileUpdateFrameRef.current = null;
        const updates = pendingProfileUpdatesRef.current;
        pendingProfileUpdatesRef.current = {};

        setStudentProfiles((current) => ({ ...current, ...updates }));
      });
    },
    [],
  );

  React.useEffect(() => {
    return () => {
      if (profileUpdateFrameRef.current !== null) {
        window.cancelAnimationFrame(profileUpdateFrameRef.current);
        profileUpdateFrameRef.current = null;
      }

      pendingProfileUpdatesRef.current = {};
    };
  }, []);

  const deferredQuery = React.useDeferredValue(query);
  const normalizedQuery = normalizeText(deferredQuery);
  const meta = MODE_META[mode];
  const initialLoading = loading && courses.length === 0 && enrollments.length === 0;

  const enrollmentsByCourse = React.useMemo(() => {
    const map = new Map<string, Enrollment[]>();

    enrollments.forEach((enrollment) => {
      const list = map.get(enrollment.course_id);

      if (list) {
        list.push(enrollment);
      } else {
        map.set(enrollment.course_id, [enrollment]);
      }
    });

    map.forEach((items) => {
      items.sort((left, right) => {
        return (
          new Date(getEffectiveActivityAt(right)).getTime() -
            new Date(getEffectiveActivityAt(left)).getTime() ||
          getStudentName(left).localeCompare(getStudentName(right), "ru")
        );
      });
    });

    return map;
  }, [enrollments]);

  const allCourseRows = React.useMemo<CourseRow[]>(() => {
    return courses
      .map((course) => {
        const students = enrollmentsByCourse.get(course.course_id) ?? [];
        const totalStudents = students.length;
        const activeCount = students.filter((student) => student.status === "active")
          .length;
        const completedCount = students.filter(
          (student) => student.status === "completed",
        ).length;
        const averageProgress = totalStudents
          ? students.reduce(
              (sum, student) => sum + getProgressNumber(student.progress_percent),
              0,
            ) / totalStudents
          : 0;

        return {
          course,
          students,
          visibleStudents: students,
          totalStudents,
          activeCount,
          completedCount,
          averageProgress,
          completionRate: totalStudents
            ? Math.round((completedCount / totalStudents) * 100)
            : 0,
          lastActivityAt: students[0] ? getEffectiveActivityAt(students[0]) : null,
          courseTextMatch: true,
        };
      })
      .sort((left, right) => {
        return (
          right.totalStudents - left.totalStudents ||
          new Date(right.lastActivityAt ?? 0).getTime() -
            new Date(left.lastActivityAt ?? 0).getTime() ||
          left.course.title.localeCompare(right.course.title, "ru")
        );
      });
  }, [courses, enrollmentsByCourse]);

  const courseRows = React.useMemo<CourseRow[]>(() => {
    return allCourseRows
      .flatMap((row) => {
        const courseTextMatch = matchesCourseQuery(row.course, normalizedQuery);
        const visibleStudents =
          !normalizedQuery || courseTextMatch
            ? row.students
            : row.students.filter((student) =>
                matchesEnrollmentQuery(student, normalizedQuery),
              );

        const shouldShow =
          !normalizedQuery || courseTextMatch || visibleStudents.length > 0;

        if (!shouldShow) {
          return [];
        }

        return [
          {
            ...row,
            visibleStudents,
            courseTextMatch,
          },
        ];
      });
  }, [allCourseRows, normalizedQuery]);

  React.useEffect(() => {
    if (!courseRows.length) {
      setSelectedCourseId(null);
      return;
    }

    if (
      selectedCourseId &&
      courseRows.some((row) => row.course.course_id === selectedCourseId)
    ) {
      return;
    }

    setSelectedCourseId(courseRows[0].course.course_id);
  }, [courseRows, selectedCourseId]);

  const selectedCourseRow = React.useMemo(
    () =>
      courseRows.find((row) => row.course.course_id === selectedCourseId) ?? null,
    [courseRows, selectedCourseId],
  );

  const selectedEnrollment = React.useMemo(
    () =>
      selectedEnrollmentId
        ? enrollments.find(
            (enrollment) => enrollment.enrollment_id === selectedEnrollmentId,
          ) ?? null
        : null,
    [enrollments, selectedEnrollmentId],
  );

  React.useEffect(() => {
    const userIds = Array.from(
      new Set(
        (selectedCourseRow?.visibleStudents ?? []).map((student) => student.user_id),
      ),
    );

    if (!userIds.length) return;

    let active = true;

    userIds.forEach((userId) => {
      let shouldLoad = false;

      setStudentProfiles((current) => {
        const existing = current[userId];

        if (existing?.user || existing?.loading || existing?.error) {
          return current;
        }

        shouldLoad = true;

        return {
          ...current,
          [userId]: {
            user: null,
            loading: true,
            error: null,
          },
        };
      });

      if (!shouldLoad) {
        return;
      }

      fetchUserById(userId)
        .then((user) => {
          if (!active) return;

          queueProfileUpdate(userId, {
            user,
            loading: false,
            error: null,
          });
        })
        .catch((loadError) => {
          if (!active) return;

          queueProfileUpdate(userId, {
            user: null,
            loading: false,
            error: getUserFacingErrorMessage(
              loadError,
              "Не удалось загрузить полный профиль ученика",
            ),
          });
        });
    });

    return () => {
      active = false;
    };
  }, [queueProfileUpdate, selectedCourseRow]);

  React.useEffect(() => {
    const userId = selectedEnrollment?.user_id;

    if (!userId) return;

    const existing = studentProfiles[userId];
    if (existing?.user || existing?.loading || existing?.error) {
      return;
    }

    let active = true;

    setStudentProfiles((current) => ({
      ...current,
      [userId]: {
        user: null,
        loading: true,
        error: null,
      },
    }));

    fetchUserById(userId)
      .then((user) => {
        if (!active) return;

        queueProfileUpdate(userId, {
          user,
          loading: false,
          error: null,
        });
      })
      .catch((loadError) => {
        if (!active) return;

        queueProfileUpdate(userId, {
          user: null,
          loading: false,
          error: getUserFacingErrorMessage(
            loadError,
            "Не удалось загрузить полный профиль ученика",
          ),
        });
      });

    return () => {
      active = false;
    };
  }, [queueProfileUpdate, selectedEnrollment, studentProfiles]);

  const selectedStudentUserId = selectedEnrollment?.user_id ?? null;
  const selectedProfileState = selectedStudentUserId
    ? studentProfiles[selectedStudentUserId]
    : undefined;

  const selectedStudent: TeacherStudentContact | null = selectedEnrollment
    ? selectedProfileState?.user
      ? {
          id: selectedProfileState.user.id,
          first_name: selectedProfileState.user.first_name,
          last_name: selectedProfileState.user.last_name,
          email: selectedProfileState.user.email,
          phone: selectedProfileState.user.phone,
          avatar_url: selectedProfileState.user.avatar_url,
          status: selectedProfileState.user.status,
          role: selectedProfileState.user.role,
          created_at: selectedProfileState.user.created_at,
          updated_at: selectedProfileState.user.updated_at,
          last_login_at: selectedProfileState.user.last_login_at,
        }
      : buildFallbackStudent(selectedEnrollment)
    : null;

  const totalCoursesWithStudents = React.useMemo(
    () => allCourseRows.filter((course) => course.totalStudents > 0).length,
    [allCourseRows],
  );

  const uniqueStudentsCount = React.useMemo(
    () => getUniqueStudentCount(enrollments),
    [enrollments],
  );

  const activeStudentsCount = React.useMemo(
    () => enrollments.filter((item) => item.status === "active").length,
    [enrollments],
  );

  const completedStudentsCount = React.useMemo(
    () => enrollments.filter((item) => item.status === "completed").length,
    [enrollments],
  );

  const averageProgress = React.useMemo(
    () =>
      enrollments.length
        ? enrollments.reduce(
            (sum, enrollment) =>
              sum + getProgressNumber(enrollment.progress_percent),
            0,
          ) / enrollments.length
        : 0,
    [enrollments],
  );

  const activeWithin7DaysCount = React.useMemo(
    () =>
      enrollments.filter(
        (item) => daysSince(getEffectiveActivityAt(item)) <= 7,
      ).length,
    [enrollments],
  );

  const staleActiveCount = React.useMemo(
    () =>
      enrollments.filter((item) => {
        if (item.status !== "active") return false;
        return daysSince(getEffectiveActivityAt(item)) > 14;
      }).length,
    [enrollments],
  );

  const completionRate = enrollments.length
    ? Math.round((completedStudentsCount / enrollments.length) * 100)
    : 0;

  const activeRate = enrollments.length
    ? Math.round((activeStudentsCount / enrollments.length) * 100)
    : 0;

  const avgStudentsPerActiveCourse = totalCoursesWithStudents
    ? enrollments.length / totalCoursesWithStudents
    : 0;

  const statusCounts = React.useMemo(() => {
    const counts = {
      active: 0,
      completed: 0,
      dropped: 0,
      blocked: 0,
      canceled: 0,
    } satisfies Record<EnrollmentStatus, number>;

    enrollments.forEach((enrollment) => {
      counts[enrollment.status] += 1;
    });

    return counts;
  }, [enrollments]);

  const sourceCounts = React.useMemo(() => {
    const counts = {
      application: 0,
      manual: 0,
      purchase: 0,
      invite: 0,
      admin: 0,
    } satisfies Record<EnrollmentSource, number>;

    enrollments.forEach((enrollment) => {
      counts[enrollment.enrollment_source] += 1;
    });

    return counts;
  }, [enrollments]);

  const visibleEnrollments = React.useMemo(() => {
    return [...enrollments]
      .filter((enrollment) => {
        if (statusFilter !== "all" && enrollment.status !== statusFilter) {
          return false;
        }

        if (!normalizedQuery) return true;
        return matchesEnrollmentQuery(enrollment, normalizedQuery);
      })
      .sort((left, right) => {
        const statusDiff =
          ENROLLMENT_STATUS_ORDER[left.status] -
          ENROLLMENT_STATUS_ORDER[right.status];

        if (statusDiff !== 0) {
          return statusDiff;
        }

        return (
          new Date(getEffectiveActivityAt(right)).getTime() -
            new Date(getEffectiveActivityAt(left)).getTime() ||
          getStudentName(left).localeCompare(getStudentName(right), "ru")
        );
      });
  }, [enrollments, normalizedQuery, statusFilter]);

  const attentionEnrollments = React.useMemo(() => {
    return [...enrollments]
      .filter((enrollment) => {
        if (enrollment.status !== "active") return false;

        const progress = getProgressNumber(enrollment.progress_percent);
        const age = daysSince(getEffectiveActivityAt(enrollment));

        return progress < 35 && age >= 7;
      })
      .sort((left, right) => {
        const ageDiff =
          daysSince(getEffectiveActivityAt(right)) -
          daysSince(getEffectiveActivityAt(left));

        if (ageDiff !== 0) {
          return ageDiff;
        }

        return (
          getProgressNumber(left.progress_percent) -
          getProgressNumber(right.progress_percent)
        );
      });
  }, [enrollments]);

  const recentActivityEnrollments = React.useMemo(() => {
    return [...enrollments]
      .sort((left, right) => {
        return (
          new Date(getEffectiveActivityAt(right)).getTime() -
          new Date(getEffectiveActivityAt(left)).getTime()
        );
      })
      .slice(0, 8);
  }, [enrollments]);

  const courseLoadRows = React.useMemo(
    () => allCourseRows.filter((row) => row.totalStudents > 0).slice(0, 8),
    [allCourseRows],
  );

  const topProgressRows = React.useMemo(
    () =>
      [...allCourseRows]
        .filter((row) => row.totalStudents > 0)
        .sort((left, right) => {
          return (
            right.averageProgress - left.averageProgress ||
            right.totalStudents - left.totalStudents ||
            left.course.title.localeCompare(right.course.title, "ru")
          );
        })
        .slice(0, 8),
    [allCourseRows],
  );

  const progressHistogramRows = React.useMemo(() => {
    const buckets = [
      { label: "0-9%", min: 0, max: 9 },
      { label: "10-39%", min: 10, max: 39 },
      { label: "40-69%", min: 40, max: 69 },
      { label: "70-99%", min: 70, max: 99 },
      { label: "100%", min: 100, max: 100 },
    ];

    return buckets.map((bucket) => {
      const count = enrollments.filter((enrollment) => {
        const progress = Math.round(getProgressNumber(enrollment.progress_percent));
        return progress >= bucket.min && progress <= bucket.max;
      }).length;

      return {
        label: bucket.label,
        value: count,
        caption: `${formatShare(count, enrollments.length)} учеников`,
      };
    });
  }, [enrollments]);

  const activityHistogramRows = React.useMemo(() => {
    const buckets = [
      { label: "0-1 дн", min: 0, max: 1 },
      { label: "2-7 дн", min: 2, max: 7 },
      { label: "8-14 дн", min: 8, max: 14 },
      { label: "15-30 дн", min: 15, max: 30 },
      { label: "31+ дн", min: 31, max: Number.POSITIVE_INFINITY },
    ];

    return buckets.map((bucket) => {
      const count = enrollments.filter((enrollment) => {
        const age = daysSince(getEffectiveActivityAt(enrollment));

        if (!Number.isFinite(age)) return false;
        if (bucket.max === Number.POSITIVE_INFINITY) {
          return age >= bucket.min;
        }

        return age >= bucket.min && age <= bucket.max;
      }).length;

      return {
        label: bucket.label,
        value: count,
        caption: `${formatShare(count, enrollments.length)} базы`,
      };
    });
  }, [enrollments]);

  const statusChartRows = ENROLLMENT_STATUS_SEQUENCE.map((status) => ({
    label: ENROLLMENT_STATUS_META[status].label,
    value: statusCounts[status],
    secondary: `${formatShare(statusCounts[status], enrollments.length)} всех enrollments`,
  }));

  const sourceChartRows = (Object.keys(ENROLLMENT_SOURCE_META) as EnrollmentSource[]).map(
    (source) => ({
      label: ENROLLMENT_SOURCE_META[source].label,
      value: sourceCounts[source],
      secondary: `${formatShare(sourceCounts[source], enrollments.length)} базы`,
    }),
  );

  const courseLoadChartRows = courseLoadRows.map((row) => ({
    label: row.course.title,
    value: row.totalStudents,
    secondary: `${formatShare(row.totalStudents, enrollments.length)} от всех учеников`,
  }));

  const courseProgressChartRows = topProgressRows.map((row) => ({
    label: row.course.title,
    value: Math.round(row.averageProgress),
    secondary: `${formatCount(row.totalStudents)} учеников, completion ${row.completionRate}%`,
  }));

  const summaryMetrics = React.useMemo(() => {
    if (mode === "workspace") {
      return [
        {
          label: "Курсы",
          value: initialLoading ? "—" : formatCount(courses.length),
          note: "Все курсы преподавателя, которые доступны в рабочей зоне.",
        },
        {
          label: "Учеников",
          value: initialLoading ? "—" : formatCount(uniqueStudentsCount),
          note: "Уникальные ученики по всем вашим урокам и доступам.",
        },
        {
          label: "Активно учатся",
          value: initialLoading ? "—" : formatCount(activeStudentsCount),
          note: "Студенты со статусом active, которым можно писать прямо сейчас.",
        },
        {
          label: "Курсов с набором",
          value: initialLoading ? "—" : formatCount(totalCoursesWithStudents),
          note: "Курсы, где уже есть хотя бы один ученик в системе.",
        },
      ];
    }

    if (mode === "progress") {
      return [
        {
          label: "Активные",
          value: initialLoading ? "—" : formatCount(activeStudentsCount),
          note: "Текущая рабочая группа, которая проходит обучение прямо сейчас.",
        },
        {
          label: "Завершили",
          value: initialLoading ? "—" : formatCount(completedStudentsCount),
          note: "Ученики, которые уже дошли до completed.",
        },
        {
          label: "Средний прогресс",
          value: initialLoading ? "—" : `${formatAverage(averageProgress)}%`,
          note: "Средний срез по progress_percent во всей lesson-базе.",
        },
        {
          label: "Активность 7 дней",
          value: initialLoading ? "—" : formatCount(activeWithin7DaysCount),
          note: "Ученики, у которых был свежий activity signal за последнюю неделю.",
        },
      ];
    }

    return [
      {
        label: "Active rate",
        value: initialLoading ? "—" : `${activeRate}%`,
        note: "Доля enrollments, которые сейчас реально находятся в active.",
      },
      {
        label: "Completion rate",
        value: initialLoading ? "—" : `${completionRate}%`,
        note: "Доля completed среди всех учеников на ваших курсах.",
      },
      {
        label: "Ср. учеников на курс",
        value: initialLoading ? "—" : formatAverage(avgStudentsPerActiveCourse),
        note: "Средняя учебная нагрузка на курсы, где есть хотя бы один ученик.",
      },
      {
        label: "Требуют внимания",
        value: initialLoading ? "—" : formatCount(staleActiveCount),
        note: "Активные ученики без свежей активности дольше двух недель.",
      },
    ];
  }, [
    activeRate,
    activeStudentsCount,
    activeWithin7DaysCount,
    averageProgress,
    completedStudentsCount,
    completionRate,
    courses.length,
    avgStudentsPerActiveCourse,
    initialLoading,
    mode,
    staleActiveCount,
    totalCoursesWithStudents,
    uniqueStudentsCount,
  ]);

  const handleOpenStudent = React.useCallback((enrollment: Enrollment) => {
    setSelectedEnrollmentId(enrollment.enrollment_id);
  }, []);

  const renderWorkspaceToolbar = (
    <div className="border-b border-zinc-300 bg-white p-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск по курсу, ученику, email или статусу"
          className="h-11 rounded-none border-zinc-300 pl-10 shadow-none"
        />
      </div>
    </div>
  );

  const renderProgressToolbar = (
    <div className="grid gap-px border-b border-zinc-300 bg-zinc-300 lg:grid-cols-[minmax(0,1fr)_240px]">
      <div className="relative bg-white p-3">
        <Search className="pointer-events-none absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск по ученику, курсу, email, note или источнику"
          className="h-11 rounded-none border-zinc-300 pl-10 shadow-none"
        />
      </div>

      <div className="bg-white p-3">
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as EnrollmentFilter)}
        >
          <SelectTrigger className="h-11 w-full rounded-none border-zinc-300 shadow-none">
            <SelectValue placeholder="Статус обучения" />
          </SelectTrigger>
          <SelectContent className="rounded-none border-zinc-300">
            <SelectItem value="all">Все статусы</SelectItem>
            {ENROLLMENT_STATUS_SEQUENCE.map((status) => (
              <SelectItem key={status} value={status}>
                {ENROLLMENT_STATUS_META[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderWorkspaceView = (
    <div className="space-y-6">
      {!initialLoading && courses.length === 0 ? (
        <div className="border border-zinc-300 bg-white p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-zinc-300 bg-zinc-50 text-zinc-600">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="mt-4 text-lg font-semibold text-zinc-950">
            У преподавателя пока нет курсов
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Как только курс появится, здесь можно будет увидеть список учеников и
            их контакты.
          </p>
          <div className="mt-4">
            <Button asChild>
              <Link href="/dashboard/teacher/courses/create">Создать курс</Link>
            </Button>
          </div>
        </div>
      ) : null}

      {(initialLoading || courses.length > 0) && (
        <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <Panel
            title="Список курсов"
            subtitle="Открывай курс слева и смотри полный список учеников справа."
            actions={
              <Badge
                variant="outline"
                className="rounded-full border-zinc-300 bg-white px-3 py-1 text-[11px] text-zinc-700"
              >
                {initialLoading ? "—" : formatCount(courseRows.length)}
              </Badge>
            }
          >
            {renderWorkspaceToolbar}

            <div className="space-y-3 p-5">
              {initialLoading ? (
                <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-600">
                  Загружаю курсы и уроки преподавателя...
                </div>
              ) : courseRows.length > 0 ? (
                courseRows.map((row) => {
                  const selected = row.course.course_id === selectedCourseId;

                  return (
                    <button
                      key={row.course.course_id}
                      type="button"
                      onClick={() => setSelectedCourseId(row.course.course_id)}
                      className={cn(
                        "w-full border p-4 text-left transition-colors",
                        selected
                          ? "border-zinc-950 bg-zinc-950 text-white"
                          : "border-zinc-300 bg-white hover:border-zinc-400",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">
                            {row.course.title}
                          </div>
                          <div
                            className={cn(
                              "mt-1 truncate text-xs font-mono",
                              selected ? "text-zinc-300" : "text-zinc-500",
                            )}
                          >
                            {row.course.slug}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-semibold tracking-tight">
                            {formatCount(row.totalStudents)}
                          </div>
                          <div
                            className={cn(
                              "text-[11px]",
                              selected ? "text-zinc-300" : "text-zinc-500",
                            )}
                          >
                            учеников
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full border px-3 py-1 text-[11px]",
                            selected
                              ? "border-white/20 bg-white/10 text-white"
                              : COURSE_STATUS_META[row.course.lifecycle_status].className,
                          )}
                        >
                          {COURSE_STATUS_META[row.course.lifecycle_status].label}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full border px-3 py-1 text-[11px]",
                            selected
                              ? "border-white/20 bg-white/10 text-white"
                              : "border-zinc-300 bg-zinc-50 text-zinc-700",
                          )}
                        >
                          {formatCount(row.activeCount)} активных
                        </Badge>
                      </div>

                      <div
                        className={cn(
                          "mt-4 flex items-center justify-between gap-3 text-xs",
                          selected ? "text-zinc-300" : "text-zinc-500",
                        )}
                      >
                        <span>
                          {row.totalStudents > 0
                            ? `${formatCount(row.totalStudents)} учеников`
                            : "Пока никто не записан"}
                        </span>
                        <span>Активность: {formatDateTime(row.lastActivityAt)}</span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-600">
                  Ничего не найдено по текущему запросу.
                </div>
              )}
            </div>
          </Panel>

          <div className="space-y-4">
            {selectedCourseRow ? (
              <>
                <Panel
                  title={selectedCourseRow.course.title}
                  subtitle={
                    selectedCourseRow.course.short_description?.trim() ||
                    "Краткое описание пока не заполнено, но список учеников уже можно отслеживать здесь."
                  }
                  actions={
                    <Button asChild variant="outline">
                      <Link
                        href={`/dashboard/teacher/courses/${selectedCourseRow.course.course_id}/edit`}
                      >
                        Открыть курс
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  }
                >
                  <div className="space-y-5 p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`rounded-full border px-3 py-1 text-[11px] ${COURSE_STATUS_META[selectedCourseRow.course.lifecycle_status].className}`}
                      >
                        {COURSE_STATUS_META[selectedCourseRow.course.lifecycle_status].label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="rounded-full border-zinc-300 bg-zinc-50 px-3 py-1 text-[11px] text-zinc-700"
                      >
                        {selectedCourseRow.course.visibility}
                      </Badge>
                      {selectedCourseRow.courseTextMatch && normalizedQuery ? (
                        <Badge
                          variant="outline"
                          className="rounded-full border-sky-200 bg-sky-50 px-3 py-1 text-[11px] text-sky-700"
                        >
                          Совпадение по курсу
                        </Badge>
                      ) : null}
                    </div>

                    <div className="grid gap-3 lg:grid-cols-4">
                      <div className="border border-zinc-200 bg-zinc-50 p-4">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                          Всего учеников
                        </div>
                        <div className="mt-2 text-2xl font-semibold text-zinc-950">
                          {formatCount(selectedCourseRow.totalStudents)}
                        </div>
                      </div>
                      <div className="border border-zinc-200 bg-zinc-50 p-4">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                          Active
                        </div>
                        <div className="mt-2 text-2xl font-semibold text-zinc-950">
                          {formatCount(selectedCourseRow.activeCount)}
                        </div>
                      </div>
                      <div className="border border-zinc-200 bg-zinc-50 p-4">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                          Средний прогресс
                        </div>
                        <div className="mt-2 text-2xl font-semibold text-zinc-950">
                          {formatAverage(selectedCourseRow.averageProgress)}%
                        </div>
                      </div>
                      <div className="border border-zinc-200 bg-zinc-50 p-4">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                          Последняя активность
                        </div>
                        <div className="mt-2 text-sm font-semibold leading-6 text-zinc-950">
                          {formatDateTime(selectedCourseRow.lastActivityAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Panel>

                <Panel
                  title="Ученики курса"
                  subtitle="Таблица показывает только нужные поля для связи и работы с учеником."
                  actions={
                    <Badge
                      variant="outline"
                      className="rounded-full border-zinc-300 bg-white px-3 py-1 text-[11px] text-zinc-700"
                    >
                      Показано {formatCount(selectedCourseRow.visibleStudents.length)}
                      {" из "}
                      {formatCount(selectedCourseRow.totalStudents)}
                    </Badge>
                  }
                >
                  {selectedCourseRow.visibleStudents.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-white">
                          <TableHead className="px-5">Email</TableHead>
                          <TableHead>Телефон</TableHead>
                          <TableHead>Статус обучения</TableHead>
                          <TableHead>Прогресс</TableHead>
                          <TableHead>Имя</TableHead>
                          <TableHead>Фамилия</TableHead>
                          <TableHead>Статус профиля</TableHead>
                          <TableHead className="px-5 text-right">
                            Действия
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedCourseRow.visibleStudents.map((enrollment) => {
                          const statusMeta = ENROLLMENT_STATUS_META[enrollment.status];
                          const profileState = studentProfiles[enrollment.user_id];
                          const studentUser = profileState?.user ?? null;
                          const studentPhone = profileState?.loading
                            ? "Загружаю..."
                            : studentUser?.phone || "—";
                          const profileStatus = profileState?.loading
                            ? "Загружаю..."
                            : getProfileStatusLabel(studentUser?.status);

                          return (
                            <TableRow
                              key={enrollment.enrollment_id}
                              className="cursor-pointer"
                              onClick={() => handleOpenStudent(enrollment)}
                            >
                              <TableCell className="px-5">
                                <div className="max-w-[220px] truncate text-sm text-zinc-900">
                                  {studentUser?.email ||
                                    enrollment.student_email ||
                                    "Email не указан"}
                                </div>
                              </TableCell>

                              <TableCell>
                                <div className="max-w-[180px] truncate text-sm text-zinc-900">
                                  {studentPhone}
                                </div>
                              </TableCell>

                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={`rounded-full border px-3 py-1 text-[11px] ${statusMeta.className}`}
                                >
                                  {statusMeta.label}
                                </Badge>
                              </TableCell>

                              <TableCell className="font-medium text-zinc-900">
                                {formatProgress(enrollment.progress_percent)}
                              </TableCell>

                              <TableCell className="text-zinc-900">
                                {getStudentFirstName(enrollment, studentUser)}
                              </TableCell>

                              <TableCell className="text-zinc-900">
                                {getStudentLastName(enrollment, studentUser)}
                              </TableCell>

                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className="rounded-full border-zinc-300 bg-zinc-50 px-3 py-1 text-[11px] text-zinc-700"
                                >
                                  {profileStatus}
                                </Badge>
                              </TableCell>

                              <TableCell className="px-5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleOpenStudent(enrollment);
                                    }}
                                  >
                                    Контакты
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="px-5 py-10 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-zinc-300 bg-zinc-50 text-zinc-600">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="mt-4 text-base font-semibold text-zinc-950">
                        По текущему запросу учеников не найдено
                      </div>
                      <p className="mt-2 text-sm leading-6 text-zinc-600">
                        Попробуй очистить поиск или выбрать другой курс слева.
                      </p>
                    </div>
                  )}
                </Panel>
              </>
            ) : (
              <div className="border border-zinc-300 bg-white px-6 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-zinc-300 bg-zinc-50 text-zinc-600">
                  <UserRound className="h-5 w-5" />
                </div>
                <div className="mt-4 text-base font-semibold text-zinc-950">
                  Выберите курс слева
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  После выбора появится полный список учеников и карточка контактов
                  для каждого.
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );

  const renderProgressView = (
    <div className="space-y-6">
      <div className="grid gap-px border border-zinc-300 bg-zinc-300 xl:grid-cols-2">
        <Panel
          title="Группа внимания"
          subtitle="Активные ученики с низким прогрессом и без свежей активности. Это первый список, который имеет смысл разбирать."
        >
          {initialLoading ? (
            <div className="px-4 py-8 text-sm text-zinc-500">
              Собираем группу внимания...
            </div>
          ) : (
            <CompactTable
              headers={["Ученик", "Курс", "Прогресс", "Активность", "Открыть"]}
              rows={attentionEnrollments.slice(0, 8).map((enrollment) => [
                <div key={`${enrollment.enrollment_id}-student`} className="space-y-1">
                  <div className="font-medium text-zinc-950">
                    {getStudentName(enrollment)}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {enrollment.student_email || "Email не указан"}
                  </div>
                </div>,
                <button
                  key={`${enrollment.enrollment_id}-course`}
                  type="button"
                  className="text-left font-medium text-zinc-950"
                  onClick={() => setSelectedCourseId(enrollment.course_id)}
                >
                  {enrollment.course_title}
                </button>,
                <span key={`${enrollment.enrollment_id}-progress`}>
                  {formatProgress(enrollment.progress_percent)}
                </span>,
                <div key={`${enrollment.enrollment_id}-activity`} className="space-y-1">
                  <div className="font-medium text-zinc-950">
                    {formatAgeLabel(getEffectiveActivityAt(enrollment))}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {formatDateTime(getEffectiveActivityAt(enrollment))}
                  </div>
                </div>,
                <Button
                  key={`${enrollment.enrollment_id}-open`}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-none border-zinc-300"
                  onClick={() => handleOpenStudent(enrollment)}
                >
                  Контакты
                </Button>,
              ])}
              emptyLabel="Явной группы риска сейчас не видно."
            />
          )}
        </Panel>

        <Panel
          title="Свежая активность"
          subtitle="Последние движения по ученикам: удобно, чтобы быстро видеть живые курсы и тех, кто реально учится."
        >
          {initialLoading ? (
            <div className="px-4 py-8 text-sm text-zinc-500">
              Загружаем свежую активность...
            </div>
          ) : (
            <CompactTable
              headers={["Ученик", "Курс", "Статус", "Когда был активен", "Прогресс"]}
              rows={recentActivityEnrollments.map((enrollment) => [
                <div key={`${enrollment.enrollment_id}-student`} className="space-y-1">
                  <div className="font-medium text-zinc-950">
                    {getStudentName(enrollment)}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {ENROLLMENT_SOURCE_META[enrollment.enrollment_source].label}
                  </div>
                </div>,
                <button
                  key={`${enrollment.enrollment_id}-course`}
                  type="button"
                  className="text-left font-medium text-zinc-950"
                  onClick={() => setSelectedCourseId(enrollment.course_id)}
                >
                  {enrollment.course_title}
                </button>,
                <Badge
                  key={`${enrollment.enrollment_id}-status`}
                  variant="outline"
                  className={`rounded-full border px-3 py-1 text-[11px] ${ENROLLMENT_STATUS_META[enrollment.status].className}`}
                >
                  {ENROLLMENT_STATUS_META[enrollment.status].label}
                </Badge>,
                <div key={`${enrollment.enrollment_id}-activity`} className="space-y-1">
                  <div className="font-medium text-zinc-950">
                    {formatAgeLabel(getEffectiveActivityAt(enrollment))}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {formatDateTime(getEffectiveActivityAt(enrollment))}
                  </div>
                </div>,
                <span key={`${enrollment.enrollment_id}-progress`}>
                  {formatProgress(enrollment.progress_percent)}
                </span>,
              ])}
              emptyLabel="Пока нет записей об активности."
            />
          )}
        </Panel>
      </div>

      <Panel
        title="Все ученики"
        subtitle="Полный список enrollments преподавателя по всем курсам. Поиск и статус-фильтр помогают быстро собрать нужную группу."
        actions={
          <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">
            visible: {initialLoading ? "—" : formatCount(visibleEnrollments.length)}
          </div>
        }
      >
        {renderProgressToolbar}

        {initialLoading ? (
          <div className="px-5 py-14 text-sm text-zinc-600">
            Загружаем базу учеников...
          </div>
        ) : visibleEnrollments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-white">
                <TableHead className="px-5">Ученик</TableHead>
                <TableHead>Курс</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Прогресс</TableHead>
                <TableHead>Активность</TableHead>
                <TableHead>Источник</TableHead>
                <TableHead className="px-5 text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleEnrollments.map((enrollment) => {
                const progress = Math.round(getProgressNumber(enrollment.progress_percent));

                return (
                  <TableRow
                    key={enrollment.enrollment_id}
                    className="cursor-pointer"
                    onClick={() => handleOpenStudent(enrollment)}
                  >
                    <TableCell className="px-5">
                      <div className="space-y-1">
                        <div className="font-medium text-zinc-950">
                          {getStudentName(enrollment)}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {enrollment.student_email || "Email не указан"}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-zinc-950">
                          {enrollment.course_title}
                        </div>
                        <div className="text-xs font-mono text-zinc-500">
                          {enrollment.course_slug}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`rounded-full border px-3 py-1 text-[11px] ${ENROLLMENT_STATUS_META[enrollment.status].className}`}
                      >
                        {ENROLLMENT_STATUS_META[enrollment.status].label}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <ProgressMeter value={progress} />
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1 text-sm text-zinc-700">
                        <div>{formatDateTime(getEffectiveActivityAt(enrollment))}</div>
                        <div className="text-xs text-zinc-500">
                          {formatAgeLabel(getEffectiveActivityAt(enrollment))}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-zinc-950">
                          {ENROLLMENT_SOURCE_META[enrollment.enrollment_source].label}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {enrollment.application_status
                            ? `application: ${enrollment.application_status}`
                            : "без application"}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-5 text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleOpenStudent(enrollment);
                        }}
                      >
                        Контакты
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="px-5 py-12">
            <div className="border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center">
              <div className="text-base font-semibold text-zinc-950">
                По текущим фильтрам ученики не найдены
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Попробуй очистить поиск или переключить статус обучения.
              </p>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );

  const renderAnalyticsView = (
    <div className="space-y-6">
      <div className="grid gap-px border border-zinc-300 bg-zinc-300 xl:grid-cols-2">
        <Panel
          title="Нагрузка по курсам"
          subtitle="Где сейчас больше всего учеников и на какие курсы у преподавателя приходится основная учебная нагрузка."
        >
          {initialLoading ? (
            <div className="px-4 py-8 text-sm text-zinc-500">
              Считаем нагрузку по курсам...
            </div>
          ) : (
            <div className="space-y-0">
              <CompactTable
                headers={["Курс", "Учеников", "Active", "Completion"]}
                rows={courseLoadRows.map((row) => [
                  <button
                    key={`${row.course.course_id}-title`}
                    type="button"
                    className="text-left font-medium text-zinc-950"
                    onClick={() => setSelectedCourseId(row.course.course_id)}
                  >
                    {row.course.title}
                  </button>,
                  formatCount(row.totalStudents),
                  formatCount(row.activeCount),
                  `${row.completionRate}%`,
                ])}
                emptyLabel="Пока нечего сравнивать по курсам."
              />
              <div className="border-t border-zinc-300">
                <div className="border-b border-zinc-300 bg-zinc-100 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
                  Бар-чарт нагрузки по курсам
                </div>
                <HorizontalBarChart
                  rows={courseLoadChartRows}
                  emptyLabel="Курсы с учениками появятся после первых enrollments."
                />
              </div>
            </div>
          )}
        </Panel>

        <Panel
          title="Лидеры по прогрессу"
          subtitle="Курсы, где средний прогресс учеников сейчас выше всего."
        >
          {initialLoading ? (
            <div className="px-4 py-8 text-sm text-zinc-500">
              Строим рейтинг прогресса...
            </div>
          ) : (
            <div className="space-y-0">
              <CompactTable
                headers={["Курс", "Средний прогресс", "Учеников", "Completion"]}
                rows={topProgressRows.map((row) => [
                  <button
                    key={`${row.course.course_id}-title`}
                    type="button"
                    className="text-left font-medium text-zinc-950"
                    onClick={() => setSelectedCourseId(row.course.course_id)}
                  >
                    {row.course.title}
                  </button>,
                  `${formatAverage(row.averageProgress)}%`,
                  formatCount(row.totalStudents),
                  `${row.completionRate}%`,
                ])}
                emptyLabel="Появится после первых уроков и progress signals."
              />
              <div className="border-t border-zinc-300">
                <div className="border-b border-zinc-300 bg-zinc-100 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
                  Бар-чарт среднего прогресса
                </div>
                <HorizontalBarChart
                  rows={courseProgressChartRows}
                  emptyLabel="Пока нечего визуализировать."
                  valueFormatter={(value) => `${value}%`}
                />
              </div>
            </div>
          )}
        </Panel>
      </div>

      <div className="grid gap-px border border-zinc-300 bg-zinc-300 xl:grid-cols-2">
        <Panel
          title="Структура lesson-базы"
          subtitle="Быстрый взгляд на распределение по статусам обучения и источникам enrollments."
        >
          {initialLoading ? (
            <div className="px-4 py-8 text-sm text-zinc-500">
              Готовим структуру базы...
            </div>
          ) : (
            <div className="grid gap-px border-t border-zinc-300 bg-zinc-300 lg:grid-cols-2">
              <div className="bg-white">
                <div className="border-b border-zinc-300 bg-zinc-100 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
                  Бар-чарт по статусам
                </div>
                <HorizontalBarChart
                  rows={statusChartRows}
                  emptyLabel="Статусы появятся после первых учеников."
                />
              </div>
              <div className="bg-white">
                <div className="border-b border-zinc-300 bg-zinc-100 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
                  Бар-чарт по источникам
                </div>
                <HorizontalBarChart
                  rows={sourceChartRows}
                  emptyLabel="Источники появятся после первых enrollments."
                />
              </div>
            </div>
          )}
        </Panel>

        <Panel
          title="Сводка по прогрессу"
          subtitle="Понимание общего качества движения учеников: как быстро база продвигается и где копится инерция."
        >
          {initialLoading ? (
            <div className="px-4 py-8 text-sm text-zinc-500">
              Считаем агрегированные метрики...
            </div>
          ) : (
            <CompactTable
              headers={["Метрика", "Значение", "Что означает"]}
              rows={[
                [
                  "Средний прогресс",
                  `${formatAverage(averageProgress)}%`,
                  "Средняя доля прохождения по всем lesson enrollments.",
                ],
                [
                  "Уникальных учеников",
                  formatCount(uniqueStudentsCount),
                  "Число реальных студентов без дублей по user_id.",
                ],
                [
                  "Активность за 7 дней",
                  formatCount(activeWithin7DaysCount),
                  "Кто проявлял учебную активность на неделе.",
                ],
                [
                  "Требуют внимания",
                  formatCount(staleActiveCount),
                  "Активные ученики без свежей активности более 14 дней.",
                ],
                [
                  "Active rate",
                  `${activeRate}%`,
                  "Какой объем базы еще реально учится сейчас.",
                ],
                [
                  "Completion rate",
                  `${completionRate}%`,
                  "Какой объем базы уже доведен до completed.",
                ],
              ]}
              emptyLabel="Метрики появятся после первых enrollments."
            />
          )}
        </Panel>
      </div>

      <div className="grid gap-px border border-zinc-300 bg-zinc-300 xl:grid-cols-2">
        <Panel
          title="Гистограмма прогресса"
          subtitle="Как распределяется база учеников по стадиям прохождения."
        >
          {initialLoading ? (
            <div className="px-4 py-8 text-sm text-zinc-500">
              Строим histogram по прогрессу...
            </div>
          ) : (
            <HistogramChart
              rows={progressHistogramRows}
              emptyLabel="Появится после первых progress данных."
            />
          )}
        </Panel>

        <Panel
          title="Гистограмма активности"
          subtitle="Насколько свежо ученики взаимодействуют с курсами и где уже возникает просадка по вовлеченности."
        >
          {initialLoading ? (
            <div className="px-4 py-8 text-sm text-zinc-500">
              Строим histogram по активности...
            </div>
          ) : (
            <HistogramChart
              rows={activityHistogramRows}
              emptyLabel="Появится после первой активности учеников."
            />
          )}
        </Panel>
      </div>

      <div className="grid gap-px border border-zinc-300 bg-zinc-300 xl:grid-cols-2">
        <Panel
          title="Группа внимания"
          subtitle="Ученики, где низкий прогресс совпал со слабой недавней активностью."
        >
          {initialLoading ? (
            <div className="px-4 py-8 text-sm text-zinc-500">
              Загружаем список внимания...
            </div>
          ) : (
            <CompactTable
              headers={["Ученик", "Курс", "Прогресс", "Активность", "Открыть"]}
              rows={attentionEnrollments.slice(0, 8).map((enrollment) => [
                <div key={`${enrollment.enrollment_id}-student`} className="space-y-1">
                  <div className="font-medium text-zinc-950">
                    {getStudentName(enrollment)}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {enrollment.student_email || "Email не указан"}
                  </div>
                </div>,
                <button
                  key={`${enrollment.enrollment_id}-course`}
                  type="button"
                  className="text-left font-medium text-zinc-950"
                  onClick={() => setSelectedCourseId(enrollment.course_id)}
                >
                  {enrollment.course_title}
                </button>,
                formatProgress(enrollment.progress_percent),
                formatDateTime(getEffectiveActivityAt(enrollment)),
                <Button
                  key={`${enrollment.enrollment_id}-open`}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-none border-zinc-300"
                  onClick={() => handleOpenStudent(enrollment)}
                >
                  Контакты
                </Button>,
              ])}
              emptyLabel="Сейчас нет ярко выраженной группы риска."
            />
          )}
        </Panel>

        <Panel
          title="Свежая активность"
          subtitle="Последние сигналы по урокам, чтобы быстро понять, какие курсы живут активнее других."
        >
          {initialLoading ? (
            <div className="px-4 py-8 text-sm text-zinc-500">
              Загружаем свежие события...
            </div>
          ) : (
            <CompactTable
              headers={["Ученик", "Курс", "Статус", "Активность", "Прогресс"]}
              rows={recentActivityEnrollments.map((enrollment) => [
                <div key={`${enrollment.enrollment_id}-student`} className="space-y-1">
                  <div className="font-medium text-zinc-950">
                    {getStudentName(enrollment)}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {ENROLLMENT_SOURCE_META[enrollment.enrollment_source].label}
                  </div>
                </div>,
                <button
                  key={`${enrollment.enrollment_id}-course`}
                  type="button"
                  className="text-left font-medium text-zinc-950"
                  onClick={() => setSelectedCourseId(enrollment.course_id)}
                >
                  {enrollment.course_title}
                </button>,
                <Badge
                  key={`${enrollment.enrollment_id}-status`}
                  variant="outline"
                  className={`rounded-full border px-3 py-1 text-[11px] ${ENROLLMENT_STATUS_META[enrollment.status].className}`}
                >
                  {ENROLLMENT_STATUS_META[enrollment.status].label}
                </Badge>,
                formatDateTime(getEffectiveActivityAt(enrollment)),
                formatProgress(enrollment.progress_percent),
              ])}
              emptyLabel="Пока нет событий по активности."
            />
          )}
        </Panel>
      </div>
    </div>
  );

  const mainContent =
    mode === "workspace"
      ? renderWorkspaceView
      : mode === "progress"
        ? renderProgressView
        : renderAnalyticsView;

  return (
    <div className="w-full bg-background">
      <div className="teacher-workspace space-y-5 bg-[#f7f8fa] px-4 py-6 md:px-6">
        <TeacherSectionTabs section="lessons" />
        <section className="border border-zinc-300 bg-white p-5">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 border border-zinc-300 bg-zinc-50 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-zinc-600">
                <meta.icon className="h-3.5 w-3.5" />
                {meta.badge}
              </div>

              <div>
                <h1 className="text-[28px] font-semibold tracking-tight text-zinc-950">
                  {meta.title}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
                  {meta.subtitle}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void load({ background: true })}
                  disabled={loading || refreshing}
                >
                  {loading || refreshing ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Обновить
                </Button>

                <Button asChild variant="ghost">
                  <Link href="/dashboard/teacher/courses">
                    <BookOpen className="h-4 w-4" />
                    К рабочей зоне курсов
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {summaryMetrics.slice(0, 3).map((metric) => (
                <MetricCard
                  key={metric.label}
                  label={metric.label}
                  value={metric.value}
                  note={metric.note}
                />
              ))}
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {mainContent}
      </div>

      <StudentDetailsDialog
        open={Boolean(selectedEnrollment)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedEnrollmentId(null);
          }
        }}
        student={selectedStudent}
        enrollment={selectedEnrollment}
        loading={selectedProfileState?.loading ?? false}
        profileError={selectedProfileState?.error ?? null}
      />
    </div>
  );
}
