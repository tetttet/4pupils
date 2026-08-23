"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

type FAQItem = {
  id: number;
  question: string;
  answer: string;
};

const faqItems: FAQItem[] = [
  {
    id: 1,
    question: "Как создать страницу компании на 4Pupils?",
    answer:
      "Добавьте название и описание компании, оформите пространство в стиле бренда и разместите свои программы. Затем можно загрузить готовые курсы или собрать новые прямо на платформе и открыть доступ нужной аудитории.",
  },
  {
    id: 2,
    question: "Нужны ли технические знания для старта?",
    answer:
      "Нет. Основные действия выполняются через готовый интерфейс, поэтому отдельная команда разработки или технический специалист для запуска не нужны.",
  },
  {
    id: 3,
    question: "Как проходит обучение?",
    answer:
      "Участники получают доступ к назначенным программам, проходят уроки в удобном темпе, возвращаются к материалам и двигаются по понятной учебной структуре.",
  },
  {
    id: 4,
    question: "Можно ли сделать курсы платными для внешней аудитории?",
    answer:
      "Да. В одном пространстве можно развивать внутреннее обучение и запускать внешние образовательные продукты для клиентов, партнёров или широкой аудитории.",
  },
  {
    id: 5,
    question: "Есть ли бесплатный пробный период?",
    answer:
      "Да, первые 3 месяца доступны бесплатно. За это время можно собрать страницу, загрузить первые программы, пригласить участников и проверить платформу на реальных задачах.",
  },
  {
    id: 6,
    question: "Как отслеживать прогресс сотрудников?",
    answer:
      "В платформе виден прогресс по сотрудникам, группам и отдельным программам: кто начал обучение, кто продвигается по курсу, а кому нужна поддержка.",
  },
  {
    id: 7,
    question: "Можно ли обучать клиентов и партнёров?",
    answer:
      "Да. Платформа подходит и для внутреннего, и для внешнего обучения: онбординга сотрудников, программ для отделов, а также курсов для клиентов и партнёров.",
  },
  {
    id: 8,
    question: "Можно ли загрузить готовые материалы?",
    answer:
      "Да. Существующие инструкции, уроки и учебные модули можно использовать как основу и постепенно собрать из них полноценную образовательную витрину компании.",
  },
];

export default function WorkSpaceFaq() {
  const [openId, setOpenId] = useState<number>(1);

  return (
    <section className="relative overflow-hidden bg-[#F3F5FF] pb-28 pt-20 sm:pb-32 sm:pt-24 lg:pb-40 lg:pt-32">
      <div className="pointer-events-none absolute -left-64 top-16 size-[520px] rounded-full bg-[#E5E9FF] blur-3xl" />

      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-5">
        <div className="grid gap-5 border-t border-[#D7DDF8] pt-6 md:grid-cols-[0.34fr_0.66fr] md:gap-10 lg:pt-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#5D75CB] sm:text-[12px]">
            FAQ
          </p>
          <div>
            <h2 className="max-w-[18ch] text-[34px] font-medium leading-[1.08] tracking-[-0.045em] text-[#202858] sm:text-[44px] lg:text-[52px]">
              Коротко отвечаем на важные вопросы.
            </h2>
            <p className="mt-6 max-w-[61ch] text-[14px] leading-7 text-[#68719B] sm:text-[15px]">
              Всё о запуске корпоративной страницы, доступах, программах и
              аналитике обучения.
            </p>
          </div>
        </div>

        <div className="mt-12 overflow-hidden rounded-[28px] border border-white bg-white px-5 shadow-[0_16px_48px_rgba(35,48,103,0.06)] sm:rounded-[32px] sm:px-7 lg:px-9">
          {faqItems.map((item, index) => {
            const isOpen = openId === item.id;
            const answerId = `workspace-faq-answer-${item.id}`;
            const buttonId = `workspace-faq-button-${item.id}`;

            return (
              <div
                className={
                  index === faqItems.length - 1
                    ? ""
                    : "border-b border-[#E4E8FA]"
                }
                key={item.id}
              >
                <button
                  aria-controls={answerId}
                  aria-expanded={isOpen}
                  className="group flex w-full items-center justify-between gap-5 py-5 text-left sm:py-6"
                  id={buttonId}
                  onClick={() => setOpenId((current) => (current === item.id ? 0 : item.id))}
                  type="button"
                >
                  <span className="text-[17px] font-medium leading-[1.25] tracking-[-0.025em] text-[#202858] sm:text-[20px]">
                    {item.question}
                  </span>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#ECEFFF] text-[#4C63B8] transition duration-300 group-hover:bg-[#DDE3FF]">
                    <Plus
                      aria-hidden="true"
                      className={`size-[18px] transition-transform duration-300 ${
                        isOpen ? "rotate-45" : "rotate-0"
                      }`}
                    />
                  </span>
                </button>

                <div
                  aria-labelledby={buttonId}
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                  id={answerId}
                  role="region"
                >
                  <div className="overflow-hidden">
                    <p className="max-w-[850px] pb-6 pr-12 text-[13px] leading-6 text-[#68719B] sm:pb-7 sm:text-[15px] sm:leading-7">
                      {item.answer}
                    </p>
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
