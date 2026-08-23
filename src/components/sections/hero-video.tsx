"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  CheckCircle2,
  Maximize2,
  Minus,
  Play,
  PlayCircle,
  X,
} from "lucide-react";
import { brand } from "@/lib/brand";

type HeroVideoProps = {
  eyebrow?: string;
  headline?: string;
  description?: string;
  note?: string;
  videos?: string[];
  poster?: string;
};

type VideoWindowMode = "closed" | "fullscreen" | "minimized";

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function WindowControl({
  color,
  label,
  icon,
  onClick,
}: {
  color: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`group grid h-3.5 w-3.5 place-items-center rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.2)] transition duration-200 hover:brightness-110 active:scale-90 ${color}`}
    >
      <span className="opacity-0 transition-opacity duration-150 group-hover:opacity-70">
        {icon}
      </span>
    </button>
  );
}

function FullscreenVideoWindow({
  mode,
  src,
  poster,
  onClose,
  onMinimize,
  onMaximize,
}: {
  mode: Exclude<VideoWindowMode, "closed">;
  src: string;
  poster: string;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const isMinimized = mode === "minimized";
  const spring = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 260, damping: 30, mass: 0.8 };

  return (
    <motion.div
      className={`fixed inset-0 z-[999] flex p-3 sm:p-4 ${
        isMinimized
          ? "pointer-events-none items-end justify-end"
          : "items-center justify-center"
      }`}
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        backgroundColor: isMinimized
          ? "rgba(2, 6, 23, 0)"
          : "rgba(2, 6, 23, 0.82)",
        backdropFilter: isMinimized ? "blur(0px)" : "blur(18px)",
      }}
      exit={{ opacity: 0, backgroundColor: "rgba(2, 6, 23, 0)" }}
      transition={{ duration: reduceMotion ? 0 : 0.28, ease: "easeOut" }}
    >
      <motion.div
        layout
        className={`pointer-events-auto flex overflow-hidden border border-white/15 bg-[#080d18]/95 shadow-[0_34px_120px_rgba(0,0,0,0.62)] ring-1 ring-white/10 backdrop-blur-2xl ${
          isMinimized
            ? "w-[420px] max-w-[calc(100vw_-_24px)] flex-col rounded-[18px]"
            : "h-[calc(100dvh_-_24px)] w-[calc(100vw_-_24px)] flex-col rounded-[26px] sm:h-[calc(100dvh_-_32px)] sm:w-[calc(100vw_-_32px)]"
        }`}
        initial={
          reduceMotion
            ? false
            : { opacity: 0, scale: 0.88, y: 44, filter: "blur(10px)" }
        }
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          filter: "blur(0px)",
        }}
        exit={
          reduceMotion
            ? { opacity: 0 }
            : { opacity: 0, scale: 0.9, y: 34, filter: "blur(10px)" }
        }
        transition={spring}
      >
        <div className="flex h-11 shrink-0 items-center gap-2 border-b border-white/10 bg-white/[0.07] px-4">
          <div className="flex items-center gap-2">
            <WindowControl
              label="Закрыть видео"
              color="bg-[#ff5f57]"
              icon={<X className="h-2.5 w-2.5 text-black" strokeWidth={3} />}
              onClick={onClose}
            />
            <WindowControl
              label="Свернуть видео"
              color="bg-[#febc2e]"
              icon={
                <Minus className="h-2.5 w-2.5 text-black" strokeWidth={3} />
              }
              onClick={onMinimize}
            />
            <WindowControl
              label="Развернуть видео"
              color="bg-[#28c840]"
              icon={
                <Maximize2
                  className="h-2.5 w-2.5 text-black"
                  strokeWidth={3}
                />
              }
              onClick={onMaximize}
            />
          </div>

          <div className="ml-3 h-2 w-28 rounded-full bg-white/10 sm:w-44" />
          <div className="ml-auto hidden h-2 w-16 rounded-full bg-white/8 sm:block" />
        </div>

        <motion.div
          layout
          className={`relative min-h-0 bg-black ${
            isMinimized ? "aspect-video w-full" : "flex-1"
          }`}
          transition={spring}
        >
          <video
            key={src}
            className="h-full w-full object-contain"
            autoPlay
            controls
            playsInline
            preload="metadata"
            poster={poster}
          >
            <source src={src} type="video/mp4" />
          </video>

          {!isMinimized && (
            <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/35 to-transparent" />
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function HeroVideo({
  eyebrow = `Что такое ${brand.name}?`,
  headline = "Находите преподавателей, создавайте курсы и обучайтесь в одном месте",
  description = `${brand.name} - это образовательная платформа, где студенты
могут не только находить преподавателей, но и
становиться ими. Здесь вы сможете создавать курсы,
делиться знаниями и начать свой путь в
преподавании.`,
  note = "Современная платформа для преподавателей, курсов и растущего образовательного сообщества.",
  videos = ["/videos/promo.mp4"],
  poster = "/images/hero-poster.jpg",
}: HeroVideoProps) {
  const router = useRouter();
  const src = React.useMemo(() => pickRandom(videos), [videos]);
  const [videoWindowMode, setVideoWindowMode] =
    React.useState<VideoWindowMode>("closed");

  const openFullscreenVideo = React.useCallback(() => {
    setVideoWindowMode("fullscreen");
  }, []);

  const closeFullscreenVideo = React.useCallback(() => {
    setVideoWindowMode("closed");
  }, []);

  React.useEffect(() => {
    if (videoWindowMode !== "fullscreen") {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [videoWindowMode]);

  React.useEffect(() => {
    if (videoWindowMode === "closed") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeFullscreenVideo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeFullscreenVideo, videoWindowMode]);

  return (
    <section className="relative overflow-hidden bg-transparent">
      <div className="relative mx-auto max-w-[1200px] px-4 pb-10 pt-2 sm:px-5 sm:pb-14 sm:pt-4 lg:pb-10">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="group relative isolate flex min-h-[620px] flex-col overflow-hidden rounded-[28px] bg-white px-6 py-8 shadow-[0_12px_36px_rgba(35,48,103,0.055)] sm:rounded-[32px] sm:px-9 sm:py-10 xl:min-h-[660px] xl:px-10 xl:py-11">
            <div className="pointer-events-none absolute -bottom-48 -left-28 -z-10 size-[520px] rounded-full border-[70px] border-[#ECEFFF] opacity-90 transition-transform duration-700 group-hover:scale-[1.03] sm:-bottom-52 sm:size-[600px] sm:border-[86px]" />
            <div className="pointer-events-none absolute -bottom-28 left-32 -z-10 size-56 rounded-full border-[44px] border-[#F3F5FF]" />

            <div className="inline-flex w-fit items-center rounded-full border border-[#D7DDF8] bg-[#F7F8FF] px-3.5 py-1.5 text-[12px] font-semibold tracking-[0.02em] text-[#4C63B8] sm:text-[13px]">
              {eyebrow}
            </div>

            <h1 className="mt-5 max-w-[15ch] text-[36px] font-medium leading-[1.04] tracking-[-0.045em] text-[#202858] sm:text-[44px] lg:text-[46px] xl:text-[50px]">
              {headline}
            </h1>

            <p className="mt-5 max-w-[54ch] text-[14px] leading-[1.65] text-[#68719B] sm:text-[15px]">
              {description}
            </p>

            <ul className="mt-6 grid gap-2.5">
              {[
                "Поиск преподавателей по нужным направлениям",
                "Удобный выбор курсов для обучения онлайн",
                "Платформа для роста студентов и преподавателей",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 size-[18px] shrink-0 text-[#5D75CB]" />
                  <span className="text-[13px] leading-5 text-[#3F4568] sm:text-[14px]">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-5 max-w-[52ch] text-[12px] leading-[1.6] text-[#7A82A8] sm:text-[13px]">
              {note}
            </p>

            <div className="mt-auto flex flex-col gap-3 pt-7 sm:flex-row sm:flex-wrap sm:items-center">
              <button
                className="group/cta inline-flex h-13 items-center justify-center gap-3 rounded-full bg-[#233067] pl-6 pr-2 text-[14px] font-medium text-white shadow-[0_12px_26px_rgba(35,48,103,0.2)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#19224c] hover:shadow-[0_16px_34px_rgba(35,48,103,0.26)] active:translate-y-0"
                onClick={() => router.push("/learning-fit")}
                type="button"
              >
                Хочу начать заниматься
                <span className="grid size-9 place-items-center rounded-full bg-white text-[#233067] transition-transform duration-300 group-hover/cta:rotate-6">
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </span>
              </button>

              <button
                type="button"
                onClick={openFullscreenVideo}
                className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-[#D7DDF8] bg-white/80 px-5 text-[13px] font-medium text-[#202858] transition duration-300 hover:-translate-y-0.5 hover:border-[#B8C2EF] hover:bg-[#F7F8FF] active:translate-y-0 sm:text-[14px]"
              >
                <PlayCircle className="size-[18px] shrink-0 text-[#5D75CB]" />
                Смотреть видео
              </button>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-rows-[1fr_auto]">
            <div className="group relative flex flex-col overflow-hidden rounded-[28px] bg-white p-3 shadow-[0_12px_36px_rgba(35,48,103,0.055)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_22px_52px_rgba(35,48,103,0.11)] sm:rounded-[32px] sm:p-4">
              <div className="flex h-10 items-center gap-2 px-2 sm:h-11 sm:px-3">
                <span className="size-2.5 rounded-full bg-[#D7DDF8]" />
                <span className="size-2.5 rounded-full bg-[#B8C2EF]" />
                <span className="size-2.5 rounded-full bg-[#5D75CB]" />
                <div className="ml-2 h-1.5 w-24 rounded-full bg-[#ECEFFF] sm:w-32" />
                <button
                  aria-label="Открыть видео на весь экран"
                  className="ml-auto grid size-8 place-items-center rounded-full bg-[#F3F5FF] text-[#4C63B8] transition duration-300 hover:bg-[#ECEFFF] hover:text-[#233067]"
                  onClick={openFullscreenVideo}
                  title="Открыть видео на весь экран"
                  type="button"
                >
                  <Maximize2 className="size-3.5" />
                </button>
              </div>

              <div className="relative overflow-hidden rounded-[20px] bg-[#202858] sm:rounded-[24px] lg:flex-1">
                <video
                  key={src}
                  className="block aspect-video w-full object-cover transition-transform duration-700 group-hover:scale-[1.015] lg:h-full lg:aspect-auto"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={poster}
                >
                  <source src={src} type="video/mp4" />
                </video>

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#202858]/55 via-transparent to-transparent" />

                <button
                  className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[12px] font-medium text-[#202858] shadow-lg transition duration-300 hover:scale-[1.03] sm:bottom-4 sm:left-4 sm:px-4 sm:text-[13px]"
                  onClick={openFullscreenVideo}
                  type="button"
                >
                  <span className="grid size-5 place-items-center rounded-full bg-[#5D75CB] text-white">
                    <Play className="ml-0.5 size-2.5 fill-current" />
                  </span>
                  Смотреть обзор
                </button>

                <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[#202858]/75 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white backdrop-blur-sm sm:right-4 sm:top-4 sm:text-[11px]">
                  <span className="size-1.5 rounded-full bg-white" />
                  Live demo
                </div>
              </div>

              <p className="px-2 pb-2 pt-4 text-[12px] leading-[1.6] text-[#7A82A8] sm:px-3 sm:text-[13px]">
                БыстПознакомьтесь с платформой поближе — как она работает, что
                предлагает и как будет поддерживать вас на каждом этапе обучения.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
              {[
                { value: "Новый", label: "Проект" },
                { value: "Онлайн", label: "Обучение" },
                { value: "Скоро", label: "Новые курсы" },
              ].map(({ value, label }, index) => (
                <div
                  key={label}
                  className={`group/stat relative min-h-28 overflow-hidden rounded-[22px] px-3 py-4 transition duration-300 hover:-translate-y-1 sm:min-h-32 sm:rounded-[26px] sm:px-5 sm:py-5 ${
                    index === 1
                      ? "bg-[#5D75CB] text-white shadow-[0_14px_30px_rgba(93,117,203,0.18)]"
                      : "border border-white bg-white text-[#202858]"
                  }`}
                >
                  <div className="absolute -bottom-8 -right-8 size-20 rounded-full border-[18px] border-current opacity-[0.06] transition-transform duration-500 group-hover/stat:scale-110" />
                  <div className="relative text-[17px] font-medium tracking-[-0.02em] sm:text-[21px]">
                    {value}
                  </div>
                  <div
                    className={`relative mt-1 text-[10px] leading-4 sm:text-[12px] ${
                      index === 1 ? "text-white/70" : "text-[#7A82A8]"
                    }`}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {videoWindowMode !== "closed" ? (
          <FullscreenVideoWindow
            mode={videoWindowMode}
            src={src}
            poster={poster}
            onClose={closeFullscreenVideo}
            onMinimize={() => setVideoWindowMode("minimized")}
            onMaximize={openFullscreenVideo}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}
