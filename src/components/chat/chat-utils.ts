import {
  draftChatTitles,
  legacyWelcomeContent,
  maxStoredMessages,
} from "./chat-data";
import type { ChatMessage, ChatSession, ThemeMode } from "./chat-types";

export function createId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createEmptyChat(index = 0): ChatSession {
  const now = Date.now();

  return {
    id: createId(),
    title: draftChatTitles[index % draftChatTitles.length],
    createdAt: now,
    updatedAt: now,
    messages: [],
    memory: {},
    context: {},
  };
}

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark";
}

export function getDeviceTheme(): ThemeMode {
  if (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "light";
}

export function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const message = value as Partial<ChatMessage>;
  return (
    typeof message.id === "string" &&
    (message.role === "assistant" || message.role === "user") &&
    typeof message.content === "string"
  );
}

export function removeLegacyWelcomeMessages(messages: ChatMessage[]) {
  return messages.filter(
    (message) =>
      !(
        message.role === "assistant" &&
        !message.reply &&
        (message.id === "welcome" || message.content === legacyWelcomeContent)
      ),
  );
}

function cleanTitle(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized ? normalized.slice(0, 64) : fallback;
}

export function titleFromMessage(message: string) {
  const text = message.replace(/\s+/g, " ").trim();
  const lower = text.toLowerCase();

  if (/(аккаунт|регистрац|войти|пароль|логин)/i.test(lower)) {
    return "Аккаунт и вход";
  }

  if (/(курс|каталог|создать курс|модерац)/i.test(lower)) {
    return "Курсы в 4pupils";
  }

  if (/(ученик|студент|заявк|список)/i.test(lower)) {
    return "Ученики и заявки";
  }

  if (/(преподав|учитель|тьютор)/i.test(lower)) {
    return "Преподаватели";
  }

  if (/(распис|занят|урок|перенести|дата|время)/i.test(lower)) {
    return "Расписание занятий";
  }

  if (/(роль|права|доступ|админ)/i.test(lower)) {
    return "Роли и доступы";
  }

  if (/(оплат|платеж|цена|стоимость)/i.test(lower)) {
    return "Оплата на платформе";
  }

  const shortText = text.length > 42 ? `${text.slice(0, 39).trim()}...` : text;
  return shortText ? `Разбор: ${shortText}` : draftChatTitles[0];
}

export function titleFromMessages(messages: ChatMessage[]) {
  const firstUserMessage = messages.find((message) => message.role === "user");
  return firstUserMessage
    ? titleFromMessage(firstUserMessage.content)
    : draftChatTitles[0];
}

export function normalizeChat(value: unknown, index: number): ChatSession | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const chat = value as Partial<ChatSession>;
  const messages = Array.isArray(chat.messages)
    ? removeLegacyWelcomeMessages(chat.messages.filter(isChatMessage)).slice(
        -maxStoredMessages,
      )
    : [];

  const fallbackTitle = titleFromMessages(messages);
  const now = Date.now();

  return {
    id: typeof chat.id === "string" ? chat.id : createId(),
    title: cleanTitle(chat.title, fallbackTitle || draftChatTitles[index]),
    createdAt: typeof chat.createdAt === "number" ? chat.createdAt : now,
    updatedAt: typeof chat.updatedAt === "number" ? chat.updatedAt : now,
    messages,
    memory:
      chat.memory && typeof chat.memory === "object" ? chat.memory : {},
    context:
      chat.context && typeof chat.context === "object"
        ? chat.context
        : {},
  };
}
