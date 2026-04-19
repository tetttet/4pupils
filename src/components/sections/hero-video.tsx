"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { PlayCircle, CheckCircle2 } from "lucide-react";
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

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function HeroVideo({
  eyebrow = `Что такое ${brand.name}?`,
  headline = "Находите преподавателей, выбирайте курсы и обучайтесь в одном месте",
  description = `${brand.name} — это образовательная платформа, где студенты могут находить преподавателей, записываться на курсы и учиться в удобном формате. Здесь можно быстро подобрать подходящего учителя, изучать разные направления и получать доступ к качественным образовательным материалам в одном месте.`,
  note = "Современная платформа для преподавателей, курсов и растущего образовательного сообщества.",
  videos = ["/videos/1.mp4"],
  poster = "/images/hero-poster.jpg",
}: HeroVideoProps) {
  const router = useRouter();
  const src = React.useMemo(() => pickRandom(videos), [videos]);

  return (
    <section className="relative overflow-hidden">
      {/* <HeroBackground /> */}
      <HeroTestBg />

      <div className="relative mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* LEFT CONTENT */}
          <div className="max-w-xl text-white">
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm">
              {eyebrow}
            </div>

            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-white md:text-5xl">
              {headline}
            </h1>

            <p className="mt-6 text-base text-white/85 md:text-base">
              {description}
            </p>

            <div className="mt-6 space-y-3 text-sm text-white/90 md:text-base">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-white" />
                <span>Поиск преподавателей по нужным направлениям</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-white" />
                <span>Удобный выбор курсов для обучения онлайн</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-white" />
                <span>Платформа для роста студентов и преподавателей</span>
              </div>
            </div>

            <p className="mt-6 text-sm leading-6 text-white/75 md:text-[15px]">
              {note}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <ButtonSend
                className="px-10! py-4! text-[15px]!"
                onClick={() => router.push("/learning-fit")}
              />

              <button className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/15">
                <PlayCircle className="h-5 w-5" />
                Смотреть видео
              </button>
            </div>
          </div>

          {/* RIGHT VIDEO */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-[32px] bg-white/10 blur-2xl" />

            <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-white/10 p-3 shadow-[0_20px_80px_rgba(0,0,0,0.25)] backdrop-blur-md">
              {/* fake browser top */}
              <div className="mb-3 flex items-center gap-2 px-2 py-2">
                <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                <div className="ml-3 h-2.5 w-40 rounded-full bg-white/10" />
              </div>

              <div className="overflow-hidden rounded-4xl bg-[#0b1220] ring-1 ring-white/10">
                <div className="relative">
                  <video
                    key={src}
                    className="block aspect-4/3 w-full object-cover md:aspect-5/4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster={poster}
                  >
                    <source src={src} type="video/mp4" />
                  </video>

                  <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent" />

                  {/* Play badge */}
                  <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-black/35 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                    <PlayCircle className="h-4 w-4" />
                    Смотреть обзор
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-4 max-w-md text-sm leading-6 text-white/80">
              Быстрый обзор того, как работает платформа, как она выглядит и
              поддерживает ваш опыт обучения с самого первого взаимодействия.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
