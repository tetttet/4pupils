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

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M8.8 12.2l2.1 2.1 4.6-4.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BackgroundArtwork() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* base */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,var(--frontier-home-primary)_0%,var(--frontier-home-primary-strong)_42%,var(--frontier-home-primary-deep)_100%)]" />

      {/* depth overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.20),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.10),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(8,33,56,0.24),transparent_34%)]" />

      {/* animated grid */}
      <motion.div
        className="absolute inset-0 opacity-[0.1]"
        animate={{ backgroundPosition: ["0px 0px", "40px 40px"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* big waves */}
      <motion.svg
        className="absolute -left-24 top-6 h-105 w-245 opacity-[0.42] blur-[0.4px]"
        viewBox="0 0 1000 420"
        fill="none"
        aria-hidden="true"
        animate={{ x: [0, 24, 0], y: [0, -10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <linearGradient id="waveA" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F1F3FF" stopOpacity="0.38" />
            <stop offset="45%" stopColor="#D7DEFF" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#BBC7FF" stopOpacity="0.26" />
          </linearGradient>
        </defs>
        <path
          d="M0 260C140 205 250 205 390 250C545 300 640 300 780 245C875 207 930 195 1000 205V420H0V260Z"
          fill="url(#waveA)"
        />
      </motion.svg>

      <motion.svg
        className="absolute -right-28 bottom-0 h-112.5 w-270 opacity-[0.42] blur-[0.4px]"
        viewBox="0 0 1100 460"
        fill="none"
        aria-hidden="true"
        animate={{ x: [0, -28, 0], y: [0, 10, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <linearGradient id="waveB" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F6F7FF" stopOpacity="0.24" />
            <stop offset="55%" stopColor="#DFE4FF" stopOpacity="0.11" />
            <stop offset="100%" stopColor="#C4CCFF" stopOpacity="0.22" />
          </linearGradient>
        </defs>
        <path
          d="M0 210C120 255 245 290 395 270C530 252 640 200 770 215C925 233 1010 290 1100 330V460H0V210Z"
          fill="url(#waveB)"
        />
      </motion.svg>

      {/* blurred glows */}
      <motion.div
        className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-[rgba(var(--frontier-home-primary-rgb),0.28)] blur-3xl"
        animate={{ x: [0, 16, 0], y: [0, -18, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-8 top-10 h-80 w-80 rounded-full bg-[rgba(var(--frontier-home-primary-strong-rgb),0.22)] blur-3xl"
        animate={{ x: [0, -20, 0], y: [0, 18, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/3 bottom-0 h-72 w-72 rounded-full bg-[rgba(var(--frontier-home-primary-deep-rgb),0.16)] blur-3xl"
        animate={{ y: [0, -14, 0], x: [0, 12, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* sparkles */}
      <motion.div
        className="absolute left-10 top-24 h-2 w-2 rounded-full bg-white/70 shadow-[0_0_18px_rgba(255,255,255,0.38)]"
        animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.6, 1] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-40 top-44 h-1.5 w-1.5 rounded-full bg-white/60 shadow-[0_0_16px_rgba(255,255,255,0.25)]"
        animate={{ opacity: [0.3, 0.9, 0.3], scale: [1, 1.4, 1] }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />
      <motion.div
        className="absolute right-36 top-36 h-2 w-2 rounded-full bg-white/55 shadow-[0_0_18px_rgba(255,255,255,0.28)]"
        animate={{ opacity: [0.35, 1, 0.35], scale: [1, 1.7, 1] }}
        transition={{
          duration: 2.6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2,
        }}
      />
      <motion.div
        className="absolute right-24 bottom-28 h-1.5 w-1.5 rounded-full bg-white/55 shadow-[0_0_16px_rgba(255,255,255,0.22)]"
        animate={{ opacity: [0.35, 0.95, 0.35], scale: [1, 1.5, 1] }}
        transition={{
          duration: 3.4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.8,
        }}
      />

      {/* shield watermark */}
      <motion.div
        className="absolute -right-10 -top-10 opacity-[0.10]"
        animate={{ rotate: [0, 4, 0], y: [0, 8, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      >
        <ShieldIcon className="h-72 w-72 text-white" />
      </motion.div>

      {/* top shine */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.10),transparent_35%,rgba(0,0,0,0.10))]" />

      {/* subtle noise */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-soft-light"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.9) 0.6px, transparent 0.6px)",
          backgroundSize: "16px 16px",
        }}
      />
    </div>
  );
}

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 26, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

function FeatureCard({ item }: { item: CardItem }) {
  return (
    <motion.article
      variants={itemVariants}
      whileHover={{ y: -8, scale: 1.015 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-[28px] border border-white/35 bg-white/90 p-6 py-8 shadow-[0_18px_50px_rgba(var(--frontier-home-primary-deep-rgb),0.18)] backdrop-blur-xl"
    >
      {/* animated hover glow */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
        <div className="absolute -left-10 top-0 h-32 w-32 rounded-full bg-[rgba(var(--frontier-home-primary-rgb),0.24)] blur-2xl" />
        <div className="absolute right-0 bottom-0 h-28 w-28 rounded-full bg-[rgba(var(--frontier-home-primary-strong-rgb),0.20)] blur-2xl" />
      </div>

      {/* top gradient line */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[rgba(var(--frontier-home-primary-rgb),0.8)] to-transparent" />

      <div className="relative z-10">
        <div className="mb-6 flex">
          <motion.div
            className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--frontier-home-surface)] ring-1 ring-[rgba(var(--frontier-home-border-rgb),0.85)] shadow-[0_8px_20px_rgba(var(--frontier-home-primary-rgb),0.16)]"
            whileHover={{ rotate: -4, scale: 1.06 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="absolute inset-0 rounded-2xl border border-[rgba(var(--frontier-home-primary-rgb),0.32)]"
              animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0, 0.35] }}
              transition={{
                duration: 2.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <CheckIcon className="h-7 w-7 text-[var(--frontier-home-primary)]" />
          </motion.div>
        </div>

        <h3 className="text-[20px] font-extrabold leading-snug text-[var(--frontier-home-ink)]">
          {item.title}
        </h3>

        <p className="mt-4 text-[15px] leading-7 text-[var(--frontier-home-ink-muted)]">
          {item.text}
        </p>
      </div>
    </motion.article>
  );
}

export default function HowWeWorkWithTutors() {
  return (
    <section className="relative bg-white py-10 md:py-28">
      <div className="mx-auto w-full max-w-400 px-0 lg:px-8">
        <div className="relative min-h-[72vh] overflow-hidden rounded-[40px] px-6 py-12 sm:px-10 sm:py-14 md:rounded-[48px] md:px-12 lg:px-14">
          <BackgroundArtwork />

          <div className="pointer-events-none absolute inset-0 rounded-[40px] ring-1 ring-white/20 md:rounded-[48px]" />
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-white/50 to-transparent" />

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 mx-auto max-w-6xl"
          >
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-md shadow-[0_8px_24px_rgba(255,255,255,0.08)]">
                Безопасность · Доверие · Качество
              </div>

              <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
                Как мы обеспечиваем качество
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/85 md:text-base">
                Прозрачная система проверки и контроля качества — чтобы вы
                находили преподавателя с уверенностью
              </p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.18 }}
              className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-4 px-1 md:mt-18 md:grid-cols-2 lg:grid-cols-4"
            >
              {items.map((item) => (
                <FeatureCard key={item.title} item={item} />
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-12 flex justify-center md:mt-14"
            >
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="relative"
              >
                <div className="absolute -inset-3 rounded-full bg-white/20 blur-xl" />
                <div className="relative">
                  <ButtonSend
                    text="Найти репетитора"
                    className="px-10! py-4! text-[15px]! shadow-[0_18px_40px_rgba(255,255,255,0.16)]"
                  />
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
