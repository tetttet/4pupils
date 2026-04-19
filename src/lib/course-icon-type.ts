import { normalizeText } from "@/lib/func";
import { ICON_TYPES, type Course, type CourseIconType } from "@/types/course";

type CourseIconSource = Pick<Course, "category" | "course_id" | "slug" | "tags">;

const CATEGORY_ICON_RULES: Array<{
  keywords: string[];
  type: CourseIconType;
}> = [
  {
    type: "blue",
    keywords: ["web", "program", "frontend", "backend", "software"],
  },
  {
    type: "orange",
    keywords: ["mobile", "ios", "android", "flutter", "react native"],
  },
  {
    type: "mint",
    keywords: ["data", "analytic", "analytics", "sql", "bi"],
  },
  {
    type: "pink",
    keywords: ["design", "figma", "branding", "illustration"],
  },
  {
    type: "indigo",
    keywords: [
      "devops",
      "cloud",
      "cyber",
      "security",
      "machine learning",
      "artificial intelligence",
      "neural",
      "llm",
    ],
  },
  {
    type: "amber",
    keywords: [
      "business",
      "marketing",
      "finance",
      "product",
      "management",
      "sales",
      "growth",
    ],
  },
];

export function getCourseIconType(course: CourseIconSource): CourseIconType {
  const normalizedCategory = normalizeText(
    [course.category, ...(course.tags ?? [])].filter(Boolean).join(" "),
  );

  for (const rule of CATEGORY_ICON_RULES) {
    if (rule.keywords.some((keyword) => normalizedCategory.includes(keyword))) {
      return rule.type;
    }
  }

  const seed = Array.from(
    `${course.course_id}${course.slug}${normalizedCategory}`,
  ).reduce((sum, symbol) => sum + symbol.charCodeAt(0), 0);

  return ICON_TYPES[seed % ICON_TYPES.length];
}
