import type { Course } from "@/types/course";
import { brand } from "@/lib/brand";

export const LEARNING_FIT_STORAGE_KEY = `${brand.storageKeyPrefix}-learning-fit`;
export const LEARNING_FIT_RESULTS_PATH = "/learning-fit/results";
export const LEARNING_FIT_LIMIT = 6;

export const learningFitSubjects = [
  {
    id: "languages",
    label: "Языки и English",
    description: "Разговорный английский, грамматика, словарь и языковая практика.",
    keywords: [
      "english",
      "language",
      "languages",
      "англий",
      "язык",
      "grammar",
      "speaking",
      "vocabulary",
      "toeic",
      "esl",
    ],
  },
  {
    id: "math",
    label: "Математика",
    description: "Алгебра, геометрия, арифметика, статистика и логика.",
    keywords: [
      "math",
      "mathematics",
      "математ",
      "алгеб",
      "геометр",
      "арифмет",
      "statistics",
      "статист",
      "calculus",
      "логик",
    ],
  },
  {
    id: "programming",
    label: "Программирование",
    description: "Frontend, backend, Python, JavaScript, React и разработка.",
    keywords: [
      "programming",
      "coding",
      "code",
      "developer",
      "development",
      "javascript",
      "typescript",
      "python",
      "react",
      "frontend",
      "backend",
      "sql",
      "data",
      "алгоритм",
      "программ",
      "код",
      "разработ",
      "веб",
    ],
  },
  {
    id: "design",
    label: "Дизайн",
    description: "UI/UX, графика, Figma, motion и визуальное мышление.",
    keywords: [
      "design",
      "designer",
      "ux",
      "ui",
      "figma",
      "graphic",
      "motion",
      "branding",
      "photoshop",
      "illustration",
      "дизайн",
      "график",
      "интерфейс",
      "визуал",
      "прототип",
    ],
  },
  {
    id: "marketing",
    label: "Маркетинг",
    description: "SMM, performance, SEO, продажи, контент и продвижение.",
    keywords: [
      "marketing",
      "smm",
      "seo",
      "target",
      "brand",
      "copywriting",
      "sales",
      "маркет",
      "продвиж",
      "контент",
      "реклама",
      "продаж",
      "лид",
    ],
  },
  {
    id: "business",
    label: "Бизнес и менеджмент",
    description: "Управление, product, команда, стратегия и запуск проектов.",
    keywords: [
      "business",
      "management",
      "manager",
      "startup",
      "strategy",
      "product",
      "leadership",
      "бизнес",
      "менедж",
      "управл",
      "стратег",
      "команд",
      "лидер",
    ],
  },
  {
    id: "finance",
    label: "Финансы",
    description: "Финансовая грамотность, инвестиции, Excel, учёт и аналитика.",
    keywords: [
      "finance",
      "financial",
      "accounting",
      "investment",
      "excel",
      "analytics",
      "финанс",
      "инвест",
      "бухгалт",
      "учет",
      "аналит",
    ],
  },
  {
    id: "school",
    label: "Школьные предметы",
    description: "Подготовка к экзаменам, олимпиадам и системная база.",
    keywords: [
      "school",
      "exam",
      "ege",
      "ent",
      "подготов",
      "школ",
      "экзамен",
      "олимпиад",
      "тест",
      "абитури",
    ],
  },
  {
    id: "creative",
    label: "Творческие навыки",
    description: "Музыка, фото, видео, рисунок и креативные дисциплины.",
    keywords: [
      "music",
      "art",
      "drawing",
      "photo",
      "video",
      "creative",
      "музык",
      "вокал",
      "рисован",
      "фото",
      "видео",
      "творч",
    ],
  },
  {
    id: "undecided",
    label: "Помогите определиться",
    description: "Покажем наиболее сильные и понятные варианты без жёсткой темы.",
    keywords: [],
  },
] as const;

export const learningFitLevels = [
  {
    id: "beginner",
    label: "Начинающий",
    description: "Хочу зайти в тему с нуля и без лишнего давления.",
  },
  {
    id: "intermediate",
    label: "Средний",
    description: "База уже есть, нужен следующий уверенный шаг.",
  },
  {
    id: "advanced",
    label: "Продвинутый",
    description: "Ищу углубление, специализацию и сильную практику.",
  },
] as const;

