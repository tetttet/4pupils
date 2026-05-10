import { brand } from "@/lib/brand";
import type {
  AtlasDeepLinkCard,
  AtlasFeatureCard,
  AtlasIntroPayload,
  UserContext,
} from "./types";

type AtlasRole = NonNullable<UserContext["role"]>;

function normalize(value: string) {
  return value.toLocaleLowerCase("ru").replace(/\s+/g, " ").trim();
}

function resolveRole(context?: UserContext): AtlasRole | "guest" {
  return context?.role ?? "guest";
}

function getRoleHint(role: AtlasRole | "guest") {
  if (role === "student") {
    return "Если вы зашли как ученик, могу быстро провести по урокам, сообщениям, прогрессу, профилю и настройкам.";
  }

  if (role === "teacher") {
    return "Если вы работаете как преподаватель, помогу с курсами, заявками, уроками, аналитикой и рабочими сценариями внутри dashboard.";
  }

  if (role === "admin") {
    return "Если вы в роли администратора, помогу с пользователями, курсами, модерацией, сообщениями и настройками платформы.";
  }

  if (role === "school") {
    return "Если вы представляете школу или команду, помогу быстрее понять структуру кабинетов, доступов и операционных разделов.";
  }

  if (role === "parent") {
    return "Если вы смотрите платформу как родитель, помогу понять, где искать курсы, уроки, сообщения и основные статусы обучения.";
  }

  return "Если вы просто знакомитесь с платформой, могу быстро показать, с каких страниц лучше начать и куда идти дальше.";
}

function buildFeatureCards(role: AtlasRole | "guest"): AtlasFeatureCard[] {
  const workspaceHref =
    role === "student"
      ? "/platform"
      : role === "guest"
        ? "/courses"
        : "/dashboard";

  return [
    {
      title: "Пошагово разложить задачу",
      description:
        "Скажу, куда зайти, что нажать и что проверить дальше без длинного поиска по интерфейсу.",
      actionLabel: "Получить план",
      visual: "sparkles",
    },
    {
      title: "Найти нужный раздел",
      description:
        "Помогу быстро выйти на правильный кабинет, экран или страницу под вашу роль и текущую задачу.",
      actionLabel: "Открыть навигацию",
      href: workspaceHref,
      visual: "compass",
    },
    {
      title: "Объяснить роли и доступы",
      description:
        "Могу простыми словами объяснить, кто что видит, какие действия доступны и где меняются права.",
      actionLabel: "Разобрать доступы",
      visual: "shield",
    },
    {
      title: "Сделать короткую сводку",
      description:
        "Если страница или процесс выглядят перегруженно, соберу понятную выжимку и подскажу следующий шаг.",
      actionLabel: "Собрать выжимку",
      href: "/guides",
      visual: "layers",
    },
  ];
}

