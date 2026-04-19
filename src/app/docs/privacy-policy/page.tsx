"use client";
import React, { useEffect, useMemo, useState } from "react";

type SectionItem = {
  id: string;
  title: string;
  content: React.ReactNode;
};

const sections: SectionItem[] = [
  {
    id: "section-1",
    title: "Что регулирует настоящая политика конфиденциальности",
    content: (
      <>
        <p>
          Настоящая политика конфиденциальности (далее — Политика) действует в
          отношении всей информации, включая персональные данные в понимании
          применимого законодательства, которую ООО «ЯНДЕКС» и/или его
          аффилированные лица, в том числе входящие в одну группу с ООО
          «ЯНДЕКС», могут получить о Вас в процессе использования Вами любых
          сайтов, программ, продуктов и/или сервисов.
        </p>
        <p>
          Политика распространяется на информацию, которую Вы предоставляете
          самостоятельно, а также на данные, получаемые автоматически в рамках
          использования сайтов и сервисов. Использование отдельных продуктов
          может регулироваться дополнительными условиями, которые дополняют или
          изменяют положения настоящей Политики.
        </p>
      </>
    ),
  },
  {
    id: "section-2",
    title: "Кто обрабатывает информацию",
    content: (
      <>
        <p>
          Для обеспечения использования Вами Сайтов и Сервисов Ваша Персональная
          информация собирается и используется Яндексом, в том числе включая
          общество с ограниченной ответственностью «ЯНДЕКС», юридическое лицо,
          созданное по законодательству Российской Федерации.
        </p>
        <p>
          С информацией о том, какое лицо предоставляет тот или иной Сервис, Вы
          можете ознакомиться в условиях использования соответствующего Сервиса.
          Направить обращение лицу, ответственному за организацию обработки
          персональных данных, можно по адресу электронной почты, указанному в
          соответствующих документах.
        </p>
      </>
    ),
  },
  {
    id: "section-3",
    title: "Какова цель данной Политики",
    content: (
      <>
        <p>
          Защита Вашей Персональной информации и Вашей конфиденциальности
          чрезвычайно важны. Поэтому при использовании Вами Сайтов и Сервисов
          Яндекс защищает и обрабатывает Вашу Персональную информацию в строгом
          соответствии с применимым законодательством.
        </p>
        <p>
          Целью настоящей Политики является информирование Вас о том, какие
          данные могут собираться, каким образом они используются, на каких
          основаниях обрабатываются и какие права доступны Вам в связи с такой
          обработкой.
        </p>
      </>
    ),
  },
  {
    id: "section-4",
    title: "Какую Персональную информацию о Вас собирает Яндекс",
    content: (
      <>
        <p>
          Яндекс может собирать информацию, которую Вы предоставляете при
          регистрации, использовании Сервисов, обращении в поддержку, а также
          данные, формируемые автоматически: IP-адрес, сведения об устройстве,
          cookie, информацию о браузере, технические журналы и сведения о
          действиях в интерфейсах.
        </p>
        <p>
          В зависимости от конкретного Сервиса набор данных может отличаться.
          Более подробные сведения указываются в соответствующих документах,
          интерфейсах согласия и дополнительных уведомлениях.
        </p>
      </>
    ),
  },
  {
    id: "section-5",
    title:
      "Какова правовая основа и цели обработки Вашей Персональной информации",
    content: (
      <>
        <p>
          Обработка данных может осуществляться для исполнения договоров,
          соблюдения требований законодательства, предоставления
          функциональности Сервисов, коммуникации с пользователями, повышения
          качества работы продуктов, предотвращения злоупотреблений и
          обеспечения безопасности.
        </p>
        <p>
          В случаях, предусмотренных законодательством, обработка может
          основываться на Вашем согласии либо на иных правовых основаниях, прямо
          предусмотренных применимыми нормами.
        </p>
      </>
    ),
  },
  {
    id: "section-6",
    title: "Как Яндекс защищает Вашу Персональную информацию",
    content: (
      <>
        <p>
          Яндекс принимает необходимые и достаточные организационные и
          технические меры для защиты Вашей Персональной информации от
          неправомерного или случайного доступа, уничтожения, изменения,
          блокирования, копирования, распространения, а также от иных
          неправомерных действий третьих лиц.
        </p>
      </>
    ),
  },
  {
    id: "section-7",
    title:
      "Кто еще имеет доступ к Вашей Персональной информации и кому она может быть передана",
    content: (
      <>
        <p>
          Доступ к информации может предоставляться аффилированным лицам,
          подрядчикам, партнёрам и иным лицам только в объёме, необходимом для
          достижения целей обработки и при наличии соответствующих правовых
          оснований и договорных механизмов.
        </p>
      </>
    ),
  },
  {
    id: "section-8",
    title: "Как долго мы храним Вашу Персональную информацию",
    content: (
      <>
        <p>
          Срок хранения определяется целями обработки, требованиями
          законодательства, сроками действия договоров, необходимостью защиты
          прав и законных интересов, а также иными обязательными требованиями.
        </p>
      </>
    ),
  },
  {
    id: "section-9",
    title: "Ваши права",
    content: (
      <>
        <p>
          Вы можете иметь право на доступ к данным, их уточнение, удаление,
          ограничение обработки, отзыв согласия, переносимость данных, а также
          иные права, предусмотренные применимым законодательством.
        </p>
      </>
    ),
  },
  {
    id: "section-10",
    title:
      "Как мы используем файлы cookie и другие подобные технологии на Сайтах или при использовании Вами Сервисов",
    content: (
      <>
        <p>
          Мы можем использовать cookie, пиксели, локальное хранилище и иные
          подобные технологии для работы сайта, аналитики, сохранения
          предпочтений, улучшения пользовательского опыта и обеспечения
          безопасности.
        </p>
      </>
    ),
  },
  {
    id: "section-11",
    title: "Обновление настоящей Политики",
    content: (
      <>
        <p>
          Политика может время от времени изменяться. Актуальная версия всегда
          публикуется на соответствующей странице. При внесении существенных
          изменений мы можем дополнительно уведомлять пользователей доступными
          способами.
        </p>
      </>
    ),
  },
  {
    id: "section-12",
    title: "Вопросы и предложения",
    content: (
      <>
        <p>
          Если у Вас есть вопросы, замечания или предложения относительно
          настоящей Политики либо обработки Персональной информации, Вы можете
          использовать контактные данные, указанные в документации и на
          соответствующих страницах Сервисов.
        </p>
      </>
    ),
  },
];

