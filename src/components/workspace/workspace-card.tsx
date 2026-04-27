"use client";

import { Flame, Sparkles, Zap, Megaphone, BadgeCheck } from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import type { ComponentProps, Ref } from "react";
import { useRef } from "react";

type MotionSectionStyle = ComponentProps<typeof motion.section>["style"];
type MotionHeadingStyle = ComponentProps<typeof motion.h1>["style"];
type MotionTextStyle = ComponentProps<typeof motion.p>["style"];

type CardProps = {
  badge: string;
  title: string;
  description: string;
  highlight: string;
  note: string;
  button: string;
  variant?: "default" | "featured";
  illustration?: "left" | "right";
  featuredText?: string;
  featuredItems?: string[];
};

type CourseCardItem = CardProps & {
  id: string;
};

type WorkSpaceCardProps = {
  sectionRef?: Ref<HTMLElement>;
  sectionStyle?: MotionSectionStyle;
  headingStyle?: MotionHeadingStyle;
  subheadingStyle?: MotionTextStyle;
};

const workspaceCards: CourseCardItem[] = [
  {
    id: "all-courses",
    badge: "Все курсы в одном месте",
    title: "Внутренние тренинги и внешние уроки в едином пространстве",
    description:
      "Соберите обучение для сотрудников и клиентов на одной платформе и назначайте курсы отдельным сотрудникам, отделам или всей компании сразу.",
    highlight: "Единое пространство",
    note: "Для сотрудников, отделов и всей компании",
    button: "Создать страницу компании",
    illustration: "left",
  },
  {
    id: "fast-start",
    badge: "Простой старт",
    title: "Создайте страницу компании и начните обучение в первый день",
    description:
      "Заполните собственное образовательное пространство, настройте сайт под стиль вашего бренда и откройте гибкий доступ к платформе без долгого запуска.",
    highlight: "0 тенге",
    note: "первые 3 месяца — бесплатно",
    button: "Начать бесплатно",
    variant: "featured",
    featuredText:
      "Суперсила сайта — в доступности. Откройте для себя удобство запуска, настройки и управления обучением в одном интерфейсе.",
    featuredItems: [
      "Настройте сайт\nпод стиль бренда",
      "Загрузите готовые курсы\nили создайте новые",
      "Откройте доступ\nсотрудникам, партнерам и клиентам",
      "Гибкий старт\nс первого дня",
    ],
  },
  {
    id: "analytics",
    badge: "Аналитика прогресса",
    title: "Держите развитие компании под контролем",
    description:
      "Отслеживайте результаты сотрудников и успех курсов через удобный интерфейс без лишних отчетов, таблиц и бумаг.",
    highlight: "Прозрачная аналитика",
    note: "Прогресс сотрудников и эффективность курсов",
    button: "Посмотреть возможности",
    illustration: "right",
  },
];

const SideEmbossLeft = () => {
  return (
    <div className="relative mx-auto mt-8 h-[150px] w-[220px]">
      <div className="absolute left-0 top-7 flex items-center justify-center rounded-[32px] bg-[#efefef] shadow-[inset_8px_8px_16px_rgba(255,255,255,0.95),inset_-8px_-8px_16px_rgba(203,203,203,0.65),0_8px_18px_rgba(255,255,255,0.6)] h-[88px] w-[88px]">
        <Megaphone className="h-11 w-11 text-[#d7d7d7] stroke-[1.8]" />
      </div>

      <div className="absolute left-[78px] top-[10px] flex items-center justify-center rounded-[36px] bg-[#efefef] shadow-[inset_8px_8px_16px_rgba(255,255,255,0.95),inset_-8px_-8px_16px_rgba(203,203,203,0.65),0_8px_18px_rgba(255,255,255,0.6)] h-[112px] w-[112px]">
        <svg
          viewBox="0 0 24 24"
          className="h-14 w-14 text-[#d7d7d7]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.65-7 10-7 10Z" />
        </svg>
      </div>
    </div>
  );
};

