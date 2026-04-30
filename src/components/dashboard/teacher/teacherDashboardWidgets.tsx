"use client";

import * as React from "react";
import Link from "next/link";
import { Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const TEACHER_DASHBOARD_WIDGET_IDS = [
  "quick-links",
  "summary-tiles",
  "operational-slice",
  "today-focus",
  "readiness-histogram",
  "course-demand",
  "control-numbers",
] as const;

export type TeacherDashboardWidgetId =
  (typeof TEACHER_DASHBOARD_WIDGET_IDS)[number];

export type TeacherDashboardWidgetComponentProps = {
  renderWidget: (id: TeacherDashboardWidgetId) => React.ReactNode;
};

export type TeacherDashboardWidgetDefinition = {
  id: TeacherDashboardWidgetId;
  title: string;
  description: string;
  component: React.ComponentType<TeacherDashboardWidgetComponentProps>;
  defaultVisible: boolean;
  defaultOrder: number;
  layout: "full" | "half";
};

export type TeacherDashboardWidgetView = TeacherDashboardWidgetDefinition & {
  visible: boolean;
  order: number;
};

function createWidgetComponent(id: TeacherDashboardWidgetId) {
  function TeacherDashboardWidgetSlot({
    renderWidget,
  }: TeacherDashboardWidgetComponentProps) {
    return <>{renderWidget(id)}</>;
  }

  TeacherDashboardWidgetSlot.displayName = `TeacherDashboardWidgetSlot(${id})`;

  return TeacherDashboardWidgetSlot;
}

export const teacherDashboardWidgets: TeacherDashboardWidgetDefinition[] = [
  {
    id: "quick-links",
    title: "Быстрые переходы",
    description:
      "Короткие карточки для входа в курсы, заявки и уроки преподавателя.",
    component: createWidgetComponent("quick-links"),
    defaultVisible: true,
    defaultOrder: 0,
    layout: "full",
  },
  {
    id: "summary-tiles",
    title: "Ключевые показатели",
    description:
      "Сводные числа по курсам, студентам, открытым заявкам и прогрессу.",
    component: createWidgetComponent("summary-tiles"),
    defaultVisible: true,
    defaultOrder: 1,
    layout: "full",
  },
  {
    id: "operational-slice",
    title: "Операционный срез",
    description:
      "Распределение статусов по курсам, заявкам и обучению студентов.",
    component: createWidgetComponent("operational-slice"),
    defaultVisible: true,
    defaultOrder: 2,
    layout: "half",
  },
  {
    id: "today-focus",
    title: "Фокус на сегодня",
    description:
      "Приоритетные действия, которые ведут сразу в нужный рабочий раздел.",
    component: createWidgetComponent("today-focus"),
    defaultVisible: true,
    defaultOrder: 3,
    layout: "half",
  },
  {
    id: "readiness-histogram",
    title: "Готовность курсов",
    description:
      "Гистограмма готовности карточек и слабых мест в каталоге.",
    component: createWidgetComponent("readiness-histogram"),
    defaultVisible: true,
    defaultOrder: 4,
    layout: "half",
  },
  {
    id: "course-demand",
    title: "Курсы по нагрузке и спросу",
    description:
      "Таблица курсов, где уже есть движение, заявки и ученики.",
    component: createWidgetComponent("course-demand"),
    defaultVisible: true,
    defaultOrder: 5,
    layout: "half",
  },
  {
    id: "control-numbers",
    title: "Контрольные цифры",
    description:
      "Короткий свод по времени реакции, конверсии и просевшему темпу.",
    component: createWidgetComponent("control-numbers"),
    defaultVisible: true,
    defaultOrder: 6,
    layout: "full",
  },
];

export function TeacherDashboardWidgetsEmptyState() {
  return (
    <section className="border border-dashed border-zinc-300 bg-white p-6 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center border border-zinc-300 bg-zinc-50 text-zinc-900">
        <Settings className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-zinc-950">
        Все виджеты главного экрана скрыты
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-600">
        Верните хотя бы один блок в настройках, чтобы главный экран снова
        показывал рабочую сводку преподавателя.
      </p>
      <div className="mt-5">
        <Button
          asChild
          variant="outline"
          className="rounded-none border-zinc-300"
        >
          <Link href="/dashboard/teacher/settings">
            Открыть настройки
            <Settings className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

function getHalfGridClassName(widgets: TeacherDashboardWidgetView[]) {
  const isOperationalPair =
    widgets.some((widget) => widget.id === "operational-slice") &&
    widgets.some((widget) => widget.id === "today-focus");

  return cn(
    "grid gap-6",
    isOperationalPair
      ? "xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]"
      : "xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]",
  );
}

export function TeacherDashboardWidgetLayout({
  widgets,
  renderWidget,
}: {
  widgets: TeacherDashboardWidgetView[];
  renderWidget: (id: TeacherDashboardWidgetId) => React.ReactNode;
}) {
  const visibleWidgets = widgets.filter((widget) => widget.visible);

  if (visibleWidgets.length === 0) {
    return <TeacherDashboardWidgetsEmptyState />;
  }

  const sections: React.ReactNode[] = [];
  let halfWidgets: TeacherDashboardWidgetView[] = [];

  const renderConfiguredWidget = (widget: TeacherDashboardWidgetView) => {
    const WidgetComponent = widget.component;

    return (
      <WidgetComponent key={widget.id} renderWidget={renderWidget} />
    );
  };

  const flushHalfWidgets = () => {
    if (halfWidgets.length === 0) return;

    const currentHalfWidgets = halfWidgets;
    halfWidgets = [];

    if (currentHalfWidgets.length === 1) {
      sections.push(renderConfiguredWidget(currentHalfWidgets[0]));
      return;
    }

    sections.push(
      <div
        key={currentHalfWidgets.map((widget) => widget.id).join("-")}
        className={getHalfGridClassName(currentHalfWidgets)}
      >
        {currentHalfWidgets.map(renderConfiguredWidget)}
      </div>,
    );
  };

  visibleWidgets.forEach((widget) => {
    if (widget.layout === "half") {
      halfWidgets.push(widget);

      if (halfWidgets.length === 2) {
        flushHalfWidgets();
      }

      return;
    }

    flushHalfWidgets();
    sections.push(renderConfiguredWidget(widget));
  });

  flushHalfWidgets();

  return <>{sections}</>;
}
