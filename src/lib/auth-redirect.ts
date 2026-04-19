export function getSafeNextPath(
  rawNext: string | null | undefined,
  fallback = "",
) {
  if (!rawNext) return fallback;

  const next = rawNext.trim();
  if (!next) return fallback;

  if (!next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }

  return next;
}

export function buildAuthHref(
  basePath: "/auth/sign-in" | "/auth/sign-up",
  rawNext: string | null | undefined,
  fallback = "",
) {
  const next = getSafeNextPath(rawNext, fallback);
  if (!next) return basePath;

  return `${basePath}?next=${encodeURIComponent(next)}`;
}
