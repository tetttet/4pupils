"use client";
import React, { useState } from "react";
import { Plus } from "lucide-react";

type FAQItem = {
  id: number;
  question: string;
  answer: string;
};

const faqItems: FAQItem[] = [
  {
    id: 1,
    question: "Как создать страницу на 4Pupils?",
    answer:
      "Запуск начинается с простой настройки страницы компании: вы добавляете название, описание, оформляете пространство в стиле бренда и размещаете свои программы. После этого можно загрузить готовые курсы или собрать новые прямо на платформе и сразу открыть доступ нужной аудитории.",
  },
  {
    id: 2,
    question: "Нужны ли технические знания для старта?",
    answer:
      "Нет, для старта не нужна отдельная команда разработки или технический специалист. Платформа рассчитана на быстрый и понятный запуск: основные действия выполняются через готовый интерфейс, поэтому можно сосредоточиться на содержании обучения, а не на сложной настройке.",
  },
  {
    id: 3,
    question: "Как проходит обучение?",
    answer:
      "Обучение проходит онлайн в едином пространстве 4Pupils. Сотрудники, клиенты или партнёры получают доступ к назначенным программам, проходят уроки в удобном темпе, возвращаются к материалам и двигаются по обучению в понятной структуре.",
  },
  {
    id: 4,
    question: "Можно ли сделать курсы платными для внешней аудитории?",
    answer:
      "Да, на платформе можно размещать как бесплатные, так и платные курсы. Это удобно, если вы хотите одновременно развивать внутреннее обучение для команды и запускать внешние образовательные продукты для клиентов, партнёров или широкой аудитории.",
  },
  {
    id: 5,
    question: "Есть ли бесплатный пробный период?",
    answer:
      "Да, начать можно бесплатно в течение первых 3 месяцев. Этого времени обычно достаточно, чтобы собрать страницу компании, загрузить первые программы, пригласить участников и спокойно проверить платформу на реальных задачах.",
  },
  {
    id: 6,
    question: "Как отслеживать прогресс сотрудников?",
    answer:
      "В 4Pupils можно видеть прогресс по сотрудникам, группам и отдельным программам: кто начал обучение, кто продвигается по курсу, а кому нужна поддержка. Это помогает руководителям и HR-командам быстро понимать общую картину без таблиц, ручных отчётов и лишней операционной нагрузки.",
  },
  {
    id: 7,
    question: "Можно ли обучать не только сотрудников, но и клиентов или партнёров?",
    answer:
      "Да, платформа подходит и для внутреннего, и для внешнего обучения. Вы можете в одном пространстве запускать онбординг сотрудников, обучающие программы для отделов, а также отдельные курсы для клиентов, партнёров и других внешних аудиторий.",
  },
  {
    id: 8,
    question: "Можно ли загрузить готовые материалы и курсы?",
    answer:
      "Да, не обязательно начинать с нуля. Если у вас уже есть готовые материалы, инструкции, уроки или учебные модули, их можно использовать как основу и постепенно собрать из них полноценную образовательную витрину компании.",
  },
];

export default function WorkSpaceFaq() {
  const [openId, setOpenId] = useState<number>(1);

  const toggleItem = (id: number) => {
    setOpenId((prev) => (prev === id ? 0 : id));
  };

  return (
    <section className="min-h-screen bg-[#171717] px-4 py-10 text-white md:px-8 lg:px-12">
      <div className="mx-auto max-w-[1180px] mb-10">
        <h2 className="mb-4 text-center text-[34px] font-normal leading-none tracking-[-0.04em] text-white md:text-[56px]">
          Отвечаем на вопросы
        </h2>

        <p className="mx-auto mb-8 max-w-[760px] text-center text-[16px] leading-[1.35] tracking-[-0.03em] text-white/60 md:mb-12 md:text-[20px]">
          Собрали самые частые вопросы о запуске корпоративной страницы,
          внутренних программах, внешних курсах и аналитике обучения на
          4Pupils.
        </p>

        <div className="mx-auto overflow-hidden rounded-[28px] bg-[#2d2d2d]">
          {faqItems.map((item, index) => {
            const isOpen = openId === item.id;

            return (
              <div
                key={item.id}
                className={
                  index !== faqItems.length - 1
                    ? "border-b border-black/35"
                    : ""
                }
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="flex w-full items-center justify-between gap-4 px-7 py-4 text-left transition-colors duration-200 hover:bg-white/[0.02] md:px-8 md:py-6"
                >
                  <span className="text-[18px] font-normal leading-[1.15] tracking-[-0.03em] text-white md:text-[24px]">
                    {item.question}
                  </span>

                  <span className="flex h-10 w-10 shrink-0 items-center justify-center text-white/55">
                    <Plus
                      className={`h-8 w-8 stroke-[1.5] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        isOpen ? "rotate-45" : "rotate-0"
                      }`}
                    />
                  </span>
                </button>

                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-black/35 px-7 py-8 md:px-8 md:py-9">
                      <p className="max-w-[900px] text-[16px] font-normal leading-[1.35] tracking-[-0.03em] text-white/60 md:text-[20px]">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
