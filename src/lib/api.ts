// lib/api.ts
import { PUBLIC_BACKEND_URL } from "@/lib/backend-url.client";
import {
  clientFetch,
  type ClientFetchOptions,
} from "@/lib/client-fetch";

export const API_URL = PUBLIC_BACKEND_URL;

export async function apiFetch(path: string, options: ClientFetchOptions = {}) {
  return clientFetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
}