const SideEmbossRight = () => {
  return (
    <div className="relative mx-auto mt-8 h-[150px] w-[220px]">
      <div className="absolute left-0 top-[30px] flex h-[96px] w-[96px] items-center justify-center rounded-full bg-[#efefef] shadow-[inset_8px_8px_16px_rgba(255,255,255,0.95),inset_-8px_-8px_16px_rgba(203,203,203,0.65),0_8px_18px_rgba(255,255,255,0.6)]">
        <svg
          viewBox="0 0 24 24"
          className="h-12 w-12 text-[#d8d8d8]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5.5 18c1.8-3 4.1-4.5 6.5-4.5s4.7 1.5 6.5 4.5" />
        </svg>
      </div>

      <div className="absolute left-[72px] top-[12px] flex h-[126px] w-[126px] items-center justify-center rounded-[22px] bg-[#efefef] shadow-[inset_10px_10px_18px_rgba(255,255,255,0.98),inset_-10px_-10px_18px_rgba(200,200,200,0.7),0_8px_18px_rgba(255,255,255,0.6)]">
        <BadgeCheck className="h-14 w-14 text-[#d7d7d7] stroke-[1.8]" />
      </div>

      <div className="absolute right-0 top-[30px] flex h-[96px] w-[96px] items-center justify-center rounded-full bg-[#efefef] shadow-[inset_8px_8px_16px_rgba(255,255,255,0.95),inset_-8px_-8px_16px_rgba(203,203,203,0.65),0_8px_18px_rgba(255,255,255,0.6)]">
        <Sparkles className="h-12 w-12 text-[#d8d8d8] stroke-[1.8]" />
      </div>
    </div>
  );
};

const FeaturedVisual = ({
  items = [
    "Настройте сайт\nпод стиль бренда",
    "Загрузите готовые курсы\nили создайте новые",
    "Откройте доступ\nсотрудникам, партнерам и клиентам",
    "Гибкий старт\nс первого дня",
  ],
}: {
  items?: string[];
}) => {
  return (
    <div className="relative mt-7 h-[300px] w-full overflow-hidden rounded-[32px]">
      <div className="absolute left-0 top-8 z-20 max-w-[160px] space-y-6 text-[16px] leading-[1.05] text-white/82">
        {items.map((item) => (
          <p key={item} className="whitespace-pre-line">
            {item}
          </p>
        ))}
      </div>

      <div className="absolute right-[88px] top-[22px] h-[230px] w-[230px] rounded-[32px] bg-white/14 backdrop-blur-[3px]" />

      <div className="absolute right-[58px] top-[38px] h-[224px] w-[224px] overflow-hidden rounded-[32px] bg-[linear-gradient(180deg,#dad5ff_0%,#a395ff_38%,#4334cc_100%)] shadow-[0_20px_45px_rgba(33,21,110,0.35)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_20%,rgba(255,255,255,0.72),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.1),rgba(76,56,215,0.18))]" />
      </div>

      <div className="absolute right-[24px] top-[30px] z-30 flex h-[92px] w-[92px] items-center justify-center rounded-full bg-[#efefef] shadow-[inset_8px_8px_16px_rgba(255,255,255,0.95),inset_-8px_-8px_16px_rgba(203,203,203,0.65),0_10px_24px_rgba(255,255,255,0.28)]">
        <Sparkles className="h-10 w-10 text-[#d7d7d7] stroke-[1.8]" />
      </div>

      <div className="absolute right-[186px] top-[196px] z-30 flex h-[74px] w-[74px] items-center justify-center rounded-[24px] bg-[#efefef] shadow-[inset_8px_8px_16px_rgba(255,255,255,0.95),inset_-8px_-8px_16px_rgba(203,203,203,0.65),0_10px_24px_rgba(255,255,255,0.24)]">
        <BadgeCheck className="h-9 w-9 text-[#d7d7d7] stroke-[1.8]" />
      </div>

      <div className="absolute bottom-[26px] right-[18px] z-30 flex h-[86px] w-[86px] items-center justify-center rounded-[28px] bg-[#efefef] shadow-[inset_10px_10px_18px_rgba(255,255,255,0.98),inset_-10px_-10px_18px_rgba(200,200,200,0.7),0_10px_24px_rgba(255,255,255,0.24)]">
        <svg
          viewBox="0 0 24 24"
          className="h-10 w-10 text-[#d7d7d7]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.65-7 10-7 10Z" />
        </svg>
      </div>

      <div className="absolute bottom-[22px] right-[120px] z-20 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#6f61ff] shadow-[0_8px_25px_rgba(255,255,255,0.32)]">
        <Sparkles className="h-5 w-5" />
      </div>

      <div className="absolute right-[42px] top-[66px] h-[168px] w-[168px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.24),rgba(255,255,255,0)_62%)]" />
    </div>
  );
};

