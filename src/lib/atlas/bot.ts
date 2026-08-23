import { brand } from "@/lib/brand";
import {
  buildAtlasIntroAnswer,
  createAtlasIntroPayload,
  isAtlasIntroRequest,
} from "./intro";
import { generateAtlasAnswer } from "./openrouter";
import type {
  AtlasIntent,
  AtlasHistoryMessage,
  AtlasMemory,
  BotReply,
  ChatAction,
  LinkTarget,
  UserContext,
} from "./types";

type PlatformTopic = {
  actions?: ChatAction[];
  answer: string[];
  chips: string[];
  intent: AtlasIntent;
  keywords: string[];
  links: LinkTarget[];
  title: string;
};

const defaultChips = [
  "Что ты умеешь?",
  "Как создать аккаунт ученика?",
  "Как добавить новый курс?",
  "Как найти нужный раздел платформы?",
];

const platformTopics: PlatformTopic[] = [
  {
    intent: "account",
    title: "Аккаунты и вход",
    keywords: [
      "аккаунт",
      "регистрац",
      "зарегистр",
      "войти",
      "логин",
      "пароль",
      "учет",
      "кабинет",
    ],
    answer: [
      "Чтобы создать аккаунт, откройте страницу регистрации и выберите подходящую роль.",
      "Ученику достаточно заполнить имя, email и пароль, затем войти в личный кабинет.",
      "Если аккаунт уже есть, используйте страницу входа и проверьте, что email указан без ошибок.",
    ],
    chips: [
      "Как создать аккаунт ученика?",
      "Как войти преподавателю?",
      "Что делать, если забыл пароль?",
    ],
    links: [
      { label: "Регистрация", href: "/auth/sign-up" },
      { label: "Вход", href: "/auth/sign-in" },
    ],
  },
  {
    intent: "profile",
    title: "Профиль",
    keywords: ["профиль", "анкета", "имя", "телефон", "почта", "школ", "данные"],
    answer: [
      "Профиль редактируется в личном кабинете пользователя.",
      "Откройте раздел профиля, обновите контактные данные и сохраните изменения.",
      "Для школы или команды сначала проверьте основные данные, затем настройки доступа для участников.",
    ],
    chips: [
      "Как настроить профиль школы?",
      "Как изменить данные ученика?",
      "Где настройки аккаунта?",
    ],
    links: [
      { label: "Профиль", href: "/platform/profile" },
      { label: "Настройки", href: "/platform/settings" },
    ],
  },
  {
    intent: "students",
    title: "Ученики",
    keywords: ["ученик", "студент", "список учен", "обучающ", "заявк", "enrollment"],
    answer: [
      "Список учеников виден в рабочих разделах преподавателя и администратора.",
      "Если ученик подал заявку на курс, сначала откройте заявки, проверьте карточку и смените статус.",
      "После одобрения доступ к обучению появится в кабинете ученика.",
    ],
    chips: [
      "Как посмотреть список учеников?",
      "Как одобрить заявку?",
      "Как выдать доступ пользователю?",
    ],
    links: [
      { label: "Заявки преподавателя", href: "/dashboard/teacher/applications" },
      { label: "Ученики", href: "/dashboard/admin/users/students" },
    ],
  },
  {
    intent: "teachers",
    title: "Преподаватели",
    keywords: ["преподав", "учитель", "тьютор", "teacher", "добавить преподав"],
    answer: [
      "Преподавателей удобно добавлять и проверять через административную панель.",
      "Откройте список преподавателей, создайте или найдите пользователя и проверьте его роль.",
      "После этого преподаватель сможет работать с курсами, заявками, уроками и сообщениями.",
    ],
    chips: [
      "Как добавить преподавателя?",
      "Как изменить роль пользователя?",
      "Где курсы преподавателя?",
    ],
    links: [
      { label: "Преподаватели", href: "/dashboard/admin/users/teachers" },
      { label: "Курсы преподавателя", href: "/dashboard/teacher/courses" },
    ],
  },
  {
    intent: "courses",
    title: "Курсы",
    keywords: ["курс", "курсы", "создать курс", "добавить курс", "модерац", "каталог"],
    answer: [
      "Новый курс создается в кабинете преподавателя.",
      "Заполните название, описание, формат, цену и материалы, затем отправьте курс на проверку.",
      "После одобрения курс появится в каталоге, а ученики смогут оставить заявку.",
    ],
    chips: [
      "Как добавить новый курс?",
      "Как отправить курс на модерацию?",
      "Где каталог курсов?",
    ],
    links: [
      { label: "Создать курс", href: "/dashboard/teacher/courses/create" },
      { label: "Каталог курсов", href: "/courses" },
      { label: "Модерация", href: "/dashboard/admin/courses/moderation" },
    ],
  },
  {
    intent: "schedule",
    title: "Расписание и уроки",
    keywords: [
      "распис",
      "занят",
      "урок",
      "lesson",
      "перенести",
      "изменить время",
      "дата",
    ],
    answer: [
      "Расписание и уроки находятся в разделе уроков.",
      "Откройте нужный курс или урок, проверьте дату, время и участников.",
      "Если нужно перенести занятие, обновите данные урока и предупредите ученика через сообщения.",
    ],
    chips: [
      "Как изменить расписание занятия?",
      "Где уроки ученика?",
      "Как преподавателю открыть уроки?",
    ],
    links: [
      { label: "Уроки ученика", href: "/platform/lessons" },
      { label: "Уроки преподавателя", href: "/dashboard/teacher/lessons" },
    ],
  },
  {
    intent: "payments",
    title: "Оплата",
    keywords: ["оплат", "платеж", "цена", "стоимость", "счет", "инвойс", "подключить оплат"],
    answer: [
      "Оплата зависит от настроек конкретного курса и выбранного формата обучения.",
      "Проверьте цену в карточке курса, затем уточните условия через заявку или сообщение преподавателю.",
      "Если вы администратор и хотите подключить оплату, начните с проверки тарифов, валюты и правил доступа после оплаты.",
    ],
    chips: [
      "Как подключить оплату?",
      "Где изменить цену курса?",
      "Как ученик видит стоимость?",
    ],
    links: [
      { label: "Курсы", href: "/courses" },
      { label: "Создать курс", href: "/dashboard/teacher/courses/create" },
    ],
  },
  {
    intent: "roles",
    title: "Роли",
    keywords: ["роль", "роли", "права", "админ", "admin", "доступ", "permission"],
    answer: [
      "Роли управляют тем, какие разделы доступны пользователю.",
      "Администратор работает с пользователями, преподаватель - с курсами и заявками, ученик - с обучением и сообщениями.",
      "Чтобы изменить роль, откройте нужного пользователя в панели администратора и проверьте права перед сохранением.",
    ],
    chips: [
      "Как изменить роль пользователя?",
      "Как выдать доступ пользователю?",
      "Как работает панель администратора?",
    ],
    links: [
      { label: "Пользователи", href: "/dashboard/admin/users/students" },
      { label: "Администраторы", href: "/dashboard/admin/users/admins" },
    ],
  },
  {
    intent: "access",
    title: "Доступы",
    keywords: ["доступ", "выдать доступ", "открыть доступ", "закрыть доступ", "разрешен"],
    answer: [
      "Доступ обычно появляется после одобрения заявки или назначения пользователя на курс.",
      "Проверьте статус заявки, роль пользователя и связь с нужным курсом.",
      "Если доступ не появился, обновите статус заявки или проверьте запись в списке учеников.",
    ],
    chips: [
      "Как выдать доступ пользователю?",
      "Почему ученик не видит курс?",
      "Как проверить заявку?",
    ],
    links: [
      { label: "Заявки", href: "/dashboard/teacher/applications" },
      { label: "Курсы ученика", href: "/platform/lessons" },
    ],
  },
  {
    intent: "admin",
    title: "Панель администратора",
    keywords: ["панель администратора", "админ панель", "админка", "moderation", "модерац"],
    answer: [
      "Панель администратора собирает управление пользователями, курсами, модерацией и сообщениями.",
      "Начните с нужного раздела: пользователи, курсы, заявки, рассылки или настройки.",
      "Для спорных действий сначала откройте карточку объекта и проверьте детали перед изменением статуса.",
    ],
    chips: [
      "Как работает панель администратора?",
      "Как добавить преподавателя?",
      "Как модерировать курс?",
    ],
    links: [
      { label: "Админ-панель", href: "/dashboard/admin/courses" },
      { label: "Пользователи", href: "/dashboard/admin/users/students" },
    ],
  },
  {
    intent: "messages",
    title: "Сообщения",
    keywords: ["сообщ", "почта", "inbox", "чат", "написать", "рассылка"],
    answer: [
      "Сообщения помогают связаться с учениками, преподавателями и администрацией внутри платформы.",
      "Откройте входящие, выберите получателя и напишите короткое понятное сообщение.",
      "Для массового обращения используйте раздел рассылок администратора.",
    ],
    chips: [
      "Где сообщения ученика?",
      "Как написать ученику?",
      "Как отправить рассылку?",
    ],
    links: [
      { label: "Сообщения ученика", href: "/platform/messages" },
      { label: "Сообщения преподавателя", href: "/dashboard/teacher/inbox" },
      { label: "Админ-сообщения", href: "/dashboard/admin/inbox" },
    ],
  },
  {
    intent: "settings",
    title: "Настройки",
    keywords: ["настрой", "setting", "конфиг", "уведом", "язык интерф", "тема"],
    answer: [
      "Настройки находятся в личном кабинете пользователя.",
      "Там можно проверить профиль, предпочтения платформы и параметры отображения.",
      "Если настройка связана с ролью или доступами, ее должен проверить администратор.",
    ],
    chips: [
      "Где настройки аккаунта?",
      "Как настроить профиль школы?",
      "Как изменить роль пользователя?",
    ],
    links: [
      { label: "Настройки", href: "/platform/settings" },
      { label: "Профиль", href: "/platform/profile" },
    ],
  },
  {
    intent: "navigation",
    title: "Навигация",
    keywords: ["где найти", "куда нажать", "раздел", "страница", "навигац", "меню"],
    answer: [
      "Нужный раздел проще искать от роли пользователя.",
      "Ученику чаще нужны курсы, уроки, сообщения и профиль; преподавателю - курсы, заявки и уроки; администратору - пользователи, модерация и рассылки.",
      "Напишите, кто вы на платформе и какой результат нужен, и я подскажу точный путь.",
    ],
    chips: [
      "Как найти нужный раздел платформы?",
      "Где панель преподавателя?",
      "Где личный кабинет ученика?",
    ],
    links: [
      { label: "Платформа", href: "/platform" },
      { label: "Панель", href: "/dashboard" },
    ],
  },
];

