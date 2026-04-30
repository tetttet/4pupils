"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";
import {
  getUserFacingErrorMessage,
  toUserFacingErrorMessage,
} from "@/lib/error-messages";
import type { ApiErr, ApiOk, Course } from "@/types/course";

type MutationAction = "submit" | "delete" | null;

async function readJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

type ErrorResponse =
  | ApiErr
  | ApiOk<unknown>
  | { error?: { message?: string } }
  | null;

function getErrorMessage(
  json: ErrorResponse,
  fallback: string,
  status?: number,
) {
  if (
    json &&
    typeof json === "object" &&
    "error" in json &&
    json.error &&
    typeof json.error === "object" &&
    "message" in json.error &&
    typeof json.error.message === "string"
  ) {
    const code =
      "code" in json.error && typeof json.error.code === "string"
        ? json.error.code
        : undefined;

    return toUserFacingErrorMessage(json.error.message, fallback, {
      code,
      status,
    });
  }

  return toUserFacingErrorMessage(null, fallback, { status });
}

export function useTeacherCourses() {
  const router = useRouter();

  const [rows, setRows] = React.useState<Course[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<Course | null>(null);

  const [pendingCourseId, setPendingCourseId] = React.useState<string | null>(
    null,
  );
  const [pendingAction, setPendingAction] =
    React.useState<MutationAction>(null);

  const activeCourseId = active?.course_id ?? null;
  const activeCourseIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    activeCourseIdRef.current = activeCourseId;
  }, [activeCourseId]);

  const load = React.useCallback(
    async (options: { background?: boolean } = {}) => {
      const isBackground = !!options.background;

      if (isBackground) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      if (!options.background) {
        setError(null);
      }

      try {
        const res = await apiFetch("/api/courses/my");
        const json = (await readJsonSafe(res)) as ApiOk<Course[]> | ApiErr | null;

        if (!res.ok) {
          setError(getErrorMessage(json, "Не удалось загрузить курсы", res.status));
          if (!options.background) {
            setRows([]);
          }
          return;
        }

        const data = (json as ApiOk<Course[]>)?.data ?? [];
        setRows(data);

        const currentActiveCourseId = activeCourseIdRef.current;

        if (currentActiveCourseId) {
          const nextActive =
            data.find((course) => course.course_id === currentActiveCourseId) ??
            null;
          setActive(nextActive);

          if (!nextActive) {
            setOpen(false);
          }
        }
      } catch (err) {
        const message = getUserFacingErrorMessage(
          err,
          "Не удалось загрузить курсы",
        );
        setError(message);

        if (!options.background) {
          setRows([]);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  React.useEffect(() => {
    void load();
  }, [load]);

  const openCourse = React.useCallback((course: Course) => {
    setActive(course);
    setOpen(true);
  }, []);

  const closeCourse = React.useCallback(() => {
    setOpen(false);
    setActive(null);
  }, []);

  const openCourseEditor = React.useCallback(
    (courseId: string) => {
      closeCourse();
      router.push(`/dashboard/teacher/courses/${courseId}/edit`);
    },
    [closeCourse, router],
  );

  const submitCourse = React.useCallback(
    async (courseId: string) => {
      setError(null);
      setPendingCourseId(courseId);
      setPendingAction("submit");

      try {
        const res = await apiFetch(`/api/courses/${courseId}/submit`, {
          method: "POST",
        });

        if (!res.ok) {
          const json = (await readJsonSafe(res)) as ErrorResponse;
          const message = getErrorMessage(
            json,
            "Не удалось отправить курс",
            res.status,
          );
          setError(message);
          toast.error(message);
          return false;
        }

        toast.success("Курс отправлен на модерацию");
        await load({ background: true });
        return true;
      } catch (err) {
        const message = getUserFacingErrorMessage(
          err,
          "Не удалось отправить курс",
        );
        setError(message);
        toast.error(message);
        return false;
      } finally {
        setPendingCourseId(null);
        setPendingAction(null);
      }
    },
    [load],
  );

  const deleteCourse = React.useCallback(
    async (courseId: string) => {
      setError(null);
      setPendingCourseId(courseId);
      setPendingAction("delete");

      try {
        const res = await apiFetch(`/api/courses/${courseId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const json = (await readJsonSafe(res)) as ErrorResponse;
          const message = getErrorMessage(
            json,
            "Не удалось удалить курс",
            res.status,
          );
          setError(message);
          toast.error(message);
          return false;
        }

        toast.success("Курс удалён");
        closeCourse();
        await load({ background: true });
        return true;
      } catch (err) {
        const message = getUserFacingErrorMessage(
          err,
          "Не удалось удалить курс",
        );
        setError(message);
        toast.error(message);
        return false;
      } finally {
        setPendingCourseId(null);
        setPendingAction(null);
      }
    },
    [closeCourse, load],
  );

  return {
    rows,
    loading,
    refreshing,
    error,
    open,
    active,
    pendingCourseId,
    pendingAction,
    load,
    openCourse,
    closeCourse,
    setOpen,
    submitCourse,
    deleteCourse,
    openCourseEditor,
  };
}
