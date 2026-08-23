"use client";

import {
  ArrowUpRight,
  BarChart3,
  Building2,
  Check,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useState } from "react";

type TabKey = "hr" | "leaders" | "companies";

const tabContent: Record<
  TabKey,
  {
    label: string;
    eyebrow: string;
    title: string;
    description: string;
    points: string[];
    metric: string;
    metricLabel: string;
  }
> = {
  hr: {
    label: "HR и L&D",
    eyebrow: "Для HR и L&D",
    title: "Запускайте обучение без лишней операционной нагрузки.",
    description:
      "Соберите онбординг, внутренние курсы и базу знаний в одном понятном пространстве.",
    points: [
      "Программы для команд и отдельных сотрудников",
      "Единая структура материалов и доступов",
      "Прогресс участников без ручных таблиц",
    ],
    metric: "82%",
    metricLabel: "команды завершили онбординг",
  },
  leaders: {
    label: "Руководителям",
    eyebrow: "Для руководителей",
    title: "Видите развитие команды и поддерживайте его вовремя.",
    description:
      "Управляйте программами, сроками и вовлечённостью без лишней координации.",
    points: [
      "Понятный статус по каждой программе",
      "Общая картина по отделам и группам",
      "Масштабирование успешных сценариев",
    ],
    metric: "24",
    metricLabel: "активные учебные программы",
  },
  companies: {
    label: "Компаниям",
    eyebrow: "Для компаний",
    title: "Создайте образовательное пространство под своим брендом.",
    description:
      "Обучайте сотрудников, клиентов и партнёров на одной современной платформе.",
    points: [
      "Корпоративная страница в стиле бренда",
      "Внутренние и внешние курсы вместе",
      "Гибкий рост от пилота до всей компании",
    ],
    metric: "3 мес.",
    metricLabel: "бесплатно для спокойного старта",
  },
};

const audienceIcons = {
  hr: UsersRound,
  leaders: BarChart3,
  companies: Building2,
};