export const learningFitGoals = [
  {
    id: "basics",
    label: "Освоить базу",
    description: "Нужен понятный вход, фундамент и объяснение без перегруза.",
    keywords: [
      "basics",
      "foundation",
      "fundamentals",
      "beginner",
      "intro",
      "introduction",
      "основ",
      "с нуля",
      "баз",
      "введение",
      "старт",
    ],
  },
  {
    id: "practice",
    label: "Больше практики",
    description: "Важно делать руками, решать задачи и быстро видеть прогресс.",
    keywords: [
      "practice",
      "hands on",
      "project",
      "projects",
      "cases",
      "workshop",
      "лаборатор",
      "практик",
      "проект",
      "задач",
      "кейс",
    ],
  },
  {
    id: "career",
    label: "Для карьеры",
    description: "Хочу курс, который помогает расти в работе и профессии.",
    keywords: [
      "career",
      "job",
      "portfolio",
      "interview",
      "profession",
      "работ",
      "карьер",
      "портфолио",
      "професс",
      "трудоустрой",
    ],
  },
  {
    id: "exam",
    label: "Под экзамен",
    description: "Нужен более целевой трек: ЕНТ, ЕГЭ, тесты, аттестация или олимпиада.",
    keywords: [
      "exam",
      "test",
      "toeic",
      "ege",
      "ent",
      "сертиф",
      "экзамен",
      "подготов",
    ],
  },
  {
    id: "growth",
    label: "Углубить навыки",
    description: "Ищу повышение уровня, новые приёмы и более сильный результат.",
    keywords: [
      "advanced",
      "deep",
      "mastery",
      "improve",
      "growth",
      "продвинут",
      "углуб",
      "улучш",
      "повыш",
      "сильн",
    ],
  },
] as const;

export const learningFitLanguages = [
  {
    id: "any",
    label: "Язык не критичен",
    description: "Главное, чтобы курс был действительно полезным.",
  },
  {
    id: "ru",
    label: "Русский",
    description: "Предпочитаю учиться на русском языке.",
  },
  {
    id: "en",
    label: "English",
    description: "Готов проходить курс полностью на английском.",
  },
  {
    id: "kk",
    label: "Қазақша",
    description: "Лучше, если курс или объяснение будут на казахском.",
  },
] as const;

export const learningFitBudgets = [
  {
    id: "free",
    label: "Только бесплатно",
    description: "Хочу начать без оплаты и сначала оценить качество.",
  },
  {
    id: "affordable",
    label: "Разумный бюджет",
    description: "Подойдут и платные курсы, если цена выглядит адекватно.",
  },
  {
    id: "any",
    label: "Бюджет не ограничивает",
    description: "Сейчас важнее найти лучший вариант по качеству.",
  },
] as const;

export type LearningFitSubjectId = (typeof learningFitSubjects)[number]["id"];
export type LearningFitLevelId = (typeof learningFitLevels)[number]["id"];
export type LearningFitGoalId = (typeof learningFitGoals)[number]["id"];
export type LearningFitLanguageId =
  (typeof learningFitLanguages)[number]["id"];
export type LearningFitBudgetId = (typeof learningFitBudgets)[number]["id"];

export type LearningFitAnswers = {
  subject: LearningFitSubjectId | "";
  level: LearningFitLevelId | "";
  goal: LearningFitGoalId | "";
  language: LearningFitLanguageId | "";
  budget: LearningFitBudgetId | "";
};

export type CompleteLearningFitAnswers = {
  subject: LearningFitSubjectId;
  level: LearningFitLevelId;
  goal: LearningFitGoalId;
  language: LearningFitLanguageId;
  budget: LearningFitBudgetId;
};

export type LearningFitRecommendation = {
  course: Course;
  score: number;
  reasons: string[];
  confidenceLabel: string;
  isStrongMatch: boolean;
};

export type LearningFitRecommendationResult = {
  items: LearningFitRecommendation[];
  usedFallback: boolean;
  totalStrongMatches: number;
};

type LearningFitAnswersRecord = Partial<
  Record<keyof LearningFitAnswers, string | null | undefined>
>;

const EMPTY_ANSWERS: LearningFitAnswers = {
  subject: "",
  level: "",
  goal: "",
  language: "",
  budget: "",
};

