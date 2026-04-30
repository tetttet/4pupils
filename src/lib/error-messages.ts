const DEFAULT_ERROR_MESSAGE = "Что-то пошло не так. Попробуйте ещё раз.";

type ErrorMessageOptions = {
  code?: string | null;
  status?: number;
};

type ErrorLike = {
  code?: unknown;
  error?: {
    code?: unknown;
    message?: unknown;
  };
  message?: unknown;
  status?: unknown;
};

const FIELD_LABELS: Record<string, string> = {
  avatar_url: "ссылка на аватар",
  email: "email",
  first_name: "имя",
  internal_note: "внутренняя заметка",
  last_name: "фамилия",
  message: "сообщение",
  password: "пароль",
  phone: "телефон",
  review_note: "комментарий для студента",
  review_notes: "комментарий модерации",
  role: "роль",
  status: "статус",
};

const CODE_MESSAGES: Record<string, string> = {
  invalid_credentials:
    "Неверный email или пароль. Проверьте данные и попробуйте снова.",
  unauthorized: "Войдите в аккаунт и попробуйте снова.",
  forbidden: "Недостаточно прав для этого действия.",
  not_found: "Запись не найдена или уже недоступна.",
  validation_error: "Проверьте заполненные поля и попробуйте снова.",
};

function normalize(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeCode(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function hasCyrillic(value: string) {
  return /[а-яё]/i.test(value);
}

function looksTechnical(value: string) {
  return (
    /[a-z]/i.test(value) &&
    !hasCyrillic(value) &&
    (/[_{}[\]<>]/.test(value) ||
      /\b(failed|invalid|required|unexpected|missing|forbidden|unauthorized|not found|http|error|credentials)\b/i.test(
        value,
      ))
  );
}

function stripTrailingPeriod(value: string) {
  return value.replace(/[.!?…]+$/u, "");
}

function joinSentences(base: string, detail: string) {
  return `${stripTrailingPeriod(base)}. ${detail}`;
}

function fieldLabel(field: string) {
  return FIELD_LABELS[field] ?? field.replace(/_/g, " ");
}

function actionLabel(action: string | undefined) {
  switch (action) {
    case "approval":
    case "approve":
      return "одобрить";
    case "rejection":
    case "reject":
      return "отклонить";
    default:
      return "продолжить";
  }
}

function statusMessage(status: number, fallback: string) {
  if (status === 400 || status === 422) {
    return joinSentences(fallback, "Проверьте заполненные поля.");
  }

  if (status === 401) {
    return "Войдите в аккаунт и попробуйте снова.";
  }

  if (status === 403) {
    return "Недостаточно прав для этого действия.";
  }

  if (status === 404) {
    return joinSentences(fallback, "Запись не найдена или уже недоступна.");
  }

  if (status === 409) {
    return joinSentences(
      fallback,
      "Данные уже изменились. Обновите страницу и попробуйте снова.",
    );
  }

  if (status >= 500) {
    return joinSentences(
      fallback,
      "На сервере возникла ошибка, попробуйте немного позже.",
    );
  }

  return fallback;
}

function statusFromMessage(message: string) {
  const match = message.match(/\bHTTP\s*(\d{3})\b/i);
  if (!match) return undefined;

  const status = Number(match[1]);
  return Number.isFinite(status) ? status : undefined;
}

function normalizeFallback(fallback?: string) {
  const normalizedFallback = normalize(fallback || DEFAULT_ERROR_MESSAGE);
  const known = matchKnownMessage(normalizedFallback);

  if (known) {
    return known;
  }

  if (looksTechnical(normalizedFallback)) {
    return DEFAULT_ERROR_MESSAGE;
  }

  return normalizedFallback || DEFAULT_ERROR_MESSAGE;
}

function matchKnownMessage(message: string) {
  const lower = message.toLowerCase();

  if (
    lower === "invalid credentials" ||
    lower === "invalid email or password" ||
    lower === "wrong email or password"
  ) {
    return "Неверный email или пароль. Проверьте данные и попробуйте снова.";
  }

  if (
    /review[_\s-]?notes?\s+or\s+internal[_\s-]?note\s+is\s+required\s+for\s+approval/.test(
      lower,
    )
  ) {
    return "Чтобы одобрить заявку, добавьте комментарий для студента или внутреннюю заметку.";
  }

  if (/review[_\s-]?notes?\s+is\s+required\s+for\s+reject/.test(lower)) {
    return "Чтобы отклонить, укажите причину для студента.";
  }

  if (lower === "email already exists" || lower === "user already exists") {
    return "Аккаунт с таким email уже существует. Войдите или используйте другой email.";
  }

  if (lower === "missing user id") {
    return "Не удалось определить пользователя. Обновите страницу и попробуйте снова.";
  }

  if (lower === "failed to load users" || lower === "failed to load admins") {
    return "Не удалось загрузить пользователей. Проверьте соединение и попробуйте снова.";
  }

  if (lower === "update failed") {
    return "Не удалось сохранить изменения. Проверьте данные и попробуйте снова.";
  }

  if (lower === "delete failed") {
    return "Не удалось удалить запись. Попробуйте снова.";
  }

  if (lower === "login failed" || lower === "unexpected login error") {
    return "Не удалось войти. Проверьте email и пароль или попробуйте позже.";
  }

  if (lower === "register failed" || lower === "unexpected register error") {
    return "Не удалось зарегистрироваться. Проверьте данные и попробуйте позже.";
  }

  if (lower === "request failed") {
    return "Не удалось выполнить запрос. Проверьте соединение и попробуйте снова.";
  }

  if (lower === "forbidden") {
    return "Недостаточно прав для этого действия.";
  }

  if (lower === "unauthorized") {
    return "Войдите в аккаунт и попробуйте снова.";
  }

  const eitherFieldMatch = lower.match(
    /^([a-z_]+)\s+or\s+([a-z_]+)\s+is\s+required(?:\s+for\s+([a-z_]+))?\.?$/,
  );
  if (eitherFieldMatch) {
    const firstField = fieldLabel(eitherFieldMatch[1]);
    const secondField = fieldLabel(eitherFieldMatch[2]);
    const action = actionLabel(eitherFieldMatch[3]);

    return `Чтобы ${action}, заполните одно из полей: ${firstField} или ${secondField}.`;
  }

  const requiredFieldMatch = lower.match(
    /^([a-z_]+)\s+is\s+required(?:\s+for\s+([a-z_]+))?\.?$/,
  );
  if (requiredFieldMatch) {
    const field = fieldLabel(requiredFieldMatch[1]);
    const action = requiredFieldMatch[2]
      ? `, чтобы ${actionLabel(requiredFieldMatch[2])}`
      : "";

    return `Заполните поле «${field}»${action}.`;
  }

  if (/\bnot found\b/.test(lower)) {
    return "Запись не найдена или уже недоступна.";
  }

  return null;
}

function extractMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (!error || typeof error !== "object") {
    return undefined;
  }

  const maybeError = error as ErrorLike;

  if (typeof maybeError.error?.message === "string") {
    return maybeError.error.message;
  }

  if (typeof maybeError.message === "string") {
    return maybeError.message;
  }

  return undefined;
}

function extractCode(error: unknown, code?: string | null) {
  if (code) return code;

  if (!error || typeof error !== "object") {
    return undefined;
  }

  const maybeError = error as ErrorLike;

  if (typeof maybeError.error?.code === "string") {
    return maybeError.error.code;
  }

  if (typeof maybeError.code === "string") {
    return maybeError.code;
  }

  return undefined;
}

function extractStatus(error: unknown, status?: number) {
  if (typeof status === "number") return status;

  if (!error || typeof error !== "object") {
    return undefined;
  }

  const maybeError = error as ErrorLike;

  if (typeof maybeError.status === "number") {
    return maybeError.status;
  }

  return undefined;
}

export function toUserFacingErrorMessage(
  message: unknown,
  fallback?: string,
  options: ErrorMessageOptions = {},
) {
  const safeFallback = normalizeFallback(fallback);
  const normalizedMessage =
    typeof message === "string" ? normalize(message) : "";
  const status = options.status ?? statusFromMessage(normalizedMessage);
  const code = options.code ? normalizeCode(options.code) : undefined;
  const codeMessage = code ? CODE_MESSAGES[code] : undefined;

  if (!normalizedMessage) {
    if (codeMessage) {
      return codeMessage;
    }

    return typeof status === "number"
      ? statusMessage(status, safeFallback)
      : safeFallback;
  }

  const known = matchKnownMessage(normalizedMessage);
  if (known && code !== "invalid_credentials") {
    return known;
  }

  if (codeMessage) {
    return codeMessage;
  }

  if (known) {
    return known;
  }

  if (typeof status === "number" && /^HTTP\s*\d{3}$/i.test(normalizedMessage)) {
    return statusMessage(status, safeFallback);
  }

  if (hasCyrillic(normalizedMessage) && !/HTTP\s*\d{3}/i.test(normalizedMessage)) {
    return normalizedMessage;
  }

  if (hasCyrillic(normalizedMessage) && typeof status === "number") {
    const messageWithoutStatus = normalize(
      normalizedMessage.replace(/\s*\(?HTTP\s*\d{3}\)?/i, ""),
    );
    return statusMessage(status, messageWithoutStatus || safeFallback);
  }

  if (typeof status === "number") {
    return statusMessage(status, safeFallback);
  }

  if (looksTechnical(normalizedMessage)) {
    return safeFallback;
  }

  return normalizedMessage;
}

export function getUserFacingErrorMessage(
  error: unknown,
  fallback?: string,
  options: ErrorMessageOptions = {},
) {
  return toUserFacingErrorMessage(extractMessage(error), fallback, {
    code: extractCode(error, options.code),
    status: extractStatus(error, options.status),
  });
}
