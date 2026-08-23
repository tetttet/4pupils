"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { brand } from "@/lib/brand";

const outcomes = [
  {
    number: "01",
    title: "Для учеников",
    text: "Найти своего преподавателя и уверенно двигаться к результату.",
  },
  {
    number: "02",
    title: "Для преподавателей",
    text: "Развивать практику, создавать курсы и строить карьеру в образовании.",
  },
];

export default function Hero() {
  const reduceMotion = useReducedMotion();
  const enter = reduceMotion
    ? { duration: 0 }
    : { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <section
      aria-labelledby="team-introduction-title"
      className="relative overflow-hidden bg-[#F3F5FF]"
    >
      <div className="pointer-events-none absolute -left-40 top-16 size-[420px] rounded-full bg-[#E2E7FF] blur-3xl" />
      <div className="relative mx-auto max-w-[1200px] px-4 pb-10 pt-2 sm:px-5 sm:pb-14 sm:pt-4 lg:pb-20">
        <div className="relative isolate overflow-hidden rounded-[28px] bg-white p-2 shadow-[0_18px_60px_rgba(35,48,103,0.08)] sm:rounded-[36px] sm:p-3">
          <div className="grid min-h-[680px] gap-2 lg:grid-cols-[1.18fr_0.82fr] lg:gap-3">
            <div className="relative flex flex-col overflow-hidden rounded-[22px] px-5 pb-6 pt-7 sm:rounded-[28px] sm:px-8 sm:pb-8 sm:pt-9 lg:px-10 lg:pb-10 lg:pt-11">
              <div className="pointer-events-none absolute -bottom-52 -left-28 size-[560px] rounded-full border-[82px] border-[#ECEFFF] opacity-90" />
              <div className="pointer-events-none absolute -bottom-24 left-36 size-56 rounded-full border-[42px] border-[#F7F8FF]" />

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={enter}
                className="relative inline-flex w-fit items-center gap-2 rounded-full border border-[#D7DDF8] bg-[#F7F8FF] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#4C63B8] sm:text-[12px]"
              >
                <Sparkles aria-hidden="true" className="size-3.5" />
                О платформе · 01
              </motion.div>

              <motion.h1
                id="team-introduction-title"
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...enter, delay: reduceMotion ? 0 : 0.08 }}
                className="relative mt-8 max-w-[11ch] text-[44px] font-medium leading-[0.98] tracking-[-0.055em] text-[#202858] sm:text-[58px] lg:text-[66px] xl:text-[72px]"
              >
                Мы создаём открытую платформу для{" "}
                <span className="text-[#5D75CB]">сильного образования.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...enter, delay: reduceMotion ? 0 : 0.16 }}
                className="relative mt-6 max-w-[57ch] text-[14px] leading-7 text-[#68719B] sm:text-[16px]"
              >
                {brand.name} соединяет учеников и преподавателей в понятной,
                современной среде — без лишних барьеров между желанием учиться
                и возможностью расти.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...enter, delay: reduceMotion ? 0 : 0.24 }}
                className="relative mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
              >
                <Link
                  className="group inline-flex h-13 w-fit items-center gap-3 rounded-full bg-[#233067] pl-6 pr-2 text-[14px] font-medium text-white shadow-[0_12px_28px_rgba(35,48,103,0.2)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#19224C] hover:shadow-[0_16px_34px_rgba(35,48,103,0.26)]"
                  href="#mission"
                >
                  Наша миссия
                  <span className="grid size-9 place-items-center rounded-full bg-white text-[#233067] transition-transform duration-300 group-hover:rotate-6">
                    <ArrowDown aria-hidden="true" className="size-4" />
                  </span>
                </Link>

                <Link
                  className="inline-flex h-13 w-fit items-center gap-2 rounded-full border border-[#D7DDF8] bg-white px-5 text-[14px] font-medium text-[#202858] transition duration-300 hover:-translate-y-0.5 hover:border-[#B8C2EF] hover:bg-[#F7F8FF]"
                  href="/workspace/company"
                >
                  Для компаний
                  <ArrowUpRight aria-hidden="true" className="size-4 text-[#5D75CB]" />
                </Link>
              </motion.div>

              <div className="relative mt-auto flex items-end justify-between gap-6 border-t border-[#D7DDF8] pt-6">
                <p className="max-w-[31ch] text-[11px] leading-5 text-[#7A82A8] sm:text-[12px]">
                  Образование, в котором технологии поддерживают человека, а не
                  заменяют его.
                </p>
                <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5D75CB]">
                  4P / 2026
                </span>
              </div>
            </div>

            <motion.aside
              initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...enter, delay: reduceMotion ? 0 : 0.12 }}
              className="group relative isolate flex min-h-[560px] flex-col overflow-hidden rounded-[22px] bg-[#5D75CB] p-6 text-white sm:rounded-[28px] sm:p-8 lg:min-h-full lg:p-9"
            >
              <div className="pointer-events-none absolute -right-40 -top-40 -z-10 size-[430px] rounded-full border-[74px] border-white opacity-[0.07] transition-transform duration-700 group-hover:scale-105" />
              <div className="pointer-events-none absolute -bottom-28 -left-28 -z-10 size-[300px] rounded-full border-[56px] border-[#202858] opacity-[0.09]" />

              <div className="flex items-center justify-between gap-4 border-b border-white/20 pb-5">
                <span className="text-[12px] font-semibold uppercase tracking-[0.13em] text-white/70">
                  {brand.name}
                </span>
                <span className="grid size-10 place-items-center rounded-full bg-white text-[#5D75CB]">
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </span>
              </div>

              <div className="my-auto py-10">
                <p className="max-w-[12ch] text-[34px] font-medium leading-[1.04] tracking-[-0.04em] sm:text-[42px] lg:text-[46px]">
                  Знания становятся ценными, когда ими удобно делиться.
                </p>
              </div>

              <div className="grid gap-3">
                {outcomes.map((item) => (
                  <div
                    className="rounded-[20px] border border-white/15 bg-white/[0.09] p-4 backdrop-blur-sm transition duration-300 hover:bg-white/[0.14] sm:p-5"
                    key={item.number}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-semibold tracking-[0.12em] text-white/55">
                        {item.number}
                      </span>
                      <h2 className="text-[14px] font-medium sm:text-[15px]">
                        {item.title}
                      </h2>
                    </div>
                    <p className="mt-2 pl-8 text-[12px] leading-5 text-white/68 sm:text-[13px]">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </motion.aside>
          </div>
        </div>
      </div>
    </section>
  );
}
