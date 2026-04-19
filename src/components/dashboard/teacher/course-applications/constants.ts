export {
  APPLICATION_STATUS_META,
  APPLICATION_STATUS_ORDER,
  COURSE_STATUS_META,
  COURSE_VISIBILITY_META,
  ENROLLMENT_STATUS_LABELS,
} from "@/lib/course-meta";

import type { ActionMeta, ApplicationWorkflowAction } from "./types";

export const ACTION_META: Record<ApplicationWorkflowAction, ActionMeta> = {
  reviewing: {
    buttonLabel: "Взять в работу",
    buttonVariant: "outline",
    confirmTitle: "Перевести заявку в работу?",
    confirmDescription:
      "Статус обновится на reviewing. Это удобно, когда вы уже начали просмотр заявки, но ещё не готовы принять решение.",
    confirmLabel: "Перевести в работу",
    notesHint:
      "Можно оставить короткий комментарий для себя или студента перед тем, как продолжить разбор.",
  },
  approve: {
    buttonLabel: "Принять",
    buttonVariant: "default",
    confirmTitle: "Одобрить заявку?",
    confirmDescription:
      "Студент получит положительное решение. Если backend создаёт доступ автоматически, это сразу отразится в статусе enrollment.",
    confirmLabel: "Одобрить заявку",
    notesHint:
      "Комментарий необязателен, но можно пояснить, что делать дальше и как начать обучение.",
  },
  reject: {
    buttonLabel: "Отклонить",
    buttonVariant: "destructive",
    confirmTitle: "Отклонить заявку?",
    confirmDescription:
      "Заявка получит статус rejected. Причину лучше описать понятно, чтобы студент видел, что именно произошло.",
    confirmLabel: "Отклонить заявку",
    notesHint:
      "Для отклонения комментарий обязателен. Он будет сохранён как review note.",
    notesRequired: true,
  },
};
