"use client";

import * as React from "react";

import type { CourseSearchItem } from "@/lib/course-search";
import { clientFetch } from "@/lib/client-fetch";

const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_CACHE_TTL_MS = 5 * 60_000;
const resultCache = new Map<
  string,
  { items: CourseSearchItem[]; expiresAt: number }
>();

export function useCourseSearch(query: string, enabled: boolean) {
  const normalizedQuery = query.trim().toLocaleLowerCase("ru");
  const [items, setItems] = React.useState<CourseSearchItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!enabled || normalizedQuery.length < 2) {
      setItems([]);
      setLoading(false);
      setError(null);
      return;
    }

    const cached = resultCache.get(normalizedQuery);
    if (cached && cached.expiresAt > Date.now()) {
      setItems(cached.items);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError(null);

    const timeoutId = window.setTimeout(() => {
      void clientFetch(
        `/api/courses/search?q=${encodeURIComponent(normalizedQuery)}&limit=6`,
        {
          cacheTtlMs: SEARCH_CACHE_TTL_MS,
          retryOn401: false,
          signal: controller.signal,
        },
      )
        .then(async (response) => {
          if (!response.ok) {
            throw new Error("Course search failed");
          }

          const payload = (await response.json()) as {
            data?: CourseSearchItem[];
          };
          const nextItems = Array.isArray(payload.data) ? payload.data : [];

          resultCache.set(normalizedQuery, {
            items: nextItems,
            expiresAt: Date.now() + SEARCH_CACHE_TTL_MS,
          });

          if (active) {
            setItems(nextItems);
          }
        })
        .catch((requestError: unknown) => {
          if (
            !active ||
            (requestError instanceof DOMException &&
              requestError.name === "AbortError")
          ) {
            return;
          }

          setItems([]);
          setError("Не удалось загрузить быстрый поиск");
        })
        .finally(() => {
          if (active) {
            setLoading(false);
          }
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [enabled, normalizedQuery]);

  return { error, items, loading };
}
