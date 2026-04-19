"use client";
import { useMemo, useState } from "react";

type TabKey = "hr" | "leaders" | "companies";

const tabContent: Record<
  TabKey,
  {
    badge: string;
    title: string;
    points: string[];
    stat: string;
    statTitle: string;
    guideTitle: string;
    cta: string;
  }
> = {
  hr: {
    badge: "HR, L&D",
    title:
      "Помогаем компаниям размещать свои курсы на платформе так, чтобы обучение было удобным и для команды, и для бизнеса",
    points: [
      "Публикуйте внутренние и внешние курсы в одном корпоративном пространстве",
      "Создавайте фирменную страницу компании с понятной витриной обучения",
      "Открывайте доступ сотрудникам, клиентам и партнёрам на одной платформе",
    ],
    stat: "73%",
    statTitle:
      "компаний выбирают единую страницу с собственными курсами, чтобы обучение было доступным, понятным и удобным для всей команды",
    guideTitle:
      "Гайд. Как оформить корпоративную страницу и начать размещать свои курсы на платформе",
    cta: "Получить гайд",
  },
  leaders: {
    badge: "Руководителям",
    title:
      "Покажите руководителям понятный формат запуска обучения: одна страница, свои курсы, единая точка доступа для всей компании",
    points: [
      "Собирайте все программы и обучающие материалы в одном месте",
      "Быстрее запускайте обучение для отделов, команд и новых сотрудников",
      "Контролируйте, как корпоративное обучение выглядит для бизнеса и команды",
    ],
    stat: "81%",
    statTitle:
      "руководителей считают удобную корпоративную витрину курсов самым простым способом масштабировать обучение внутри компании",
    guideTitle:
      "Подборка. Как руководителю быстро запустить страницу компании с курсами без сложной разработки",
    cta: "Смотреть подборку",
  },
  companies: {
    badge: "Компаниям",
    title:
      "Создайте корпоративную страницу, где ваша компания сможет размещать собственные курсы, программы и обучающие продукты под своим брендом",
    points: [
      "Запускайте брендированную страницу компании с вашими курсами и описаниями",
      "Добавляйте программы для сотрудников, клиентов, партнёров и B2B-заказчиков",
      "Используйте платформу как единое пространство для роста, адаптации и обучения",
    ],
    stat: "89%",
    statTitle:
      "компаний хотят размещать собственные курсы на готовой платформе, чтобы не тратить ресурсы на отдельную разработку",
    guideTitle:
      "Инструкция. Как компании запустить свою страницу на платформе и выкладывать курсы в одном месте",
    cta: "Открыть инструкцию",
  },
};

