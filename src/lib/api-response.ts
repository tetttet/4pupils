import type { ApiErr, ApiOk } from "@/types/api";
import { toUserFacingErrorMessage } from "@/lib/error-messages";

type ApiJson<T> = ApiOk<T> | ApiErr | { message?: unknown } | null;

export function isApiOk<T>(value: unknown): value is ApiOk<T> {
  if (!value || typeof value !== "object") return false;

  const maybeValue = value as {
    ok?: unknown;
    data?: unknown;
  };

  return maybeValue.ok === true && "data" in maybeValue;
}

export function isApiErr(value: unknown): value is ApiErr {
  if (!value || typeof value !== "object") return false;

  const maybeValue = value as {
    ok?: unknown;
    error?: { code?: unknown; message?: unknown };
  };

  return maybeValue.ok === false;
}

export async function readJsonSafe<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function getApiErrorMessage(
  json: ApiJson<unknown>,
  fallback: string,
  status?: number,
) {
  if (isApiErr(json) && typeof json.error?.message === "string") {
    return toUserFacingErrorMessage(json.error.message, fallback, {
      code: typeof json.error.code === "string" ? json.error.code : undefined,
      status,
    });
  }

  if (json && typeof json === "object") {
    const message = (json as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return toUserFacingErrorMessage(message, fallback, { status });
    }
  }

  if (typeof status === "number") {
    return toUserFacingErrorMessage(null, fallback, { status });
  }

  return toUserFacingErrorMessage(null, fallback);
}

export async function readApiData<T>(res: Response, fallback: string) {
  const json = await readJsonSafe<ApiJson<T>>(res);

  if (!res.ok) {
    throw new Error(getApiErrorMessage(json, fallback, res.status));
  }

  if (!isApiOk<T>(json)) {
    throw new Error("Сервер вернул некорректный ответ");
  }

  return json.data;
}
