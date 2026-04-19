import {
  formatLabel,
  getCourseCategoryLabel,
  getCourseLevelLabel,
  isFreeCourse,
  normalizeText,
} from "@/lib/func";
import { getCourseIconType } from "@/lib/course-icon-type";
import type { Course, CourseIconType } from "@/types/course";
import type { Enrollment } from "@/types/enrollment";

export type CourseRecommendationItem = {
  course: Course;
  priceBadge: string;
  tagLine: string;
  level: string;
  type: CourseIconType;
};

type CourseRecommendationReference = {
  courseId?: string | null;
  slug?: string | null;
  title: string;
  category?: string | null;
  level?: string | null;
  language?: string | null;
  tags?: string[];
  outcomes?: string[];
  isFree?: boolean;
};

const STOP_WORDS = new Set([
  "course",
  "courses",
  "курс",
  "курсы",
  "для",
  "или",
  "the",
  "and",
  "with",
  "без",
  "это",
  "как",
  "from",
  "into",
]);

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

function getMeaningfulTokens(values: Array<string | null | undefined>) {
  return new Set(
    values
      .flatMap((value) => normalizeText(value).split(" "))
      .filter((token) => token.length >= 4 && !STOP_WORDS.has(token)),
  );
}

function getSharedCount(left: Set<string>, right: Set<string>) {
  let count = 0;

  for (const token of left) {
    if (right.has(token)) {
      count += 1;
    }
  }

  return count;
}

function buildReferenceFromCourse(
  course: Course,
): CourseRecommendationReference {
  return {
    courseId: course.course_id,
    slug: course.slug,
    title: course.title,
    category: course.category,
    level: course.level,
    language: course.language,
    tags: course.tags,
    outcomes: course.outcomes,
    isFree: isFreeCourse(course),
  };
}

export function buildRecommendationReferencesFromEnrollments(
  enrollments: Enrollment[],
  courses: Course[],
) {
  const coursesById = new Map(courses.map((course) => [course.course_id, course]));
  const coursesBySlug = new Map(courses.map((course) => [course.slug, course]));
  const seen = new Set<string>();

  return enrollments.flatMap((enrollment) => {
    const matchedCourse =
      coursesById.get(enrollment.course_id) ||
      coursesBySlug.get(enrollment.course_slug);

    const reference = matchedCourse
      ? buildReferenceFromCourse(matchedCourse)
      : {
          courseId: enrollment.course_id,
          slug: enrollment.course_slug,
          title: enrollment.course_title,
        };

    const key = `${reference.courseId || ""}:${reference.slug || ""}:${normalizeText(reference.title)}`;

    if (seen.has(key)) {
      return [];
    }

    seen.add(key);

    return reference;
  });
}

export function buildRecommendationReferenceFromCourse(course: Course) {
  return buildReferenceFromCourse(course);
}

function scoreCandidateAgainstReference(
  candidate: Course,
  reference: CourseRecommendationReference,
) {
  const referenceCategory = normalizeText(reference.category);
  const referenceLevel = normalizeText(reference.level);
  const referenceLanguage = normalizeText(reference.language);
  const referenceTagSet = new Set(
    (reference.tags ?? []).map((tag) => normalizeText(tag)).filter(Boolean),
  );
  const referenceKeywordSet = getMeaningfulTokens([
    reference.title,
    reference.category,
    ...(reference.tags ?? []),
    ...(reference.outcomes ?? []),
  ]);

  const candidateCategory = normalizeText(candidate.category);
  const candidateLevel = normalizeText(candidate.level);
  const candidateLanguage = normalizeText(candidate.language);
  const candidateTagSet = new Set(
    (candidate.tags ?? []).map((tag) => normalizeText(tag)).filter(Boolean),
  );
  const candidateKeywordSet = getMeaningfulTokens([
    candidate.title,
    candidate.category,
    ...(candidate.tags ?? []),
    ...(candidate.outcomes ?? []),
  ]);

  const sameCategory =
    Boolean(referenceCategory) && referenceCategory === candidateCategory;
  const sameLevel = Boolean(referenceLevel) && referenceLevel === candidateLevel;
  const sameLanguage =
    Boolean(referenceLanguage) && referenceLanguage === candidateLanguage;
  const sharedTags = getSharedCount(referenceTagSet, candidateTagSet);
  const sharedKeywords = getSharedCount(
    referenceKeywordSet,
    candidateKeywordSet,
  );
  const samePriceModel =
    typeof reference.isFree === "boolean" &&
    reference.isFree === isFreeCourse(candidate);

  return {
    strongScore:
      (sameCategory ? 14 : 0) +
      sharedTags * 6 +
      Math.min(sharedKeywords, 4) * 2,
    tieBreaker:
      (sameLevel ? 2 : 0) +
      (sameLanguage ? 1 : 0) +
      (samePriceModel ? 1 : 0),
  };
}

