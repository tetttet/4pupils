"use client";

import * as React from "react";
import type { Course } from "@/types/course";
import {
  getAvailableModerationActions,
  type ModerationAction,
} from "@/services/course-moderation";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ActionMeta = {
  buttonLabel: string;
  buttonVariant: "default" | "destructive" | "outline" | "secondary";
  confirmTitle: string;
  confirmDescription: string;
  confirmLabel: string;
  notesHint: string;
  notesRequired?: boolean;
};

const ACTION_META: Record<ModerationAction, ActionMeta> = {
  approve: {
    buttonLabel: "Одобрить",
    buttonVariant: "default",
    confirmTitle: "Одобрить и опубликовать курс?",
    confirmDescription:
      "Курс станет approved и будет переведён в public, чтобы отображаться на сайте.",
    confirmLabel: "Одобрить курс",
    notesHint:
      "Можно оставить комментарий модератора. Он сохранится в review notes.",
  },
  reject: {
    buttonLabel: "Отклонить",
    buttonVariant: "destructive",
    confirmTitle: "Отклонить курс?",
    confirmDescription:
      "Курс вернётся преподавателю на доработку. Причина отклонения обязательна.",
    confirmLabel: "Отклонить курс",
    notesHint:
      "Опишите, что нужно исправить. Эти заметки увидит преподаватель.",
    notesRequired: true,
  },
  archive: {
    buttonLabel: "В архив",
    buttonVariant: "outline",
    confirmTitle: "Отправить курс в архив?",
    confirmDescription:
      "Курс будет скрыт из активного потока и перенесён в archived.",
    confirmLabel: "Архивировать",
    notesHint:
      "Комментарий необязателен. Можно использовать для внутренней истории модерации.",
  },
  unarchive: {
    buttonLabel: "Вернуть в draft",
    buttonVariant: "secondary",
    confirmTitle: "Вернуть курс из архива?",
    confirmDescription:
      "Курс снова станет draft и сможет быть отправлен на модерацию заново.",
    confirmLabel: "Вернуть курс",
    notesHint:
      "При необходимости можно оставить комментарий, почему курс вернули из архива.",
  },
};

export default function AdminCourseActions({
  course,
  pendingAction,
  error,
  onAction,
}: {
  course: Course;
  pendingAction: ModerationAction | null;
  error: string | null;
  onAction: (action: ModerationAction, notes: string) => Promise<boolean>;
}) {
  const [notes, setNotes] = React.useState(course.review_notes || "");
  const [action, setAction] = React.useState<ModerationAction | null>(null);

  React.useEffect(() => {
    setNotes(course.review_notes || "");
    setAction(null);
  }, [course.course_id, course.review_notes]);

  const availableActions = getAvailableModerationActions(course);
  const activeMeta = action ? ACTION_META[action] : null;
  const notesRequired = !!activeMeta?.notesRequired;
  const notesError =
    notesRequired && !notes.trim()
      ? "Для отклонения нужно указать причину."
      : null;
  const isSubmitting = pendingAction !== null;

  async function handleConfirm(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    if (!action || notesError) {
      return;
    }

    const success = await onAction(action, notes);
    if (success) {
      setAction(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-medium">Комментарий модератора</div>
          <div className="text-xs text-muted-foreground">
            {notes.trim().length} символов
          </div>
        </div>

        <Textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Напиши, что хорошо, что нужно исправить и что будет дальше."
          className="min-h-28 resize-y"
          disabled={isSubmitting}
        />

        <div className="text-xs leading-relaxed text-muted-foreground">
          {activeMeta?.notesHint ||
            "Комментарий можно оставить для любого решения. Для отклонения он обязателен."}
        </div>
      </div>

      {error ? <div className="text-sm text-destructive">{error}</div> : null}

      <div className="flex flex-wrap justify-end gap-2">
        {availableActions.map((nextAction) => {
          const meta = ACTION_META[nextAction];

          return (
            <Button
              key={nextAction}
              variant={meta.buttonVariant}
              disabled={isSubmitting}
              onClick={() => setAction(nextAction)}
            >
              {pendingAction === nextAction ? "Обновление..." : meta.buttonLabel}
            </Button>
          );
        })}
      </div>

      <AlertDialog
        open={!!action}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !isSubmitting) {
            setAction(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{activeMeta?.confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {activeMeta?.confirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {notesRequired ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              Причина отклонения обязательна и будет сохранена в review notes.
            </div>
          ) : null}

          {notesError ? (
            <div className="text-sm text-destructive">{notesError}</div>
          ) : null}

          {error ? <div className="text-sm text-destructive">{error}</div> : null}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              disabled={isSubmitting || !!notesError}
              onClick={handleConfirm}
            >
              {isSubmitting ? "Сохраняем..." : activeMeta?.confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
