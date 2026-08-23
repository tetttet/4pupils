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
      className="inline-flex max-w-full items-center overflow-x-auto rounded-full border border-[#D7DDF8] bg-[#F7F8FF] p-1.5"
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
              "relative h-11 shrink-0 rounded-full px-5 sm:px-6",
              "text-[12px] font-medium sm:text-[14px]",
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
                className="absolute inset-0 rounded-full bg-white shadow-[0_8px_20px_rgba(35,48,103,0.09)]"
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
    normalizedLabel.includes("язык")
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
      className="animate-pulse rounded-[28px] border border-[#ECEFFF] bg-[#F7F8FF] p-5 md:p-6"
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
      initial={false}
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
        "group relative min-h-[210px] overflow-hidden rounded-[24px] border text-left sm:min-h-[220px] sm:rounded-[28px]",
        "p-4 sm:p-5 md:p-6",
        "transition-all duration-300",
        "disabled:pointer-events-none disabled:opacity-70",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--frontier-home-primary-rgb),0.20)] focus-visible:ring-offset-2",
        item.featured
          ? "border-[#5D75CB] bg-[#5D75CB] shadow-[0_16px_34px_rgba(93,117,203,0.18)]"
          : "border-[#ECEFFF] bg-[#F7F8FF] hover:border-[#D7DDF8] hover:bg-white hover:shadow-[0_16px_36px_rgba(35,48,103,0.07)]",
      ].join(" ")}
    >
      <div
        className={`absolute -bottom-16 -right-16 size-44 rounded-full border-[34px] border-current opacity-[0.055] transition-transform duration-500 group-hover:scale-110 ${
          item.featured ? "text-white" : "text-[#5D75CB]"
        }`}
      />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <div
            className={[
              "mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl",
              item.featured
                ? "bg-white text-[#5D75CB]"
                : "bg-white text-[#4C63B8] shadow-[0_8px_20px_rgba(35,48,103,0.06)]",
            ].join(" ")}
          >
            {item.icon}
          </div>

          <div
            className={`max-w-[18ch] text-[17px] font-medium leading-6 md:text-[18px] ${
              item.featured ? "text-white" : "text-[#202858]"
            }`}
          >
            {item.label}
          </div>
        </div>

        <div
          className={`mt-1 flex h-9 w-9 items-center justify-center rounded-full border bg-white transition-all duration-300 group-hover:translate-x-0.5 ${
            item.featured
              ? "border-white text-[#5D75CB]"
              : "border-[#D7DDF8] text-[#68719B] group-hover:text-[#233067]"
          }`}
        >
          <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </div>
      </div>

      <div
        className={`relative z-10 mt-5 h-px w-full ${
          item.featured ? "bg-white/[0.18]" : "bg-[#D7DDF8]"
        }`}
      />

      <p
        className={`relative z-10 mt-4 line-clamp-3 text-[12px] leading-5 sm:text-[13px] sm:leading-6 ${
          item.featured ? "text-white/[0.72]" : "text-[#68719B]"
        }`}
      >
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
    <section className="relative overflow-hidden bg-transparent">
      <div className="pointer-events-none absolute -left-48 top-32 size-[520px] rounded-full bg-[#F7F8FF] blur-3xl" />
      <div className="relative mx-auto max-w-[1200px] px-4 py-20 sm:px-5 sm:py-24 lg:py-28">
        {/* top row */}
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12">
          <div className="max-w-[720px]">
            <h2 className="text-[36px] font-medium leading-[1.04] tracking-[-0.045em] text-[#202858] sm:text-[44px] lg:text-[52px]">
              Сделайте первый шаг
              <span className="block text-[#5D75CB]">
                к новым знаниям
              </span>
            </h2>

            <p className="mt-5 max-w-[64ch] text-[14px] leading-7 text-[#68719B] sm:text-[15px]">
              Выберите направление, формат или стартовый уровень — чтобы найти
              подходящие курсы, удобные варианты обучения и актуальные категории
              из каталога.
            </p>
          </div>

          <div>
            <Segmented
              value={tab}
              onChange={handleTabChange}
              options={TAB_OPTIONS}
            />
          </div>
        </div>

        {/* cards */}
        <div className="mt-10 md:mt-14">
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
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
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4"
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
    </section>
  );
}