const CourseCard = ({
  badge,
  title,
  description,
  highlight,
  note,
  button,
  variant = "default",
  illustration,
  featuredText,
  featuredItems,
}: CardProps) => {
  const isFeatured = variant === "featured";

  return (
    <div
      className={[
        "relative rounded-[28px] transition-all duration-300",
        isFeatured
          ? "z-10 min-h-[700px] bg-[linear-gradient(135deg,#6b63f6_0%,#7a71ff_35%,#6a66f4_100%)] px-10 pb-8 pt-14 text-white shadow-[0_30px_80px_rgba(93,87,255,0.38)]"
          : "min-h-[598px] bg-[#ececec] px-8 pb-8 pt-5 text-[#222] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]",
      ].join(" ")}
    >
      <div className="flex justify-center">
        <div
          className={[
            "inline-flex items-center gap-2 rounded-full px-5 py-3 text-[15px] font-medium",
            isFeatured
              ? "absolute -top-6 bg-white text-[#2f2f2f] shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
              : "bg-[#f2f2f2] text-[#2e2e2e] shadow-[inset_0_1px_0_rgba(255,255,255,1),0_4px_14px_rgba(0,0,0,0.04)]",
          ].join(" ")}
        >
          {isFeatured ? (
            <Flame className="h-5 w-5 text-[#ff7a2f]" />
          ) : (
            <Zap className="h-4 w-4 fill-current" />
          )}
          <span>{badge}</span>
        </div>
      </div>

      <div className={isFeatured ? "mt-2 text-center" : "mt-8 text-center"}>
        <h3
          className={[
            "mx-auto font-medium leading-[0.98]",
            isFeatured
              ? "max-w-[470px] text-[34px]"
              : "max-w-[320px] text-[31px] text-[#222]",
          ].join(" ")}
        >
          {title}
        </h3>

        <p
          className={[
            "mx-auto mt-4 leading-[1.15]",
            isFeatured
              ? "max-w-[460px] text-[20px] text-white/88"
              : "max-w-[340px] text-[20px] text-[#6a6a6a]",
          ].join(" ")}
        >
          {description}
        </p>
      </div>

      {isFeatured ? (
        <>
          <div className="mt-5 rounded-[22px] border border-white/30 bg-white/12 px-6 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-sm">
            <div className="flex items-center gap-3 text-[14px] leading-[1.2] text-white/90">
              <Zap className="h-6 w-6 shrink-0 fill-white" />
              <p>{featuredText}</p>
            </div>
          </div>

          <FeaturedVisual items={featuredItems} />
        </>
      ) : (
        <>
          {illustration === "left" ? (
            <SideEmbossLeft />
          ) : (
            <SideEmbossRight />
          )}
        </>
      )}

      <div className={isFeatured ? "mt-3 text-center" : "mt-2 text-center"}>
        <div
          className={[
            "font-semibold tracking-[-0.03em]",
            isFeatured ? "text-[28px] text-white" : "text-[28px] text-[#222]",
          ].join(" ")}
        >
          {highlight}
        </div>
        <p
          className={[
            "mt-1 text-[16px]",
            isFeatured ? "text-white/65" : "text-[#7b7b7b]",
          ].join(" ")}
        >
          {note}
        </p>
      </div>

      <button
        className={[
          "mt-6 h-14 w-full rounded-xl text-[18px] font-medium transition-transform duration-200 hover:scale-[1.02]",
          isFeatured ? "bg-[#1e2754] text-white" : "bg-[#1e2754] text-white",
        ].join(" ")}
      >
        {button}
      </button>
    </div>
  );
};

