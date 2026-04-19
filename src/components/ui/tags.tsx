import React from "react";
import { Badge } from "./badge";
import type { MailTag } from "@/types/mail";

type TagKey = MailTag[number];

const TAG_STYLES: Record<TagKey, { className: string }> = {
  important: {
    className:
      "bg-rose-500/15 text-rose-700 ring-1 ring-rose-500/25 dark:text-rose-300",
  },
  work: {
    className:
      "bg-blue-500/15 text-blue-700 ring-1 ring-blue-500/25 dark:text-blue-300",
  },
  personal: {
    className:
      "bg-violet-500/15 text-violet-700 ring-1 ring-violet-500/25 dark:text-violet-300",
  },
  spam: {
    className:
      "bg-zinc-500/15 text-zinc-700 ring-1 ring-zinc-500/25 dark:text-zinc-300",
  },
  teacher: {
    className:
      "bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/25 dark:text-emerald-300",
  },
  student: {
    className:
      "bg-amber-500/15 text-amber-700 ring-1 ring-amber-500/25 dark:text-amber-300",
  },
  admin: {
    className:
      "bg-slate-500/15 text-slate-700 ring-1 ring-slate-500/25 dark:text-slate-300",
  },
};

const VALID_TAGS = new Set(Object.keys(TAG_STYLES) as TagKey[]);

function normalizeTags(input: unknown): TagKey[] {
  if (!input) return [];

  // already array
  if (Array.isArray(input)) {
    return input
      .map((x) => String(x).trim())
      .filter((x): x is TagKey => VALID_TAGS.has(x as TagKey));
  }

  // postgres array string: "{work,teacher}"
  if (typeof input === "string") {
    const s = input.trim();
    const raw = s.startsWith("{") && s.endsWith("}") ? s.slice(1, -1) : s;

    return raw
      .split(",")
      .map((x) => x.trim().replace(/^"+|"+$/g, "")) // remove quotes if any
      .filter((x): x is TagKey => VALID_TAGS.has(x as TagKey));
  }

  return [];
}

type TagsProps = {
  m: {
    tags?: unknown; // <-- важно: потому что реально может прилетать строка
  };
};

export default function Tags({ m }: TagsProps) {
  const tags = normalizeTags(m.tags);

  if (tags.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {tags.map((tag) => {
        const style = TAG_STYLES[tag];
        return (
          <Badge
            key={tag}
            variant="secondary"
            className={[
              "rounded-xl px-2 py-0.5 text-[11px] font-medium",
              "ring-inset",
              style.className,
            ].join(" ")}
          >
            {tag}
          </Badge>
        );
      })}
    </div>
  );
}
