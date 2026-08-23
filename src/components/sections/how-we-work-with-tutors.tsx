"use client";

import React from "react";
import { motion } from "framer-motion";
import ButtonSend from "../ui/button-send";

type CardItem = {
  title: string;
  text: string;
};

const items: CardItem[] = [
  {
    title: "Проверяем профиль",
    text: "Мы проверяем корректность заполнения анкеты, соответствие описания стандартам платформы и достоверность информации.",
  },
  {
    title: "Собираем отзывы учеников",
    text: "Отслеживаем качество занятий на основе реальных отзывов учеников и учитываем их при продвижении репетитора в каталоге.",
  },
  {
    title: "Обновляем базу",
    text: "Оставляем лучших, добавляем новых — чтобы вы могли быстро найти репетитора, которому действительно можно доверять.",
  },
  {
    title: "Гарантируем безопасность",
    text: "Все взаимодействия на платформе проходят в безопасной среде — мы следим за соблюдением стандартов сервиса.",
  },
];

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M20 7L10 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.58,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

function FeatureCard({ item, index }: { item: CardItem; index: number }) {
  const wideLeft = index === 0 || index === 3;

  return (
    <motion.article
      variants={itemVariants}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={`group relative flex min-h-[250px] flex-col overflow-hidden rounded-[26px] border border-white/80 p-6 transition-shadow duration-300 sm:min-h-[270px] sm:rounded-[30px] sm:p-8 ${
        wideLeft ? "lg:col-span-5" : "lg:col-span-7"
      } ${index === 1 || index === 2 ? "bg-[#ECEFFF]" : "bg-white"}`}
    >
      <div className="absolute -bottom-20 -right-16 size-52 rounded-full border-[42px] border-[#5D75CB] opacity-[0.055] transition-transform duration-500 group-hover:scale-110" />

      <div className="relative grid size-12 place-items-center rounded-full bg-[#F7F8FF] text-[#5D75CB] shadow-[0_8px_22px_rgba(35,48,103,0.06)]">
        <CheckIcon className="size-6" />
      </div>

      <h3 className="relative mt-8 max-w-[24ch] text-[22px] font-medium leading-[1.08] tracking-[-0.035em] text-[#202858] sm:text-[26px]">
        {item.title}
      </h3>

      <p className="relative mt-auto max-w-[58ch] pt-5 text-[13px] leading-6 text-[#68719B] sm:text-[14px]">
        {item.text}
      </p>
    </motion.article>
  );
}

export default function HowWeWorkWithTutors() {
  return (
    <section className="relative overflow-hidden bg-transparent py-20 sm:py-24 lg:py-28">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-5">
        <div className="relative isolate overflow-hidden rounded-[30px] bg-[#233067] px-5 py-10 shadow-[0_24px_70px_rgba(35,48,103,0.18)] sm:rounded-[34px] sm:px-9 sm:py-14 lg:px-12 lg:py-16">
          <div className="pointer-events-none absolute -left-36 -top-40 -z-10 size-[460px] rounded-full border-[84px] border-white opacity-[0.045]" />
          <div className="pointer-events-none absolute -bottom-56 -right-28 -z-10 size-[540px] rounded-full border-[92px] border-[#5D75CB] opacity-25" />
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_84%_12%,rgba(93,117,203,0.5),transparent_34%)]" />

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end"
          >
            <div>
              <div className="inline-flex items-center rounded-full border border-white/[0.18] bg-white/[0.08] px-4 py-2 text-[12px] font-medium text-white/80 backdrop-blur-sm sm:text-[13px]">
                Безопасность · Доверие · Качество
              </div>

              <h2 className="mt-6 max-w-[13ch] text-[36px] font-medium leading-[1.02] tracking-[-0.045em] text-white sm:text-[44px] lg:text-[52px]">
                Как мы обеспечиваем качество
              </h2>
            </div>

            <p className="max-w-[58ch] text-[14px] leading-7 text-white/[0.72] sm:text-[15px] lg:justify-self-end">
              Прозрачная система проверки и контроля качества — чтобы вы
              находили преподавателя с уверенностью
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="relative z-10 mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:mt-12 lg:grid-cols-12"
          >
            {items.map((item, index) => (
              <FeatureCard key={item.title} item={item} index={index} />
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="relative z-10 mt-9 flex justify-center sm:mt-11"
          >
            <ButtonSend
              text="Найти репетитора"
              className="rounded-full! bg-white! px-8! py-4! text-[14px]! font-medium! text-[#233067]! shadow-[0_14px_32px_rgba(0,0,0,0.16)]! hover:bg-[#F7F8FF]! sm:px-10! sm:text-[15px]!"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