function DesktopWorkspaceCards() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [leftCard, featuredCard, rightCard] = workspaceCards;

  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start 88%", "center 54%"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 28,
    mass: 0.24,
  });

  const leftX = useTransform(smoothProgress, [0, 1], [210, 0]);
  const leftY = useTransform(smoothProgress, [0, 1], [56, 0]);
  const leftScale = useTransform(smoothProgress, [0, 1], [0.9, 1]);
  const leftOpacity = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [0.46, 0.78, 1],
  );
  const leftRotateZ = useTransform(smoothProgress, [0, 1], [3, 0]);
  const leftRotateY = useTransform(smoothProgress, [0, 1], [14, 0]);

  const rightX = useTransform(smoothProgress, [0, 1], [-210, 0]);
  const rightY = useTransform(smoothProgress, [0, 1], [56, 0]);
  const rightScale = useTransform(smoothProgress, [0, 1], [0.9, 1]);
  const rightOpacity = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [0.46, 0.78, 1],
  );
  const rightRotateZ = useTransform(smoothProgress, [0, 1], [-3, 0]);
  const rightRotateY = useTransform(smoothProgress, [0, 1], [-14, 0]);

  const centerY = useTransform(smoothProgress, [0, 1], [44, 0]);
  const centerScale = useTransform(smoothProgress, [0, 1], [0.95, 1]);
  const centerOpacity = useTransform(smoothProgress, [0, 1], [0.84, 1]);

  const desktopMotionClass =
    "transform-gpu [backface-visibility:hidden] [transform-style:preserve-3d]";

  return (
    <div ref={sceneRef} className="mt-14 hidden lg:block">
      <div className="[perspective:1800px]">
        <div className="grid items-end gap-5 lg:grid-cols-[1fr_1.37fr_1fr]">
          <motion.div
            className={`relative z-10 origin-bottom-right ${desktopMotionClass}`}
            style={
              prefersReducedMotion
                ? undefined
                : {
                    x: leftX,
                    y: leftY,
                    scale: leftScale,
                    opacity: leftOpacity,
                    rotateZ: leftRotateZ,
                    rotateY: leftRotateY,
                    transformPerspective: 1800,
                    willChange: "transform, opacity",
                  }
            }
          >
            <CourseCard {...leftCard} />
          </motion.div>

          <motion.div
            className={`relative z-20 ${desktopMotionClass}`}
            style={
              prefersReducedMotion
                ? undefined
                : {
                    y: centerY,
                    scale: centerScale,
                    opacity: centerOpacity,
                    willChange: "transform, opacity",
                  }
            }
          >
            <CourseCard {...featuredCard} />
          </motion.div>

          <motion.div
            className={`relative z-10 origin-bottom-left ${desktopMotionClass}`}
            style={
              prefersReducedMotion
                ? undefined
                : {
                    x: rightX,
                    y: rightY,
                    scale: rightScale,
                    opacity: rightOpacity,
                    rotateZ: rightRotateZ,
                    rotateY: rightRotateY,
                    transformPerspective: 1800,
                    willChange: "transform, opacity",
                  }
            }
          >
            <CourseCard {...rightCard} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function WorkSpaceCard({
  sectionRef,
  sectionStyle,
  headingStyle,
  subheadingStyle,
}: WorkSpaceCardProps) {
  return (
    <motion.section
      ref={sectionRef}
      className="min-h-screen w-full bg-[#f3f3f3] px-4 py-10 md:px-6 lg:px-10"
      style={sectionStyle}
    >
      <div className="mx-auto max-w-[1440px] my-10 lg:my-20">
        <div className="mx-auto max-w-[980px] text-center">
          <motion.h1
            className="mx-auto max-w-[980px] text-[34px] font-normal leading-[1.03] tracking-[-0.04em] text-[#1b1b1b] md:text-[52px] lg:text-[60px]"
            style={headingStyle}
          >
            Все корпоративное обучение в одном месте
          </motion.h1>

          <motion.p
            className="mt-5 text-[20px] font-normal text-[#7b7b7b] md:text-[24px]"
            style={subheadingStyle}
          >
            Создайте страницу компании, загрузите готовые курсы или соберите
            новые прямо на платформе и откройте доступ сотрудникам,
            партнерам и клиентам.
          </motion.p>
        </div>

        <div className="mt-14 grid items-end gap-5 lg:hidden">
          {workspaceCards.map(({ id, ...card }) => (
            <CourseCard key={id} {...card} />
          ))}
        </div>

        <DesktopWorkspaceCards />
      </div>
    </motion.section>
  );
}
