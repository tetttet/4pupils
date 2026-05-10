import { productBrand } from "@/lib/atlas/brand";
import type { ChatSession } from "./chat-types";

export const starterChips = [
  "Что ты умеешь?",
  "Как создать аккаунт ученика?",
  "Как найти нужный раздел платформы?",
  "Как работает платформа для моей роли?",
];

export const draftChatTitles = [
  "Работа с платформой",
  "Аккаунты и доступы",
  "Курсы и заявки",
  "Ученики и преподаватели",
  "Расписание занятий",
  "Панель администратора",
  "Профиль школы",
  "Оплата и доступ",
];

export const storageKey = productBrand.storageKey;
export const threadsStorageKey = `${storageKey}.threads`;
export const themeStorageKey = `${storageKey}.theme`;
export const themeOverrideStorageKey = `${themeStorageKey}.override`;
export const maxStoredChats = 16;
export const maxStoredMessages = 60;

export const welcomeBackdropText = "Спросите Atlas";
export const welcomeBackdropSubtext =
  "Atlas поможет быстро сориентироваться в платформе";
export const legacyWelcomeContent = `Здравствуйте. Я ${productBrand.assistantName}. Помогу разобраться с аккаунтами, курсами, уроками, сообщениями, ролями, доступами и настройками платформы.`;

export const initialChat: ChatSession = {
  id: "initial",
  title: draftChatTitles[0],
  createdAt: 0,
  updatedAt: 0,
  messages: [],
  memory: {},
  context: {},
};