const PrivacyPolicy = () => {
  const [activeId, setActiveId] = useState(sections[0].id);
  const [progress, setProgress] = useState(0);

  const sectionIds = useMemo(() => sections.map((item) => item.id), []);

  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY;
      const maxScroll = doc.scrollHeight - window.innerHeight;
      const nextProgress =
        maxScroll > 0 ? Math.min(Math.max(scrollTop / maxScroll, 0), 1) : 0;
      setProgress(nextProgress);

      let currentId = sectionIds[0];

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;

        const rect = el.getBoundingClientRect();
        if (rect.top <= 140) {
          currentId = id;
        }
      }

      setActiveId(currentId);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [sectionIds]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const top = el.getBoundingClientRect().top + window.scrollY - 36;

    window.scrollTo({
      top,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen text-[#232323]">
      <div className="mx-auto flex w-full max-w-360 gap-12 px-6 py-10 sm:px-8 lg:px-10">
        <main className="min-w-0 flex-1 max-w-300">
          <div className="animate-[fadeIn_0.7s_ease-out]">
            <h1 className="text-[18px] font-semibold leading-[1.05] tracking-[-0.03em] text-[#222222] sm:text-[32px]">
              Политика конфиденциальности
            </h1>

            <div className="mt-10 space-y-0 text-[15px] leading-8 text-[#3f3f46]">
              <p>
                <span className="text-[#2b2b2b]">Дата публикации:</span> 26
                августа 2025 г.
              </p>
              <p className="break-all">
                <span className="text-[#2b2b2b]">
                  Текущая версия доступна по адресу:
                </span>{" "}
                <a
                  href="https://yandex.ru/legal/confidential/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#3b6cff] underline-offset-4 transition hover:underline"
                >
                  https://yandex.ru/legal/confidential/
                </a>
                .
              </p>
            </div>
          </div>

          <div className="mt-14 space-y-12">
            {sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-12 opacity-0 animate-[sectionIn_0.6s_ease-out_forwards]"
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                <h2 className="text-[24px] font-semibold leading-[1.12] tracking-[-0.03em] text-[#232323]">
                  {index + 1}. {section.title}
                </h2>

                <div className="mt-4 space-y-6 text-[15px] leading-[1.72] text-[#303030]">
                  {section.content}
                </div>
              </section>
            ))}
          </div>
        </main>

        <aside className="relative hidden w-60 shrink-0 xl:block">
          <div className="sticky top-8">
            <div className="relative pl-8">
              <div className="absolute left-3 top-0 h-full w-px bg-[#d5d5d5]" />

              <div
                className="absolute left-3 top-0 w-px bg-[#262626] transition-all duration-300 ease-out"
                style={{
                  height: `${Math.max(progress * 100, 8)}%`,
                }}
              />

              <div className="mb-6 text-[15px] font-semibold text-[#2b2b2b]">
                В этой статье:
              </div>

              <nav className="space-y-4">
                {sections.map((item, index) => {
                  const isActive = activeId === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => scrollToSection(item.id)}
                      className="group block w-full text-left"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`text-[13px] transition-colors duration-200 font-medium ${
                            isActive ? "text-[#232323]" : "text-[#989898]"
                          }`}
                        >
                          {index + 1}. {item.title}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        html {
          scroll-behavior: smooth;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes sectionIn {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default PrivacyPolicy;