function getPopularityScore(course: Course) {
  return (
    (course.students_count ?? 0) * 3 +
    (course.rating_count ?? 0) +
    Math.round((course.rating_avg ?? 0) * 10)
  );
}

function getRecencyScore(course: Course) {
  return (
    new Date(course.published_at || course.updated_at || course.created_at).getTime() ||
    0
  );
}

export function buildRecommendedCourseItems({
  references,
  courses,
  limit = 4,
}: {
  references: CourseRecommendationReference[];
  courses: Course[];
  limit?: number;
}) {
  const excludedCourseIds = new Set(
    references.map((reference) => reference.courseId).filter(Boolean),
  );
  const excludedSlugs = new Set(
    references.map((reference) => reference.slug).filter(Boolean),
  );

  const ranked = courses
    .filter(
      (candidate) =>
        !excludedCourseIds.has(candidate.course_id) &&
        !excludedSlugs.has(candidate.slug),
    )
    .map((candidate) => {
      let strongScore = 0;
      let tieBreaker = 0;
      let matchedReferences = 0;

      for (const reference of references) {
        const score = scoreCandidateAgainstReference(candidate, reference);

        if (score.strongScore > 0) {
          matchedReferences += 1;
        }

        if (
          score.strongScore > strongScore ||
          (score.strongScore === strongScore &&
            score.tieBreaker > tieBreaker)
        ) {
          strongScore = score.strongScore;
          tieBreaker = score.tieBreaker;
        }
      }

      return {
        candidate,
        strongScore,
        tieBreaker,
        matchedReferences,
        popularity: getPopularityScore(candidate),
        recency: getRecencyScore(candidate),
      };
    });

  const relevant = ranked
    .filter((item) => item.strongScore > 0)
    .sort((left, right) => {
      if (right.strongScore !== left.strongScore) {
        return right.strongScore - left.strongScore;
      }

      if (right.matchedReferences !== left.matchedReferences) {
        return right.matchedReferences - left.matchedReferences;
      }

      if (right.tieBreaker !== left.tieBreaker) {
        return right.tieBreaker - left.tieBreaker;
      }

      if (right.popularity !== left.popularity) {
        return right.popularity - left.popularity;
      }

      if (right.recency !== left.recency) {
        return right.recency - left.recency;
      }

      return left.candidate.title.localeCompare(right.candidate.title, "ru");
    });

  const fallback = ranked
    .filter((item) => item.strongScore === 0)
    .sort((left, right) => {
      if (right.popularity !== left.popularity) {
        return right.popularity - left.popularity;
      }

      if (right.recency !== left.recency) {
        return right.recency - left.recency;
      }

      if (right.tieBreaker !== left.tieBreaker) {
        return right.tieBreaker - left.tieBreaker;
      }

      return left.candidate.title.localeCompare(right.candidate.title, "ru");
    });

  return [...relevant, ...fallback].slice(0, limit).map(({ candidate }) => {
    const category = getCourseCategoryLabel(candidate);

    return {
      course: candidate,
      priceBadge: getCoursePriceBadge(candidate),
      tagLine: getCourseTagLine(candidate, category),
      level: getCourseLevelLabel(candidate.level),
      type: getCourseIconType(candidate),
    } satisfies CourseRecommendationItem;
  });
}
