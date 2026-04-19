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
import { CourseIcon } from "@/components/ui/course-icon";
import { getCourseIconType } from "@/lib/course-icon-type";
import { SearchCourse } from "@/components/ui/search-course";
import {
  CourseCardSkeleton,
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
import { indigo_dark } from "@/constant/color";

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

function CourseCard({ item }: { item: PreparedCourse }) {
  return (
    <Link
      href={item.href}
      className="group block transition-colors duration-100 hover:bg-[#f5f5f5] rounded-4xl"
    >
      <article className="w-full">
        <div className="relative overflow-hidden">
          <div className="absolute right-3.5 top-3 z-10 rounded-sm bg-[#3b79d6] px-2.5 py-1 text-[14px] font-medium leading-none text-white shadow-sm">
            {item.badge}
          </div>

          <div className="transition-transform duration-300 ease-out group-hover:scale-[1.11]">
            <CourseIcon type={item.type} />
          </div>
        </div>

        <div className="py-4 px-2 pt-2.5">
          <p className="mb-1 text-[14px] lg:text-[16px] leading-[1.2] text-[#747474]">
            {item.tag?.split(", ").slice(0, 3).join(", ")}
          </p>
          <h3 className="line-clamp-2 text-[16px] lg:text-[20px] font-normal leading-[1.12] tracking-[-0.03em] text-[#222222]">
            {item.course.title}
          </h3>
          <p className="mt-1.5 text-[14px] lg:text-[16px] leading-none text-[#6b6b6b]">
            {item.level}
          </p>
        </div>
      </article>
    </Link>
  );
}

function CoursesPageFallback() {
  return (
    <div className="min-h-screen bg-[#ffffff] text-[#252525]">
      <div className="mx-auto max-w-355 px-4 pb-12 pt-6 sm:px-8 lg:px-10 xl:px-12 2xl:px-0">
        <header className="ml-0.5 sm:ml-1.5">
          <h1 className="text-[34px] font-normal leading-[1.08] tracking-[-0.04em] text-[#2a2a2a] sm:text-[48px]">
            {`Каталог курсов ${brand.upper}`}
          </h1>
          <p className="mt-0.5 text-[26px] font-normal leading-[1.12] tracking-[-0.04em] text-[#bdbdbd] sm:text-[48px]">
            Все опубликованные курсы в одном месте
          </p>
        </header>

        <section className="mt-8.5 sm:mt-10.5">
          <ToolbarSkeleton />
        </section>

        <section className="mt-10 grid grid-cols-1 gap-10 xl:mt-17 xl:grid-cols-[225px_minmax(0,1fr)] xl:gap-8">
          <SidebarSkeleton />

          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <CourseCardSkeleton key={index} />
            ))}
          </div>
        </section>
      </div>
      <CourseContactFab />
    </div>
  );
}

