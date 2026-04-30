"use client";

import * as React from "react";

import { apiFetch } from "@/lib/api";
import { getUserFacingErrorMessage } from "@/lib/error-messages";
import { readApiData } from "@/lib/api-response";
import { CourseApplicationsAPI } from "@/services/course-application";
import type { Course } from "@/types/course";
import type {
  CourseApplication,
  CourseApplicationRejectPayload,
  CourseApplicationReviewPayload,
} from "@/types/course-application";

import type { ApplicationWorkflowAction } from "@/components/dashboard/teacher/course-applications/types";
import {
  normalizeText,
  upsertApplication,
} from "@/components/dashboard/teacher/course-applications/utils";

export function useTeacherCourseApplications() {
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [applications, setApplications] = React.useState<CourseApplication[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pendingAction, setPendingAction] =
    React.useState<ApplicationWorkflowAction | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  const clearActionError = React.useCallback(() => {
    setActionError(null);
  }, []);

  const load = React.useCallback(
    async (options: { background?: boolean } = {}) => {
      const isBackground = !!options.background;

      if (isBackground) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      if (!isBackground) {
        setError(null);
      }

      try {
        const [nextCourses, nextApplications] = await Promise.all([
          readApiData<Course[]>(
            await apiFetch("/api/courses/my"),
            "Не удалось загрузить ваши курсы",
          ),
          CourseApplicationsAPI.listTeaching({
            sort: "updated_at",
            dir: "desc",
          }),
        ]);

        setCourses(nextCourses);
        setApplications(nextApplications);
      } catch (loadError) {
        setError(
          getUserFacingErrorMessage(
            loadError,
            "Не удалось загрузить заявки преподавателя",
          ),
        );
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

  const applyApplicationAction = React.useCallback(
    async ({
      action,
      applicationId,
      reviewNote,
      internalNote,
    }: {
      action: ApplicationWorkflowAction;
      applicationId: string;
      reviewNote: string;
      internalNote: string;
    }) => {
      setActionError(null);
      setPendingAction(action);

      try {
        let nextApplication: CourseApplication;

        if (action === "reviewing") {
          const payload: CourseApplicationReviewPayload = {
            review_note: normalizeText(reviewNote),
            internal_note: normalizeText(internalNote),
          };

          nextApplication = await CourseApplicationsAPI.markReviewing(
            applicationId,
            payload,
          );
        } else if (action === "approve") {
          const payload: CourseApplicationReviewPayload = {
            review_note: normalizeText(reviewNote),
            internal_note: normalizeText(internalNote),
          };

          nextApplication = await CourseApplicationsAPI.approve(
            applicationId,
            payload,
          );
        } else {
          const payload: CourseApplicationRejectPayload = {
            review_note: reviewNote.trim(),
            internal_note: normalizeText(internalNote) ?? undefined,
          };

          nextApplication = await CourseApplicationsAPI.reject(
            applicationId,
            payload,
          );
        }

        setApplications((current) => upsertApplication(current, nextApplication));
        return nextApplication;
      } catch (actionLoadError) {
        const message = getUserFacingErrorMessage(
          actionLoadError,
          "Не удалось обновить заявку",
        );

        setActionError(message);
        throw new Error(message);
      } finally {
        setPendingAction(null);
      }
    },
    [],
  );

  return {
    courses,
    applications,
    loading,
    refreshing,
    error,
    pendingAction,
    actionError,
    clearActionError,
    load,
    applyApplicationAction,
  };
}
