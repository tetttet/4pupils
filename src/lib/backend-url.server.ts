import { normalizeBaseUrl } from "@/lib/url";

export const BACKEND_URL = normalizeBaseUrl(
  process.env.BACKEND_URL ??
    process.env.SERVER_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    process.env.NEXT_PUBLIC_SERVER_URL ??
    process.env.NEXT_PUBLIC_API_URL,
);
