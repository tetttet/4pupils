"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApprovedCourses } from "@/hooks/use-approved-courses";
import {
  type Course,
  type PreparedCourse,
} from "@/types/course";
import {
  CategoryChip,
  CheckboxItem,
  FilterSection,
} from "@/components/ui/category-ui";
import CourseContactFab from "@/components/courses/course-contact-fab";
import ApprovedCourseCard from "@/components/dashboard/admin/courses/approved-course-card";
import ApprovedCoursesGridSkeleton from "@/components/dashboard/admin/courses/approved-courses-grid-skeleton";
import { getCourseIconType } from "@/lib/course-icon-type";
import { SearchCourse } from "@/components/ui/search-course";
import {
  SidebarSkeleton,
  ToolbarSkeleton,
} from "@/components/ui/skeleton-ui";
import {
  formatLabel,
  getCourseCategoryLabel,
  getCourseLevelLabel,
  isFreeCourse,
  normalizeText,
  toggleArrayValue,
} from "@/lib/func";
import { brand } from "@/lib/brand";

const ALL_COURSES_LABEL = "Все курсы";

function findCategoryFromParam(
  courses: PreparedCourse[],
  requestedCategory: string,
) {
  const normalizedRequestedCategory = normalizeText(requestedCategory);

  if (!normalizedRequestedCategory) return null;

  const matchedCourse = courses.find((item) => {
    const normalizedItemCategory = normalizeText(item.category);
    const normalizedRawCategory = normalizeText(item.course.category);

    return (
      normalizedItemCategory === normalizedRequestedCategory ||
      normalizedRawCategory === normalizedRequestedCategory
    );
  });

  return matchedCourse?.category ?? null;
}

function findFilterValueFromParam(options: string[], requestedValue: string) {
  const normalizedRequestedValue = normalizeText(requestedValue);

  if (!normalizedRequestedValue) return null;

  return (
    options.find(
      (option) => normalizeText(option) === normalizedRequestedValue,
    ) ?? null
  );
}

function getCourseTagLine(course: Course, category: string) {
  const parts = [category, ...(course.tags ?? []).map(formatLabel)].filter(
    Boolean,
  );

  return Array.from(new Set(parts)).join(", ");
}

function getCoursePriceBadge(course: Course) {
  if (isFreeCourse(course)) return "Бесплатно";

  try {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: (course.currency || "USD").toUpperCase(),
      maximumFractionDigits: 0,
    }).format(Number(course.price ?? 0));
  } catch {
    return `${course.price ?? 0} ${(course.currency || "").toUpperCase()}`.trim();
  }
}

function buildPreparedCourse(course: Course): PreparedCourse {
  const category = getCourseCategoryLabel(course);
  const level = getCourseLevelLabel(course.level);

  return {
    course,
    href: `/o/courses/${course.slug}`,
    badge: getCoursePriceBadge(course),
    tag: getCourseTagLine(course, category) || "Курс",
    level,
    category,
    priceType: isFreeCourse(course) ? "Бесплатно" : "Платно",
    searchText: normalizeText(
      [
        course.title,
        course.short_description,
        course.description,
        course.category,
        course.level,
        course.language,
        ...(course.tags ?? []),
        ...(course.outcomes ?? []),
      ].join(" "),
    ),
    type: getCourseIconType(course),
  };
}

function CoursesPageFallback() {
  return (
    <div className="min-h-screen bg-[#F3F5FF] text-[#202858]">
      <div className="mx-auto w-full max-w-[1400px] px-4 pb-20 pt-8 sm:px-5 sm:pb-24 sm:pt-12">
        <header className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-end lg:gap-12">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#5D75CB] sm:text-[13px]">
              Образовательная платформа {brand.name}
            </p>
            <h1 className="mt-4 max-w-[12ch] text-[42px] font-medium leading-[1.02] tracking-[-0.05em] text-[#202858] sm:text-[54px] lg:text-[64px]">
              Каталог курсов
              <span className="block text-[#5D75CB]">для вашего роста</span>
            </h1>
          </div>
          <p className="max-w-[58ch] text-[14px] leading-7 text-[#68719B] sm:text-[15px] lg:justify-self-end">
            Выбирайте проверенные программы, сравнивайте направления и находите
            обучение, которое подходит именно вам.
          </p>
        </header>

        <section className="mt-10 rounded-[28px] border border-white bg-white p-4 shadow-[0_12px_34px_rgba(35,48,103,0.055)] sm:p-5">
          <ToolbarSkeleton />
        </section>

        <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
          <SidebarSkeleton />
          <ApprovedCoursesGridSkeleton count={6} variant="home" />
        </section>
      </div>
      <CourseContactFab />
    </div>
  );
}

