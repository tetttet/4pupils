import {
  ArrowUpRight,
  BarChart3,
  BookOpenCheck,
  Layers3,
  Palette,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    number: "01",
    title: "Свой стиль",
    text: "Оформите страницу компании так, чтобы обучение продолжало визуальный язык вашего бренда.",
    icon: Palette,
  },
  {
    number: "02",
    title: "Любые программы",
    text: "Загрузите готовые материалы или создайте новые курсы прямо внутри платформы.",
    icon: BookOpenCheck,
  },
  {
    number: "03",
    title: "Понятный контроль",
    text: "Следите за активностью, завершением курсов и прогрессом каждой учебной группы.",
    icon: BarChart3,
  },
];

export default function WorkSpaceCard() {
  return (
    <section className="relative overflow-hidden bg-[#F3F5FF] pb-24 pt-14 sm:pb-28 sm:pt-20 lg:pb-36 lg:pt-28">
      <div className="pointer-events-none absolute -right-56 top-20 size-[520px] rounded-full bg-[#E6EAFF] blur-3xl" />

      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-5">
        <div className="grid gap-5 border-t border-[#D7DDF8] pt-6 md:grid-cols-[0.34fr_0.66fr] md:gap-10 lg:pt-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#5D75CB] sm:text-[12px]">
            Возможности
          </p>
          <div>
            <h2 className="max-w-[18ch] text-[34px] font-medium leading-[1.08] tracking-[-0.045em] text-[#202858] sm:text-[44px] lg:text-[52px]">
              Всё корпоративное обучение в одном месте.
            </h2>
            <p className="mt-6 max-w-[61ch] text-[14px] leading-7 text-[#68719B] sm:text-[15px]">
              Создавайте программы, распределяйте доступы и наблюдайте за
              результатами — в единой среде для команды, клиентов и партнёров.
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-12">
          <article className="group relative isolate flex min-h-[480px] flex-col overflow-hidden rounded-[28px] bg-[#202858] p-6 text-white shadow-[0_20px_50px_rgba(32,40,88,0.14)] sm:rounded-[32px] sm:p-9 lg:col-span-7 lg:min-h-[550px] lg:p-10">
            <div className="pointer-events-none absolute -bottom-48 -right-36 -z-10 size-[520px] rounded-full border-[86px] border-[#5D75CB] opacity-35 transition-transform duration-700 group-hover:scale-105" />
            <div className="pointer-events-none absolute -bottom-20 right-44 -z-10 size-48 rounded-full border-[38px] border-white opacity-[0.035]" />

            <div className="flex items-center justify-between gap-4">
              <span className="inline-flex rounded-full border border-white/15 bg-white/[0.07] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/70">
                Единая система
              </span>
              <span className="text-[11px] font-semibold tracking-[0.14em] text-white/35">
                01 / 04
              </span>
            </div>

            <p className="my-auto max-w-[13ch] py-12 text-[38px] font-medium leading-[1.04] tracking-[-0.045em] sm:text-[48px] lg:text-[58px]">
              От первого курса до культуры постоянного развития.
            </p>

            <div className="flex flex-col gap-5 border-t border-white/15 pt-6 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-[50ch] text-[12px] leading-6 text-white/60 sm:text-[13px]">
                Начните с одной программы, проверьте сценарий на реальной
                группе и постепенно масштабируйте обучение на всю компанию.
              </p>
              <Link
                aria-label="Создать корпоративное пространство"
                className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-[#202858] transition-transform duration-300 group-hover:rotate-6"
                href="/auth/sign-up"
              >
                <ArrowUpRight aria-hidden="true" className="size-[18px]" />
              </Link>
            </div>
          </article>

          <article className="relative isolate flex min-h-[480px] flex-col overflow-hidden rounded-[28px] bg-[#DDE3FF] p-6 sm:rounded-[32px] sm:p-8 lg:col-span-5 lg:min-h-[550px]">
            <div className="pointer-events-none absolute -right-28 -top-28 -z-10 size-[320px] rounded-full border-[54px] border-white/45" />
            <div className="flex items-center justify-between border-b border-[#BFC9F1] pb-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#68719B]">
                  Пространство компании
                </p>
                <p className="mt-1 text-[14px] font-medium text-[#202858]">
                  4P Learning Hub
                </p>
              </div>
              <span className="grid size-10 place-items-center rounded-full bg-white text-[#5D75CB] shadow-[0_8px_24px_rgba(35,48,103,0.08)]">
                <Layers3 aria-hidden="true" className="size-[18px]" />
              </span>
            </div>

            <div className="my-auto py-8">
              <div className="rounded-[22px] bg-white p-5 shadow-[0_18px_42px_rgba(35,48,103,0.1)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] text-[#7A82A8]">Текущая программа</p>
                    <p className="mt-1 text-[15px] font-medium text-[#202858]">
                      Адаптация в компании
                    </p>
                  </div>
                  <span className="rounded-full bg-[#ECEFFF] px-3 py-1.5 text-[11px] font-medium text-[#4C63B8]">
                    12 уроков
                  </span>
                </div>
                <div className="mt-6 h-2 rounded-full bg-[#ECEFFF]">
                  <div className="h-full w-[72%] rounded-full bg-[#5D75CB]" />
                </div>
                <div className="mt-3 flex justify-between text-[10px] text-[#7A82A8]">
                  <span>Прогресс команды</span>
                  <span>72%</span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-[20px] bg-[#5D75CB] p-4 text-white">
                  <UsersRound aria-hidden="true" className="size-4 text-white/65" />
                  <p className="mt-5 text-[28px] font-medium tracking-[-0.04em]">186</p>
                  <p className="mt-1 text-[10px] text-white/60">участников</p>
                </div>
                <div className="rounded-[20px] bg-white p-4 text-[#202858]">
                  <BarChart3 aria-hidden="true" className="size-4 text-[#5D75CB]" />
                  <p className="mt-5 text-[28px] font-medium tracking-[-0.04em]">78%</p>
                  <p className="mt-1 text-[10px] text-[#7A82A8]">завершили курс</p>
                </div>
              </div>
            </div>

            <p className="border-t border-[#BFC9F1] pt-5 text-[12px] leading-6 text-[#68719B]">
              Все важные показатели видны сразу — без отдельных отчётов и
              ручной сверки данных.
            </p>
          </article>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {features.map(({ icon: Icon, number, text, title }) => (
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
