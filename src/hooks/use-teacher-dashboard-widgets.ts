"use client";

import * as React from "react";

import {
  teacherDashboardWidgets,
  type TeacherDashboardWidgetId,
  type TeacherDashboardWidgetView,
} from "@/components/dashboard/teacher/teacherDashboardWidgets";

export type TeacherDashboardWidgetPreference = {
  id: TeacherDashboardWidgetId;
  visible: boolean;
  order: number;
};

const STORAGE_KEY = "teacher-dashboard-widgets:v1";

const widgetDefinitionById = new Map(
  teacherDashboardWidgets.map((widget) => [widget.id, widget]),
);

function createDefaultPreferences(): TeacherDashboardWidgetPreference[] {
  return teacherDashboardWidgets
    .map((widget) => ({
      id: widget.id,
      visible: widget.defaultVisible,
      order: widget.defaultOrder,
    }))
    .sort((a, b) => a.order - b.order);
}

function normalizeOrder(
  preferences: TeacherDashboardWidgetPreference[],
): TeacherDashboardWidgetPreference[] {
  return [...preferences].sort((a, b) => a.order - b.order).map(
    (preference, index) => ({
      ...preference,
      order: index,
    }),
  );
}

function isWidgetPreference(
  value: unknown,
): value is Partial<TeacherDashboardWidgetPreference> & {
  id: TeacherDashboardWidgetId;
} {
  if (!value || typeof value !== "object") return false;

  const maybePreference = value as { id?: unknown };
  return (
    typeof maybePreference.id === "string" &&
    widgetDefinitionById.has(maybePreference.id as TeacherDashboardWidgetId)
  );
}

function getStoredWidgets(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;

  if (value && typeof value === "object") {
    const maybeStored = value as { widgets?: unknown };
    if (Array.isArray(maybeStored.widgets)) return maybeStored.widgets;
  }

  return [];
}

function normalizePreferences(value: unknown): TeacherDashboardWidgetPreference[] {
  const defaults = createDefaultPreferences();
  const storedById = new Map<TeacherDashboardWidgetId, unknown>();

  getStoredWidgets(value).forEach((item) => {
    if (isWidgetPreference(item)) {
      storedById.set(item.id, item);
    }
  });

  return normalizeOrder(
    defaults.map((defaultPreference) => {
      const stored = storedById.get(defaultPreference.id);

      if (!stored || typeof stored !== "object") return defaultPreference;

      const maybePreference = stored as {
        visible?: unknown;
        order?: unknown;
      };

      return {
        id: defaultPreference.id,
        visible:
          typeof maybePreference.visible === "boolean"
            ? maybePreference.visible
            : defaultPreference.visible,
        order:
          typeof maybePreference.order === "number" &&
          Number.isFinite(maybePreference.order)
            ? maybePreference.order
            : defaultPreference.order,
      };
    }),
  );
}

function movePreference(
  preferences: TeacherDashboardWidgetPreference[],
  activeId: TeacherDashboardWidgetId,
  overId: TeacherDashboardWidgetId,
) {
  const fromIndex = preferences.findIndex(
    (preference) => preference.id === activeId,
  );
  const toIndex = preferences.findIndex(
    (preference) => preference.id === overId,
  );

  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return preferences;
  }

  const nextPreferences = [...preferences];
  const [movedPreference] = nextPreferences.splice(fromIndex, 1);
  nextPreferences.splice(toIndex, 0, movedPreference);

  return normalizeOrder(nextPreferences);
}

export function useTeacherDashboardWidgets() {
  const [preferences, setPreferences] = React.useState(
    createDefaultPreferences,
  );
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(STORAGE_KEY);

      if (storedValue) {
        setPreferences(normalizePreferences(JSON.parse(storedValue)));
      } else {
        setPreferences(createDefaultPreferences());
      }
    } catch {
      setPreferences(createDefaultPreferences());
    } finally {
      setIsHydrated(true);
    }
  }, []);

  React.useEffect(() => {
    if (!isHydrated) return;

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        widgets: preferences,
      }),
    );
  }, [isHydrated, preferences]);

  const widgets = React.useMemo<TeacherDashboardWidgetView[]>(() => {
    return preferences
      .map((preference) => {
        const definition = widgetDefinitionById.get(preference.id);

        if (!definition) return null;

        return {
          ...definition,
          visible: preference.visible,
          order: preference.order,
        };
      })
      .filter((widget): widget is TeacherDashboardWidgetView => !!widget);
  }, [preferences]);

  const visibleWidgets = React.useMemo(
    () => widgets.filter((widget) => widget.visible),
    [widgets],
  );

  const hiddenWidgets = React.useMemo(
    () => widgets.filter((widget) => !widget.visible),
    [widgets],
  );

  const setWidgetVisible = React.useCallback(
    (id: TeacherDashboardWidgetId, visible: boolean) => {
      setPreferences((currentPreferences) =>
        currentPreferences.map((preference) =>
          preference.id === id ? { ...preference, visible } : preference,
        ),
      );
    },
    [],
  );

  const moveWidget = React.useCallback(
    (activeId: TeacherDashboardWidgetId, overId: TeacherDashboardWidgetId) => {
      setPreferences((currentPreferences) =>
        movePreference(currentPreferences, activeId, overId),
      );
    },
    [],
  );

  const resetWidgets = React.useCallback(() => {
    setPreferences(createDefaultPreferences());
  }, []);

  return {
    widgets,
    visibleWidgets,
    hiddenWidgets,
    isHydrated,
    allHidden: visibleWidgets.length === 0,
    setWidgetVisible,
    moveWidget,
    resetWidgets,
  };
}
