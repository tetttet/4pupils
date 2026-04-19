"use client";

import * as React from "react";

const STORAGE_KEY = "student-platform-preferences";
const STORAGE_EVENT = "student-platform-preferences-updated";

export const studentPlatformDefaultPageOptions = [
  { value: "/platform", label: "Главная" },
  { value: "/platform/lessons", label: "Мои уроки" },
  { value: "/platform/messages", label: "Сообщения" },
  { value: "/platform/profile", label: "Профиль" },
] as const;

export const studentPlatformMessagePreviewOptions = [
  { value: "comfortable", label: "Обычный" },
  { value: "compact", label: "Компактный" },
] as const;

export const studentPlatformFontSizeOptions = [
  { value: "default", label: "Обычный" },
  { value: "large", label: "Крупный" },
] as const;

export type StudentPlatformDefaultPage =
  (typeof studentPlatformDefaultPageOptions)[number]["value"];

export type StudentPlatformMessagePreview =
  (typeof studentPlatformMessagePreviewOptions)[number]["value"];

export type StudentPlatformFontSize =
  (typeof studentPlatformFontSizeOptions)[number]["value"];

export type StudentPlatformPreferences = {
  defaultPage: StudentPlatformDefaultPage;
  sidebarCollapsed: boolean;
  showRecommendedCourses: boolean;
  messagePreview: StudentPlatformMessagePreview;
  fontSize: StudentPlatformFontSize;
};

export const defaultStudentPlatformPreferences: StudentPlatformPreferences = {
  defaultPage: "/platform",
  sidebarCollapsed: false,
  showRecommendedCourses: true,
  messagePreview: "comfortable",
  fontSize: "default",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function pickBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function pickOptionValue<const T extends readonly { value: string }[]>(
  value: unknown,
  options: T,
  fallback: T[number]["value"],
): T[number]["value"] {
  return options.some((option) => option.value === value)
    ? (value as T[number]["value"])
    : fallback;
}

export function normalizeStudentPlatformPreferences(
  value: unknown,
): StudentPlatformPreferences {
  const source = isRecord(value) ? value : {};

  return {
    defaultPage: pickOptionValue(
      source.defaultPage,
      studentPlatformDefaultPageOptions,
      defaultStudentPlatformPreferences.defaultPage,
    ),
    sidebarCollapsed: pickBoolean(
      source.sidebarCollapsed,
      defaultStudentPlatformPreferences.sidebarCollapsed,
    ),
    showRecommendedCourses: pickBoolean(
      source.showRecommendedCourses,
      defaultStudentPlatformPreferences.showRecommendedCourses,
    ),
    messagePreview: pickOptionValue(
      source.messagePreview,
      studentPlatformMessagePreviewOptions,
      defaultStudentPlatformPreferences.messagePreview,
    ),
    fontSize: pickOptionValue(
      source.fontSize,
      studentPlatformFontSizeOptions,
      defaultStudentPlatformPreferences.fontSize,
    ),
  };
}

export function readStudentPlatformPreferences(): StudentPlatformPreferences {
  if (typeof window === "undefined") {
    return defaultStudentPlatformPreferences;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return defaultStudentPlatformPreferences;
    }

    return normalizeStudentPlatformPreferences(JSON.parse(raw));
  } catch {
    return defaultStudentPlatformPreferences;
  }
}

function emitPreferencesChange(preferences: StudentPlatformPreferences) {
  window.dispatchEvent(
    new CustomEvent<StudentPlatformPreferences>(STORAGE_EVENT, {
      detail: preferences,
    }),
  );
}

export function writeStudentPlatformPreferences(
  preferences: StudentPlatformPreferences,
) {
  if (typeof window === "undefined") {
    return preferences;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    return preferences;
  }

  emitPreferencesChange(preferences);

  return preferences;
}

export function patchStudentPlatformPreferences(
  patch: Partial<StudentPlatformPreferences>,
) {
  const next = {
    ...readStudentPlatformPreferences(),
    ...patch,
  };

  return writeStudentPlatformPreferences(next);
}

export function resetStudentPlatformPreferences() {
  return writeStudentPlatformPreferences(defaultStudentPlatformPreferences);
}

function subscribeToStudentPlatformPreferences(
  listener: (preferences: StudentPlatformPreferences) => void,
) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) {
      return;
    }

    listener(readStudentPlatformPreferences());
  };

  const handleCustomEvent = (event: Event) => {
    const nextPreferences =
      (event as CustomEvent<StudentPlatformPreferences>).detail ??
      readStudentPlatformPreferences();

    listener(nextPreferences);
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(STORAGE_EVENT, handleCustomEvent);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(STORAGE_EVENT, handleCustomEvent);
  };
}

export function useStudentPlatformPreferences() {
  const [preferences, setPreferences] = React.useState(
    defaultStudentPlatformPreferences,
  );
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setPreferences(readStudentPlatformPreferences());
    setHydrated(true);

    return subscribeToStudentPlatformPreferences((nextPreferences) => {
      setPreferences(nextPreferences);
      setHydrated(true);
    });
  }, []);

  const setPreference = React.useCallback(
    <K extends keyof StudentPlatformPreferences>(
      key: K,
      value: StudentPlatformPreferences[K],
    ) => {
      const nextPreferences = patchStudentPlatformPreferences({
        [key]: value,
      } as Pick<StudentPlatformPreferences, K>);

      setPreferences(nextPreferences);
      setHydrated(true);

      return nextPreferences;
    },
    [],
  );

  const patchPreferences = React.useCallback(
    (patch: Partial<StudentPlatformPreferences>) => {
      const nextPreferences = patchStudentPlatformPreferences(patch);
      setPreferences(nextPreferences);
      setHydrated(true);
      return nextPreferences;
    },
    [],
  );

  const resetPreferences = React.useCallback(() => {
    const nextPreferences = resetStudentPlatformPreferences();
    setPreferences(nextPreferences);
    setHydrated(true);
    return nextPreferences;
  }, []);

  return {
    preferences,
    hydrated,
    setPreference,
    patchPreferences,
    resetPreferences,
  };
}