function buildPlatformKnowledge() {
  return platformTopics
    .map((topic) => {
      const links = topic.links
        .map((link) => `${link.label}: ${link.href}`)
        .join("; ");

      return [
        `[${topic.title}]`,
        `Проверенные сведения: ${topic.answer.join(" ")}`,
        `Доступные пути: ${links}.`,
      ].join("\n");
    })
    .join("\n\n");
}

const platformKnowledge = buildPlatformKnowledge();

function normalize(value: string) {
  return value.toLocaleLowerCase("ru").replace(/\s+/g, " ").trim();
}

function hasAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

const roleOnlyKeywords = new Set([
  "админ",
  "администратор",
  "преподав",
  "студент",
  "тьютор",
  "ученик",
  "учитель",
]);

function scoreTopic(topic: PlatformTopic, text: string) {
  return topic.keywords.reduce((score, keyword) => {
    if (!text.includes(keyword)) return score;

    if (roleOnlyKeywords.has(keyword)) {
      return score + 0.35;
    }

    const wordCount = keyword.trim().split(/\s+/).length;
    return score + (wordCount > 1 ? 2.5 : 1);
  }, 0);
}

function detectRole(text: string): UserContext["role"] | undefined {
  if (hasAny(text, ["ученик", "студент"])) return "student";
  if (hasAny(text, ["преподав", "учитель", "тьютор"])) return "teacher";
  if (hasAny(text, ["админ", "администратор"])) return "admin";
  if (hasAny(text, ["родител"])) return "parent";
  if (hasAny(text, ["школ", "команд", "организац"])) return "school";
  return undefined;
}

