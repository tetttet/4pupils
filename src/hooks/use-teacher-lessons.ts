"use client";

import * as React from "react";

import { apiFetch } from "@/lib/api";
import { invalidateClientFetchCache } from "@/lib/client-fetch";
import { getUserFacingErrorMessage } from "@/lib/error-messages";
import { readApiData } from "@/lib/api-response";
import { EnrollmentsAPI } from "@/services/enrollment";
import type { Course } from "@/types/course";
import type { Enrollment } from "@/types/enrollment";

export function useTeacherLessons() {
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [enrollments, setEnrollments] = React.useState<Enrollment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const requestIdRef = React.useRef(0);

  const load = React.useCallback(
    async (options: { background?: boolean } = {}) => {
      const requestId = ++requestIdRef.current;
      const isBackground = !!options.background;

      if (isBackground) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      if (!isBackground) {
        setError(null);
      } else {
        invalidateClientFetchCache();
      }

      try {
        const [nextCourses, nextEnrollments] = await Promise.all([
          readApiData<Course[]>(
            await apiFetch("/api/courses/my"),
            "Не удалось загрузить ваши курсы",
          ),
          EnrollmentsAPI.listTeaching({
            sort: "last_activity_at",
            dir: "desc",
          }),
        ]);

        if (requestId !== requestIdRef.current) return;

        const updateData = () => {
          setCourses(nextCourses);
          setEnrollments(nextEnrollments);
        };

        if (isBackground) {
          React.startTransition(updateData);
        } else {
          updateData();
        }
      } catch (loadError) {
        if (requestId !== requestIdRef.current) return;

        setError(
          getUserFacingErrorMessage(
            loadError,
            "Не удалось загрузить уроки преподавателя",
          ),
        );
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [],
  );

  React.useEffect(() => {
    void load();

    return () => {
      requestIdRef.current += 1;
    };
  }, [load]);

  return {
    courses,
    enrollments,
    loading,
    refreshing,
    error,
    load,
  };
}
