import Image from "next/image";
import {
  ArrowUpRight,
  Compass,
  HeartHandshake,
  Layers3,
} from "lucide-react";

const principles = [
  {
    number: "01",
    title: "Человечность",
    text: "Сохраняем живой контакт и строим продукт вокруг реальных потребностей людей.",
    icon: HeartHandshake,
  },
  {
    number: "02",
    title: "Ясность",
    text: "Убираем лишнюю сложность, чтобы обучение оставалось понятным и управляемым.",
    icon: Compass,
  },
  {
    number: "03",
    title: "Развитие",
    text: "Создаём пространство, в котором растут и ученики, и преподаватели.",
    icon: Layers3,
  },
];

export default function About() {
  return (
    <section
      aria-labelledby="mission-title"
      className="relative overflow-hidden bg-[#F3F5FF] pb-24 pt-14 sm:pb-28 sm:pt-20 lg:pb-36 lg:pt-28"
      id="mission"
    >
      <div className="pointer-events-none absolute -right-56 top-20 size-[520px] rounded-full bg-[#E6EAFF] blur-3xl" />

      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-5">
        <div className="grid gap-5 border-t border-[#D7DDF8] pt-6 md:grid-cols-[0.34fr_0.66fr] md:gap-10 lg:pt-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#5D75CB] sm:text-[12px]">
              Кто мы
            </p>
          </div>
          <div>
            <h2
              className="max-w-[18ch] text-[34px] font-medium leading-[1.08] tracking-[-0.045em] text-[#202858] sm:text-[44px] lg:text-[52px]"
              id="mission-title"
            >
              4P Education — среда для тех, кто хочет понимать больше и
              двигаться увереннее.
            </h2>
            <p className="mt-6 max-w-[61ch] text-[14px] leading-7 text-[#68719B] sm:text-[15px]">
              Мы помогаем ученикам находить сильных преподавателей, разбираться
              в сложных темах и добиваться измеримых результатов. Преподавателям
              даём инструменты, чтобы делиться знаниями и развивать собственную
              практику.
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-12">
          <article className="group relative isolate flex min-h-[480px] flex-col overflow-hidden rounded-[28px] bg-[#202858] p-6 text-white shadow-[0_20px_50px_rgba(32,40,88,0.14)] sm:rounded-[32px] sm:p-9 lg:col-span-7 lg:min-h-[560px] lg:p-10">
            <div className="pointer-events-none absolute -bottom-48 -right-36 -z-10 size-[520px] rounded-full border-[86px] border-[#5D75CB] opacity-35 transition-transform duration-700 group-hover:scale-105" />
            <div className="pointer-events-none absolute -bottom-20 right-44 -z-10 size-48 rounded-full border-[38px] border-white opacity-[0.035]" />

            <div className="flex items-center justify-between gap-4">
              <span className="inline-flex rounded-full border border-white/15 bg-white/[0.07] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/70">
                Наша миссия
              </span>
              <span className="text-[11px] font-semibold tracking-[0.14em] text-white/35">
                02 / 04
              </span>
            </div>

            <p className="my-auto max-w-[13ch] py-12 text-[38px] font-medium leading-[1.04] tracking-[-0.045em] sm:text-[48px] lg:text-[58px]">
              Сделать качественное образование доступным, понятным и
              эффективным.
            </p>

            <div className="flex flex-col gap-5 border-t border-white/15 pt-6 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-[52ch] text-[12px] leading-6 text-white/60 sm:text-[13px]">
                Мы объединяем современные технологии, сильную экспертизу и
                внимательное отношение к каждому образовательному пути.
              </p>
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-[#202858] transition-transform duration-300 group-hover:rotate-6">
                <ArrowUpRight aria-hidden="true" className="size-[18px]" />
              </span>
            </div>
          </article>

          <article className="group relative min-h-[480px] overflow-hidden rounded-[28px] bg-[#D7DDF8] sm:rounded-[32px] lg:col-span-5 lg:min-h-[560px]">
            <Image
              alt="Команда за совместной работой над образовательным продуктом"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.025]"
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              src="/ochi/team.jpg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111735]/85 via-[#202858]/10 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
              <div className="mb-4 h-px w-full bg-white/25" />
              <div className="flex items-end justify-between gap-5">
                <p className="max-w-[15ch] text-[26px] font-medium leading-[1.08] tracking-[-0.035em] sm:text-[32px]">
                  Работаем вместе. Растём вместе.
                </p>
                <span className="mb-1 shrink-0 rounded-full bg-white/12 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] backdrop-blur-md">
                  4P team
                </span>
              </div>
            </div>
          </article>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {principles.map(({ icon: Icon, number, text, title }) => (
            <article
              className="group relative flex min-h-[285px] flex-col overflow-hidden rounded-[26px] border border-white bg-white p-6 shadow-[0_12px_36px_rgba(35,48,103,0.05)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(35,48,103,0.09)] sm:rounded-[30px] sm:p-7"
              key={number}
            >
              <div className="pointer-events-none absolute -bottom-16 -right-16 size-40 rounded-full border-[34px] border-[#5D75CB] opacity-[0.05] transition-transform duration-500 group-hover:scale-110" />
              <div className="relative flex items-center justify-between gap-4">
                <span className="grid size-11 place-items-center rounded-full bg-[#ECEFFF] text-[#4C63B8]">
                  <Icon aria-hidden="true" className="size-[18px]" />
                </span>
                <span className="text-[10px] font-semibold tracking-[0.13em] text-[#9AA2C0]">
                  {number}
                </span>
              </div>
              <h3 className="relative mt-8 text-[25px] font-medium tracking-[-0.035em] text-[#202858]">
                {title}
              </h3>
              <p className="relative mt-auto max-w-[36ch] pt-5 text-[13px] leading-6 text-[#68719B]">
                {text}
              </p>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
