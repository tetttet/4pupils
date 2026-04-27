"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Calculator,
  Languages,
  MonitorSmartphone,
  Landmark,
  FlaskConical,
  Atom,
  ScrollText,
  Feather,
  Globe2,
  Leaf,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import { useApprovedCourses } from "@/hooks/use-approved-courses";
import type { Course } from "@/types/course";
import {
  getCourseCategoryLabel,
  getCourseLevelLabel,
  isFreeCourse,
  normalizeText,
} from "@/lib/func";

type TabKey = "subjects" | "free" | "starter";

type Option = {
  key: TabKey;
  label: string;
};

type SegmentedProps = {
  options: Option[];
  value: TabKey;
  onChange: (key: TabKey) => void;
};

type SubjectItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
  featured?: boolean;
};

const ALL_COURSES_LABEL = "Все курсы";
const FREE_PRICE_LABEL = "Бесплатно";
const STARTER_LEVEL_LABEL = "С нуля";

const EMPTY_STATE_COPY: Record<TabKey, { title: string; description: string }> =
  {
    subjects: {
      title: "Пока нет опубликованных направлений",
      description:
        "Как только в базе появятся одобренные курсы, они автоматически отобразятся здесь.",
    },
    free: {
      title: "Пока нет бесплатных курсов",
      description:
        "Как только в базе появятся бесплатные опубликованные курсы, они сразу появятся в этом разделе.",
    },
    starter: {
      title: "Пока нет курсов для старта",
      description:
        "Когда в базе появятся опубликованные курсы уровня «С нуля», мы сразу покажем их здесь.",
    },
  };