function detectTopic(message: string) {
  const text = normalize(message);

  const ranked = platformTopics
    .map((topic) => ({ score: scoreTopic(topic, text), topic }))
    .sort((first, second) => second.score - first.score);

  const best = ranked[0];

  if (best?.score > 0) {
    return {
      confidence: Math.min(0.95, 0.58 + best.score * 0.14),
      topic: best.topic,
      intent: best.topic.intent,
    };
  }

  return {
    confidence: 0.45,
    topic: undefined,
    intent: "general" as const,
  };
}

function buildGeneralAnswer() {
  return [
    `Я Atlas, встроенный помощник ${brand.name}.`,
    "Помогаю разобраться с аккаунтами, профилями, ролями, пользователями, курсами, уроками, сообщениями, настройками и навигацией по платформе.",
    "Напишите, что хотите сделать на платформе, и я разложу путь по шагам.",
  ].join("\n");
}

function buildOffTopicAnswer() {
  return [
    `Я помогаю именно с использованием платформы ${brand.name}.`,
    "Могу подсказать, где создать аккаунт, найти нужный раздел, открыть уроки, настроить доступ, разобраться с ролями или пройти нужный сценарий внутри платформы.",
    "Сформулируйте вопрос по работе сайта, и я дам короткие шаги.",
  ].join("\n");
}