function CoursesPageContent() {
  const searchParams = useSearchParams();
  const {
    courses,
    loading,
    error,
    refresh,
    hasMore,
    loadMore,
    loadMoreError,
    loadingMore,
  } = useApprovedCourses();
  const [selectedCategory, setSelectedCategory] =
    React.useState(ALL_COURSES_LABEL);
  const [selectedLevels, setSelectedLevels] = React.useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);
  const deferredSearchQuery = React.useDeferredValue(searchQuery);

  const preparedCourses = React.useMemo(
    () => courses.map((course) => buildPreparedCourse(course)),
    [courses],
  );
  const requestedCategory = searchParams.get("category")?.trim() || "";
  const requestedQuery = searchParams.get("q")?.trim() || "";
  const requestedLevel = searchParams.get("level")?.trim() || "";
  const requestedPrice = searchParams.get("price")?.trim() || "";

  const filterOptions = React.useMemo(() => {
    const categories = [ALL_COURSES_LABEL];
    const levels: string[] = [];
    const prices: string[] = [];
    const seenCategories = new Set<string>();
    const seenLevels = new Set<string>();
    const seenPrices = new Set<string>();

    for (const item of preparedCourses) {
      if (item.category && !seenCategories.has(item.category)) {
        seenCategories.add(item.category);
        categories.push(item.category);
      }

      if (item.level !== "Любой уровень" && !seenLevels.has(item.level)) {
        seenLevels.add(item.level);
        levels.push(item.level);
      }

      if (!seenPrices.has(item.priceType)) {
        seenPrices.add(item.priceType);
        prices.push(item.priceType);
      }
    }

    return { categories, levels, prices };
  }, [preparedCourses]);

  React.useEffect(() => {
    setSearchQuery(requestedQuery);
  }, [requestedQuery]);

  React.useEffect(() => {
    if (!requestedCategory) {
      setSelectedCategory(ALL_COURSES_LABEL);
      return;
    }

    const matchedCategory = findCategoryFromParam(
      preparedCourses,
      requestedCategory,
    );

    setSelectedCategory(matchedCategory ?? ALL_COURSES_LABEL);
  }, [preparedCourses, requestedCategory]);

  React.useEffect(() => {
    if (!requestedLevel) {
      setSelectedLevels([]);
      return;
    }

    const matchedLevel = findFilterValueFromParam(
      filterOptions.levels,
      requestedLevel,
    );

    setSelectedLevels(matchedLevel ? [matchedLevel] : []);
  }, [filterOptions.levels, requestedLevel]);

  React.useEffect(() => {
    if (!requestedPrice) {
      setSelectedPrices([]);
      return;
    }

    const matchedPrice = findFilterValueFromParam(
      filterOptions.prices,
      requestedPrice,
    );

    setSelectedPrices(matchedPrice ? [matchedPrice] : []);
  }, [filterOptions.prices, requestedPrice]);

  React.useEffect(() => {
    if (!filterOptions.categories.includes(selectedCategory)) {
      setSelectedCategory(ALL_COURSES_LABEL);
    }
  }, [filterOptions.categories, selectedCategory]);

  React.useEffect(() => {
    setSelectedLevels((current) =>
      current.filter((item) => filterOptions.levels.includes(item)),
    );
  }, [filterOptions.levels]);

  React.useEffect(() => {
    setSelectedPrices((current) =>
      current.filter((item) => filterOptions.prices.includes(item)),
    );
  }, [filterOptions.prices]);

  const filteredCourses = React.useMemo(() => {
    const query = normalizeText(deferredSearchQuery);

    return preparedCourses.filter((item) => {
      if (
        selectedCategory !== ALL_COURSES_LABEL &&
        item.category !== selectedCategory
      ) {
        return false;
      }

      if (selectedLevels.length > 0 && !selectedLevels.includes(item.level)) {
        return false;
      }

      if (
        selectedPrices.length > 0 &&
        !selectedPrices.includes(item.priceType)
      ) {
        return false;
      }

      return !query || item.searchText.includes(query);
    });
  }, [
    deferredSearchQuery,
    preparedCourses,
    selectedCategory,
    selectedLevels,
    selectedPrices,
  ]);

  const activeFiltersCount =
    (selectedCategory !== ALL_COURSES_LABEL ? 1 : 0) +
    selectedLevels.length +
    selectedPrices.length;
  const hasFilterSelections = activeFiltersCount > 0;

  const resetFilters = React.useCallback(() => {
    setSelectedCategory(ALL_COURSES_LABEL);
    setSelectedLevels([]);
    setSelectedPrices([]);
  }, []);

  const mobileResultLabel = loading
    ? "Загружаем курсы..."
    : `Найдено: ${filteredCourses.length} курсов`;

  return (
    <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
      <div className="min-h-screen bg-[#F3F5FF] text-[#202858]">
        <div className="mx-auto w-full max-w-[1400px] px-4 pb-20 pt-8 sm:px-5 sm:pb-24 sm:pt-12">
          <header className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-end lg:gap-12">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#5D75CB] sm:text-[13px]">
                Образовательная платформа {brand.name}
              </p>
              <h1 className="mt-4 max-w-[12ch] text-[42px] font-medium leading-[1.02] tracking-[-0.05em] text-[#202858] sm:text-[54px] lg:text-[64px]">
                Каталог курсов
                <span className="block text-[#5D75CB]">для вашего роста</span>
              </h1>
            </div>
            <p className="max-w-[58ch] text-[14px] leading-7 text-[#68719B] sm:text-[15px] lg:justify-self-end">
              Выбирайте проверенные программы, сравнивайте направления и
              находите обучение, которое подходит именно вам.
            </p>
          </header>

          <section className="mt-10 rounded-[28px] border border-white bg-white p-4 shadow-[0_12px_34px_rgba(35,48,103,0.055)] sm:p-5">
            {loading ? (
              <ToolbarSkeleton />
            ) : (
              <>
                <div className="flex items-center gap-3 xl:hidden">
                  <div className="flex h-14 flex-1 items-center rounded-[18px] border border-[#ECEFFF] bg-[#F7F8FF] px-4 transition focus-within:border-[#B8C2EF] focus-within:bg-white">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Навык или курс"
                      className="h-full w-full bg-transparent text-[15px] text-[#202858] outline-none placeholder:text-[#7A82A8]"
                    />
                    <Search
                      className="h-4.75 w-4.75 text-[#5D75CB]"
                      strokeWidth={2.2}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(true)}
                    className="relative flex h-14 w-14 items-center justify-center rounded-[18px] border border-[#D7DDF8] bg-[#ECEFFF] text-[#4C63B8] transition hover:border-[#B8C2EF] hover:bg-[#F7F8FF]"
                    aria-label="Открыть фильтры"
                  >
                    <SlidersHorizontal className="h-5 w-5" strokeWidth={2.2} />
                    {activeFiltersCount > 0 ? (
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#233067] px-1 text-[11px] font-medium text-white">
                        {activeFiltersCount}
                      </span>
                    ) : null}
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between xl:hidden">
                  <p className="text-[14px] font-medium text-[#3F4568]">
                    {mobileResultLabel}
                  </p>
                  {hasFilterSelections ? (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-[14px] font-medium text-[#5D75CB] transition hover:text-[#233067]"
                    >
                      Сбросить
                    </button>
                  ) : null}
                </div>

                <div className="hidden flex-col gap-6 xl:flex xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex max-w-[920px] flex-wrap gap-2.5">
                    {filterOptions.categories.map((item) => (
                      <CategoryChip
                        key={item}
                        label={item}
                        active={item === selectedCategory}
                        onClick={() => setSelectedCategory(item)}
                      />
                    ))}
                  </div>

                  <div className="w-full xl:max-w-[360px]">
                    <SearchCourse
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                    />
                  </div>
                </div>
              </>
            )}
          </section>

          <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
            {loading ? (
              <SidebarSkeleton />
            ) : (
              <aside className="sticky top-24 hidden max-h-[calc(100vh-7rem)] self-start overflow-y-auto rounded-[28px] border border-white bg-white p-6 shadow-[0_12px_34px_rgba(35,48,103,0.045)] xl:block">
                {filterOptions.levels.length > 0 ? (
                  <FilterSection title="Уровень">
                    <div className="space-y-2.5">
                      {filterOptions.levels.map((item) => (
                        <CheckboxItem
                          key={item}
                          label={item}
                          checked={selectedLevels.includes(item)}
                          onChange={() =>
                            setSelectedLevels((current) =>
                              toggleArrayValue(item, current),
                            )
                          }
                        />
                      ))}
                    </div>
                  </FilterSection>
                ) : null}

                {filterOptions.prices.length > 0 ? (
                  <FilterSection
                    title="Стоимость"
                    className={filterOptions.levels.length > 0 ? "mt-8" : ""}
                  >
                    <div className="space-y-2.5">
                      {filterOptions.prices.map((item) => (
                        <CheckboxItem
                          key={item}
                          label={item}
                          checked={selectedPrices.includes(item)}
                          onChange={() =>
                            setSelectedPrices((current) =>
                              toggleArrayValue(item, current),
                            )
                          }
                        />
                      ))}
                    </div>
                  </FilterSection>
                ) : null}

                <p className="mt-8 border-t border-[#ECEFFF] pt-5 text-[13px] font-medium leading-5 text-[#68719B]">
                  Найдено: {filteredCourses.length} курсов
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 w-full rounded-full border border-[#D7DDF8] bg-[#F7F8FF] px-4 py-3 text-[13px] font-medium text-[#4C63B8] transition hover:border-[#B8C2EF] hover:bg-[#ECEFFF] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!hasFilterSelections}
                >
                  Сбросить фильтры
                </button>
              </aside>
            )}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {loading ? (
                <div className="col-span-full">
                  <ApprovedCoursesGridSkeleton count={6} variant="home" />
                </div>
              ) : error ? (
                <div className="col-span-full rounded-[28px] border border-red-200 bg-red-50 p-6 sm:p-8">
                  <p className="text-[20px] font-medium text-[#202858]">
                    Не удалось загрузить курсы
                  </p>
                  <p className="mt-2 text-[14px] leading-6 text-[#68719B]">
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={refresh}
                    className="mt-5 rounded-full bg-[#233067] px-5 py-3 text-[14px] font-medium text-white transition hover:bg-[#19224c]"
                  >
                    Повторить попытку
                  </button>
                </div>
              ) : filteredCourses.length > 0 ? (
                filteredCourses.map((item) => (
                  <ApprovedCourseCard
                    key={item.course.course_id}
                    course={item.course}
                    href={item.href}
                    variant="home"
                  />
                ))
              ) : (
                <div className="col-span-full rounded-[28px] border border-white bg-white px-6 py-8 shadow-[0_12px_34px_rgba(35,48,103,0.045)] sm:p-10">
                  <p className="text-[20px] font-medium text-[#202858]">
                    Курсы не найдены
                  </p>
                  <p className="mt-2 max-w-[60ch] text-[14px] leading-6 text-[#68719B]">
                    Попробуйте изменить направление, снять фильтры или ввести
                    другой поисковый запрос.
                  </p>
                </div>
              )}
              {!loading && !error && hasMore ? (
                <div className="col-span-full flex flex-col items-center gap-2 py-2">
                  <button
                    type="button"
                    onClick={() => void loadMore()}
                    disabled={loadingMore}
                    className="rounded-full border border-[#D7DDF8] bg-white px-6 py-3 text-[14px] font-medium text-[#4C63B8] transition hover:border-[#B8C2EF] hover:bg-[#F7F8FF] disabled:cursor-wait disabled:opacity-60"
                  >
                    {loadingMore ? "Загружаем..." : "Показать ещё курсы"}
                  </button>
                  {loadMoreError ? (
                    <p className="text-sm text-red-600">{loadMoreError}</p>
                  ) : null}
                </div>
              ) : null}
              <div className="col-span-full flex flex-col items-start justify-between gap-5 rounded-[26px] border border-white bg-white px-5 py-5 shadow-[0_10px_30px_rgba(35,48,103,0.045)] sm:flex-row sm:items-center sm:px-7">
                <p className="max-w-[68ch] text-[13px] leading-6 text-[#68719B] sm:text-[14px]">
                  Не нашли подходящий курс? Расскажите нам, какое направление
                  вам нужно, и мы поможем с выбором.
                </p>
                <Link
                  href={`mailto:${brand.supportEmail}`}
                  className="inline-flex h-12 shrink-0 items-center rounded-full bg-[#233067] px-5 text-[13px] font-medium text-white transition hover:bg-[#19224c]"
                >
                  Связаться с нами
                </Link>
              </div>
            </div>
          </section>
        </div>
        <CourseContactFab />
      </div>

      <DialogContent
        showCloseButton={false}
        className="left-0 top-0 h-dvh w-screen max-w-none translate-x-0 translate-y-0 gap-0 rounded-none border-0 bg-[#F3F5FF] p-0 xl:hidden"
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-[#D7DDF8] bg-white px-4 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-[28px] font-medium tracking-[-0.04em] text-[#202858]">
                  Фильтры
                </DialogTitle>
                <DialogDescription className="mt-1 text-[14px] text-[#68719B]">
                  Направление, уровень и стоимость
                </DialogDescription>
              </div>

              <DialogClose asChild>
                <button
                  aria-label="Закрыть фильтры"
                  className="grid size-11 place-items-center rounded-full bg-[#F7F8FF] text-[#4C63B8] transition hover:bg-[#ECEFFF]"
                  type="button"
                >
                  <X className="h-5 w-5" strokeWidth={2.2} />
                </button>
              </DialogClose>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6">
            <FilterSection title="Направление">
              <div className="flex flex-wrap gap-2.5">
                {filterOptions.categories.map((item) => (
                  <CategoryChip
                    key={item}
                    label={item}
                    active={item === selectedCategory}
                    onClick={() => setSelectedCategory(item)}
                  />
                ))}
              </div>
            </FilterSection>

            {filterOptions.levels.length > 0 ? (
              <FilterSection title="Уровень" className="mt-8">
                <div className="space-y-3">
                  {filterOptions.levels.map((item) => (
                    <CheckboxItem
                      key={item}
                      label={item}
                      checked={selectedLevels.includes(item)}
                      onChange={() =>
                        setSelectedLevels((current) =>
                          toggleArrayValue(item, current),
                        )
                      }
                    />
                  ))}
                </div>
              </FilterSection>
            ) : null}

            {filterOptions.prices.length > 0 ? (
              <FilterSection title="Стоимость" className="mt-8">
                <div className="space-y-3">
                  {filterOptions.prices.map((item) => (
                    <CheckboxItem
                      key={item}
                      label={item}
                      checked={selectedPrices.includes(item)}
                      onChange={() =>
                        setSelectedPrices((current) =>
                          toggleArrayValue(item, current),
                        )
                      }
                    />
                  ))}
                </div>
              </FilterSection>
            ) : null}
          </div>

          <div className="border-t border-[#D7DDF8] bg-white px-4 py-4">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetFilters}
                className="h-13.5 flex-1 rounded-full border border-[#D7DDF8] bg-[#F7F8FF] text-[15px] font-medium text-[#4C63B8] transition hover:bg-[#ECEFFF] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!hasFilterSelections}
              >
                Сбросить
              </button>

              <DialogClose asChild>
                <button
                  type="button"
                  className="h-13.5 flex-[1.3] rounded-full bg-[#233067] px-5 text-[15px] font-medium text-white transition hover:bg-[#19224c]"
                >
                  Показать {filteredCourses.length}
                </button>
              </DialogClose>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Page() {
  return (
    <React.Suspense fallback={<CoursesPageFallback />}>
      <CoursesPageContent />
    </React.Suspense>
  );
}
