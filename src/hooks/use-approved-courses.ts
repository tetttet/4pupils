"use client";

import * as React from "react";
import type { Course } from "@/types/course";
import { getUserFacingErrorMessage } from "@/lib/error-messages";
import {
  fetchApprovedCoursesPage,
  fetchApprovedCourses,
  getApprovedCoursesMetaSnapshot,
  getApprovedCoursesSnapshot,
  primeApprovedCoursesCache,
} from "@/services/course";
import type { PublicCoursesPageMeta } from "@/lib/public-course";

const DEFAULT_ERROR_MESSAGE = "Не удалось загрузить курсы";
type ApprovedCoursesInitialValue = {
  courses: Course[];
  meta?: PublicCoursesPageMeta;
};

const ApprovedCoursesInitialContext =
  React.createContext<ApprovedCoursesInitialValue | undefined>(undefined);

export function ApprovedCoursesProvider({
  children,
  initialCourses,
  initialMeta,
}: {
  children: React.ReactNode;
  initialCourses: Course[] | undefined;
  initialMeta?: PublicCoursesPageMeta;
}) {
  return React.createElement(
    ApprovedCoursesInitialContext.Provider,
    {
      value:
        initialCourses === undefined
          ? undefined
          : { courses: initialCourses, meta: initialMeta },
    },
    children,
  );
}

export function useApprovedCourses() {
  const serverSnapshot = React.useContext(ApprovedCoursesInitialContext);
  const initialSnapshot = React.useRef(
    serverSnapshot?.courses ?? getApprovedCoursesSnapshot(),
  ).current;
  const initialMeta = React.useRef(
    serverSnapshot?.meta ?? getApprovedCoursesMetaSnapshot(),
  ).current;

  const [courses, setCourses] = React.useState<Course[]>(
    () => initialSnapshot ?? [],
  );
  const [loading, setLoading] = React.useState(
    () => initialSnapshot === undefined,
  );
  const [error, setError] = React.useState<string | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [pagination, setPagination] = React.useState(initialMeta);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [loadMoreError, setLoadMoreError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (refreshKey === 0 && serverSnapshot !== undefined) {
      primeApprovedCoursesCache(serverSnapshot.courses, serverSnapshot.meta);
      return;
    }

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
        setPagination(getApprovedCoursesMetaSnapshot());
      } catch (error) {
        if (!isActive) return;

        setCourses([]);
        setError(getUserFacingErrorMessage(error, DEFAULT_ERROR_MESSAGE));
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
  }, [refreshKey, serverSnapshot]);

  const loadMore = React.useCallback(async () => {
    if (loadingMore || !pagination?.hasMore || pagination.nextOffset == null) {
      return;
    }

    setLoadingMore(true);
    setLoadMoreError(null);

    try {
      const page = await fetchApprovedCoursesPage({
        offset: pagination.nextOffset,
        limit: pagination.limit,
      });

      setCourses((current) => {
        const knownIds = new Set(current.map((course) => course.course_id));
        return [
          ...current,
          ...page.courses.filter((course) => !knownIds.has(course.course_id)),
        ];
      });
      setPagination(page.meta);
    } catch (error) {
      setLoadMoreError(getUserFacingErrorMessage(error, DEFAULT_ERROR_MESSAGE));
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, pagination]);

  return {
    courses,
    loading,
    error,
    hasMore: pagination?.hasMore === true,
    loadMore,
    loadMoreError,
    loadingMore,
    refresh: () => setRefreshKey((value) => value + 1),
  };
}
