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
  ArrowLeft,
  Check,
  Circle,
  ImagePlus,
  Info,
  X,
  Plus,
  Sparkles,
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
    <div className="space-y-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <Label className="text-sm font-medium text-slate-900">{label}</Label>
          {hint ? (
            <p className="text-xs leading-5 text-slate-500">{hint}</p>
          ) : null}
          {botHint ? (
            <p className="text-xs leading-5 text-slate-500">{botHint}</p>
          ) : null}
        </div>
        <div className="shrink-0 text-xs text-slate-400">
          {value.length}/{max}
        </div>
      </div>

      <div className="rounded-lg border border-slate-300 bg-white p-3 shadow-xs transition focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-200">
        {value.length ? (
          <div className="mb-3 flex flex-wrap gap-2">
            {value.map((item, idx) => (
              <div
                key={`${item}-${idx}`}
                className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700"
              >
                <span className="max-w-55 truncate">{item}</span>
                <button
                  type="button"
                  className="inline-flex h-4 w-4 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  onClick={() => remove(idx)}
                  aria-label={`Удалить: ${item}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex gap-2">
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
            className="h-10 rounded-md border-0 bg-slate-50 shadow-none focus-visible:ring-0"
          />
          <Button
            type="button"
            variant="outline"
            onClick={addDraft}
            disabled={!draft.trim()}
            className="h-10 shrink-0 rounded-lg border-slate-300 bg-white px-3 shadow-none"
          >
            <Plus className="h-4 w-4" />
            {addButtonLabel}
          </Button>
        </div>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          Нажмите Enter или используйте запятую, чтобы добавить несколько значений.
        </p>
      </div>
    </div>
  );
}

function MoneyInput({
  id,
  value,
  onChange,
  disabled,
  className,
}: {
  id?: string;
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Input
      id={id}
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
  "h-10 rounded-lg border-slate-300 bg-white text-slate-900 shadow-xs focus-visible:border-slate-500 focus-visible:ring-slate-200";

const SELECT_CONTENT_CLASS = "rounded-lg border-slate-200";

function StatusPill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}

function FormCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
        ) : null}
      </div>
      <div className="space-y-5 p-5 sm:p-6">{children}</div>
    </section>
  );
}

function FormField({
  label,
  htmlFor,
  hint,
  required,
  action,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  required?: boolean;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Label htmlFor={htmlFor} className="text-sm font-medium text-slate-900">
            {label}
            {required ? <span className="ml-1 text-rose-600">*</span> : null}
          </Label>
          {hint ? (
            <p className="mt-1 text-xs leading-5 text-slate-500">{hint}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </div>
  );
}

function ReadinessItem({
  done,
  children,
}: {
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-slate-700">
      {done ? (
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
          <Check className="h-3.5 w-3.5" />
        </span>
      ) : (
        <Circle className="h-5 w-5 shrink-0 text-slate-300" />
      )}
      <span className={done ? "text-slate-500" : undefined}>{children}</span>
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
  const readinessChecks = [
    { label: "Название и ссылка", done: Boolean(title.trim() && finalSlug) },
    { label: "Короткое описание", done: Boolean(shortDescription.trim()) },
    { label: "Обложка курса", done: Boolean(previewImageUrl) },
    { label: "Результаты обучения", done: outcomes.length > 0 },
    { label: "Цена курса", done: isFree || price > 0 },
  ];
  const completedChecks = readinessChecks.filter((item) => item.done).length;
  const readinessPercent = Math.round(
    (completedChecks / readinessChecks.length) * 100,
  );
  const isFormEmpty =
    !title.trim() &&
    !shortDescription.trim() &&
    !description.trim() &&
    tags.length === 0 &&
    requirements.length === 0 &&
    outcomes.length === 0;

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
  }

  function validateForm() {
    if (!title.trim()) return "Введите название курса";
    if (!finalSlug)
      return "Ссылка курса пустая — заполните название или задайте её вручную";
    return null;
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
    void saveCourse();
  }

  async function saveCourse() {
    if (loading) return;

    setErr(null);
    setOkMsg(null);

    const v0 = validateForm();
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
      <div className="teacher-workspace min-h-full bg-[#f6f6f7] px-4 py-8 text-slate-900 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />
            <span>Загружаем данные курса…</span>
          </div>
        </div>
      </div>
    );
  }

  if (isEditMode && !courseLoaded) {
    return (
      <div className="teacher-workspace min-h-full bg-[#f6f6f7] px-4 py-8 text-slate-900 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm text-slate-700">
            {err || "Не удалось открыть курс"}
          </div>
          <Button
            type="button"
            variant="outline"
            className="rounded-lg border-slate-300"
            onClick={() => router.push("/dashboard/teacher/courses")}
          >
            <ArrowLeft className="h-4 w-4" />
            Вернуться к списку
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="teacher-workspace min-h-full bg-[#f6f6f7] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="mt-0.5 rounded-lg border-slate-300 bg-white shadow-xs"
                onClick={() => router.push("/dashboard/teacher/courses")}
                aria-label="Вернуться к списку курсов"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-[28px]">
                    {isEditMode ? "Редактировать курс" : "Создать курс"}
                  </h1>
                  <StatusPill className="bg-slate-200 text-slate-700">
                    {courseStatus === "submitted"
                      ? "На проверке"
                      : courseStatus === "approved"
                        ? "Одобрен"
                        : courseStatus === "rejected"
                          ? "Нужны исправления"
                          : courseStatus === "archived"
                            ? "В архиве"
                            : "Черновик"}
                  </StatusPill>
                </div>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                  {isEditMode
                    ? "Обновите информацию о курсе и сохраните изменения."
                    : "Заполните основную информацию. После создания вы сможете добавить уроки и отправить курс на модерацию."}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:pl-12 lg:pl-0">
              {!isEditMode && isFormEmpty ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-lg text-slate-600"
                  onClick={fillCourseExample}
                >
                  <Sparkles className="h-4 w-4" />
                  Подставить пример
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                className="rounded-lg border-slate-300 bg-white shadow-xs"
                onClick={() => router.push("/dashboard/teacher/courses")}
                disabled={loading}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                className="min-w-36 rounded-lg bg-[#0f3b57] text-white shadow-xs hover:bg-[#123f5b]"
                disabled={loading}
              >
                {loading
                  ? "Сохраняем…"
                  : isEditMode
                    ? "Сохранить"
                    : "Создать курс"}
              </Button>
            </div>
          </header>

          {err ? (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
            >
              {err}
            </div>
          ) : null}

          {okMsg ? (
            <div
              role="status"
              className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
            >
              {okMsg}
            </div>
          ) : null}

          {isEditMode && courseStatus === "rejected" ? (
            <div className="mb-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <div className="font-medium">Замечания модерации</div>
                <p className="mt-1 leading-5 text-amber-800">
                  {reviewNotes ||
                    "Исправьте данные курса, сохраните изменения и отправьте его на повторную проверку."}
                </p>
              </div>
            </div>
          ) : null}

          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <main className="min-w-0 space-y-5">
              <FormCard
                title="Основная информация"
                description="Объясните студенту, чему он научится и как будет проходить обучение."
              >
                <FormField
                  label="Название курса"
                  htmlFor="title"
                  hint="Понятное название с темой и результатом работает лучше всего."
                  required
                >
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Например, Разговорный английский за 8 недель"
                    className={CONTROL_CLASS}
                    aria-invalid={Boolean(err) && !title.trim()}
                    autoFocus={!isEditMode}
                  />
                </FormField>

                <FormField
                  label="Короткое описание"
                  htmlFor="short_description"
                  hint="Одно-два предложения для карточки курса в каталоге."
                >
                  <Textarea
                    id="short_description"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    rows={3}
                    placeholder="Кому подходит курс и какой результат получит студент"
                    className="min-h-24 rounded-lg border-slate-300 bg-white shadow-xs focus-visible:border-slate-500 focus-visible:ring-slate-200"
                  />
                  <div className="text-right text-xs text-slate-400">
                    {shortDescription.length} символов
                  </div>
                </FormField>

                <FormField
                  label="Описание"
                  htmlFor="description"
                  hint="Расскажите о программе, формате занятий и поддержке студентов."
                >
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={9}
                    placeholder="Опишите программу и формат обучения…"
                    className="min-h-56 rounded-lg border-slate-300 bg-white shadow-xs focus-visible:border-slate-500 focus-visible:ring-slate-200"
                  />
                </FormField>
              </FormCard>

              <FormCard
                title="Обложка"
                description="Используйте изображение 16:9 без мелкого текста — оно будет хорошо выглядеть и в каталоге, и на странице курса."
              >
                <Input
                  id="course-cover"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="sr-only"
                />
                <label
                  htmlFor="course-cover"
                  className="group block cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-3 transition hover:border-slate-400 hover:bg-slate-100/70 focus-within:ring-2 focus-within:ring-slate-300"
                >
                  {previewImageUrl ? (
                    <div className="grid items-center gap-4 sm:grid-cols-[220px_1fr]">
                      <div className="aspect-video overflow-hidden rounded-lg border border-slate-200 bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previewImageUrl}
                          alt="Предпросмотр обложки курса"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="px-1 py-2">
                        <div className="text-sm font-medium text-slate-900">
                          {imageFile ? imageFile.name : "Текущая обложка"}
                        </div>
                        <p className="mt-1 text-sm leading-5 text-slate-500">
                          Нажмите, чтобы выбрать другое изображение.
                        </p>
                        <span className="mt-3 inline-flex rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-xs">
                          Заменить изображение
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex min-h-44 flex-col items-center justify-center px-4 py-8 text-center">
                      <span className="grid h-11 w-11 place-items-center rounded-lg bg-white text-slate-600 shadow-sm ring-1 ring-slate-200">
                        <ImagePlus className="h-5 w-5" />
                      </span>
                      <div className="mt-3 text-sm font-medium text-slate-900">
                        Добавить обложку
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Нажмите для выбора JPG, PNG или WebP
                      </p>
                    </div>
                  )}
                </label>
                {imageFile ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-lg text-slate-600"
                    onClick={() => setImageFile(null)}
                  >
                    <X className="h-4 w-4" />
                    Отменить выбор
                  </Button>
                ) : null}
              </FormCard>

              <FormCard
                title="Содержание курса"
                description="Конкретные результаты и понятные требования помогают студенту принять решение."
              >
                <ChipField
                  label="Результаты обучения"
                  hint="Что студент сможет сделать после курса. Начинайте с глагола: создать, настроить, объяснить."
                  value={outcomes}
                  onChange={setOutcomes}
                  placeholder="Например, уверенно вести короткий разговор"
                  addButtonLabel="Добавить"
                />

                <div className="border-t border-slate-200" />

                <ChipField
                  label="Требования"
                  hint="Какие знания, инструменты или время понадобятся до начала обучения."
                  value={requirements}
                  onChange={setRequirements}
                  placeholder="Например, базовый уровень B1"
                  addButtonLabel="Добавить"
                />
              </FormCard>

              <FormCard
                title="Поиск и ссылка"
                description="Настройте адрес страницы и слова, по которым курс легче найти."
              >
                <FormField
                  label="Ссылка курса"
                  htmlFor="slug"
                  hint={
                    slugLocked
                      ? "Вы редактируете ссылку вручную. Используйте латинские буквы, цифры и дефисы."
                      : "Ссылка создаётся автоматически из названия курса."
                  }
                  required
                  action={
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-lg px-2 text-xs text-slate-600"
                      onClick={() => setSlugLocked((value) => !value)}
                    >
                      {slugLocked ? "Вернуть авто" : "Изменить"}
                    </Button>
                  }
                >
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="english-speaking-club"
                    disabled={!slugLocked}
                    className={cn(
                      CONTROL_CLASS,
                      "font-mono text-sm disabled:bg-slate-50 disabled:opacity-100",
                    )}
                  />
                  <p className="text-xs text-slate-500">
                    Итоговый адрес:{" "}
                    <span className="font-mono text-slate-700">
                      /{finalSlug || "название-курса"}
                    </span>
                  </p>
                </FormField>

                <div className="border-t border-slate-200" />

                <ChipField
                  label="Теги"
                  hint="Добавьте тему, формат и ключевые навыки. Обычно достаточно 5–10 тегов."
                  value={tags}
                  onChange={setTags}
                  placeholder="Например, English, Speaking, Vocabulary"
                  addButtonLabel="Добавить тег"
                />
              </FormCard>
            </main>

            <aside className="min-w-0 space-y-5 lg:sticky lg:top-5">
              <FormCard title="Статус">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-600">Состояние курса</span>
                  <StatusPill className="bg-slate-100 text-slate-700">
                    {courseStatus === "submitted"
                      ? "На проверке"
                      : courseStatus === "approved"
                        ? "Одобрен"
                        : courseStatus === "rejected"
                          ? "Исправить"
                          : courseStatus === "archived"
                            ? "Архив"
                            : "Черновик"}
                  </StatusPill>
                </div>

                <FormField
                  label="Видимость"
                  hint="Публичный курс появится у студентов только после одобрения модератором."
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
                      <SelectItem value="private">Приватный</SelectItem>
                      <SelectItem value="public">
                        Публичный после одобрения
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <div className="flex gap-2 rounded-lg bg-sky-50 p-3 text-xs leading-5 text-sky-800">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  Сейчас можно спокойно сохранить черновик — публикация не произойдёт автоматически.
                </div>
              </FormCard>

              <FormCard title="Цена">
                <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      Бесплатный курс
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      Цена будет равна нулю
                    </div>
                  </div>
                  <Switch
                    checked={isFree}
                    onCheckedChange={setIsFree}
                    className="data-[state=checked]:bg-[#0f3b57]"
                    aria-label="Бесплатный курс"
                  />
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_110px] gap-3">
                  <FormField label="Цена" htmlFor="price">
                    <MoneyInput
                      id="price"
                      value={isFree ? 0 : price}
                      onChange={setPrice}
                      disabled={isFree}
                      className={CONTROL_CLASS}
                    />
                  </FormField>
                  <FormField label="Валюта">
                    <Select
                      value={currency}
                      onValueChange={setCurrency}
                      disabled={isFree}
                    >
                      <SelectTrigger className={cn("w-full", CONTROL_CLASS)}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={SELECT_CONTENT_CLASS}>
                        <SelectItem value="KZT">KZT</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="TRY">TRY</SelectItem>
                        <SelectItem value="RUB">RUB</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
              </FormCard>

              <FormCard title="Организация">
                <FormField label="Язык курса">
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
                </FormField>

                <FormField label="Уровень">
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
                </FormField>

                <FormField label="Категория">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className={cn("w-full", CONTROL_CLASS)}>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent className={SELECT_CONTENT_CLASS}>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </FormCard>

              <FormCard
                title="Готовность курса"
                description={`${completedChecks} из ${readinessChecks.length} пунктов заполнено`}
              >
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-[width] duration-300"
                    style={{ width: `${readinessPercent}%` }}
                  />
                </div>
                <div className="space-y-3">
                  {readinessChecks.map((item) => (
                    <ReadinessItem key={item.label} done={item.done}>
                      {item.label}
                    </ReadinessItem>
                  ))}
                </div>
                <p className="text-xs leading-5 text-slate-500">
                  Для сохранения обязательны только название и ссылка. Остальное можно дополнить позже.
                </p>
              </FormCard>
            </aside>
          </div>

          <footer className="mt-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-5 text-slate-500">
              {isEditMode
                ? "Изменения вступят в силу после сохранения."
                : "Курс сохранится как черновик — уроки можно добавить следующим шагом."}
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-lg border-slate-300"
                onClick={() => router.push("/dashboard/teacher/courses")}
                disabled={loading}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                className="min-w-36 rounded-lg bg-[#0f3b57] text-white shadow-xs hover:bg-[#123f5b]"
                disabled={loading}
              >
                {loading
                  ? "Сохраняем…"
                  : isEditMode
                    ? "Сохранить"
                    : "Создать курс"}
              </Button>
            </div>
          </footer>
        </div>
      </div>
    </form>
  );
}