function buildDeepLinks(role: AtlasRole | "guest"): AtlasDeepLinkCard[] {
  if (role === "student") {
    return [
      {
        title: "Главная платформа",
        description:
          "Обзор дня, прогресса, ближайших шагов и общей учебной активности.",
        href: "/platform",
        actionLabel: "Открыть платформу",
        visual: "dashboard",
      },
      {
        title: "Мои уроки",
        description:
          "Активные курсы, уроки, модули и точки возврата в обучение.",
        href: "/platform/lessons",
        actionLabel: "Открыть уроки",
        visual: "book",
      },
      {
        title: "Сообщения",
        description:
          "Переписка с преподавателями, командой платформы и системными уведомлениями.",
        href: "/platform/messages",
        actionLabel: "Открыть сообщения",
        visual: "messages",
      },
      {
        title: "Настройки",
        description:
          "Параметры уведомлений, приватности, доступности и поведения платформы.",
        href: "/platform/settings",
        actionLabel: "Открыть настройки",
        visual: "settings",
      },
    ];
  }

  if (role === "teacher") {
    return [
      {
        title: "Главная панель",
        description:
          "Сводка по курсам, заявкам, активности студентов и рабочим фокусам.",
        href: "/dashboard",
        actionLabel: "Открыть dashboard",
        visual: "dashboard",
      },
      {
        title: "Мои курсы",
        description:
          "Создание, обновление и управление карточками курсов преподавателя.",
        href: "/dashboard/teacher/courses",
        actionLabel: "Открыть курсы",
        visual: "courses",
      },
      {
        title: "Заявки",
        description:
          "Просмотр заявок студентов, статусов и решений по доступу к курсам.",
        href: "/dashboard/teacher/applications",
        actionLabel: "Открыть заявки",
        visual: "users",
      },
      {
        title: "Уроки",
        description:
          "Работа с уроками, расписанием, прогрессом и учебными срезами.",
        href: "/dashboard/teacher/lessons",
        actionLabel: "Открыть уроки",
        visual: "book",
      },
    ];
  }

  if (role === "admin") {
    return [
      {
        title: "Главная панель",
        description:
          "Операционный обзор платформы и быстрый вход в ключевые административные процессы.",
        href: "/dashboard",
        actionLabel: "Открыть dashboard",
        visual: "dashboard",
      },
      {
        title: "Курсы",
        description:
          "Каталог утверждённых курсов, контроль качества и рабочий контур модерации.",
        href: "/dashboard/admin/courses",
        actionLabel: "Открыть курсы",
        visual: "courses",
      },
      {
        title: "Пользователи",
        description:
          "Управление студентами, ролями, доступами и основными профилями.",
        href: "/dashboard/admin/users/students",
        actionLabel: "Открыть пользователей",
        visual: "users",
      },
      {
        title: "Входящие",
        description:
          "Внутренние сообщения, рассылки и коммуникация с пользователями платформы.",
        href: "/dashboard/admin/inbox",
        actionLabel: "Открыть inbox",
        visual: "messages",
      },
    ];
  }

  return [
    {
      title: "Каталог курсов",
      description:
        "Публичный обзор доступных курсов, программ и направлений обучения.",
      href: "/courses",
      actionLabel: "Открыть каталог",
      visual: "courses",
    },
    {
      title: "Гайды",
      description:
        "Полезные материалы и справочные страницы, если хотите быстрее освоиться в продукте.",
      href: "/guides",
      actionLabel: "Открыть гайды",
      visual: "book",
    },
    {
      title: "Вход",
      description:
        "Быстрый переход в авторизацию, если хотите продолжить уже внутри кабинета.",
      href: "/auth/sign-in",
      actionLabel: "Открыть вход",
      visual: "shield",
    },
    {
      title: "Регистрация",
      description:
        "Стартовая страница для создания аккаунта и выбора рабочего сценария.",
      href: "/auth/sign-up",
      actionLabel: "Открыть регистрацию",
      visual: "sparkles",
    },
  ];
}

export function isAtlasIntroRequest(message: string) {
  const text = normalize(message);

  return [
    "что ты умеешь",
    "что ты умеешь делать",
    "что ты можешь",
    "как ты можешь помочь",
    "расскажи о возможностях",
    "какие у тебя возможности",
    "в чем ты можешь помочь",
  ].some((phrase) => text.includes(phrase));
}

export function buildAtlasIntroAnswer(context?: UserContext) {
  const role = resolveRole(context);

  return [
    "Я Atlas. Могу быть вашим навигатором по платформе и помогать с задачами внутри продукта.",
    `По структуре проекта видно, что это образовательная платформа ${brand.name}: здесь есть курсы, уроки, сообщения, профили, настройки и отдельные рабочие контуры для разных ролей.`,
    getRoleHint(role),
    "",
    "Вот чем я особенно полезен:",
    "1. Быстро объясняю, где находится нужный раздел и какой путь пройти.",
    "2. Раскладываю действия по шагам: от входа и профиля до курсов, уроков, сообщений и настроек.",
    "3. Подстраиваю ответ под роль пользователя и текущий сценарий, а не даю общий шаблон.",
    "4. Помогаю понять, что делать дальше, если вы упёрлись в навигацию, статус, доступ или процесс.",
    "",
    "Чтобы получить лучший ответ, напишите цель простыми словами. Например: что именно хотите открыть, настроить, проверить или завершить.",
  ].join("\n");
}

export function createAtlasIntroPayload(
  context?: UserContext,
): AtlasIntroPayload {
  const role = resolveRole(context);

  return {
    featureTitle: "Что я могу сделать прямо сейчас",
    featureCards: buildFeatureCards(role),
    deepLinksTitle: "Быстрые переходы по платформе",
    deepLinks: buildDeepLinks(role),
  };
}
