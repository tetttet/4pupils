import type {
  AtlasMemory,
  BotReply,
  UserContext,
} from "@/lib/atlas/types";

export type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  reply?: BotReply;
};

export type ChatSession = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  memory: AtlasMemory;
  context: UserContext;
};

export type ThemeMode = "light" | "dark";

export type StoredChatState = {
  messages: ChatMessage[];
  memory: AtlasMemory;
  context?: UserContext;
};

export type StoredThreadState = {
  activeChatId: string;
  chats: ChatSession[];
  theme?: ThemeMode;
};
