import { categoryOptions } from "@/constant/dash";
import { Course } from "@/types/course";
import { USER_ROLES } from "@/types/user";
import { useEffect, useState } from "react";

export function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase();
}

export function formatPlainText(body: string) {
  // Безопасно: показываем как pre-wrap
  return body;
}

export function roleBadgeVariant(role: USER_ROLES) {
  // shadcn Badge variants might differ; default is ok
  return role === "admin"
    ? "default"
    : role === "teacher"
      ? "secondary"
      : "outline";
}

export function fmtDateTime(iso?: string) {
  if (!iso) return { dateLabel: "—", timeLabel: "" };
  const d = new Date(iso);
  const dateLabel = d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timeLabel = d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { dateLabel, timeLabel };
}

export function initialsFromId(id?: string) {
  if (!id) return "—";
  return id.slice(0, 2).toUpperCase();
}

export function formatBytes(bytes?: number) {
  const n = typeof bytes === "number" ? bytes : 0;
  if (n < 1024) return `${n} B`;
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(2)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}

// tiny hook for debounce (fast search without re-render spam)
export function useDebounced<T>(value: T, delayMs: number) {
  const [v, setV] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setV(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return v;
}

export function formatMoney(
  value: string | number | null | undefined,
  currency?: string | null,
) {
  if (value == null) return "—";
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return String(value);

  // KZT / USD / EUR и т.п.
  try {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: currency ?? "USD",
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency ?? ""}`.trim();
  }
}

export function normalizeText(value?: string | null) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0400-\u04ff]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatLabel(value?: string | null) {
  const words = String(value || "")
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return "";

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function isFreeCourse(course: Course) {
  return (
    Boolean(course.is_free) ||
    Number(course.price ?? 0) === 0 ||
    String(course.price ?? "") === "0.00"
  );
}

export function getCourseLevelLabel(level?: string | null) {
  const normalized = normalizeText(level);

  if (!normalized) return "Любой уровень";
  if (
    normalized.includes("begin") ||
    normalized.includes("basic") ||
    normalized.includes("entry") ||
    normalized.includes("novice") ||
    normalized.includes("junior") ||
    normalized.includes("начина") ||
    normalized.includes("с нуля")
  ) {
    return "С нуля";
  }

  if (
    normalized.includes("intermediate") ||
    normalized.includes("middle") ||
    normalized.includes("medium") ||
    normalized.includes("сред")
  ) {
    return "Средний";
  }

  if (
    normalized.includes("advanced") ||
    normalized.includes("expert") ||
    normalized.includes("pro") ||
    normalized.includes("продвин")
  ) {
    return "Продвинутый";
  }

  return formatLabel(level);
}

export function getCourseCategoryLabel(course: Course) {
  const categoryValue = String(course.category || course.tags?.[0] || "").trim();

  if (!categoryValue) return "Без категории";

  const matchedCategory = categoryOptions.find(
    ({ value, label }) => value === categoryValue || label === categoryValue,
  );

  return matchedCategory?.label || formatLabel(categoryValue) || "Без категории";
}

export function toggleArrayValue(value: string, values: string[]) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}
