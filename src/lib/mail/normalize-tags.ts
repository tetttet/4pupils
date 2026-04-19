import type { MailTag } from "@/types/mail";

type TagKey = MailTag[number];

const VALID_TAGS = new Set<TagKey>([
  "important",
  "work",
  "personal",
  "spam",
  "teacher",
  "student",
  "admin",
]);

export function normalizeTags(input: unknown): TagKey[] {
  if (!input) return [];

  // Уже массив
  if (Array.isArray(input)) {
    return input
      .map((x) => String(x).trim())
      .filter((x): x is TagKey => VALID_TAGS.has(x as TagKey));
  }

  // Postgres array string: "{work,teacher}"
  if (typeof input === "string") {
    const s = input.trim();
    const raw =
      s.startsWith("{") && s.endsWith("}")
        ? s.slice(1, -1)
        : s;

    return raw
      .split(",")
      .map((x) => x.trim().replace(/^"+|"+$/g, ""))
      .filter((x): x is TagKey => VALID_TAGS.has(x as TagKey));
  }

  return [];
}