const LEVEL_ALIASES: Record<string, LearningFitLevelId> = {
  beginner: "beginner",
  basic: "beginner",
  entry: "beginner",
  junior: "beginner",
  начинающий: "beginner",
  novice: "beginner",
  intermediate: "intermediate",
  middle: "intermediate",
  средний: "intermediate",
  medium: "intermediate",
  advanced: "advanced",
  expert: "advanced",
  продвинутый: "advanced",
  pro: "advanced",
};

const LANGUAGE_ALIASES: Record<string, LearningFitLanguageId> = {
  ru: "ru",
  russian: "ru",
  русский: "ru",
  рус: "ru",
  en: "en",
  english: "en",
  англ: "en",
  английский: "en",
  kk: "kk",
  kz: "kk",
  kazakh: "kk",
  қазақ: "kk",
  казахский: "kk",
};

const SUBJECT_SET = new Set<string>(learningFitSubjects.map((item) => item.id));
const LEVEL_SET = new Set<string>(learningFitLevels.map((item) => item.id));
const GOAL_SET = new Set<string>(learningFitGoals.map((item) => item.id));
const LANGUAGE_SET = new Set<string>(
  learningFitLanguages.map((item) => item.id),
);
const BUDGET_SET = new Set<string>(learningFitBudgets.map((item) => item.id));

function isCourseFree(course: Course) {
  return (
    course.is_free ||
    String(course.price) === "0" ||
    String(course.price) === "0.00"
  );
}

function normalizeText(value?: string | null) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0400-\u04ff]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countKeywordHits(haystack: string, keywords: readonly string[]) {
  const hits = new Set<string>();

  for (const keyword of keywords) {
    const normalized = normalizeText(keyword);
    if (!normalized) continue;
    if (haystack.includes(normalized)) {
      hits.add(normalized);
    }
  }

  return hits.size;
}

function normalizeCourseLevel(level?: string | null): LearningFitLevelId | null {
  const normalized = normalizeText(level);
  if (!normalized) return null;

  for (const [alias, value] of Object.entries(LEVEL_ALIASES)) {
    if (normalized.includes(alias)) {
      return value;
    }
  }

  return null;
}

function normalizeCourseLanguage(
  language?: string | null,
): LearningFitLanguageId | null {
  const normalized = normalizeText(language);
  if (!normalized) return null;

  for (const [alias, value] of Object.entries(LANGUAGE_ALIASES)) {
    if (normalized === alias || normalized.includes(alias)) {
      return value;
    }
  }

  return null;
}

function getAffordablePriceThreshold(currency?: string | null) {
  switch (String(currency || "").toUpperCase()) {
    case "USD":
      return 120;
    case "EUR":
      return 100;
    case "RUB":
      return 10_000;
    case "KZT":
    case "":
      return 40_000;
    default:
      return 100_000;
  }
}

function isAffordableCourse(course: Course) {
  if (isCourseFree(course)) return true;
  return Number(course.price ?? 0) <= getAffordablePriceThreshold(course.currency);
}

function getPopularityBonus(course: Course) {
  const rating = Math.max(0, Number(course.rating_avg ?? 0));
  const ratingCount = Math.max(0, Number(course.rating_count ?? 0));
  const studentsCount = Math.max(0, Number(course.students_count ?? 0));

  return Math.min(
    10,
    rating * 0.9 +
      Math.min(3, Math.log10(ratingCount + 1) * 2.2) +
      Math.min(2.5, Math.log10(studentsCount + 1) * 1.7),
  );
}

function getConfidenceLabel(score: number, isStrongMatch: boolean) {
  if (score >= 80) return "Лучшее совпадение";
  if (isStrongMatch) return "Сильное совпадение";
  if (score >= 36) return "Близкий вариант";
  return "Запасной вариант";
}