function CoursesPageContent() {
  const searchParams = useSearchParams();
  const { courses, loading, error, refresh } = useApprovedCourses();
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
      <div className="min-h-screen bg-[#ffffff] text-[#252525]">
        <div className="mx-auto max-w-355 px-4 pb-12 pt-6 sm:px-8 lg:px-10 xl:px-12 2xl:px-0">
          <header className="ml-0.5 sm:ml-1.5">
            <h1 className="text-[34px] font-normal leading-[1.08] tracking-[-0.04em] text-[#2a2a2a] sm:text-[48px]">
              {`Каталог курсов ${brand.upper}`}
            </h1>
            <p className="mt-0.5 text-[26px] font-normal leading-[1.12] tracking-[-0.04em] text-[#bdbdbd] sm:text-[48px]">
              Все опубликованные курсы в одном месте
            </p>
          </header>

          <section className="mt-8.5 sm:mt-10.5">
            {loading ? (
              <ToolbarSkeleton />
            ) : (
              <>
                <div className="flex items-center gap-3 xl:hidden">
                  <div className="flex h-14 flex-1 items-center rounded-sm border border-[#e5e5e5] bg-transparent px-4">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Навык или курс"
                      className="h-full w-full bg-transparent text-[16px] text-[#2f2f2f] outline-none placeholder:text-[#9d9d9d]"
                    />
                    <Search
                      className="h-4.75 w-4.75 text-[#8d8d8d]"
                      strokeWidth={2.2}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(true)}
                    className="relative flex h-14 w-14 items-center justify-center rounded-sm border bg-[#f0f0f0] text-[#2f2f2f] transition hover:bg-white"
                    aria-label="Открыть фильтры"
                  >
                    <SlidersHorizontal className="h-5 w-5" strokeWidth={2.2} />
                    {activeFiltersCount > 0 ? (
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#242424] px-1 text-[11px] font-medium text-white">
                        {activeFiltersCount}
                      </span>
                    ) : null}
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between xl:hidden">
                  <p className="text-[16px] font-normal text-[#333333]">
                    {mobileResultLabel}
                  </p>
                  {hasFilterSelections ? (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-[15px] text-[#6b6b6b] transition hover:text-[#242424]"
                    >
                      Сбросить
                    </button>
                  ) : null}
                </div>

                <div className="hidden flex-col gap-6 xl:flex xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex max-w-245 flex-wrap gap-2.5">
                    {filterOptions.categories.map((item) => (
                      <CategoryChip
                        key={item}
                        label={item}
                        active={item === selectedCategory}
                        onClick={() => setSelectedCategory(item)}
                      />
                    ))}
                  </div>

                  <div className="w-full xl:max-w-98.5">
                    <SearchCourse
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                    />
                  </div>
                </div>
              </>
            )}
          </section>

          <section className="mt-10 grid grid-cols-1 gap-10 xl:mt-17 xl:grid-cols-[225px_minmax(0,1fr)] xl:gap-8">
            {loading ? (
              <SidebarSkeleton />
            ) : (
              <aside className="hidden xl:block sticky top-3 self-start max-h-[calc(100vh-20px)] overflow-y-auto pt-1.5">
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
                    className={filterOptions.levels.length > 0 ? "mt-7.5" : ""}
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

                <p className="mt-5 text-[16px] font-normal text-[#333333]">
                  Найдено: {filteredCourses.length} курсов
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[16px] bg-[#f0f0f0] mt-5 rounded-sm w-full py-3 text-[#2f2f2f] transition hover:bg-[#e5e5e5] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Сбросить фильтры
                </button>
              </aside>
            )}

            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 2xl:grid-cols-4">
              {loading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <CourseCardSkeleton key={index} />
                ))
              ) : error ? (
                <div className="col-span-full rounded-sm border border-[#e3bcbc] bg-[#fff4f4] p-6">
                  <p className="text-[18px] font-medium text-[#2a2a2a]">
                    Не удалось загрузить курсы
                  </p>
                  <p className="mt-2 text-[16px] leading-[1.45] text-[#666666]">
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={refresh}
                    className="mt-5 rounded-sm bg-[#242424] px-5 py-3 text-[16px] text-white transition hover:opacity-90"
                  >
                    Повторить попытку
                  </button>
                </div>
              ) : filteredCourses.length > 0 ? (
                filteredCourses.map((item) => (
                  <CourseCard key={item.course.course_id} item={item} />
                ))
              ) : (
                <div className="col-span-full rounded-sm border border-[#e5e5e5] bg-white px-6 py-8">
                  <p className="text-[18px] font-medium text-[#2a2a2a]">
                    Курсы не найдены
                  </p>
                  <p className="mt-2 text-[16px] leading-[1.45] text-[#666666]">
                    Попробуйте изменить направление, снять фильтры или ввести
                    другой поисковый запрос.
                  </p>
                </div>
              )}
              <div className="col-span-full rounded-2xl border border-[#e5e5e5] bg-white p-6">
                <p className="text-[14px] lg:text-[16px] leading-[1.45] text-[#666666]">
                  Не нашли подходящий курс?{" "}
                  <Link
                    href="/contact"
                    className="text-[#242424] font-medium underline transition hover:text-[#2a2a2a]"
                  >
                    Свяжитесь с нами
                  </Link>{" "}
                  и расскажите, какой курс вы хотели бы видеть в каталоге.
                </p>
              </div>
            </div>
          </section>
        </div>
        <CourseContactFab />
      </div>

      <DialogContent
        showCloseButton={false}
        className="left-0 top-0 h-dvh w-screen max-w-none translate-x-0 translate-y-0 gap-0 rounded-none border-0 bg-[#f6f6f6] p-0 xl:hidden"
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-[#dddddd] bg-[#f6f6f6] px-4 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-[28px] font-normal tracking-[-0.04em] text-[#2a2a2a]">
                  Фильтры
                </DialogTitle>
                <DialogDescription className="mt-1 text-[15px] text-[#7b7b7b]">
                  Направление, уровень и стоимость
                </DialogDescription>
              </div>

              <DialogClose asChild>
                <X className="h-6 w-6" strokeWidth={2.2} />
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

          <div className="border-t border-[#dddddd] bg-[#f6f6f6] px-4 py-4">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetFilters}
                className="h-13.5 flex-1 rounded-[10px] border border-[#d0d0d0] text-[16px] text-[#2f2f2f] transition disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!hasFilterSelections}
              >
                Сбросить
              </button>

              <DialogClose asChild>
                <button
                  type="button"
                  className={`h-13.5 flex-[1.3] rounded-[10px] bg-[${indigo_dark}] px-5 text-[16px] text-white transition hover:opacity-90`}
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
