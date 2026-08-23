// lib/http.ts
import {
  clientFetch,
  type ClientFetchOptions,
} from "@/lib/client-fetch";

export async function http(path: string, options: ClientFetchOptions = {}) {
  return clientFetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
  });
}
