"use client";

import React, { useMemo, useRef } from "react";
import { useInView } from "motion/react";
import { AnimatedNumber } from "@/components/motion-primitives/animated-number";
import H2Text from "../text/h2-text";
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
    <div ref={ref} className="inline-flex items-baseline justify-center">
      <AnimatedNumber
        className={className}
        springOptions={{
          bounce: 0,
          duration,
        }}
        value={value}
      />
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
    <section className="relative overflow-hidden bg-white">
      {/* background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-10 h-72 w-72 rounded-full bg-[rgba(var(--frontier-home-primary-rgb),0.10)] blur-3xl" />
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-[rgba(var(--frontier-home-primary-strong-rgb),0.08)] blur-3xl" />

        {/* grid */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `
          linear-gradient(rgba(var(--frontier-home-primary-rgb),0.20) 1px, transparent 1px),
          linear-gradient(90deg, rgba(var(--frontier-home-primary-rgb),0.20) 1px, transparent 1px)
        `,
            backgroundSize: "34px 34px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
        <div className="grid items-center gap-10 lg:grid-cols-[420px_1fr] lg:gap-14">
          {/* left */}
          <div className="text-left">
            <H2Text
              title="4Pupils в цифрах"
              className="mt-5! mb-0! text-3xl! text-[var(--frontier-home-ink)]! sm:text-4xl! lg:text-5xl!"
            />

            <p className="mt-5 max-w-[42ch] text-sm leading-7 text-[var(--frontier-home-ink-muted)] sm:text-[15px]">
              Мы создаём удобную образовательную платформу, где ученики находят
своего преподавателя, а репетиторы строят карьеру в образовании с
первых дней работы с нами.
            </p>
          </div>

          {/* right */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {prepared.map((s) => (
              <div
                key={s.label}
                className="group relative overflow-hidden rounded-3xl border border-[rgba(var(--frontier-home-border-rgb),0.85)] bg-white/90 p-6 shadow-[0_10px_40px_rgba(var(--frontier-home-primary-deep-rgb),0.08)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(var(--frontier-home-primary-deep-rgb),0.16)]"
              >
                {/* top accent */}
                <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-[var(--frontier-home-primary)] to-[var(--frontier-home-primary-strong)]" />

                {/* card glow */}
                <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[rgba(var(--frontier-home-primary-rgb),0.10)] blur-2xl transition duration-300 group-hover:bg-[rgba(var(--frontier-home-primary-rgb),0.16)]" />

                <div className="relative mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(var(--frontier-home-primary-rgb),0.10)] text-[var(--frontier-home-primary-deep)]">
                  {s.icon}
                </div>

                <div className="relative flex items-end gap-1">
                  <AnimatedNumberInView
                    number={s.numeric}
                    duration={2400}
                    className="text-[34px] font-extrabold leading-none tracking-tight text-[var(--frontier-home-ink)] sm:text-[38px] lg:text-[42px]"
                  />
                  {s.suffix ? (
                    <span className="pb-1 text-[22px] font-extrabold leading-none text-[var(--frontier-home-primary)] sm:text-[24px]">
                      {s.suffix}
                    </span>
                  ) : null}
                </div>

                <div className="relative mt-3 max-w-[18ch] text-sm font-medium leading-6 text-[var(--frontier-home-ink-muted)] sm:text-[15px]">
                  {s.label}
                </div>

                <div className="relative mt-5 h-px w-full bg-linear-to-r from-[rgba(var(--frontier-home-primary-rgb),0.22)] via-[rgba(var(--frontier-home-primary-deep-rgb),0.06)] to-transparent" />

                <p className="relative mt-4 text-xs leading-6 text-[var(--frontier-home-ink-muted)] sm:text-[13px]">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
