"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PlayCircle, CheckCircle2, Maximize2, Minus, X } from "lucide-react";
import { brand } from "@/lib/brand";
import ButtonSend from "../ui/button-send";
import HeroTestBg from "../ui/hero-test-bg";

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
    <section className="relative overflow-hidden">
      <HeroTestBg />

      <div className="relative mx-auto max-w-[1400px] px-6 py-14 md:px-10 md:py-20 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.45fr] lg:gap-12">
          {/* ── LEFT CONTENT ── */}
          <div className="max-w-lg text-white lg:py-6">
            {/* Eyebrow pill */}
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[13px] font-medium tracking-wide text-white/90 backdrop-blur-sm">
              {eyebrow}
            </div>

            {/* Headline */}
            <h1 className="mt-5 text-[28px] font-semibold leading-[1.25] tracking-[-0.02em] text-white sm:text-[32px] md:text-[36px] lg:text-[38px] xl:text-[42px]">
              {headline}
            </h1>

            {/* Description */}
            <p className="mt-4 text-[14px] leading-[1.7] text-white/75 sm:text-[15px]">
              {description}
            </p>

            {/* Feature checklist */}
            <ul className="mt-5 space-y-2.5">
              {[
                "Поиск преподавателей по нужным направлениям",
                "Удобный выбор курсов для обучения онлайн",
                "Платформа для роста студентов и преподавателей",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-[18px] w-[18px] shrink-0 text-white/90" />
                  <span className="text-[13.5px] leading-snug text-white/85 sm:text-[14px]">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            {/* Note */}
            <p className="mt-5 text-[12.5px] leading-[1.65] text-white/50 sm:text-[13px]">
              {note}
            </p>

            {/* CTAs */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <ButtonSend
                className="px-8! py-3! text-[14px]! font-medium!"
                onClick={() => router.push("/learning-fit")}
              />

              <button
                type="button"
                onClick={openFullscreenVideo}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-[13.5px] font-medium text-white/90 transition hover:bg-white/15 active:scale-[.97]"
              >
                <PlayCircle className="h-4 w-4 shrink-0" />
                Смотреть видео
              </button>
            </div>
          </div>

          {/* ── RIGHT VIDEO ── */}
          <div className="relative">
            {/* Layered glow atmosphere */}
            <div className="pointer-events-none absolute -inset-8 rounded-[40px] bg-white/10 blur-3xl opacity-50" />
            <div className="pointer-events-none absolute -bottom-10 -right-10 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -top-10 -left-6 h-48 w-48 rounded-full bg-sky-400/15 blur-2xl" />

            {/* Perspective tilt for depth */}
            <div style={{ perspective: "1200px" }}>
              <div
                style={{
                  transform: "rotateY(-4deg) rotateX(2deg)",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Glassmorphism card */}
                <div className="relative overflow-hidden rounded-[22px] border border-white/15 bg-white/[0.08] p-3 shadow-[0_32px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                  {/* Fake browser chrome */}
                  <div className="mb-3 flex items-center gap-1.5 px-2.5 py-1.5">
                    <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                    <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                    <button
                      type="button"
                      aria-label="Открыть видео на весь экран"
                      title="Открыть видео на весь экран"
                      onClick={openFullscreenVideo}
                      className="h-3 w-3 rounded-full bg-[#28c840] transition hover:brightness-110 active:scale-90"
                    />
                    <div className="ml-3 h-2 w-40 rounded-full bg-white/10" />
                    <div className="ml-auto h-2 w-16 rounded-full bg-white/8" />
                  </div>

                  {/* Video */}
                  <div className="overflow-hidden rounded-[14px] bg-[#080e1a] ring-1 ring-white/10">
                    <div className="relative">
                      <video
                        key={src}
                        className="block w-full object-cover"
                        style={{ aspectRatio: "16/9" }}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        poster={poster}
                      >
                        <source src={src} type="video/mp4" />
                      </video>

                      {/* Vignette */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                      {/* Play badge */}
                      <div className="select-none absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-black/45 px-4 py-2 text-[12.5px] font-medium text-white backdrop-blur-sm">
                        <PlayCircle className="h-3.5 w-3.5" />
                        Смотреть обзор
                      </div>

                      {/* Live badge */}
                      <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/80 backdrop-blur-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Live demo
                      </div>
                    </div>
                  </div>

                  {/* Mini stats bar inside card */}
                  <div className="mt-3 grid grid-cols-3 divide-x divide-white/10 rounded-xl bg-white/5 px-2 py-2.5">
                    {[
                      { value: "Новый", label: "Проект" },
                      { value: "Онлайн", label: "Обучение" },
                      { value: "Скоро", label: "Новые курсы" },
                    ].map(({ value, label }) => (
                      <div
                        key={label}
                        className="flex flex-col items-center gap-0.5 px-2"
                      >
                        <span className="text-[15px] font-semibold text-white">
                          {value}
                        </span>
                        <span className="text-[11px] text-white/50">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Caption */}
            <p className="mt-4 max-w-2xl pl-1 text-[12.5px] leading-[1.65] text-white/50 sm:text-[13px]">
              БыстПознакомьтесь с платформой поближе — как она работает, что
              предлагает и как будет поддерживать вас на каждом этапе обучения.
            </p>
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