const Segmented = React.memo(function Segmented({
  options,
  value,
  onChange,
}: SegmentedProps) {
  return (
    <div
      role="tablist"
      aria-label="Выбор категории"
      className="inline-flex items-center rounded-full border border-[rgba(var(--frontier-home-border-rgb),0.9)] bg-[rgba(var(--frontier-home-primary-rgb),0.07)] p-1.5 backdrop-blur-md"
    >
      {options.map((opt) => {
        const active = opt.key === value;

        return (
          <button
            key={opt.key}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(opt.key)}
            className={[
              "relative h-11 rounded-full px-6",
              "text-[12px] lg:text-[15px] font-semibold",
              "transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--frontier-home-primary-rgb),0.20)] focus-visible:ring-offset-2",
              active
                ? "text-[var(--frontier-home-ink)]"
                : "text-[var(--frontier-home-ink-muted)] hover:text-[var(--frontier-home-ink)]",
            ].join(" ")}
          >
            {active && (
              <motion.span
                layoutId="segmented-pill"
                className="absolute inset-0 rounded-full bg-white shadow-[0_10px_24px_rgba(var(--frontier-home-primary-deep-rgb),0.10)]"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
});

const TAB_OPTIONS: Option[] = [
  { key: "subjects", label: "Направления" },
  { key: "free", label: "Бесплатные" },
  { key: "starter", label: "С нуля" },
];

function buildCoursesHref({
  category,
  query,
  level,
  price,
}: {
  category?: string;
  query?: string;
  level?: string;
  price?: string;
} = {}) {
  const params = new URLSearchParams();

  if (category) {
    params.set("category", category);
  }

  if (query) {
    params.set("q", query);
  }

  if (level) {
    params.set("level", level);
  }

  if (price) {
    params.set("price", price);
  }

  const queryString = params.toString();
  return queryString ? `/courses?${queryString}` : "/courses";
}

function collectUniqueCategoryLabels(courses: Course[]) {
  const seen = new Set<string>();
  const labels: string[] = [];

  for (const course of courses) {
    const label = getCourseCategoryLabel(course);

    if (!label || label === "Без категории") continue;

    const normalizedLabel = normalizeText(label);
    if (!normalizedLabel || seen.has(normalizedLabel)) continue;

    seen.add(normalizedLabel);
    labels.push(label);
  }

  return labels.sort((left, right) => left.localeCompare(right, "ru"));
}

function getSubjectIcon(label: string, featured = false) {
  if (featured) {
    return <GraduationCap className="h-5 w-5" />;
  }

  const normalizedLabel = normalizeText(label);

  if (
    normalizedLabel.includes("англ") ||
    normalizedLabel.includes("язык") ||
    normalizedLabel.includes("ielts") ||
    normalizedLabel.includes("toefl")
  ) {
    return <Languages className="h-5 w-5" />;
  }

  if (normalizedLabel.includes("математ")) {
    return <Calculator className="h-5 w-5" />;
  }

  if (
    normalizedLabel.includes("информ") ||
    normalizedLabel.includes("program") ||
    normalizedLabel.includes("web") ||
    normalizedLabel.includes("mobile") ||
    normalizedLabel.includes("data") ||
    normalizedLabel.includes("кибер")
  ) {
    return <MonitorSmartphone className="h-5 w-5" />;
  }

  if (
    normalizedLabel.includes("обществ") ||
    normalizedLabel.includes("финанс") ||
    normalizedLabel.includes("бизнес") ||
    normalizedLabel.includes("маркет")
  ) {
    return <Landmark className="h-5 w-5" />;
  }

  if (normalizedLabel.includes("хим")) {
    return <FlaskConical className="h-5 w-5" />;
  }

  if (
    normalizedLabel.includes("физ") ||
    normalizedLabel.includes("science") ||
    normalizedLabel.includes("интеллект")
  ) {
    return <Atom className="h-5 w-5" />;
  }

  if (normalizedLabel.includes("истор")) {
    return <ScrollText className="h-5 w-5" />;
  }

  if (
    normalizedLabel.includes("литератур") ||
    normalizedLabel.includes("design")
  ) {
    return <Feather className="h-5 w-5" />;
  }

  if (
    normalizedLabel.includes("биолог") ||
    normalizedLabel.includes("здоров")
  ) {
    return <Leaf className="h-5 w-5" />;
  }

  if (normalizedLabel.includes("географ")) {
    return <Globe2 className="h-5 w-5" />;
  }

  return <BookOpen className="h-5 w-5" />;
}

function buildTabItems(
  labels: string[],
  extraFilters?: { query?: string; level?: string; price?: string },
) {
  return labels.map((label) => ({
    label,
    href: buildCoursesHref({ category: label, ...extraFilters }),
    icon: getSubjectIcon(label),
  }));
}

function buildSubjectsData(courses: Course[]): Record<TabKey, SubjectItem[]> {
  const allCategories = collectUniqueCategoryLabels(courses);
  const freeCategories = collectUniqueCategoryLabels(
    courses.filter((course) => isFreeCourse(course)),
  );
  const starterCategories = collectUniqueCategoryLabels(
    courses.filter(
      (course) => getCourseLevelLabel(course.level) === STARTER_LEVEL_LABEL,
    ),
  );

  return {
    subjects:
      allCategories.length > 0
        ? [
            ...buildTabItems(allCategories),
            {
              label: ALL_COURSES_LABEL,
              href: buildCoursesHref(),
              icon: getSubjectIcon(ALL_COURSES_LABEL, true),
              featured: true,
            },
          ]
        : [],
    free:
      freeCategories.length > 0
        ? [
            ...buildTabItems(freeCategories, { price: FREE_PRICE_LABEL }),
            {
              label: ALL_COURSES_LABEL,
              href: buildCoursesHref({ price: FREE_PRICE_LABEL }),
              icon: getSubjectIcon(FREE_PRICE_LABEL, true),
              featured: true,
            },
          ]
        : [],
    starter:
      starterCategories.length > 0
        ? [
            ...buildTabItems(starterCategories, {
              level: STARTER_LEVEL_LABEL,
            }),
            {
              label: ALL_COURSES_LABEL,
              href: buildCoursesHref({ level: STARTER_LEVEL_LABEL }),
              icon: getSubjectIcon(STARTER_LEVEL_LABEL, true),
              featured: true,
            },
          ]
        : [],
  };
}

function SubjectCardSkeleton({ index }: { index: number }) {
  return (
    <div
      className="animate-pulse rounded-3xl border border-[rgba(var(--frontier-home-border-rgb),0.8)] bg-white/90 p-5 shadow-[0_10px_30px_rgba(var(--frontier-home-primary-deep-rgb),0.08)] md:p-6"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="h-11 w-11 rounded-2xl bg-[rgba(var(--frontier-home-primary-rgb),0.12)]" />
      <div className="mt-4 h-5 w-2/3 rounded-full bg-[var(--frontier-home-surface-strong)]" />
      <div className="mt-3 h-px w-full bg-[rgba(var(--frontier-home-border-rgb),0.9)]" />
      <div className="mt-4 h-4 w-5/6 rounded-full bg-[rgba(var(--frontier-home-primary-rgb),0.08)]" />
      <div className="mt-2 h-4 w-2/3 rounded-full bg-[rgba(var(--frontier-home-primary-rgb),0.08)]" />
    </div>
  );
}

function SubjectCard({
  item,
  index,
  onClick,
  disabled,
}: {
  item: SubjectItem;
  index: number;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      transition={{
        duration: 0.38,
        delay: index * 0.04,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.985 }}
      className={[
        "group relative overflow-hidden rounded-3xl border text-left",
        "bg-white/90 backdrop-blur-sm",
        "p-5 md:p-6",
        "shadow-[0_10px_30px_rgba(var(--frontier-home-primary-deep-rgb),0.08)]",
        "transition-all duration-300",
        "disabled:pointer-events-none disabled:opacity-70",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--frontier-home-primary-rgb),0.20)] focus-visible:ring-offset-2",
        item.featured
          ? "border-[rgba(var(--frontier-home-primary-rgb),0.28)] bg-linear-to-br from-[rgba(var(--frontier-home-primary-rgb),0.10)] to-white"
          : "border-[rgba(var(--frontier-home-border-rgb),0.85)] hover:border-[rgba(var(--frontier-home-primary-rgb),0.25)]",
      ].join(" ")}
    >
      <div className="absolute inset-0 bg-linear-to-br from-white/40 via-transparent to-[rgba(var(--frontier-home-primary-rgb),0.05)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <div
            className={[
              "mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl",
              item.featured
                ? "bg-[var(--frontier-home-primary)] text-white shadow-[0_12px_30px_rgba(var(--frontier-home-primary-rgb),0.28)]"
                : "bg-[rgba(var(--frontier-home-primary-rgb),0.10)] text-[var(--frontier-home-primary-deep)]",
            ].join(" ")}
          >
            {item.icon}
          </div>

          <div className="max-w-[18ch] text-[17px] font-semibold leading-6 text-[var(--frontier-home-ink)] md:text-[18px]">
            {item.label}
          </div>
        </div>

        <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(var(--frontier-home-border-rgb),0.85)] bg-white text-[var(--frontier-home-ink-muted)] transition-all duration-300 group-hover:border-[rgba(var(--frontier-home-primary-rgb),0.24)] group-hover:bg-[rgba(var(--frontier-home-primary-rgb),0.10)] group-hover:text-[var(--frontier-home-primary-deep)]">
          <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </div>
      </div>

      <div className="relative z-10 mt-5 h-px w-full bg-linear-to-r from-[rgba(var(--frontier-home-primary-rgb),0.22)] via-[rgba(var(--frontier-home-border-rgb),0.9)] to-transparent" />

      <p className="relative z-10 mt-4 text-sm leading-6 text-[var(--frontier-home-ink-muted)]">
        Подберём подходящих преподавателей и удобный формат обучения.
      </p>
    </motion.button>
  );
}

export default function Subjects() {
  const router = useRouter();
  const [tab, setTab] = React.useState<TabKey>("subjects");
  const [isPending, startTransition] = React.useTransition();
  const { courses, loading, error, refresh } = useApprovedCourses();

  const subjectsData = React.useMemo(
    () => buildSubjectsData(courses),
    [courses],
  );
  const subjects = React.useMemo(() => subjectsData[tab], [subjectsData, tab]);

  const handleTabChange = React.useCallback((k: TabKey) => {
    setTab(k);
  }, []);

  const handleCardClick = React.useCallback(
    (href: string) => {
      startTransition(() => {
        router.push(href);
      });
    },
    [router],
  );

  return (
    <main className="relative overflow-hidden bg-white">
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        {/* top row */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-[var(--frontier-home-ink)] md:text-5xl">
              Сделайте первый шаг
              <span className="block text-[var(--frontier-home-primary)]">
                к новым знаниям
              </span>
            </h1>

            <p className="mt-4 max-w-176 text-base leading-7 text-[var(--frontier-home-ink-muted)] md:text-lg">
              Выберите направление, формат или стартовый уровень — чтобы найти
              подходящие курсы, удобные варианты обучения и актуальные категории
              из каталога.
            </p>
          </div>

          <div className="lg:pb-1">
            <Segmented
              value={tab}
              onChange={handleTabChange}
              options={TAB_OPTIONS}
            />
          </div>
        </div>

        {/* cards */}
        <div className="mt-12 md:mt-16">
          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <SubjectCardSkeleton key={index} index={index} />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-[rgba(var(--frontier-home-border-rgb),0.85)] bg-white/95 p-6 md:p-8">
              <p className="text-xl font-semibold text-[var(--frontier-home-ink)]">
                Не удалось загрузить направления
              </p>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--frontier-home-ink-muted)]">
                {error}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={refresh}
                  className="rounded-full bg-[var(--frontier-home-primary-deep)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-92"
                >
                  Повторить попытку
                </button>
                <button
                  type="button"
                  onClick={() => handleCardClick("/courses")}
                  className="rounded-full border border-[rgba(var(--frontier-home-border-rgb),0.9)] bg-[rgba(var(--frontier-home-primary-rgb),0.05)] px-5 py-3 text-sm font-semibold text-[var(--frontier-home-ink)] transition hover:bg-[rgba(var(--frontier-home-primary-rgb),0.10)]"
                >
                  Открыть каталог
                </button>
              </div>
            </div>
          ) : subjects.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
              >
                {subjects.map((item, index) => (
                  <SubjectCard
                    key={`${tab}-${item.label}`}
                    item={item}
                    index={index}
                    disabled={isPending}
                    onClick={() => handleCardClick(item.href)}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="rounded-3xl border border-[rgba(var(--frontier-home-border-rgb),0.85)] bg-white/95 p-6 md:p-8">
              <p className="text-xl font-semibold text-[var(--frontier-home-ink)]">
                {EMPTY_STATE_COPY[tab].title}
              </p>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--frontier-home-ink-muted)]">
                {EMPTY_STATE_COPY[tab].description}
              </p>
              <button
                type="button"
                onClick={() => handleCardClick("/courses")}
                className="mt-6 rounded-full bg-[var(--frontier-home-primary-deep)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-92"
              >
                Перейти в каталог
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
