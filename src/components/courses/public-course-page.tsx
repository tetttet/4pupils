import type { Course } from "@/types/course";
import {
  formatCourseCompactCount,
  formatCourseFullCount,
  getCourseDescriptionParagraphs,
  getCoursePriceLabel,
  getCourseSummary,
  isCourseFree,
  normalizeCourseLabel,
} from "@/lib/public-course";
import CareerChoiceHero from "../ui/career-choice-hero";
import WhatYouWillLearn from "../ui/what-you-will-learn";
import LongLearn from "../ui/long-learn";
import SimilarCoursesCarousel from "./similar-courses-carousel";

type Props = {
  course: Course;
};

function getUniqueStrings(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  );
}

export default function PublicCoursePage({ course }: Props) {
  const free = isCourseFree(course);
  const priceLabel = getCoursePriceLabel(course);
  const summary = getCourseSummary(course);
  const descriptionParagraphs = getCourseDescriptionParagraphs(course);

  const outcomes = (course.outcomes ?? []).filter(Boolean);
  const requirements = (course.requirements ?? []).filter(Boolean);
  const tags = (course.tags ?? []).filter(Boolean);

  const categoryLabel = course.category || "Общая категория";
  const levelLabel = normalizeCourseLabel(course.level);
  const languageLabel = normalizeCourseLabel(course.language);
  const longDescription = descriptionParagraphs.length
    ? descriptionParagraphs
    : [summary];

  const ratingValue =
    Number(course.rating_avg ?? 0) > 0
      ? Number(course.rating_avg ?? 0).toFixed(1)
      : "Новый курс";

  const ratingHint =
    Number(course.rating_count ?? 0) > 0
      ? `${formatCourseFullCount(course.rating_count) || "0"} оценок`
      : "Первые оценки появятся после старта";

  const studentsValue =
    formatCourseCompactCount(course.students_count) || "Набор открыт";

  const studentsHint =
    formatCourseFullCount(course.students_count) !== null
      ? `${formatCourseFullCount(course.students_count)} участников`
      : "Открыт для первых участников";

  const primaryHref = `/o/courses/${course.slug}/apply`;
  const primaryLabel = "Оставить заявку";
  const heroHighlight = {
    value: priceLabel,
    description: free
      ? "Можно начать знакомство с курсом без оплаты"
      : "Стоимость курса показана сразу на странице",
  };

  const learnTopItems = getUniqueStrings([
    ...outcomes,
    ...requirements,
    ...tags,
    course.short_description,
    summary,
  ]).slice(0, 5);

  const learnCardTitles = getUniqueStrings([
    categoryLabel,
    ...tags,
    levelLabel !== "Не указано" ? levelLabel : null,
    languageLabel !== "Не указано" ? languageLabel : null,
    course.title,
  ]);

  const learnCardDescriptions = getUniqueStrings([
    course.short_description,
    summary,
    ...descriptionParagraphs,
    ...outcomes,
    ...requirements,
  ]);

  const learnCards = learnCardDescriptions
    .slice(0, 3)
    .map((description, index) => ({
      title: learnCardTitles[index] ?? course.title,
      description,
    }));

  return (
    <main className="min-h-screen bg-linear-to-b from-[#ffffff] via-[#f5f5f5] to-[#f5f5f5] text-[#222222]">
      <CareerChoiceHero
        tags={tags}
        title={course.title}
        subtitle={summary}
        ctaLabel={primaryLabel}
        ctaHref={primaryHref}
        rating={{
          value: ratingValue,
          description: ratingHint,
        }}
        students={{
          value: studentsValue,
          description: studentsHint,
        }}
        highlight={heroHighlight}
      />

      <WhatYouWillLearn
        topItems={learnTopItems}
        bottomCards={learnCards}
        languageLabel={languageLabel}
        levelLabel={levelLabel}
        categoryLabel={categoryLabel}
      />
      <LongLearn
        longDescription={longDescription.join("\n\n")}
        image={course.image_url ?? undefined}
      />
      <SimilarCoursesCarousel course={course} />
    </main>
  );
}
