"use client";

import * as React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, EyeOff, GripVertical, MonitorUp, RotateCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  DashboardControlNumbersSkeleton,
  DashboardCourseTablePanelSkeleton,
  DashboardFocusSkeleton,
  DashboardHistogramPanelSkeleton,
  DashboardOperationalSkeleton,
  DashboardQuickLinksSkeleton,
  DashboardSummaryTilesSkeleton,
} from "@/components/dashboard/home/dashboard-home-skeletons";
import type {
  TeacherDashboardWidgetId,
  TeacherDashboardWidgetView,
} from "@/components/dashboard/teacher/teacherDashboardWidgets";
import { TeacherDashboardWidgetLayout } from "@/components/dashboard/teacher/teacherDashboardWidgets";
import { useTeacherDashboardWidgets } from "@/hooks/use-teacher-dashboard-widgets";
import { cn } from "@/lib/utils";

function isTeacherWidgetId(value: unknown): value is TeacherDashboardWidgetId {
  return typeof value === "string";
}

function SortableWidgetCard({
  widget,
  onVisibleChange,
}: {
  widget: TeacherDashboardWidgetView;
  onVisibleChange: (id: TeacherDashboardWidgetId, visible: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "grid gap-4 bg-white p-4 transition-colors sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center",
        !widget.visible && "bg-zinc-50 opacity-60",
        isDragging && "relative z-10 border-y border-zinc-900 shadow-lg",
      )}
    >
      <button
        type="button"
        aria-label={`Изменить порядок: ${widget.title}`}
        className="flex h-10 w-10 cursor-grab items-center justify-center border border-zinc-300 bg-white text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-950 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-zinc-950">
            {widget.title}
          </h3>
          <Badge
            variant="outline"
            className="rounded-full border-zinc-300 bg-white text-[11px] text-zinc-600"
          >
            #{widget.order + 1}
          </Badge>
        </div>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-600">
          {widget.description}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
          {widget.visible ? (
            <Eye className="h-4 w-4 text-zinc-500" />
          ) : (
            <EyeOff className="h-4 w-4 text-zinc-400" />
          )}
          <span>{widget.visible ? "Показывать" : "Скрыть"}</span>
        </div>
        <Switch
          checked={widget.visible}
          onCheckedChange={(checked) => onVisibleChange(widget.id, checked)}
          aria-label={`${widget.visible ? "Скрыть" : "Показать"} виджет ${widget.title}`}
        />
      </div>
    </div>
  );
}

const PREVIEW_RENDERERS: Record<TeacherDashboardWidgetId, React.ReactNode> = {
  "quick-links": <DashboardQuickLinksSkeleton />,
  "summary-tiles": <DashboardSummaryTilesSkeleton darkFirst />,
  "operational-slice": <DashboardOperationalSkeleton />,
  "today-focus": <DashboardFocusSkeleton />,
  "readiness-histogram": <DashboardHistogramPanelSkeleton />,
  "course-demand": <DashboardCourseTablePanelSkeleton />,
  "control-numbers": <DashboardControlNumbersSkeleton />,
};

const TeacherDashboardPreviewDialog = React.memo(
  function TeacherDashboardPreviewDialog({
    open,
    onOpenChange,
    widgets,
    visibleCount,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    widgets: TeacherDashboardWidgetView[];
    visibleCount: number;
  }) {
    const renderPreviewWidget = React.useCallback(
      (widgetId: TeacherDashboardWidgetId) => PREVIEW_RENDERERS[widgetId],
      [],
    );

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-h-[min(90vh,960px)] gap-0 overflow-hidden rounded-none border-zinc-300 bg-[#f6f6f6] p-0"
          style={{
            width: "calc(100vw - 16px)",
            maxWidth: "none",
          }}
        >
          <DialogHeader className="border-b border-zinc-300 bg-white px-5 py-4 pr-12">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <DialogTitle className="text-base text-zinc-950">
                  Предпросмотр главного экрана
                </DialogTitle>
                <DialogDescription className="mt-1 max-w-2xl leading-6 text-zinc-600">
                  Это лёгкий live-preview раскладки: он показывает порядок и
                  видимость виджетов без повторной загрузки данных dashboard.
                </DialogDescription>
              </div>
              <Badge
                variant="outline"
                className="rounded-full border-zinc-300 bg-zinc-50 text-zinc-700"
              >
                {visibleCount} виджетов видно
              </Badge>
            </div>
          </DialogHeader>

          <div className="max-h-[calc(90vh-96px)] overflow-y-auto p-5">
            <div className="space-y-6">
              <TeacherDashboardWidgetLayout
                widgets={widgets}
                renderWidget={renderPreviewWidget}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  },
);

export function TeacherWidgetSettings() {
  const {
    widgets,
    visibleWidgets,
    allHidden,
    isHydrated,
    moveWidget,
    setWidgetVisible,
    resetWidgets,
  } = useTeacherDashboardWidgets();
  const [previewOpen, setPreviewOpen] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = React.useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!over || active.id === over.id) return;
      if (!isTeacherWidgetId(active.id) || !isTeacherWidgetId(over.id)) return;

      moveWidget(active.id, over.id);
      setPreviewOpen(true);
    },
    [moveWidget],
  );

  const handleVisibleChange = React.useCallback(
    (id: TeacherDashboardWidgetId, visible: boolean) => {
      setWidgetVisible(id, visible);
      setPreviewOpen(true);
    },
    [setWidgetVisible],
  );

  const handleResetWidgets = React.useCallback(() => {
    resetWidgets();
    setPreviewOpen(true);
  }, [resetWidgets]);

  return (
    <>
      <section className="border border-zinc-300 bg-white">
        <div className="flex flex-col gap-4 border-b border-zinc-300 px-4 py-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.16em] text-zinc-500">
              Главный экран
            </div>
            <h2 className="mt-2 text-base font-semibold text-zinc-950">
              Виджеты главного экрана
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-600">
              Меняйте порядок блоков, скрывайте лишнее и возвращайте виджеты,
              когда они снова нужны в ежедневной работе.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="rounded-full border-zinc-300 bg-zinc-50 text-zinc-700"
            >
              {visibleWidgets.length} из {widgets.length} включены
            </Badge>
            <Badge
              variant="outline"
              className="rounded-full border-zinc-300 bg-white text-zinc-500"
            >
              {isHydrated ? "Сохранено локально" : "Загрузка"}
            </Badge>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewOpen(true)}
              className="rounded-none border-zinc-300"
            >
              <MonitorUp className="h-4 w-4" />
              Предпросмотр
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleResetWidgets}
              className="rounded-none border-zinc-300"
            >
              <RotateCcw className="h-4 w-4" />
              Сбросить по умолчанию
            </Button>
          </div>
        </div>

        {allHidden ? (
          <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-4">
            <div className="text-sm font-semibold text-zinc-950">
              Все виджеты скрыты
            </div>
            <p className="mt-1 text-sm leading-6 text-zinc-600">
              Главный экран покажет пустое состояние, пока вы не включите хотя
              бы один блок.
            </p>
          </div>
        ) : null}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={widgets.map((widget) => widget.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="divide-y divide-zinc-200">
              {widgets.map((widget) => (
                <SortableWidgetCard
                  key={widget.id}
                  widget={widget}
                  onVisibleChange={handleVisibleChange}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </section>

      <TeacherDashboardPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        widgets={widgets}
        visibleCount={visibleWidgets.length}
      />
    </>
  );
}