function buildTopicAnswer(topic: PlatformTopic) {
  return topic.answer.join("\n");
}

function updateMemory(
  previousMemory: AtlasMemory | undefined,
  message: string,
  intent: AtlasIntent,
  answer: string,
  chips: string[],
  topic?: PlatformTopic,
): AtlasMemory {
  return {
    ...(previousMemory ?? {}),
    lastIntent: intent,
    lastTopic: topic?.title,
    lastUserMessage: message,
    lastBotAnswer: answer,
    lastSuggestedChips: chips,
    selectedSection: topic?.title ?? previousMemory?.selectedSection,
    summary: topic
      ? `Пользователь интересовался разделом: ${topic.title}.`
      : previousMemory?.summary,
  };
}

function updateContext(
  previousContext: UserContext | undefined,
  message: string,
  topic?: PlatformTopic,
): UserContext {
  const role = detectRole(normalize(message)) ?? previousContext?.role;

  return {
    ...(previousContext ?? {}),
    ...(role ? { role } : {}),
    selectedSection: topic?.title ?? previousContext?.selectedSection,
    lastUpdatedAt: new Date().toISOString(),
  };
}

function createReply(
  message: string,
  previousMemory?: AtlasMemory,
  previousContext?: UserContext,
): BotReply {
  const context = updateContext(previousContext, message);

  if (isAtlasIntroRequest(message)) {
    const answer = buildAtlasIntroAnswer(context);
    const intro = createAtlasIntroPayload(context);
    const memory: AtlasMemory = {
      ...(previousMemory ?? {}),
      lastIntent: "intro",
      lastTopic: "Возможности Atlas",
      lastUserMessage: message,
      lastBotAnswer: answer,
      lastSuggestedChips: [],
      summary: "Пользователь запросил обзор возможностей Atlas.",
    };

    return {
      answer,
      engine: "local",
      intent: "intro",
      confidence: 0.98,
      actions: [],
      links: [],
      chips: [],
      sources: [brand.name, "Atlas"],
      memory,
      context,
      handoff: false,
      intro,
      topic: "Возможности Atlas",
    };
  }

  const result = detectTopic(message);
  const answer =
    result.intent === "off_topic"
      ? buildOffTopicAnswer()
      : result.topic
        ? buildTopicAnswer(result.topic)
        : buildGeneralAnswer();
  const chips = result.topic?.chips ?? defaultChips;
  const links = result.topic?.links ?? [
    { label: "Платформа", href: "/platform" },
    { label: "Курсы", href: "/courses" },
    { label: "Гайды", href: "/guides" },
  ];
  const actions = result.topic
    ? [
        {
          type: "link" as const,
          label: result.topic.links[0]?.label ?? "Открыть раздел",
          href: result.topic.links[0]?.href ?? "/platform",
        },
      ]
    : [
        {
          type: "link" as const,
          label: "Открыть Atlas",
          href: "/ai/homemade/atlas",
        },
      ];
  const nextContext = updateContext(context, message, result.topic);
  const memory = updateMemory(
    previousMemory,
    message,
    result.intent,
    answer,
    chips,
    result.topic,
  );

  return {
    answer,
    engine: "local",
    intent: result.intent,
    confidence: result.confidence,
    actions,
    links,
    chips,
    sources: result.topic ? [result.topic.title] : ["Atlas"],
    memory,
    context: nextContext,
    handoff: result.intent === "support",
    topic: result.topic?.title,
  };
}

type ChatStreamEvent =
  | {
      text: string;
      type: "delta";
    }
  | {
      reply: BotReply;
      type: "final";
    };

