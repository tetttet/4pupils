import React from "react";
import {
  Flame,
  Sparkles,
  Zap,
  Megaphone,
  BadgeCheck,
  BriefcaseBusiness,
} from "lucide-react";

type CardProps = {
  badge: string;
  title: string;
  description: string;
  price: string;
  note: string;
  button: string;
  variant?: "default" | "featured";
};

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

const FeaturedVisual = () => {
  return (
    <div className="relative mt-7 h-[295px] w-full overflow-hidden">
      <div className="absolute left-[-36px] top-[34px] h-[2px] w-[250px] rotate-[-4deg] bg-white/35" />
      <div className="absolute left-[-10px] top-[62px] h-[1px] w-[220px] rotate-[-8deg] bg-white/20" />

      <div className="absolute left-2 top-10 space-y-7 text-[16px] leading-[1.05] text-white/82">
        <p>Создай список дел...</p>
        <p>
          Проанализируй
          <br />
          эти документы
          <br />и напиши...
        </p>
        <p>
          Создай саммари
          <br />
          встречи...
        </p>
        <p>
          Напиши текст
          <br />
          для презентации...
        </p>
      </div>

      <div className="absolute left-[168px] top-[10px] h-[235px] w-[235px] rounded-[28px] bg-white/18 backdrop-blur-[2px]" />

      <div className="absolute left-[190px] top-[28px] h-[230px] w-[230px] overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#d9d5ff_0%,#9a8cff_40%,#3c2fb6_100%)] shadow-[0_18px_40px_rgba(40,24,126,0.38)]">
        <img
          src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80"
          alt="AI visual"
          className="h-full w-full object-cover mix-blend-multiply opacity-95"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.7),transparent_28%),linear-gradient(90deg,rgba(138,120,255,0.15),rgba(108,84,255,0.45))]" />
      </div>

      <div className="absolute bottom-[18px] left-[154px] flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#6f61ff] shadow-[0_8px_25px_rgba(255,255,255,0.35)]">
        <Sparkles className="h-5 w-5" />
      </div>

      <div className="absolute right-[12px] top-[38px] h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle_at_40%_35%,rgba(255,255,255,0.5),rgba(158,138,255,0.7)_34%,rgba(102,82,255,0.7)_58%,rgba(89,66,238,0.5)_100%)] opacity-75 blur-[1px]" />
      <div className="absolute right-[46px] top-[72px] h-[150px] w-[150px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.28),rgba(255,255,255,0)_58%)]" />
    </div>
  );
};

const CourseCard = ({
  badge,
  title,
  description,
  price,
  note,
  button,
  variant = "default",
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
              ? "max-w-[420px] text-[34px]"
              : "max-w-[270px] text-[34px] text-[#222]",
          ].join(" ")}
        >
          {title}
        </h3>

        <p
          className={[
            "mx-auto mt-4 leading-[1.15]",
            isFeatured
              ? "max-w-[430px] text-[20px] text-white/88"
              : "max-w-[315px] text-[22px] text-[#6a6a6a]",
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
              <p>
                Суперсила программ — воркшопы. Узнаете обо всех новинках в
                режиме реального времени
              </p>
            </div>
          </div>

          <FeaturedVisual />
        </>
      ) : (
        <>
          {title.includes("маркетинга") ? <SideEmbossLeft /> : <SideEmbossRight />}
        </>
      )}

      <div className={isFeatured ? "mt-3 text-center" : "mt-2 text-center"}>
        <div
          className={[
            "font-semibold tracking-[-0.03em]",
            isFeatured ? "text-[28px] text-white" : "text-[28px] text-[#222]",
          ].join(" ")}
        >
          {price}
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
          isFeatured ? "bg-[#171717] text-white" : "bg-[#171717] text-white",
        ].join(" ")}
      >
        {button}
      </button>
    </div>
  );
};

export default function WorkSpaceCard() {
  return (
    <section className="min-h-screen w-full bg-[#f3f3f3] px-4 py-10 md:px-6 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <div className="mx-auto max-w-[980px] text-center">
          <h1 className="mx-auto max-w-[980px] text-[34px] font-normal leading-[1.03] tracking-[-0.04em] text-[#1b1b1b] md:text-[52px] lg:text-[64px]">
            Обучаем работе с ИИ так, как умеем только мы, с технологиями Яндекса
          </h1>

          <p className="mt-5 text-[20px] font-normal text-[#7b7b7b] md:text-[24px]">
            Самые практичные курсы по нейросетям
          </p>
        </div>

        <div className="mt-14 grid items-end gap-5 lg:grid-cols-[1fr_1.37fr_1fr]">
          <CourseCard
            badge="Практика на воркшопах"
            title="Нейросети для маркетинга"
            description="Внедрите нейросети в маркетинговые процессы, чтобы автоматизировать рутину и повысить эффективность работы."
            price="70 800 руб."
            note="*при оплате от юридического лица"
            button="В каталог"
          />

          <CourseCard
            badge="Горячая новинка"
            title="Нейросети для работы"
            description="Научим вас и вашу команду работать с 10 популярными нейросетями, автоматизировать рутину, генерировать идеи и применять их на практике"
            price="79 800 руб."
            note="*при оплате от юридического лица"
            button="В каталог"
            variant="featured"
          />

          <CourseCard
            badge="Практика на воркшопах"
            title="Нейросети для бизнеса"
            description="Освойте AI-инструменты, которые помогут повысить эффективность бизнеса, оптимизировать расходы и увеличить прибыль"
            price="97 200 руб."
            note="*при оплате от юридического лица"
            button="В каталог"
          />
        </div>
      </div>
    </section>
  );
}