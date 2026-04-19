"use client";

import * as React from "react";
import type { Course } from "@/types/course";
import {
  fetchApprovedCourses,
  getApprovedCoursesSnapshot,
} from "@/services/course";

const DEFAULT_ERROR_MESSAGE = "Не удалось загрузить курсы";

export function useApprovedCourses() {
  const initialSnapshot = React.useRef(getApprovedCoursesSnapshot()).current;

  const [courses, setCourses] = React.useState<Course[]>(
    () => initialSnapshot ?? [],
  );
  const [loading, setLoading] = React.useState(
    () => initialSnapshot === undefined,
  );
  const [error, setError] = React.useState<string | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    let isActive = true;

    async function loadCourses() {
      const forceFresh = refreshKey > 0;
      const hasCachedData = getApprovedCoursesSnapshot() !== undefined;

      if (forceFresh || !hasCachedData) {
        setLoading(true);
      }

      setError(null);

      try {
        const nextCourses = await fetchApprovedCourses({ forceFresh });

        if (!isActive) return;
        setCourses(nextCourses);
      } catch (error) {
        if (!isActive) return;

        setCourses([]);
        setError(
          error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE,
        );
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadCourses();

    return () => {
      isActive = false;
    };
  }, [refreshKey]);

  return {
    courses,
    loading,
    error,
    refresh: () => setRefreshKey((value) => value + 1),
  };
}