const streamEncoder = new TextEncoder();

function splitReplyIntoChunks(answer: string) {
  const parts = answer.split(/(\s+)/).filter(Boolean);
  const targetLength =
    answer.length > 540 ? 24 : answer.length > 260 ? 18 : 12;
  const chunks: string[] = [];
  let currentChunk = "";

  for (const part of parts) {
    const nextChunk = `${currentChunk}${part}`;

    if (
      currentChunk &&
      (part.includes("\n") || nextChunk.length > targetLength)
    ) {
      chunks.push(currentChunk);
      currentChunk = part;

      if (part.includes("\n")) {
        chunks.push(currentChunk);
        currentChunk = "";
      }

      continue;
    }

    currentChunk = nextChunk;

    if (part.includes("\n")) {
      chunks.push(currentChunk);
      currentChunk = "";
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

function getChunkDelay(chunk: string) {
  if (/\n/.test(chunk)) {
    return 28;
  }

  if (/[.!?]\s*$/.test(chunk)) {
    return 34;
  }

  if (chunk.length > 20) {
    return 24;
  }

  if (chunk.length > 12) {
    return 20;
  }

  return 16;
}

async function waitForNextChunk(ms: number, signal?: AbortSignal) {
  if (ms <= 0 || signal?.aborted) {
    return;
  }

  await new Promise<void>((resolve) => {
    const handleAbort = () => {
      clearTimeout(timeoutId);
      signal?.removeEventListener("abort", handleAbort);
      resolve();
    };

    const timeoutId = setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve();
    }, ms);

    signal?.addEventListener("abort", handleAbort, { once: true });
  });
}

function serializeChatStreamEvent(event: ChatStreamEvent) {
  return streamEncoder.encode(`${JSON.stringify(event)}\n`);
}

export async function createBotReply(
  userMessage: string,
  previousMemory?: AtlasMemory,
  previousContext?: UserContext,
  history?: AtlasHistoryMessage[],
  signal?: AbortSignal,
) {
  const localReply = createReply(
    userMessage,
    previousMemory,
    previousContext,
  );

  try {
    const answer = await generateAtlasAnswer({
      context: localReply.context,
      history,
      memory: previousMemory,
      message: userMessage,
      platformKnowledge,
      signal,
      topic: localReply.topic,
    });

    return {
      ...localReply,
      answer,
      engine: "openrouter" as const,
      memory: {
        ...localReply.memory,
        lastBotAnswer: answer,
      },
    };
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }

    console.warn(
      "Atlas OpenRouter fallback:",
      error instanceof Error ? error.message : "unknown error",
    );

    return {
      ...localReply,
      engine: "openrouter-fallback" as const,
    };
  }
}

export async function createBotResponse(
  userMessage: string,
  previousMemory?: AtlasMemory,
  previousContext?: UserContext,
  history?: AtlasHistoryMessage[],
  signal?: AbortSignal,
) {
  const reply = await createBotReply(
    userMessage,
    previousMemory,
    previousContext,
    history,
    signal,
  );
  const answerChunks = splitReplyIntoChunks(reply.answer);

  return new Response(
    new ReadableStream({
      start(controller) {
        let isClosed = false;

        const closeStream = () => {
          if (isClosed) {
            return;
          }

          isClosed = true;
          controller.close();
        };

        const handleAbort = () => {
          closeStream();
        };

        signal?.addEventListener("abort", handleAbort, { once: true });

        void (async () => {
          try {
            for (const chunk of answerChunks) {
              if (signal?.aborted || isClosed) {
                return;
              }

              controller.enqueue(
                serializeChatStreamEvent({
                  text: chunk,
                  type: "delta",
                }),
              );

              await waitForNextChunk(getChunkDelay(chunk), signal);
            }

            if (signal?.aborted || isClosed) {
              return;
            }

            controller.enqueue(
              serializeChatStreamEvent({
                reply,
                type: "final",
              }),
            );
          } catch (error) {
            if (!isClosed && !signal?.aborted) {
              isClosed = true;
              controller.error(error);
            }
          } finally {
            signal?.removeEventListener("abort", handleAbort);
            closeStream();
          }
        })();
      },
    }),
    {
      headers: {
        "Cache-Control": "no-cache, no-transform",
        "Content-Type": "application/x-ndjson; charset=utf-8",
      },
    },
  );
}
