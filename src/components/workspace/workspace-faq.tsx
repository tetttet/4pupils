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
    question: "Как проходит обучение?",
    answer: "Всё обучение в Практикуме проходит онлайн.",
  },
  {
    id: 2,
    question: "Сможет ли сотрудник совмещать учёбу с работой?",
    answer:
      "Да, программа рассчитана так, чтобы обучение можно было совмещать с работой. Материалы доступны онлайн, а нагрузка распределена удобно.",
  },
  {
    id: 3,
    question: "Можно ли кастомизировать курсы Практикума?",
    answer:
      "Да, в зависимости от задач компании программу можно адаптировать под нужный стек, уровень сотрудников и цели обучения.",
  },
  {
    id: 4,
    question: "Можно ли кастомизировать курсы Практикума?",
    answer:
      "Да, в зависимости от задач компании программу можно адаптировать под нужный стек, уровень сотрудников и цели обучения.",
  },
  {
    id: 5,
    question: "Можно ли кастомизировать курсы Практикума?",
    answer:
      "Да, в зависимости от задач компании программу можно адаптировать под нужный стек, уровень сотрудников и цели обучения.",
  },
  {
    id: 6,
    question: "Можно ли кастомизировать курсы Практикума?",
    answer:
      "Да, в зависимости от задач компании программу можно адаптировать под нужный стек, уровень сотрудников и цели обучения.",
  },
  {
    id: 7,
    question: "Можно ли кастомизировать курсы Практикума?",
    answer:
      "Да, в зависимости от задач компании программу можно адаптировать под нужный стек, уровень сотрудников и цели обучения.",
  },
  {
    id: 8,
    question: "Можно ли кастомизировать курсы Практикума?",
    answer:
      "Да, в зависимости от задач компании программу можно адаптировать под нужный стек, уровень сотрудников и цели обучения.",
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
        <h2 className="mb-14 text-center text-[34px] font-normal leading-none tracking-[-0.04em] text-white md:text-[56px]">
          Отвечаем на вопросы
        </h2>

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
