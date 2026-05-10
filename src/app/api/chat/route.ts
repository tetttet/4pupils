import { createBotResponse } from "@/lib/atlas/bot";
import type { ChatRequest } from "@/lib/atlas/types";

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
