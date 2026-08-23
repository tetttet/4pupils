"use client";

import React, { useMemo, useRef } from "react";
import { useInView } from "motion/react";
import { AnimatedNumber } from "@/components/motion-primitives/animated-number";
import { BookOpenCheck, CalendarDays, Layers3 } from "lucide-react";

type AnimatedNumberInViewProps = {
  number: number;
  duration?: number;
  className?: string;
};

function AnimatedNumberInView({
  number,
  duration = 2200,
  className,
}: AnimatedNumberInViewProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { amount: 0.35, once: true });

  const value = useMemo(() => (isInView ? number : 0), [isInView, number]);

  return (
    <div
      ref={ref}
      className="relative inline-flex items-baseline justify-center"
    >
      <span className={`${className ?? ""} ${isInView ? "opacity-0" : ""}`}>
        {number.toLocaleString("ru-RU")}
      </span>
      <span
        aria-hidden="true"
        className={`absolute inset-0 ${isInView ? "opacity-100" : "opacity-0"}`}
      >
        <AnimatedNumber
          className={className}
          springOptions={{
            bounce: 0,
            duration,
          }}
          value={value}
        />
      </span>
    </div>
  );
}

type Stat = {
  value: string;
  label: string;
  description: string;
  suffix?: string;
  icon: React.ReactNode;
};

const stats: Stat[] = [
  {
    value: "2026",
    label: "Год основания",
    description:
      "Год запуска 4pupils — с идеей сделать образование ближе и доступнее для всех",
    icon: <CalendarDays className="h-5 w-5" />,
  },
  {
    value: "100",
    suffix: "+",
    label: "учебных взаимодействий",
    description:
      "Структурированные материалы, которые помогают изучать ключевые темы шаг за шагом.",
    icon: <BookOpenCheck className="h-5 w-5" />,
  },
  {
    value: "10",
    suffix: "+",
    label: "образовательных модулей",
    description:
      "Первые пользователи уже проходят обучение и помогают улучшать платформу.",
    icon: <Layers3 className="h-5 w-5" />,
  },
];

function toNumber(val: string) {
  const onlyDigits = val.replace(/[^\d]/g, "");
  return Number(onlyDigits || 0);
}

export default function CountDown() {
  const prepared = useMemo(
    () =>
      stats.map((s) => ({
        ...s,
        numeric: toNumber(s.value),
      })),
    [],
  );

  return (
    <section className="relative overflow-hidden bg-transparent">
      <div className="pointer-events-none absolute -right-40 bottom-10 size-[460px] rounded-full bg-[#ECEFFF] blur-3xl" />

      <div className="relative mx-auto max-w-[1200px] px-4 pb-20 pt-8 sm:px-5 sm:pb-24 sm:pt-12 lg:pb-28 lg:pt-10">
        <div className="grid items-end gap-5 md:grid-cols-[0.95fr_1.05fr] md:gap-10">
          <h2 className="max-w-[10ch] text-[36px] font-medium leading-[1.04] tracking-[-0.045em] text-[#202858] sm:text-[44px] lg:text-[52px]">
            4Pupils в цифрах
          </h2>

          <p className="max-w-[58ch] text-[14px] leading-7 text-[#68719B] sm:text-[15px] md:justify-self-end">
            Мы создаём удобную образовательную платформу, где ученики находят
            своего преподавателя, а репетиторы строят карьеру в образовании с
            первых дней работы с нами.
          </p>
        </div>

        <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-12">
          {prepared.map((s, index) => {
            const isPrimary = index === 1;

            return (
              <div
                key={s.label}
                className={`group relative flex min-h-[290px] flex-col overflow-hidden rounded-[28px] border p-6 transition duration-500 hover:-translate-y-1 sm:min-h-[310px] sm:rounded-[32px] sm:p-8 ${
                  index === 0
                    ? "border-white bg-white text-[#202858] shadow-[0_12px_36px_rgba(35,48,103,0.055)] md:col-span-2 xl:col-span-4"
                    : isPrimary
                      ? "border-[#5D75CB] bg-[#5D75CB] text-white shadow-[0_18px_40px_rgba(93,117,203,0.2)] xl:col-span-5"
                      : "border-[#D7DDF8] bg-[#ECEFFF] text-[#202858] xl:col-span-3"
                }`}
              >
                <div
                  className={`absolute -bottom-24 -right-20 size-64 rounded-full border-[54px] border-current opacity-[0.055] transition-transform duration-700 group-hover:scale-110 ${
                    isPrimary ? "text-white" : "text-[#5D75CB]"
                  }`}
                />
                <div
                  className={`relative grid size-11 place-items-center rounded-full sm:size-12 ${
                    isPrimary
                      ? "bg-white text-[#5D75CB]"
                      : "bg-[#F7F8FF] text-[#4C63B8]"
                  }`}
                >
                  {s.icon}
                </div>

                <div className="relative mt-8 flex items-start gap-1 sm:mt-10">
                  <AnimatedNumberInView
                    number={s.numeric}
                    duration={2400}
                    className="text-[48px] font-medium leading-[0.92] tracking-[-0.055em] sm:text-[58px]"
                  />
                  {s.suffix ? (
                    <span
                      className={`text-[28px] font-medium leading-none sm:text-[34px] ${
                        isPrimary ? "text-white/90" : "text-[#5D75CB]"
                      }`}
                    >
                      {s.suffix}
                    </span>
                  ) : null}
                </div>

                <div
                  className={`relative mt-3 max-w-[22ch] text-[15px] font-medium leading-5 sm:text-[16px] ${
                    isPrimary ? "text-white/85" : "text-[#3F4568]"
                  }`}
                >
                  {s.label}
                </div>

                <p
                  className={`relative mt-auto max-w-[46ch] pt-7 text-[12px] leading-5 sm:text-[13px] sm:leading-6 ${
                    isPrimary ? "text-white/70" : "text-[#68719B]"
                  }`}
                >
                  {s.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
