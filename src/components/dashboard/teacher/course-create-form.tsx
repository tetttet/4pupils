"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";
import { apiFetchMultipart } from "@/lib/api-multipart";
import {
  getUserFacingErrorMessage,
  toUserFacingErrorMessage,
} from "@/lib/error-messages";
import { ApiErr, ApiOk, Course } from "@/types/course";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import {
  X,
  Plus,
  UploadCloud,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { categoryOptions } from "@/constant/dash";

const SUPPORTED_LANGUAGES = ["kz", "ru", "en", "tr", "es"] as const;
const SUPPORTED_LEVELS = ["beginner", "intermediate", "advanced"] as const;
const SUPPORTED_CURRENCIES = ["KZT", "USD", "EUR", "TRY", "RUB"] as const;
const SUPPORTED_CATEGORIES = new Set(categoryOptions.map((opt) => opt.value));

// -----------------------------
// 1) RU -> LAT translit (приближённо)
// -----------------------------
const RU_MAP: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "yo",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "kh",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

function translitRuToLat(input: string) {
  const s = String(input || "");
  let out = "";
  for (const ch of s) {
    const low = ch.toLowerCase();
    if (RU_MAP[low] !== undefined) {
      const mapped = RU_MAP[low];
      // preserve basic case only for first letter sequences (not needed for slug)
      out += mapped;
    } else {
      out += ch;
    }
  }
  return out;
}

function slugifyAny(input: string) {
  // 1) translit ru -> lat
  const translit = translitRuToLat(input);
  // 2) normalize to slug
  return String(translit || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-_.~]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function uniq(arr: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of arr) {
    const k = x.trim();
    if (!k) continue;
    const key = k.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(k);
  }
  return out;
}

function parseTokens(raw: string) {
  return String(raw || "")
    .split(/[\n,;]+/g)
    .map((x) => x.trim())
    .filter(Boolean);
}

function useObjectUrl(file: File | null) {
  const [url, setUrl] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return url;
}

async function readJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function sanitizeOption(
  value: string | null | undefined,
  fallback: string,
  allowed: readonly string[],
) {
  return value && allowed.includes(value) ? value : fallback;
}

function sanitizeCategory(value: string | null | undefined) {
  return value && SUPPORTED_CATEGORIES.has(value) ? value : "other";
}

type ChipFieldProps = {
  label: string;
  hint?: string;
  placeholder?: string;
  value: string[];
  onChange: (next: string[]) => void;
  addButtonLabel?: string;
  max?: number;
  botHint?: string;
};

function ChipField({
  label,
  hint,
  placeholder,
  value,
  onChange,
  addButtonLabel = "Добавить",
  max = 50,
  botHint,
}: ChipFieldProps) {
  const [draft, setDraft] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const addDraft = React.useCallback(() => {
    const tokens = parseTokens(draft);
    if (!tokens.length) return;
    const next = uniq([...value, ...tokens]).slice(0, max);
    onChange(next);
    setDraft("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [draft, max, onChange, value]);

  const remove = React.useCallback(
    (idx: number) => {
      const next = value.filter((_, i) => i !== idx);
      onChange(next);
      requestAnimationFrame(() => inputRef.current?.focus());
    },
    [onChange, value],
  );

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <Label className="text-sm font-medium text-zinc-900">{label}</Label>
          {hint ? (
            <p className="text-xs leading-5 text-zinc-500">{hint}</p>
          ) : null}
          {botHint ? (
            <p className="text-xs leading-5 text-zinc-500">{botHint}</p>
          ) : null}
        </div>
        <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">
          {value.length}/{max}
        </div>
      </div>

      <div className="border border-zinc-300 bg-white p-3">
        <div className="flex flex-wrap gap-2">
          {value.map((item, idx) => (
            <div
              key={`${item}-${idx}`}
              className="inline-flex items-center gap-2 border border-zinc-300 bg-zinc-50 px-2 py-1 text-xs text-zinc-800"
            >
              <span className="max-w-55 truncate">{item}</span>
              <button
                type="button"
                className="inline-flex h-4 w-4 items-center justify-center text-zinc-500 transition-colors hover:text-zinc-900"
                onClick={() => remove(idx)}
                aria-label={`Удалить: ${item}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <Input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={
              placeholder || "Например: React, Next.js (Enter чтобы добавить)"
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addDraft();
              }
              if (e.key === ",") {
                e.preventDefault();
                addDraft();
              }
              if (e.key === "Backspace" && !draft && value.length) {
                remove(value.length - 1);
              }
            }}
            className="rounded-none border-zinc-300 shadow-none focus-visible:border-zinc-900 focus-visible:ring-zinc-200"
          />
          <Button
            type="button"
            variant="outline"
            onClick={addDraft}
            disabled={!draft.trim()}
            className="shrink-0 rounded-none border-zinc-300"
          >
            <Plus className="mr-2 h-4 w-4" />
            {addButtonLabel}
          </Button>
        </div>

        <p className="mt-2 text-xs leading-5 text-zinc-500">
          Можно вводить через <span className="font-medium">запятую</span>,
          <span className="font-medium"> точку с запятой</span> или
          <span className="font-medium"> с новой строки</span>. Нажмите Enter,
          чтобы добавить.
        </p>
      </div>
    </div>
  );
}

function MoneyInput({
  value,
  onChange,
  disabled,
  className,
}: {
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Input
      type="number"
      inputMode="decimal"
      step="0.01"
      min={0}
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => {
        const n = Number(e.target.value);
        onChange(Number.isFinite(n) ? n : 0);
      }}
      disabled={disabled}
      className={className}
    />
  );
}

const CONTROL_CLASS =
  "rounded-none border-zinc-300 bg-white text-zinc-900 shadow-none focus-visible:border-zinc-900 focus-visible:ring-zinc-200";

const SELECT_CONTENT_CLASS = "rounded-none border-zinc-300";

const steps = [
  { id: "basics", title: "Основное", desc: "Название, slug, описание" },
  { id: "meta", title: "Детали", desc: "Язык, уровень, теги" },
  {
    id: "pricing",
    title: "Цена и доступ",
    desc: "Стоимость, видимость, обложка",
  },
] as const;

type StepId = (typeof steps)[number]["id"];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function MonoPill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2 py-1 text-[11px] font-medium uppercase tracking-[0.14em]",
        className,
      )}
    >
      {children}
    </span>
  );
}

function StepGrid({ index }: { index: number }) {
  return (
    <div className="grid gap-px border border-zinc-300 bg-zinc-300 md:grid-cols-3">
      {steps.map((step, i) => {
        const isDone = i < index;
        const isActive = i === index;

        return (
          <div key={step.id} className="bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                  Шаг {i + 1}
                </div>
                <div className="mt-2 text-base font-semibold text-zinc-950">
                  {step.title}
                </div>
                <div className="mt-1 text-sm leading-5 text-zinc-600">
                  {step.desc}
                </div>
              </div>
              <MonoPill
                className={
                  isActive
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : isDone
                      ? "border-zinc-300 bg-zinc-100 text-zinc-900"
                      : "border-zinc-300 bg-white text-zinc-500"
                }
              >
                {isActive ? "текущий" : isDone ? "готов" : "ожидает"}
              </MonoPill>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FieldCell({
  label,
  htmlFor,
  note,
  action,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  note?: string | null;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("bg-white p-4 space-y-3", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <Label
            htmlFor={htmlFor}
            className="text-sm font-medium leading-5 text-zinc-900"
          >
            {label}
          </Label>
          {note ? (
            <p className="mt-1 text-xs leading-5 text-zinc-500">{note}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </div>
  );
}

function MetaTable({
  rows,
}: {
  rows: Array<{ label: string; value: React.ReactNode }>;
}) {
  return (
    <div className="overflow-x-auto border border-zinc-300">
      <table className="w-full text-sm">
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.label}
              className="border-b border-zinc-200 last:border-b-0"
            >
              <td className="w-36 border-r border-zinc-200 bg-zinc-100 px-3 py-2.5 text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                {row.label}
              </td>
              <td className="px-3 py-2.5 text-zinc-800">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CreateFormSidebar({
  stepIndex,
  slugLocked,
  showHints,
  onFillExample,
  onToggleHints,
  isEditMode,
  title,
  finalSlug,
  language,
  level,
  category,
  isFree,
  price,
  currency,
  visibility,
  previewImageUrl,
  courseStatus,
  reviewNotes,
}: {
  stepIndex: number;
  slugLocked: boolean;
  showHints: boolean;
  onFillExample: () => void;
  onToggleHints: () => void;
  isEditMode: boolean;
  title: string;
  finalSlug: string;
  language: string;
  level: string;
  category: string;
  isFree: boolean;
  price: number;
  currency: string;
  visibility: "private" | "public";
  previewImageUrl: string | null;
  courseStatus: Course["lifecycle_status"] | null;
  reviewNotes: string | null;
}) {
  const messages: Record<StepId, string[]> = {
    basics: [
      "Название должно сразу объяснять результат и формат курса.",
      slugLocked
        ? "Slug сейчас в ручном режиме: значение не меняется от названия."
        : "Slug сейчас в авто-режиме: строится из названия через транслит и slugify.",
    ],
    meta: [
      "Теги, требования и результаты лучше писать короткими предметными фразами.",
      "Результаты формулируй через действия: собрать, написать, настроить, пройти, улучшить.",
    ],
    pricing: [
      "Если курс бесплатный, цена фиксируется в 0 и поле блокируется.",
      "Даже при visibility=public курс станет публичным только после approved.",
    ],
  };

  const stepId = steps[stepIndex]?.id as StepId;
  const stack = messages[stepId] ?? [];

  return (
    <div className="sticky top-6 space-y-4">
      <section className="border border-zinc-300 bg-white">
        <div className="border-b border-zinc-300 px-4 py-4">
          <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
            Course Control
          </div>
          <div className="mt-2 text-lg font-semibold text-zinc-950">
            {isEditMode ? "Редактирование карточки" : "Новая карточка курса"}
          </div>
          <div className="mt-1 text-sm leading-5 text-zinc-600">
            Справа всегда видна текущая сводка, чтобы не терять контекст во время заполнения.
          </div>
        </div>

        <div className="space-y-3 px-4 py-4">
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-none border-zinc-300"
            onClick={onFillExample}
          >
            Заполнить примером курса
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-none border-zinc-300"
            onClick={onToggleHints}
          >
            {showHints ? "Скрыть подсказки" : "Показать подсказки"}
          </Button>
        </div>
      </section>

      <section className="border border-zinc-300 bg-white">
        <div className="border-b border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-950">
          Снимок курса
        </div>
        <div className="p-4 space-y-4">
          <div className="overflow-hidden border border-zinc-300 bg-zinc-100">
            {previewImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewImageUrl}
                alt="Preview"
                className="h-36 w-full object-cover"
              />
            ) : (
              <div className="flex h-36 items-center justify-center text-sm text-zinc-500">
                Обложка не выбрана
              </div>
            )}
          </div>

          <MetaTable
            rows={[
              {
                label: "Название",
                value: title.trim() || "Без названия",
              },
              {
                label: "Slug",
                value: (
                  <span className="font-mono text-xs text-zinc-600">
                    {finalSlug || "—"}
                  </span>
                ),
              },
              {
                label: "Шаг",
                value: `${stepIndex + 1} / ${steps.length} — ${steps[stepIndex]?.title}`,
              },
              {
                label: "Цена",
                value: isFree ? "Free" : `${price || 0} ${currency}`,
              },
              {
                label: "Доступ",
                value: visibility,
              },
              {
                label: "Язык",
                value: language,
              },
              {
                label: "Уровень",
                value: level,
              },
              {
                label: "Категория",
                value: category,
              },
              {
                label: "Slug режим",
                value: slugLocked ? "manual" : "auto",
              },
              {
                label: "Статус",
                value: courseStatus || (isEditMode ? "—" : "draft"),
              },
            ]}
          />
        </div>
      </section>

      <section className="border border-zinc-300 bg-white">
        <div className="border-b border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-950">
          Фокус текущего шага
        </div>
        <div className="space-y-2 px-4 py-4">
          {stack.map((item) => (
            <div
              key={item}
              className="border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm leading-6 text-zinc-700"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      {isEditMode && courseStatus === "rejected" ? (
        <section className="border border-zinc-300 bg-zinc-50">
          <div className="border-b border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-950">
            Замечания модерации
          </div>
          <div className="px-4 py-4 text-sm leading-6 text-zinc-700">
            {reviewNotes ||
              "Исправьте замечания, сохраните курс и затем отправьте его повторно."}
          </div>
        </section>
      ) : null}

      <section className="border border-zinc-300 bg-white">
        <div className="border-b border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-950">
          Базовый контроль
        </div>
        <div className="space-y-2 px-4 py-4 text-sm text-zinc-700">
          <div className="flex items-center justify-between gap-3 border border-zinc-300 px-3 py-2">
            <span>Название объясняет результат</span>
            <MonoPill className="border-zinc-300 bg-white text-zinc-700">
              check
            </MonoPill>
          </div>
          <div className="flex items-center justify-between gap-3 border border-zinc-300 px-3 py-2">
            <span>Slug выглядит чисто и понятно</span>
            <MonoPill className="border-zinc-300 bg-white text-zinc-700">
              check
            </MonoPill>
          </div>
          <div className="flex items-center justify-between gap-3 border border-zinc-300 px-3 py-2">
            <span>Outcomes написаны через действия</span>
            <MonoPill className="border-zinc-300 bg-white text-zinc-700">
              check
            </MonoPill>
          </div>
          <div className="flex items-center justify-between gap-3 border border-zinc-300 px-3 py-2">
            <span>Цена и visibility согласованы</span>
            <MonoPill className="border-zinc-300 bg-white text-zinc-700">
              check
            </MonoPill>
          </div>
        </div>
      </section>
    </div>
  );
}

type CourseCreateWizardProps = {
  mode?: "create" | "edit";
  courseId?: string;
};

export default function CourseCreateWizard({
  mode = "create",
  courseId,
}: CourseCreateWizardProps) {
  const router = useRouter();
  const isEditMode = mode === "edit";
  const [loading, setLoading] = React.useState(false);
  const [bootstrapping, setBootstrapping] = React.useState(isEditMode);
  const [courseLoaded, setCourseLoaded] = React.useState(!isEditMode);
  const [err, setErr] = React.useState<string | null>(null);
  const [okMsg, setOkMsg] = React.useState<string | null>(null);

  // wizard
  const [stepIndex, setStepIndex] = React.useState(0);
  const step = steps[stepIndex];

  // form state
  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [slugLocked, setSlugLocked] = React.useState(false); // false = auto; true = manual
  const [shortDescription, setShortDescription] = React.useState("");
  const [description, setDescription] = React.useState("");

  const [language, setLanguage] = React.useState("ru");
  const [level, setLevel] = React.useState<string>("beginner");
  const [category, setCategory] = React.useState<string>("other");

  const [tags, setTags] = React.useState<string[]>([]);
  const [requirements, setRequirements] = React.useState<string[]>([]);
  const [outcomes, setOutcomes] = React.useState<string[]>([]);

  const [isFree, setIsFree] = React.useState(false);
  const [price, setPrice] = React.useState<number>(0);
  const [currency, setCurrency] = React.useState("USD");
  const [visibility, setVisibility] = React.useState<"private" | "public">(
    "private",
  );

  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = React.useState<string | null>(
    null,
  );
  const imageUrl = useObjectUrl(imageFile);
  const previewImageUrl = imageUrl ?? existingImageUrl;

  // Optional: show more popovers by toggling this
  const [showHints, setShowHints] = React.useState(false);
  const [courseStatus, setCourseStatus] =
    React.useState<Course["lifecycle_status"] | null>(null);
  const [reviewNotes, setReviewNotes] = React.useState<string | null>(null);

  // ✅ Auto-slug from title, including RU, unless manual mode
  React.useEffect(() => {
    if (slugLocked) return;
    const next = slugifyAny(title);
    setSlug(next);
  }, [title, slugLocked]);

  const finalSlug = slugifyAny(slug);

  const applyCourseToForm = React.useCallback((course: Course) => {
    const normalizedPrice = Number(course.price);
    const safePrice = Number.isFinite(normalizedPrice) ? normalizedPrice : 0;
    const nextIsFree = Boolean(course.is_free) || safePrice <= 0;

    setTitle(course.title ?? "");
    setSlug(course.slug ?? "");
    setSlugLocked(true);
    setShortDescription(course.short_description ?? "");
    setDescription(course.description ?? "");
    setLanguage(sanitizeOption(course.language, "ru", SUPPORTED_LANGUAGES));
    setLevel(sanitizeOption(course.level, "beginner", SUPPORTED_LEVELS));
    setCategory(sanitizeCategory(course.category));
    setTags(Array.isArray(course.tags) ? course.tags : []);
    setRequirements(Array.isArray(course.requirements) ? course.requirements : []);
    setOutcomes(Array.isArray(course.outcomes) ? course.outcomes : []);
    setIsFree(nextIsFree);
    setPrice(nextIsFree ? 0 : safePrice);
    setCurrency(
      sanitizeOption(
        course.currency?.toUpperCase(),
        "USD",
        SUPPORTED_CURRENCIES,
      ),
    );
    setVisibility(course.visibility === "public" ? "public" : "private");
    setImageFile(null);
    setExistingImageUrl(course.image_url ?? null);
    setCourseStatus(course.lifecycle_status);
    setReviewNotes(course.review_notes ?? null);
  }, []);

  React.useEffect(() => {
    if (!isEditMode) return;
    if (!courseId) {
      setErr("Не удалось открыть курс для редактирования");
      setBootstrapping(false);
      setCourseLoaded(false);
      return;
    }

    let cancelled = false;

    async function loadCourseForEdit() {
      setBootstrapping(true);
      setCourseLoaded(false);
      setErr(null);

      try {
        const res = await apiFetch("/api/courses/my");
        const json = (await readJsonSafe(res)) as ApiOk<Course[]> | ApiErr | null;

        if (!res.ok) {
          const msg =
            toUserFacingErrorMessage(
              (json as ApiErr | null)?.error?.message,
              "Не удалось загрузить курс",
              {
                code: (json as ApiErr | null)?.error?.code,
                status: res.status,
              },
            );
          if (!cancelled) setErr(msg);
          return;
        }

        const course = ((json as ApiOk<Course[]>)?.data ?? []).find(
          (item) => item.course_id === courseId,
        );

        if (!course) {
          if (!cancelled) {
            setErr("Курс не найден или недоступен для редактирования");
          }
          return;
        }

        if (!cancelled) {
          applyCourseToForm(course);
          setStepIndex(0);
          setCourseLoaded(true);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setErr(getUserFacingErrorMessage(e, "Не удалось загрузить курс"));
        }
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    }

    void loadCourseForEdit();

    return () => {
      cancelled = true;
    };
  }, [applyCourseToForm, courseId, isEditMode]);

  function fillCourseExample() {
    setErr(null);
    setOkMsg(null);

    setTitle("Английский разговорный клуб за 8 недель");
    setSlugLocked(false);

    setShortDescription(
      "Практический курс для тех, кто хочет увереннее говорить на английском в учебе, работе и путешествиях.",
    );

    setDescription(
      "Курс для тех, кто хочет снять языковой барьер и говорить свободнее.\n\nФормат:\n— 8 недель, 3 занятия в неделю\n— короткие домашние задания\n— разговорные сценарии для учебы, работы и поездок\n— разбор типовых ошибок\n\nВнутри: чек-листы, словарь по темам, парная практика и персональный план развития.",
    );

    setLanguage("ru");
    setLevel("intermediate");
    setCategory("other");

    setTags([
      "English",
      "Speaking",
      "Conversation",
      "Vocabulary",
      "Grammar",
      "Practice",
    ]);

    setRequirements([
      "Уровень английского примерно B1+ (или выше)",
      "Готовность делать домашку 30–60 минут в день",
      "Тетрадь/Google Docs для заметок",
    ]);

    setOutcomes([
      "Говорить увереннее в типовых учебных и рабочих ситуациях",
      "Собирать короткие ответы без долгих пауз",
      "Использовать тематическую лексику в живом разговоре",
      "Понимать свои частые ошибки и исправлять их",
      "Собрать персональный список ошибок и план улучшения",
    ]);

    setIsFree(false);
    setPrice(49.99);
    setCurrency("USD");
    setVisibility("private");

    setStepIndex(0);
  }

  function validateStep(idx: number) {
    if (idx === 0) {
      if (!title.trim()) return "Введите название курса";
      if (!finalSlug)
        return "Slug пустой — заполните название или задайте slug";
    }
    // other steps can be optional
    return null;
  }

  function goNext() {
    const v = validateStep(stepIndex);
    if (v) {
      setErr(v);
      return;
    }
    setErr(null);
    setStepIndex((i) => clamp(i + 1, 0, steps.length - 1));
  }

  function goPrev() {
    setErr(null);
    setStepIndex((i) => clamp(i - 1, 0, steps.length - 1));
  }

  function buildCourseFormData(includeEmptyFields = false) {
    const fd = new FormData();
    const shortDescriptionValue = shortDescription.trim();
    const descriptionValue = description.trim();
    const levelValue = level.trim();
    const categoryValue = category.trim();

    fd.append("title", title.trim());
    fd.append("slug", finalSlug);

    if (includeEmptyFields || shortDescriptionValue) {
      fd.append("short_description", shortDescriptionValue);
    }
    if (includeEmptyFields || descriptionValue) {
      fd.append("description", descriptionValue);
    }

    fd.append("language", (language || "ru").trim());
    if (includeEmptyFields || levelValue) {
      fd.append("level", levelValue);
    }
    if (includeEmptyFields || categoryValue) {
      fd.append("category", categoryValue);
    }

    if (includeEmptyFields || tags.length) {
      fd.append("tags", tags.join(", "));
    }
    if (includeEmptyFields || requirements.length) {
      fd.append("requirements", requirements.join(", "));
    }
    if (includeEmptyFields || outcomes.length) {
      fd.append("outcomes", outcomes.join(", "));
    }

    fd.append("visibility", visibility);
    fd.append("currency", (currency || "USD").toUpperCase());
    fd.append(
      "price",
      isFree ? "0" : String(Number.isFinite(price) ? price : 0),
    );

    if (imageFile) fd.append("image", imageFile);

    return fd;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setErr(null);
    setOkMsg(null);

    if (stepIndex < steps.length - 1) {
      goNext();
    }
  }

  async function saveCourse() {
    if (loading) return;

    setErr(null);
    setOkMsg(null);

    const v0 = validateStep(0);
    if (v0) return setErr(v0);

    setLoading(true);
    try {
      const res = await apiFetchMultipart(
        isEditMode ? `/api/courses/${courseId}` : "/api/courses",
        {
          method: isEditMode ? "PATCH" : "POST",
          body: buildCourseFormData(isEditMode),
        },
      );

      const json = (await readJsonSafe(res)) as ApiOk<Course> | ApiErr | null;
      if (!res.ok || !json || !("ok" in json) || json.ok === false) {
        const msg = toUserFacingErrorMessage(
          (json as ApiErr | null)?.error?.message,
          isEditMode ? "Не удалось обновить курс" : "Не удалось создать курс",
          {
            code: (json as ApiErr | null)?.error?.code,
            status: res.status,
          },
        );
        setErr(msg);
        return;
      }

      const savedCourse = (json as ApiOk<Course>).data;

      if (isEditMode) {
        applyCourseToForm(savedCourse);
        toast.success("Курс обновлён");
        router.push("/dashboard/teacher/courses");
        return;
      }

      setOkMsg(`Курс создан: ${savedCourse.title}`);

      // reset
      setTitle("");
      setSlug("");
      setSlugLocked(false);
      setShortDescription("");
      setDescription("");
      setLanguage("ru");
      setLevel("beginner");
      setCategory("other");
      setTags([]);
      setRequirements([]);
      setOutcomes([]);
      setIsFree(false);
      setPrice(0);
      setCurrency("USD");
      setVisibility("private");
      setImageFile(null);
      setExistingImageUrl(null);
      setCourseStatus(null);
      setReviewNotes(null);
      setStepIndex(0);
    } catch (e: unknown) {
      setErr(
        getUserFacingErrorMessage(
          e,
          isEditMode ? "Не удалось обновить курс" : "Не удалось создать курс",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  if (isEditMode && bootstrapping) {
    return (
      <div className="bg-white p-6 text-zinc-900">
        <div className="flex items-center gap-3 border border-zinc-300 bg-white p-6 text-sm text-zinc-600">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
          <span>Загружаю курс для редактирования...</span>
        </div>
      </div>
    );
  }

  if (isEditMode && !courseLoaded) {
    return (
      <div className="bg-white p-6 text-zinc-900">
        <div className="space-y-4 border border-zinc-300 bg-white p-6">
          <div className="text-sm text-zinc-700">
            {err || "Не удалось открыть курс"}
          </div>
          <Button
            type="button"
            variant="outline"
            className="rounded-none border-zinc-300"
            onClick={() => router.push("/dashboard/teacher/courses")}
          >
            Вернуться к списку
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white p-6 text-zinc-900">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
            Course Setup
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
            {isEditMode ? "Редактирование курса" : "Создание курса"}
          </h1>
          <p className="max-w-4xl text-sm leading-6 text-zinc-600">
            {isEditMode
              ? "Исправьте поля курса, сохраните изменения и затем снова отправьте карточку на модерацию."
              : "Соберите курс пошагово: основа, метаданные, доступ и обложка. Всё в одном рабочем интерфейсе без лишних отвлечений."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <MonoPill className="border-zinc-900 bg-zinc-900 text-white">
            Шаг {stepIndex + 1} / {steps.length}
          </MonoPill>
          {courseStatus ? (
            <MonoPill className="border-zinc-300 bg-white text-zinc-700">
              {courseStatus}
            </MonoPill>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="rounded-none border-zinc-300"
            onClick={() => router.push("/dashboard/teacher/courses")}
          >
            К списку курсов
          </Button>
        </div>
      </div>

      <StepGrid index={stepIndex} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="border border-zinc-300 bg-white">
          <div className="flex flex-col gap-2 border-b border-zinc-300 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                Текущий шаг
              </div>
              <div className="mt-2 text-lg font-semibold text-zinc-950">
                {step.title}
              </div>
              <div className="mt-1 text-sm leading-5 text-zinc-600">
                {step.desc}
              </div>
            </div>
            <div className="text-xs uppercase tracking-[0.16em] text-zinc-500">
              {showHints ? "Подсказки включены" : "Подсказки скрыты"}
            </div>
          </div>

          <form onSubmit={onSubmit}>
            <div className="space-y-6 p-4">
              {err || okMsg ? (
                <div
                  className={cn(
                    "border px-4 py-3 text-sm",
                    err
                      ? "border-zinc-900 bg-zinc-100 text-zinc-900"
                      : "border-zinc-300 bg-white text-zinc-900",
                  )}
                >
                  {err || okMsg}
                </div>
              ) : null}

              {step.id === "basics" ? (
                <section className="space-y-4">
                  <div className="grid gap-px border border-zinc-300 bg-zinc-300 md:grid-cols-2">
                    <FieldCell
                      label="Название курса"
                      htmlFor="title"
                      note={
                        showHints
                          ? "Пиши название через итог и формат. Пример: Разговорный английский за 8 недель."
                          : null
                      }
                    >
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Например: Разговорный английский за 8 недель"
                        className={CONTROL_CLASS}
                      />
                      <p className="text-xs leading-5 text-zinc-500">
                        Slug может собираться автоматически даже из русского названия.
                      </p>
                    </FieldCell>

                    <FieldCell
                      label="Ссылка (slug)"
                      htmlFor="slug"
                      note={
                        showHints
                          ? "Авто-режим строит slug из названия. В ручном режиме можно править напрямую."
                          : null
                      }
                      action={
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-none border-zinc-300"
                          onClick={() => setSlugLocked((v) => !v)}
                        >
                          {slugLocked ? (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" />
                              Ручной
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              Авто
                            </>
                          )}
                        </Button>
                      }
                    >
                      <Input
                        id="slug"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="english-speaking-club"
                        disabled={!slugLocked}
                        className={CONTROL_CLASS}
                      />
                      <p className="text-xs leading-5 text-zinc-500">
                        Итоговый slug:{" "}
                        <span className="font-mono text-zinc-700">
                          {finalSlug || "—"}
                        </span>
                      </p>
                    </FieldCell>

                    <FieldCell
                      label="Короткое описание"
                      htmlFor="short_description"
                      note={
                        showHints
                          ? "Сделай 1–2 предложения: кому курс подходит и какой результат обещает."
                          : null
                      }
                      className="md:col-span-2"
                    >
                      <Textarea
                        id="short_description"
                        value={shortDescription}
                        onChange={(e) => setShortDescription(e.target.value)}
                        rows={2}
                        placeholder="Например: Практика разговорного английского с живыми сценариями и обратной связью."
                        className={CONTROL_CLASS}
                      />
                    </FieldCell>

                    <FieldCell
                      label="Полное описание"
                      htmlFor="description"
                      note={
                        showHints
                          ? "Опиши программу, формат, блоки курса, как проходит обучение и что получает студент."
                          : null
                      }
                      className="md:col-span-2"
                    >
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={8}
                        placeholder="Опишите программу, формат, что входит, как проходит обучение..."
                        className={CONTROL_CLASS}
                      />
                    </FieldCell>
                  </div>
                </section>
              ) : null}

              {step.id === "meta" ? (
                <section className="space-y-4">
                  <div className="grid gap-px border border-zinc-300 bg-zinc-300 md:grid-cols-3">
                    <FieldCell
                      label="Язык"
                      note={showHints ? "Язык основного контента курса." : null}
                    >
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className={cn("w-full", CONTROL_CLASS)}>
                          <SelectValue placeholder="Выберите язык" />
                        </SelectTrigger>
                        <SelectContent className={SELECT_CONTENT_CLASS}>
                          <SelectItem value="kz">Қазақ тілі</SelectItem>
                          <SelectItem value="ru">Русский</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="tr">Türkçe</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                        </SelectContent>
                      </Select>
                    </FieldCell>

                    <FieldCell label="Уровень">
                      <Select value={level} onValueChange={setLevel}>
                        <SelectTrigger className={cn("w-full", CONTROL_CLASS)}>
                          <SelectValue placeholder="Выберите уровень" />
                        </SelectTrigger>
                        <SelectContent className={SELECT_CONTENT_CLASS}>
                          <SelectItem value="beginner">Новичок</SelectItem>
                          <SelectItem value="intermediate">Средний</SelectItem>
                          <SelectItem value="advanced">Продвинутый</SelectItem>
                        </SelectContent>
                      </Select>
                    </FieldCell>

                    <FieldCell label="Категория">
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className={cn("w-full", CONTROL_CLASS)}>
                          <SelectValue placeholder="Выберите категорию" />
                        </SelectTrigger>
                        <SelectContent className={SELECT_CONTENT_CLASS}>
                          {categoryOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FieldCell>
                  </div>

                  <div className="space-y-6">
                    <ChipField
                      label="Теги"
                      hint="Ключевые слова, по которым курс будет находиться в поиске."
                      value={tags}
                      onChange={setTags}
                      placeholder="Например: English, Speaking, Vocabulary"
                      addButtonLabel="Добавить тег"
                      botHint={
                        showHints
                          ? "Полезно собрать 5–10 тегов: тема, формат, уровень и ожидаемый результат."
                          : undefined
                      }
                    />

                    <ChipField
                      label="Требования"
                      hint="Что нужно знать или иметь заранее."
                      value={requirements}
                      onChange={setRequirements}
                      placeholder="Например: уровень B1+, готовность делать домашку"
                      addButtonLabel="Добавить"
                      botHint={
                        showHints
                          ? "Требования лучше формулировать мягко и конкретно: уровень, инструменты, нагрузка."
                          : undefined
                      }
                    />

                    <ChipField
                      label="Результаты"
                      hint="Что человек сможет после курса."
                      value={outcomes}
                      onChange={setOutcomes}
                      placeholder="Например: уверенно вести короткий разговор"
                      addButtonLabel="Добавить"
                      botHint={
                        showHints
                          ? "Пиши глаголами: написать, собрать, настроить, пройти, улучшить."
                          : undefined
                      }
                    />
                  </div>
                </section>
              ) : null}

              {step.id === "pricing" ? (
                <section className="space-y-4">
                  <div className="grid gap-px border border-zinc-300 bg-zinc-300 md:grid-cols-2">
                    <FieldCell
                      label="Бесплатный курс"
                      note={
                        showHints
                          ? "Если включить этот режим, цена фиксируется в 0."
                          : "Включите, если курс распространяется бесплатно."
                      }
                    >
                      <div className="flex items-center justify-between border border-zinc-300 bg-zinc-50 px-3 py-3">
                        <div className="text-sm text-zinc-700">
                          Бесплатный доступ
                        </div>
                        <Switch
                          checked={isFree}
                          onCheckedChange={setIsFree}
                          className="data-[state=checked]:bg-zinc-900 data-[state=unchecked]:bg-white rounded-none border-zinc-300"
                        />
                      </div>
                    </FieldCell>

                    <FieldCell
                      label="Цена и валюта"
                      note={
                        isFree
                          ? "При бесплатном режиме цена остаётся равной 0."
                          : "Можно указать дробную сумму, например 19.99."
                      }
                    >
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-[0.12em] text-zinc-500">
                            Цена
                          </Label>
                          <MoneyInput
                            value={price}
                            onChange={setPrice}
                            disabled={isFree}
                            className={CONTROL_CLASS}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-[0.12em] text-zinc-500">
                            Валюта
                          </Label>
                          <Select value={currency} onValueChange={setCurrency}>
                            <SelectTrigger className={cn("w-full", CONTROL_CLASS)}>
                              <SelectValue placeholder="Выберите валюту" />
                            </SelectTrigger>
                            <SelectContent className={SELECT_CONTENT_CLASS}>
                              <SelectItem value="KZT">KZT(₸)</SelectItem>
                              <SelectItem value="USD">USD($)</SelectItem>
                              <SelectItem value="EUR">EUR(€)</SelectItem>
                              <SelectItem value="TRY">TRY(₺)</SelectItem>
                              <SelectItem value="RUB">RUB(₽)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </FieldCell>

                    <FieldCell
                      label="Видимость"
                      note={
                        showHints
                          ? "Public сработает только после одобрения курса модератором."
                          : "Определяет, кому курс потенциально может быть виден."
                      }
                    >
                      <Select
                        value={visibility}
                        onValueChange={(value) =>
                          setVisibility(value as "private" | "public")
                        }
                      >
                        <SelectTrigger className={cn("w-full", CONTROL_CLASS)}>
                          <SelectValue placeholder="Выберите видимость" />
                        </SelectTrigger>
                        <SelectContent className={SELECT_CONTENT_CLASS}>
                          <SelectItem value="private">
                            Черновик (видно только вам)
                          </SelectItem>
                          <SelectItem value="public">
                            Публичный (после approved)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FieldCell>

                    <FieldCell
                      label="Обложка"
                      note={
                        showHints
                          ? "Лучше всего работает 16:9 или аккуратный квадрат без перегруженного текста."
                          : "Файл JPG или PNG."
                      }
                    >
                      <div className="flex items-start gap-3 border border-zinc-300 bg-zinc-50 p-3">
                        <div className="relative flex h-20 w-28 items-center justify-center overflow-hidden border border-zinc-300 bg-white">
                          {previewImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={previewImageUrl}
                              alt="Preview"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UploadCloud className="h-5 w-5 text-zinc-500" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-3">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              setImageFile(e.target.files?.[0] || null)
                            }
                            className={CONTROL_CLASS}
                          />
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-none border-zinc-300"
                              onClick={() => setImageFile(null)}
                              disabled={!imageFile}
                            >
                              Убрать
                            </Button>
                            <span className="text-xs leading-5 text-zinc-500">
                              Лучше 16:9 или квадрат.
                            </span>
                          </div>
                        </div>
                      </div>
                    </FieldCell>
                  </div>

                  <div className="border border-zinc-300 bg-white">
                    <div className="border-b border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-950">
                      Предпросмотр
                    </div>
                    <div className="p-4">
                      <MetaTable
                        rows={[
                          {
                            label: "Название",
                            value: title || "(без названия)",
                          },
                          {
                            label: "URL",
                            value: (
                              <span className="font-mono text-xs text-zinc-600">
                                /{finalSlug || "—"}
                              </span>
                            ),
                          },
                          {
                            label: "Цена",
                            value: isFree ? "Free" : `${price || 0} ${currency}`,
                          },
                          {
                            label: "Visibility",
                            value: visibility,
                          },
                        ]}
                      />
                      <div className="mt-4 flex flex-wrap gap-2">
                        <MonoPill className="border-zinc-300 bg-white text-zinc-700">
                          {language}
                        </MonoPill>
                        <MonoPill className="border-zinc-300 bg-white text-zinc-700">
                          {level}
                        </MonoPill>
                        <MonoPill className="border-zinc-300 bg-white text-zinc-700">
                          {category}
                        </MonoPill>
                      </div>
                    </div>
                  </div>
                </section>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 border-t border-zinc-300 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs leading-5 text-zinc-500">
                {stepIndex < steps.length - 1
                  ? "На следующих шагах можно дополнять карточку по мере готовности."
                  : isEditMode
                    ? "На финальном шаге сохраните изменения, затем курс можно снова отправить на модерацию."
                    : "На финальном шаге нажмите «Создать курс», чтобы открыть новый черновик."}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-none border-zinc-300"
                  onClick={goPrev}
                  disabled={stepIndex === 0 || loading}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Назад
                </Button>

                {stepIndex < steps.length - 1 ? (
                  <Button
                    type="button"
                    className="rounded-none bg-zinc-900 text-white hover:bg-zinc-800"
                    onClick={goNext}
                    disabled={loading}
                  >
                    Далее
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={saveCourse}
                    disabled={loading}
                    className="min-w-45 rounded-none bg-zinc-900 text-white hover:bg-zinc-800"
                  >
                    {loading
                      ? isEditMode
                        ? "Сохраняем..."
                        : "Создаём..."
                      : isEditMode
                        ? "Сохранить изменения"
                        : "Создать курс"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </section>

        <CreateFormSidebar
          stepIndex={stepIndex}
          slugLocked={slugLocked}
          showHints={showHints}
          onFillExample={fillCourseExample}
          onToggleHints={() => setShowHints((value) => !value)}
          isEditMode={isEditMode}
          title={title}
          finalSlug={finalSlug}
          language={language}
          level={level}
          category={category}
          isFree={isFree}
          price={price}
          currency={currency}
          visibility={visibility}
          previewImageUrl={previewImageUrl}
          courseStatus={courseStatus}
          reviewNotes={reviewNotes}
        />
      </div>
    </div>
  );
}
