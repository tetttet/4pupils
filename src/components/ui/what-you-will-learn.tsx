import React from "react";
import {
  Briefcase,
  SlidersHorizontal,
  User,
  FileText,
  Settings,
} from "lucide-react";

type WhatYouWillLearnCard = {
  title: string;
  description: string;
};

type Props = {
  topItems: string[];
  bottomCards: WhatYouWillLearnCard[];
  languageLabel: string;
  levelLabel: string;
  categoryLabel: string;
};

const icons = [Briefcase, SlidersHorizontal, User, Settings, FileText];

export default function WhatYouWillLearn({
  topItems,
  bottomCards,
  languageLabel,
  levelLabel,
  categoryLabel,
}: Props) {
  const detailCards = [
    {
      title: languageLabel,
      description:
        languageLabel === "Не указано"
          ? "Язык курса будет уточнён отдельно. Даже без этого раздел помогает заранее понять формат обучения и сориентироваться, как будет выстроена подача материала."
          : `Курс проходит на языке «${languageLabel}». Объяснения, примеры и учебные материалы подаются последовательно и в одном контексте, чтобы вам было проще держать темп и уверенно двигаться по программе.`,
    },
    {
      title: levelLabel,
      description:
        levelLabel === "Не указано"
          ? "Точный уровень подготовки пока не указан, поэтому курс можно рассматривать как удобную точку входа в тему. По описанию программы вы сможете оценить нагрузку и понять, насколько комфортным будет старт."
          : `Программа рассчитана на уровень «${levelLabel}». Материал выстроен так, чтобы шаг за шагом провести вас от ключевых основ к практическим задачам без резких скачков по сложности и перегруза лишней теорией.`,
    },
    {
      title: categoryLabel,
      description:
        categoryLabel === "Общая категория"
          ? "Курс охватывает универсальное направление, которое помогает собрать цельное представление о теме и увидеть, как полученные знания применяются на практике в реальных учебных сценариях."
          : `Курс относится к категории «${categoryLabel}». Это значит, что акцент сделан на навыках, инструментах и подходах, которые действительно важны в этом направлении и помогают быстрее перейти от изучения к практике.`,
    },
  ];

  return (
    <section className="w-full p-4">
      <div className="mx-auto max-w-355 px-4 md:px-6 lg:px-8">
        <div className="rounded-[28px] bg-white px-6 py-6 md:px-8 md:py-7">
          <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
            {topItems.map((text, index) => {
              const Icon = icons[index % icons.length];

              return (
                <div key={index} className="flex items-start gap-5">
                  <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-[#f7f7f8] text-[#2f2f2f]">
                    <Icon className="h-5 w-5" />
                  </div>

                  <p className="capitalize whitespace-pre-line pt-1 text-[14px] font-semibold leading-[1.28] tracking-[-0.02em] text-[#2f2f2f] md:text-[16px]">
                    {text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-14 md:pt-20">
          <h2 className="text-[28px] font-semibold leading-none tracking-[-0.04em] text-[#242424] md:text-[42px]">
            Что вы узнаете
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {bottomCards.map((card, index) => (
              <div key={index} className="min-h-48 md:min-h-58 rounded-[22px] bg-white p-6">
                <h3 className="text-[18px] md:text-[24px] font-bold leading-[1.1] tracking-[-0.03em] text-black capitalize">
                  {card.title}
                </h3>

                <p className="mt-5 max-w-[95%] text-[16px] md:text-[18px] leading-[1.45] tracking-[-0.02em] text-[#363636]">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-14 md:pt-20">
          <h2 className="text-[28px] font-semibold leading-none tracking-[-0.04em] text-[#242424] md:text-[42px]">
            Важные детали курса
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {detailCards.map((card, index) => (
              <div key={index} className="min-h-48 md:min-h-58 rounded-[22px] bg-white p-6">
                <h3 className="text-[18px] md:text-[24px] font-bold leading-[1.1] tracking-[-0.03em] text-black capitalize">
                  {card.title}
                </h3>

                <p className="mt-5 max-w-[95%] text-[16px] md:text-[18px] leading-[1.45] tracking-[-0.02em] text-[#363636]">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
