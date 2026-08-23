import { ArrowUpRight, Check, Rocket, Sparkles } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Соберите пространство",
    text: "Добавьте название, описание и визуальный стиль компании. Техническая команда не понадобится.",
  },
  {
    number: "02",
    title: "Добавьте обучение",
    text: "Загрузите готовые материалы или создайте курсы и адаптационные треки с нуля.",
  },
  {
    number: "03",
    title: "Пригласите участников",
    text: "Откройте доступ сотрудникам, клиентам или партнёрам и следите за их прогрессом.",
  },
];

const launchBenefits = [
  "Первые 3 месяца бесплатно",
  "Без сложного внедрения",
  "Поддержка при запуске",
];

export default function FlexiblePaymentSection() {
  return (
    <section className="relative overflow-hidden bg-[#F8F9FF] py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-5">
        <div className="grid gap-5 border-t border-[#D7DDF8] pt-6 md:grid-cols-[0.34fr_0.66fr] md:gap-10 lg:pt-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#5D75CB] sm:text-[12px]">
            Быстрый старт
          </p>
          <div>
            <h2 className="max-w-[18ch] text-[34px] font-medium leading-[1.08] tracking-[-0.045em] text-[#202858] sm:text-[44px] lg:text-[52px]">
              От идеи до первого курса — три понятных шага.
            </h2>
            <p className="mt-6 max-w-[61ch] text-[14px] leading-7 text-[#68719B] sm:text-[15px]">
              Начните с небольшого пилота, соберите обратную связь и развивайте
              систему в темпе вашей компании.
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {steps.map((step, index) => (
            <article
              className="group relative flex min-h-[300px] flex-col overflow-hidden rounded-[28px] bg-white p-6 shadow-[0_12px_38px_rgba(35,48,103,0.055)] sm:p-7"
              key={step.number}
            >
              <div className="pointer-events-none absolute -right-20 -top-20 size-44 rounded-full border-[32px] border-[#5D75CB] opacity-[0.045] transition-transform duration-500 group-hover:scale-110" />
              <div className="relative flex items-center justify-between border-b border-[#E4E8FA] pb-5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#5D75CB]">
                  Шаг {step.number}
                </span>
                <span className="grid size-8 place-items-center rounded-full bg-[#ECEFFF] text-[#4C63B8]">
                  <Check aria-hidden="true" className="size-4" strokeWidth={2} />
                </span>
              </div>
              <h3 className="relative mt-8 max-w-[13ch] text-[27px] font-medium leading-[1.08] tracking-[-0.04em] text-[#202858]">
                {step.title}
              </h3>
              <p className="relative mt-auto max-w-[38ch] pt-6 text-[13px] leading-6 text-[#68719B]">
                {step.text}
              </p>
              {index < steps.length - 1 && (
                <span className="absolute -right-2 top-1/2 z-10 hidden size-8 -translate-y-1/2 place-items-center rounded-full bg-[#5D75CB] text-white shadow-[0_8px_20px_rgba(35,48,103,0.16)] lg:grid">
                  <ArrowUpRight aria-hidden="true" className="size-3.5" />
                </span>
              )}
            </article>
          ))}
        </div>

        <div className="relative isolate mt-5 overflow-hidden rounded-[28px] bg-[#5D75CB] p-6 text-white shadow-[0_22px_54px_rgba(76,99,184,0.2)] sm:rounded-[32px] sm:p-9 lg:p-10">
          <div className="pointer-events-none absolute -right-40 -top-44 -z-10 size-[430px] rounded-full border-[74px] border-white opacity-[0.07]" />
          <div className="pointer-events-none absolute -bottom-44 left-[42%] -z-10 size-[360px] rounded-full border-[62px] border-[#202858] opacity-[0.09]" />

          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.09] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/75">
                <Sparkles aria-hidden="true" className="size-3.5" />
                Готовы начать
              </span>
              <h3 className="mt-7 max-w-[15ch] text-[34px] font-medium leading-[1.04] tracking-[-0.045em] sm:text-[44px] lg:text-[50px]">
                Запустите обучение, которое растёт вместе с компанией.
              </h3>
              <ul className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-6">
                {launchBenefits.map((benefit) => (
                  <li className="flex items-center gap-2 text-[12px] text-white/68 sm:text-[13px]" key={benefit}>
                    <Check aria-hidden="true" className="size-4 text-white" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              className="group inline-flex h-14 w-fit shrink-0 items-center gap-3 rounded-full bg-white pl-6 pr-2 text-[14px] font-medium text-[#233067] shadow-[0_12px_28px_rgba(32,40,88,0.16)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#F7F8FF]"
              href="/auth/sign-up"
            >
              Начать бесплатно
              <span className="grid size-10 place-items-center rounded-full bg-[#233067] text-white transition-transform duration-300 group-hover:rotate-6">
                <Rocket aria-hidden="true" className="size-4" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
