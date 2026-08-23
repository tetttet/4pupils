import { createBotResponse } from "@/lib/atlas/bot";
import type {
  AtlasHistoryMessage,
  ChatRequest,
} from "@/lib/atlas/types";

function sanitizeHistory(value: unknown): AtlasHistoryMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) && typeof item === "object",
    )
    .filter(
      (item) =>
        (item.role === "assistant" || item.role === "user") &&
        typeof item.content === "string",
    )
    .map((item) => ({
      role: item.role as AtlasHistoryMessage["role"],
      content: (item.content as string).trim().slice(0, 2_000),
    }))
    .filter((item) => item.content.length > 0)
    .slice(-10);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<ChatRequest>;
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!message) {
      return Response.json(
        { error: "Сообщение обязательно." },
        { status: 400 },
      );
    }

    if (message.length > 1200) {
      return Response.json(
        { error: "Сообщение слишком длинное. Ограничение - 1200 символов." },
        { status: 413 },
      );
    }

    return createBotResponse(
      message,
      body.memory,
      body.context,
      sanitizeHistory(body.history),
      request.signal,
    );
  } catch {
    return Response.json(
      {
        error:
          "Не получилось обработать сообщение. Попробуйте еще раз или свяжитесь с менеджером.",
      },
      { status: 500 },
    );
  }
}