function scoreCourse(
  course: Course,
  answers: CompleteLearningFitAnswers,
): LearningFitRecommendation {
  const titleText = normalizeText(course.title);
  const categoryText = normalizeText([course.category, ...(course.tags ?? [])].join(" "));
  const detailText = normalizeText(
    [
      course.short_description,
      course.description,
      ...(course.outcomes ?? []),
      ...(course.requirements ?? []),
    ].join(" "),
  );
  const fullText = normalizeText([titleText, categoryText, detailText].join(" "));

  let subjectScore = 0;
  let goalScore = 0;
  let levelScore = 0;
  let languageScore = 0;
  let budgetScore = 0;
  const reasons: string[] = [];

  if (answers.subject === "undecided") {
    subjectScore = 12;
    reasons.push("Подходит для широкого старта");
  } else {
    const subjectProfile = learningFitSubjects.find(
      (item) => item.id === answers.subject,
    );

    if (subjectProfile) {
      const titleHits = countKeywordHits(titleText, subjectProfile.keywords);
      const categoryHits = countKeywordHits(categoryText, subjectProfile.keywords);
      const detailHits = countKeywordHits(detailText, subjectProfile.keywords);

      subjectScore = Math.min(
        54,
        categoryHits * 16 + titleHits * 12 + detailHits * 5,
      );

      if (subjectScore >= 18) {
        reasons.push(`Совпадает по теме: ${subjectProfile.label}`);
      }
    }
  }

  const goalProfile = learningFitGoals.find((item) => item.id === answers.goal);
  if (goalProfile) {
    const goalHits = countKeywordHits(fullText, goalProfile.keywords);
    goalScore = Math.min(18, goalHits * 6);

    if (answers.goal === "basics" && normalizeCourseLevel(course.level) === "beginner") {
      goalScore += 8;
    }

    if (answers.goal === "practice" && (course.outcomes?.length ?? 0) >= 2) {
      goalScore += 5;
    }

    if (answers.goal === "career" && (course.outcomes?.length ?? 0) >= 1) {
      goalScore += 4;
    }

    if (answers.goal === "growth" && normalizeCourseLevel(course.level) === "advanced") {
      goalScore += 6;
    }

    if (answers.goal === "exam" && countKeywordHits(titleText, goalProfile.keywords) > 0) {
      goalScore += 5;
    }

    goalScore = Math.min(goalScore, 22);

    if (goalScore >= 10) {
      reasons.push(`Учитывает цель: ${goalProfile.label}`);
    }
  }

  const courseLevel = normalizeCourseLevel(course.level);
  if (!courseLevel) {
    levelScore = 4;
  } else if (courseLevel === answers.level) {
    levelScore = 14;
    reasons.push("Под ваш текущий уровень");
  } else if (
    (answers.level === "beginner" && courseLevel === "intermediate") ||
    (answers.level === "intermediate" &&
      (courseLevel === "beginner" || courseLevel === "advanced")) ||
    (answers.level === "advanced" && courseLevel === "intermediate")
  ) {
    levelScore = 7;
  }

  const courseLanguage = normalizeCourseLanguage(course.language);
  if (answers.language === "any") {
    languageScore = 6;
  } else if (!courseLanguage) {
    languageScore = 4;
  } else if (courseLanguage === answers.language) {
    languageScore = 10;
    reasons.push("Совпадает по языку");
  }

  if (answers.budget === "any") {
    budgetScore = 6;
  } else if (answers.budget === "free") {
    if (isCourseFree(course)) {
      budgetScore = 14;
      reasons.push("Можно начать без оплаты");
    }
  } else if (answers.budget === "affordable") {
    budgetScore = isAffordableCourse(course) ? 11 : 3;
    if (budgetScore >= 10) {
      reasons.push("Подходит по бюджету");
    }
  }

  const popularityBonus = getPopularityBonus(course);
  if (popularityBonus >= 6.5) {
    reasons.push("Есть хороший отклик у учеников");
  }

  const score = Math.round(
    subjectScore +
      goalScore +
      levelScore +
      languageScore +
      budgetScore +
      popularityBonus,
  );

  const isStrongMatch =
    (answers.subject === "undecided" || subjectScore >= 18) && score >= 58;

  return {
    course,
    score,
    reasons: reasons.slice(0, 4),
    confidenceLabel: getConfidenceLabel(score, isStrongMatch),
    isStrongMatch,
  };
}

export function getLearningFitInitialAnswers(): LearningFitAnswers {
  return { ...EMPTY_ANSWERS };
}

export function hasCompleteLearningFitAnswers(
  answers: LearningFitAnswers,
): answers is CompleteLearningFitAnswers {
  return Boolean(
    answers.subject &&
      answers.level &&
      answers.goal &&
      answers.language &&
      answers.budget,
  );
}