export default function CorporatePlatformLanding() {
  const [activeTab, setActiveTab] = useState<TabKey>("hr");

  const current = useMemo(() => tabContent[activeTab], [activeTab]);

  return (
    <div className="min-h-screen bg-[#1e2754] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-305 flex-col px-4 pb-6 pt-5 sm:px-5 md:px-7 md:pb-8 lg:px-8 lg:pb-10">
        <section className="flex flex-col items-center pt-8 text-center sm:pt-10 md:pt-14 lg:pt-6">
          <h1 className="max-w-210 text-[28px] font-light leading-[1.02] tracking-[-0.05em] text-white sm:text-[38px] md:text-[50px] lg:text-[60px]">
            Корпоративная страница
            <br />
            для компаний, которые
            <br />
            размещают свои курсы
          </h1>

          <button className="mt-7 h-11.5 rounded-[10px] bg-white px-6 text-[14px] font-medium text-[#1e2754] transition hover:bg-[#eef2ff] sm:mt-8 sm:h-12 sm:px-7 sm:text-[15px]">
            Запустить страницу
          </button>

          <div className="mt-8 flex w-full max-w-190 flex-wrap items-center justify-center gap-2 rounded-[18px] bg-[#27336b] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:mt-10 sm:gap-0 sm:rounded-3xl sm:p-1.5">
            {(
              [
                ["hr", "HR, L&D"],
                ["leaders", "Руководителям"],
                ["companies", "Компаниям"],
              ] as [TabKey, string][]
            ).map(([key, label]) => {
              const isActive = activeTab === key;

              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`min-w-37.5 rounded-2xl px-4 py-3 text-[14px] font-medium transition sm:flex-1 sm:rounded-[10px] sm:px-6 ${
                    isActive
                      ? "bg-[#3b4a8f] text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
                      : "text-white/75 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-5 grid grid-cols-1 gap-4 lg:mt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-6">
          <div className="relative overflow-hidden rounded-[24px] bg-[#27336b] px-5 pb-0 pt-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] sm:px-6 sm:pt-6 md:px-7 md:pt-7">
            <h2 className="max-w-140 text-[22px] font-normal leading-[1.1] tracking-[-0.04em] text-white sm:text-[26px] md:text-[32px] lg:text-[36px]">
              {current.title}
            </h2>

            <div className="mt-6 space-y-4 pb-55 sm:space-y-5 sm:pb-62.5 md:mt-7 md:pb-72.5">
              {current.points.map((item) => (
                <div key={item} className="flex items-start gap-3 sm:gap-4">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#8fa4ff]/15 text-[#c6d2ff] sm:h-7 sm:w-7">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.5 10.5L8.5 14.5L15.5 6.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <p className="max-w-115 text-[15px] font-normal leading-[1.28] tracking-[-0.03em] text-white/92 sm:text-[16px] md:text-[18px] lg:text-[19px]">
                    {item}
                  </p>
                </div>
              ))}
            </div>

            <div className="select-none absolute bottom-0 left-0 right-0 h-48.75 overflow-hidden rounded-t-[22px] border border-b-0 border-[#6f88ff] bg-[#202b5e] sm:h-[220px] md:h-[270px]">
              <div className="absolute left-4 top-4 flex gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#6f88ff]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#8fa4ff]" />
              </div>

              <div className="absolute left-1/2 top-0 h-4 w-24 -translate-x-1/2 rounded-b-[18px] border-b border-[#6f88ff] sm:w-[112px]" />
              <div className="absolute right-4 top-3 text-[20px] font-medium leading-none text-[#aebcff] sm:text-[22px]">
                LMS
              </div>

              <div className="absolute inset-x-0 bottom-0 top-8.5 flex items-end justify-center">
                <div className="relative h-[145px] w-[250px] rounded-[24px] border border-[#7187f7] bg-[#25316a] shadow-[0_30px_70px_rgba(4,10,36,0.45)] sm:h-[165px] sm:w-[290px] md:h-[190px] md:w-[330px]">
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                    <div>
                      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#aebcff]">
                        Learning Hub
                      </div>
                      <div className="mt-1 text-[13px] text-white/90 sm:text-[14px]">
                        Внутреннее обучение
                      </div>
                    </div>
                    <div className="rounded-full bg-[#6f88ff] px-3 py-1 text-[11px] font-medium text-white">
                      24 курса
                    </div>
                  </div>

                  <div className="space-y-3 px-4 py-4">
                    <div className="rounded-[16px] border border-white/10 bg-white/5 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[13px] font-medium text-white sm:text-[14px]">
                            Онбординг команды
                          </div>
                          <div className="mt-1 text-[11px] text-white/60 sm:text-[12px]">
                            Адаптация • База знаний
                          </div>
                        </div>
                        <div className="text-[11px] font-medium text-[#bcd0ff]">
                          82%
                        </div>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-white/10">
                        <div className="h-2 w-[82%] rounded-full bg-[#7d95ff]" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-[16px] border border-white/10 bg-white/5 p-3">
                        <div className="text-[11px] text-white/60">Сотрудники</div>
                        <div className="mt-1 text-[18px] font-light text-white">
                          240+
                        </div>
                      </div>
                      <div className="rounded-[16px] border border-white/10 bg-white/5 p-3">
                        <div className="text-[11px] text-white/60">Программы</div>
                        <div className="mt-1 text-[18px] font-light text-white">
                          18
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -right-5 top-[34px] hidden rounded-[18px] border border-[#89a0ff] bg-[#eef2ff] px-4 py-3 shadow-[0_20px_40px_rgba(7,12,40,0.18)] md:block">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4e62b8]">
                      Новый курс
                    </div>
                    <div className="mt-1 text-[13px] font-medium text-[#1e2754]">
                      Продажи для B2B
                    </div>
                  </div>

                  <div className="absolute -left-6 bottom-5 hidden h-[56px] w-[56px] items-center justify-center rounded-[18px] border border-[#89a0ff] bg-[#dfe7ff] text-[#1e2754] shadow-[0_18px_36px_rgba(7,12,40,0.18)] md:flex">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 7.5C4 6.67157 4.67157 6 5.5 6H18.5C19.3284 6 20 6.67157 20 7.5V16.5C20 17.3284 19.3284 18 18.5 18H5.5C4.67157 18 4 17.3284 4 16.5V7.5Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                      <path
                        d="M8 10H16"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                      <path
                        d="M8 14H13"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:gap-6">
            <div className="rounded-[24px] bg-[#27336b] px-5 py-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] sm:px-6 sm:py-6 md:px-7 md:py-7">
              <div className="text-[68px] font-light leading-[0.9] tracking-[-0.07em] text-white sm:text-[84px] md:text-[98px] lg:text-[108px]">
                {current.stat}
              </div>

              <p className="mt-5 max-w-[480px] text-[18px] font-normal leading-[1.08] tracking-[-0.04em] text-white/78 sm:text-[20px] md:mt-6 md:text-[23px] lg:mt-7 lg:text-[26px]">
                {current.statTitle}
              </p>
            </div>

            <div className="rounded-[24px] bg-[#4a67d6] px-5 py-5 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.04)] sm:px-6 sm:py-6 md:px-7 md:py-7">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[12px] font-medium text-[#4d5b93] sm:text-[13px]">
                <span className="inline-flex h-4 w-4 items-center justify-center text-[#4a67d6]">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 1.5V14.5M1.5 8H14.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                    <path
                      d="M3 4.5H13V11.5H3V4.5Z"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                  </svg>
                </span>
                Бесплатно
              </div>

              <h3 className="mx-auto mt-6 max-w-[500px] text-[20px] font-normal leading-[1.08] tracking-[-0.04em] text-white sm:text-[22px] md:text-[25px] lg:mt-7">
                {current.guideTitle}
              </h3>

              <button className="mt-7 h-[44px] rounded-[10px] bg-white px-8 text-[14px] font-medium text-[#1e2754] transition hover:bg-[#eef2ff] sm:h-[46px] sm:px-12 sm:text-[15px]">
                {current.cta}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}