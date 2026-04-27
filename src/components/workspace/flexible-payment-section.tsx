"use client";

import { motion } from "motion/react";
import React, { type ComponentProps, type Ref } from "react";
import { Check, Heart, Circle, Sparkles } from "lucide-react";

type MotionSectionStyle = ComponentProps<typeof motion.section>["style"];
type MotionHeadingStyle = ComponentProps<typeof motion.h2>["style"];

type FlexiblePaymentSectionProps = {
  sectionRef?: Ref<HTMLElement>;
  sectionStyle?: MotionSectionStyle;
  headingStyle?: MotionHeadingStyle;
};

type PaymentCardProps = {
  icon: React.ReactNode;
  title: string;
  features: string[];
};

const paymentCards: PaymentCardProps[] = [
  {
    icon: (
      <Heart
        className="h-8 w-8 fill-[#6c63ff] text-[#6c63ff]"
        strokeWidth={1.8}
      />
    ),
    title: "Проверка качества",
    features: [
      "Следим за стандартами платформы",
      "Собираем отзывы учеников",
      "Проверяем структуру и подачу материалов перед публикацией",
      "Помогаем поддерживать понятный и аккуратный пользовательский опыт",
    ],
  },
  {
    icon: <Circle className="h-8 w-8 text-[#6c63ff]" strokeWidth={2.2} />,
    title: "Быстрый старт",
    features: [
      "Без сложных настроек и технических специалистов",
      "Загружайте курсы уже в первый день",
      "Запускайте страницу компании без долгой подготовки и разработки",
      "Быстро подключайте команду и начинайте обучение в привычном темпе",
    ],
  },
  {
    icon: <Sparkles className="h-8 w-8 text-[#6c63ff]" strokeWidth={2.2} />,
    title: "Доступное начало",
    features: [
      "Начните бесплатно первые 3 месяца",
      "Станьте одними из первых и получите скидки на дальнейшее использование",
      "Тестируйте платформу на реальных задачах и первых группах",
      "Постепенно расширяйте обучение",
    ],
  },
];

function PaymentCard({ icon, title, features }: PaymentCardProps) {
  return (
    <div className="flex min-h-[560px] flex-col rounded-[28px] bg-[#2b2b2d] px-7 pb-7 pt-10">
      <div className="mb-7 flex justify-center">{icon}</div>

      <h3 className="mx-auto mb-10 max-w-[320px] whitespace-pre-line text-center text-[28px] font-normal leading-[1.12] tracking-[-0.03em] text-white">
        {title}
      </h3>

      <div className="space-y-0">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex min-h-[72px] items-center gap-4 border-t border-white/10 py-4 "
          >
            <Check
              className="h-5 w-5 shrink-0 text-white/70"
              strokeWidth={2.2}
            />
            <p className="whitespace-pre-line text-[17px] leading-[1.15] tracking-[-0.02em] text-white/60">
              {feature}
            </p>
          </div>
        ))}
      </div>

      <button
        className="mt-8 h-[62px] w-full rounded-[8px] bg-[#f3f3f4] text-[18px] font-medium tracking-[-0.02em] text-[#232325] transition hover:bg-white"
        type="button"
      >
        Оставить заявку
      </button>
    </div>
  );
}

export default function FlexiblePaymentSection({
  sectionRef,
  sectionStyle,
  headingStyle,
}: FlexiblePaymentSectionProps) {
  return (
    <motion.section
      ref={sectionRef}
      className="w-full bg-[#171719] px-6 py-20 text-white md:px-10 lg:px-16 lg:py-24"
      style={sectionStyle}
    >
      <div className="mx-auto max-w-[1180px] my-10 lg:my-18">
        <motion.h2
          className="mb-14 text-center text-[34px] font-normal leading-none tracking-[-0.04em] text-white md:text-[56px]"
          style={headingStyle}
        >
          Почему 4Pupils?
        </motion.h2>

        <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
          {paymentCards.map((card, index) => (
            <PaymentCard
              key={index}
              icon={card.icon}
              title={card.title}
              features={card.features}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