export function parseLearningFitAnswers(
  source:
    | { get(key: string): string | null }
    | LearningFitAnswersRecord
    | null
    | undefined,
): LearningFitAnswers {
  if (!source) {
    return getLearningFitInitialAnswers();
  }

  const getValue = (key: keyof LearningFitAnswers) => {
    if ("get" in source && typeof source.get === "function") {
      return source.get(key);
    }

    const recordSource = source as LearningFitAnswersRecord;
    return recordSource[key] ?? null;
  };

  const subject = getValue("subject");
  const level = getValue("level");
  const goal = getValue("goal");
  const language = getValue("language");
  const budget = getValue("budget");

  return {
    subject: SUBJECT_SET.has(String(subject)) ? (subject as LearningFitSubjectId) : "",
    level: LEVEL_SET.has(String(level)) ? (level as LearningFitLevelId) : "",
    goal: GOAL_SET.has(String(goal)) ? (goal as LearningFitGoalId) : "",
    language: LANGUAGE_SET.has(String(language))
      ? (language as LearningFitLanguageId)
      : "",
    budget: BUDGET_SET.has(String(budget)) ? (budget as LearningFitBudgetId) : "",
  };
}

export function serializeLearningFitAnswers(answers: CompleteLearningFitAnswers) {
  const params = new URLSearchParams({
    subject: answers.subject,
    level: answers.level,
    goal: answers.goal,
    language: answers.language,
    budget: answers.budget,
  });

  return params.toString();
}

export function buildLearningFitResultsHref(answers: CompleteLearningFitAnswers) {
  return `${LEARNING_FIT_RESULTS_PATH}?${serializeLearningFitAnswers(answers)}`;
}

export function getLearningFitOptionLabel<
  T extends { id: string; label: string },
>(collection: readonly T[], id?: string | null) {
  return collection.find((item) => item.id === id)?.label ?? "Не выбрано";
}

export function getLearningFitSummaryItems(answers: LearningFitAnswers) {
  return [
    {
      key: "subject",
      label: "Предмет",
      value: getLearningFitOptionLabel(learningFitSubjects, answers.subject),
    },
    {
      key: "level",
      label: "Уровень",
      value: getLearningFitOptionLabel(learningFitLevels, answers.level),
    },
    {
      key: "goal",
      label: "Цель",
      value: getLearningFitOptionLabel(learningFitGoals, answers.goal),
    },
    {
      key: "language",
      label: "Язык",
      value: getLearningFitOptionLabel(learningFitLanguages, answers.language),
    },
    {
      key: "budget",
      label: "Бюджет",
      value: getLearningFitOptionLabel(learningFitBudgets, answers.budget),
    },
  ];
}

export function createLearningFitSubmissionPayload(
  answers: CompleteLearningFitAnswers,
) {
  return {
    answers,
    labels: {
      subject: getLearningFitOptionLabel(learningFitSubjects, answers.subject),
      level: getLearningFitOptionLabel(learningFitLevels, answers.level),
      goal: getLearningFitOptionLabel(learningFitGoals, answers.goal),
      language: getLearningFitOptionLabel(learningFitLanguages, answers.language),
      budget: getLearningFitOptionLabel(learningFitBudgets, answers.budget),
    },
    submittedAt: new Date().toISOString(),
  };
}

export function getLearningFitRecommendations(
  courses: Course[],
  answers: CompleteLearningFitAnswers,
  limit = LEARNING_FIT_LIMIT,
): LearningFitRecommendationResult {
  const ranked = courses
    .map((course) => scoreCourse(course, answers))
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;

      const leftStudents = Number(left.course.students_count ?? 0);
      const rightStudents = Number(right.course.students_count ?? 0);
      if (rightStudents !== leftStudents) return rightStudents - leftStudents;

      return left.course.title.localeCompare(right.course.title, "ru");
    });

  const strongMatches = ranked.filter((item) => item.isStrongMatch);
  const items = (strongMatches.length ? strongMatches : ranked).slice(0, limit);

  return {
    items,
    usedFallback: strongMatches.length === 0,
    totalStrongMatches: strongMatches.length,
  };
}