export default function CorporatePlatformLanding() {
  const [activeTab, setActiveTab] = useState<TabKey>("hr");
  const reduceMotion = useReducedMotion();
  const current = tabContent[activeTab];

  return (
    <>
      <section className="relative overflow-hidden bg-[#F3F5FF]">
        <div className="pointer-events-none absolute -left-48 top-16 size-[480px] rounded-full bg-[#E2E7FF] blur-3xl" />
        <div className="pointer-events-none absolute -right-52 bottom-4 size-[460px] rounded-full bg-[#E7EBFF] blur-3xl" />

        <div className="relative mx-auto max-w-[1200px] px-4 pb-12 pt-2 sm:px-5 sm:pb-16 sm:pt-4 lg:pb-20">
          <div className="overflow-hidden rounded-[28px] bg-white p-2 shadow-[0_18px_60px_rgba(35,48,103,0.08)] sm:rounded-[36px] sm:p-3">
            <div className="grid min-h-[650px] gap-2 lg:grid-cols-[1.12fr_0.88fr] lg:gap-3">
              <div className="relative isolate flex flex-col overflow-hidden rounded-[22px] bg-[#FBFCFF] px-5 pb-6 pt-7 sm:rounded-[28px] sm:px-8 sm:pb-8 sm:pt-9 lg:px-10 lg:pb-10 lg:pt-11">
                <div className="pointer-events-none absolute -bottom-56 -left-40 -z-10 size-[620px] rounded-full border-[86px] border-[#ECEFFF]" />
                <div className="pointer-events-none absolute -bottom-24 left-40 -z-10 size-56 rounded-full border-[42px] border-[#F4F6FF]" />

                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.6 }}
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-[#D7DDF8] bg-white px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#4C63B8] sm:text-[12px]"
                >
                  <Sparkles aria-hidden="true" className="size-3.5" />
                  4Pupils для бизнеса
                </motion.div>

                <motion.h1
                  initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.72,
                    delay: reduceMotion ? 0 : 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="mt-8 max-w-[12ch] text-[43px] font-medium leading-[0.98] tracking-[-0.055em] text-[#202858] sm:text-[56px] lg:text-[64px] xl:text-[70px]"
                >
                  Развивайте людей. Собирайте знания.{" "}
                  <span className="text-[#5D75CB]">Растите вместе.</span>
                </motion.h1>

                <motion.p
                  initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.65,
                    delay: reduceMotion ? 0 : 0.16,
                  }}
                  className="mt-6 max-w-[55ch] text-[14px] leading-7 text-[#68719B] sm:text-[16px]"
                >
                  Корпоративная платформа, где обучение сотрудников, клиентов
                  и партнёров становится понятной частью роста компании.
                </motion.p>

                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.65,
                    delay: reduceMotion ? 0 : 0.24,
                  }}
                  className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
                >
                  <Link
                    className="group inline-flex h-13 w-fit items-center gap-3 rounded-full bg-[#233067] pl-6 pr-2 text-[14px] font-medium text-white shadow-[0_12px_28px_rgba(35,48,103,0.2)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#19224C]"
                    href="/auth/sign-up"
                  >
                    Создать пространство
                    <span className="grid size-9 place-items-center rounded-full bg-white text-[#233067] transition-transform duration-300 group-hover:rotate-6">
                      <ArrowUpRight aria-hidden="true" className="size-4" />
                    </span>
                  </Link>
                  <Link
                    className="inline-flex h-13 w-fit items-center gap-2 rounded-full border border-[#D7DDF8] bg-white px-5 text-[14px] font-medium text-[#202858] transition duration-300 hover:-translate-y-0.5 hover:border-[#B8C2EF] hover:bg-[#F7F8FF]"
                    href="/courses"
                  >
                    Смотреть курсы
                    <ArrowUpRight aria-hidden="true" className="size-4 text-[#5D75CB]" />
                  </Link>
                </motion.div>

                <div className="mt-auto grid grid-cols-2 gap-4 pt-6 sm:flex sm:items-end sm:justify-between sm:gap-8">
                  <div>
                    <p className="text-[22px] font-medium tracking-[-0.04em] text-[#202858] sm:text-[26px]">
                      3 месяца
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-[#7A82A8] sm:text-[12px]">
                      бесплатного старта
                    </p>
                  </div>
                  <div>
                    <p className="text-[22px] font-medium tracking-[-0.04em] text-[#202858] sm:text-[26px]">
                      1 пространство
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-[#7A82A8] sm:text-[12px]">
                      для всех форматов обучения
                    </p>
                  </div>
                </div>
              </div>

              <motion.aside
                initial={
                  reduceMotion ? false : { opacity: 0, scale: 0.97, y: 10 }
                }
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.7,
                  delay: reduceMotion ? 0 : 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group relative isolate flex min-h-[570px] flex-col overflow-hidden rounded-[22px] bg-[#5D75CB] p-6 text-white sm:rounded-[28px] sm:p-8 lg:min-h-full lg:p-9"
              >
                <div className="pointer-events-none absolute -right-36 -top-36 -z-10 size-[410px] rounded-full border-[70px] border-white opacity-[0.07] transition-transform duration-700 group-hover:scale-105" />
                <div className="pointer-events-none absolute -bottom-28 -left-28 -z-10 size-[300px] rounded-full border-[56px] border-[#202858] opacity-[0.1]" />

                <div className="flex items-center justify-between border-b border-white/20 pb-5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">
                      Learning workspace
                    </p>
                    <p className="mt-1 text-[14px] font-medium">Обучение команды</p>
                  </div>
                  <span className="grid size-10 place-items-center rounded-full bg-white text-[#5D75CB]">
                    <BarChart3 aria-hidden="true" className="size-[17px]" />
                  </span>
                </div>

                <div className="my-auto py-8">
                  <p className="text-[12px] font-medium text-white/65">
                    Общий прогресс
                  </p>
                  <div className="mt-3 flex items-end justify-between gap-4">
                    <p className="text-[54px] font-medium leading-none tracking-[-0.06em] sm:text-[66px]">
                      78%
                    </p>
                    <p className="pb-1 text-right text-[11px] leading-5 text-white/60">
                      +12% за месяц
                      <br />
                      186 участников
                    </p>
                  </div>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
                    <div className="h-full w-[78%] rounded-full bg-white" />
                  </div>
                </div>

                <div className="grid gap-3">
                  {[
                    ["Онбординг новых сотрудников", "82%", "bg-[#C7D2FF]"],
                    ["Продажи для B2B", "68%", "bg-white"],
                    ["Работа с клиентами", "54%", "bg-[#202858]"],
                  ].map(([title, progress, color]) => (
                    <div
                      className="rounded-[18px] border border-white/15 bg-white/[0.09] p-4 backdrop-blur-sm"
                      key={title}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className={`size-2.5 shrink-0 rounded-full ${color}`} />
                          <p className="truncate text-[12px] font-medium sm:text-[13px]">
                            {title}
                          </p>
                        </div>
                        <span className="text-[11px] text-white/60">{progress}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.aside>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#F3F5FF] py-16 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-5">
          <div className="grid gap-5 border-t border-[#D7DDF8] pt-6 md:grid-cols-[0.34fr_0.66fr] md:gap-10 lg:pt-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#5D75CB] sm:text-[12px]">
              Для каждой задачи
            </p>
            <div>
              <h2 className="max-w-[18ch] text-[34px] font-medium leading-[1.08] tracking-[-0.045em] text-[#202858] sm:text-[44px] lg:text-[52px]">
                Один продукт. Разные сценарии роста.
              </h2>
              <p className="mt-5 max-w-[62ch] text-[14px] leading-7 text-[#68719B] sm:text-[15px]">
                Настройте пространство под процессы своей компании — от
                адаптации новичков до обучения клиентов и партнёров.
              </p>
            </div>
          </div>

          <div
            aria-label="Сценарии корпоративного обучения"
            className="mt-10 grid gap-2 rounded-[22px] border border-white bg-white p-2 shadow-[0_12px_36px_rgba(35,48,103,0.05)] sm:grid-cols-3 sm:rounded-[26px]"
            role="tablist"
          >
            {(Object.keys(tabContent) as TabKey[]).map((key) => {
              const Icon = audienceIcons[key];
              const isActive = activeTab === key;

              return (
                <button
                  aria-controls="corporate-audience-panel"
                  aria-selected={isActive}
                  className={`flex min-h-14 items-center justify-center gap-2.5 rounded-[16px] px-4 text-[13px] font-medium transition duration-300 sm:min-h-16 sm:text-[14px] ${
                    isActive
                      ? "bg-[#233067] text-white shadow-[0_10px_24px_rgba(35,48,103,0.16)]"
                      : "text-[#68719B] hover:bg-[#F7F8FF] hover:text-[#202858]"
                  }`}
                  id={`corporate-tab-${key}`}
                  key={key}
                  onClick={() => setActiveTab(key)}
                  role="tab"
                  type="button"
                >
                  <Icon aria-hidden="true" className="size-4" />
                  {tabContent[key].label}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              aria-labelledby={`corporate-tab-${activeTab}`}
              className="mt-5 grid overflow-hidden rounded-[28px] bg-white shadow-[0_18px_48px_rgba(35,48,103,0.065)] lg:grid-cols-[1fr_0.78fr]"
              id="corporate-audience-panel"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              key={activeTab}
              role="tabpanel"
              transition={{ duration: reduceMotion ? 0 : 0.28 }}
            >
              <div className="p-6 sm:p-8 lg:p-10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5D75CB]">
                  {current.eyebrow}
                </p>
                <h3 className="mt-5 max-w-[17ch] text-[30px] font-medium leading-[1.06] tracking-[-0.04em] text-[#202858] sm:text-[38px]">
                  {current.title}
                </h3>
                <p className="mt-5 max-w-[55ch] text-[14px] leading-7 text-[#68719B] sm:text-[15px]">
                  {current.description}
                </p>

                <ul className="mt-7 grid gap-3">
                  {current.points.map((point) => (
                    <li className="flex items-start gap-3" key={point}>
                      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[#ECEFFF] text-[#4C63B8]">
                        <Check aria-hidden="true" className="size-3.5" strokeWidth={2.2} />
                      </span>
                      <span className="text-[13px] leading-6 text-[#3F4568] sm:text-[14px]">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative isolate flex min-h-[320px] flex-col justify-between overflow-hidden bg-[#202858] p-6 text-white sm:p-8 lg:p-10">
                <div className="pointer-events-none absolute -bottom-40 -right-32 -z-10 size-[400px] rounded-full border-[70px] border-[#5D75CB] opacity-35" />
                <div className="flex items-center justify-between border-b border-white/15 pb-5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-white/50">
                    Эффект
                  </span>
                  <span className="grid size-9 place-items-center rounded-full bg-white/10">
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </span>
                </div>
                <div className="py-10">
                  <p className="text-[56px] font-medium leading-none tracking-[-0.06em] sm:text-[68px]">
                    {current.metric}
                  </p>
                  <p className="mt-4 max-w-[22ch] text-[16px] leading-6 text-white/65 sm:text-[18px]">
                    {current.metricLabel}
                  </p>
                </div>
                <p className="text-[11px] leading-5 text-white/45">
                  Пример того, как обучение становится видимым и управляемым.
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}
