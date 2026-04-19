export const DEFAULT_SERVER_URL = "http://localhost:8080";

export function normalizeBaseUrl(value?: string | null) {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return DEFAULT_SERVER_URL;
  }

  return trimmedValue.replace(/\/+$/, "");
}
