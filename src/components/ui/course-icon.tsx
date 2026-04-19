"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { CourseIconType } from "@/types/course";

// ─── types ───────────────────────────────────────────────────────────────────

export type CourseIconAnimationMode = "hover" | "always";

type CourseIconProps = {
  type: CourseIconType;
  className?: string;
  animationMode?: CourseIconAnimationMode;
};

// ─── animation variants ──────────────────────────────────────────────────────

const frameVariants = {
  rest: { y: 0, scale: 1, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" },
  hover: {
    y: -5,
    scale: 1.015,
    boxShadow: "0 16px 40px rgba(0,0,0,0.10)",
    transition: { type: "spring", stiffness: 340, damping: 28 } as const,
  },
};

const floatA = {
  rest: { y: 0 },
  hover: {
    y: [0, -6, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } as const,
  },
};

const floatB = {
  rest: { y: 0 },
  hover: {
    y: [0, -8, 0],
    transition: {
      duration: 3.4,
      repeat: Infinity,
      ease: "easeInOut",
      delay: 0.4,
    } as const,
  },
};

const floatC = {
  rest: { y: 0 },
  hover: {
    y: [0, -5, 0],
    transition: {
      duration: 2.8,
      repeat: Infinity,
      ease: "easeInOut",
      delay: 0.8,
    } as const,
  },
};

const swayA = {
  rest: { rotate: -12 },
  hover: {
    rotate: [-12, -14, -12],
    y: [0, -5, 0],
    transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" } as const,
  },
};

const swayB = {
  rest: { rotate: 14 },
  hover: {
    rotate: [14, 12, 14],
    y: [0, -4, 0],
    transition: {
      duration: 2.9,
      repeat: Infinity,
      ease: "easeInOut",
      delay: 0.3,
    } as const,
  },
};

const breathe = {
  rest: { scale: 1 },
  hover: {
    scale: [1, 1.04, 1],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } as const,
  },
};

const breatheY = {
  rest: { scaleY: 1 },
  hover: {
    scaleY: [1, 1.04, 1],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } as const,
  },
};

const breatheX = {
  rest: { scaleX: 1 },
  hover: {
    scaleX: [1, 1.04, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
      delay: 0.5,
    } as const,
  },
};

const spinSlow = {
  rest: { rotate: 45 },
  hover: {
    rotate: [45, 405],
    transition: { duration: 12, repeat: Infinity, ease: "linear" } as const,
  },
};

const spinSmall = {
  rest: { rotate: 45 },
  hover: {
    rotate: [45, 405],
    transition: { duration: 12, repeat: Infinity, ease: "linear" } as const,
  },
};

const pulseA = (delay = 0) => ({
  rest: { scale: 1, opacity: 0.55 },
  hover: {
    scale: [1, 1.2, 1],
    opacity: [0.55, 0.9, 0.55],
    transition: {
      duration: 2.4,
      repeat: Infinity,
      ease: "easeInOut",
      delay,
    } as const,
  },
});

const orbitSlow = {
  rest: { rotate: 0 },
  hover: {
    rotate: [0, 360],
    transition: { duration: 14, repeat: Infinity, ease: "linear" } as const,
  },
};

const shimmerA = {
  rest: { x: 0, opacity: 0.8 },
  hover: {
    x: [-4, 4, -4],
    opacity: [0.8, 1, 0.8],
    transition: { duration: 4.2, repeat: Infinity, ease: "easeInOut" } as const,
  },
};

function getSceneAnimationProps(
  prefersReduced: boolean,
  animationMode: CourseIconAnimationMode,
) {
  if (prefersReduced) {
    return { animate: "rest" as const, initial: "rest" as const };
  }

  if (animationMode === "always") {
    return { animate: "hover" as const, initial: "rest" as const };
  }

  return {
    animate: "rest" as const,
    initial: "rest" as const,
    whileHover: "hover" as const,
  };
}

// ─── inner frame ─────────────────────────────────────────────────────────────

function IconFrame({
  animationMode,
  glowClassName,
  className,
  children,
}: {
  animationMode: CourseIconAnimationMode;
  glowClassName: string;
  className?: string;
  children: ReactNode;
}) {
  const prefersReduced = useReducedMotion() ?? false;
  const sceneAnimationProps = getSceneAnimationProps(
    prefersReduced,
    animationMode,
  );

  return (
    <motion.div
      aria-hidden="true"
      className={cn(
        "relative h-42 w-full overflow-hidden rounded-4xl bg-[linear-gradient(180deg,#fbfbfb_0%,#f1f3f6_100%)] lg:h-62.5",
        className,
      )}
      variants={prefersReduced ? undefined : frameVariants}
      initial="rest"
      animate="rest"
      whileHover={prefersReduced ? undefined : "hover"}
    >
      {/* Glass sheen */}
      <div className="absolute inset-0 z-[1] bg-[linear-gradient(135deg,rgba(255,255,255,0.82),rgba(255,255,255,0)_48%,rgba(255,255,255,0.28)_100%)]" />
      {/* Glow */}
      <div className={cn("absolute inset-0 z-[0]", glowClassName)} />
      {/* Grid */}
      <div className="absolute inset-0 z-[2] opacity-70 [background-image:linear-gradient(to_right,rgba(255,255,255,0.75)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.75)_1px,transparent_1px)] [background-size:34px_34px] [mask-image:radial-gradient(circle_at_center,black_26%,transparent_76%)]" />
      {/* Blobs */}
      <div className="absolute -left-10 top-4 z-[0] h-24 w-24 rounded-full bg-white/80 blur-2xl" />
      <div className="absolute -right-8 bottom-0 z-[0] h-28 w-28 rounded-full bg-white/55 blur-3xl" />
      {/* Shapes */}
      <motion.div className="absolute inset-0 z-[3]" {...sceneAnimationProps}>
        {children}
      </motion.div>
    </motion.div>
  );
}

// ─── blue composition ─────────────────────────────────────────────────────────

function BlueComposition() {
  return (
    <>
      <motion.div
        variants={floatA}
        className="absolute left-1/2 top-1/2 h-[118px] w-[164px] -translate-x-[58%] -translate-y-[58%] rounded-[30px] border border-[#90c4ff] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(225,239,255,0.92))] shadow-[0_26px_44px_rgba(95,155,229,0.18)]"
      />
      <motion.div
        variants={floatB}
        className="absolute left-1/2 top-1/2 h-[104px] w-[150px] -translate-x-[28%] -translate-y-[10%] rounded-[28px] border border-[#badbff] bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(231,243,255,0.78))] shadow-[0_18px_35px_rgba(95,155,229,0.12)]"
      />
      {/* Static lines */}
      <div className="absolute left-1/2 top-1/2 h-[18px] w-[72px] -translate-x-[86%] -translate-y-[170%] rounded-full bg-[#6caeff]/35" />
      <div className="absolute left-1/2 top-1/2 h-[10px] w-[102px] -translate-x-[82%] -translate-y-[20px] rounded-full bg-[#d6eaff]" />
      <div className="absolute left-1/2 top-1/2 h-[10px] w-[76px] -translate-x-[82%] translate-y-[4px] rounded-full bg-white/80" />
      <div className="absolute left-1/2 top-1/2 h-[10px] w-[52px] -translate-x-[82%] translate-y-[28px] rounded-full bg-white/65" />
      <motion.div
        variants={floatC}
        className="absolute left-1/2 top-1/2 h-[88px] w-[44px] translate-x-[18px] -translate-y-[34%] rounded-[18px] border border-[#9bcaff] bg-[linear-gradient(180deg,#ffffff,#ddebff)] shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]"
      />
    </>
  );
}

// ─── orange composition ───────────────────────────────────────────────────────

function OrangeComposition() {
  return (
    <>
      <motion.div
        variants={swayA}
        className="absolute left-1/2 top-1/2 h-[126px] w-[126px] -translate-x-[58%] -translate-y-[54%] rounded-[34px] border border-[#ffc2b0] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,226,216,0.92))] shadow-[0_24px_44px_rgba(255,132,97,0.16)]"
      />
      <motion.div
        variants={swayB}
        className="absolute left-1/2 top-1/2 h-[144px] w-[144px] -translate-x-[40%] -translate-y-[40%] rounded-[38px] border border-[#ff9e82] bg-[linear-gradient(180deg,rgba(255,245,239,0.96),rgba(255,181,154,0.96))] shadow-[0_28px_46px_rgba(255,132,97,0.22)]"
      />
      <motion.div
        variants={floatA}
        className="absolute left-1/2 top-1/2 h-[118px] w-[54px] -translate-x-1/2 -translate-y-1/2 rounded-[999px] border border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,243,236,0.88))] shadow-[0_0_0_10px_rgba(255,255,255,0.38)]"
      />
      <motion.div
        variants={pulseA(0)}
        className="absolute left-1/2 top-1/2 h-[16px] w-[16px] -translate-x-1/2 -translate-y-[42px] rounded-full bg-[#ff8d69]/50"
      />
      <motion.div
        variants={pulseA(0.6)}
        className="absolute left-1/2 top-1/2 h-[14px] w-[14px] -translate-x-1/2 translate-y-[32px] rounded-full bg-white/75"
      />
    </>
  );
}

// ─── mint composition ─────────────────────────────────────────────────────────

function MintComposition() {
  return (
    <>
      <motion.div
        variants={breatheY}
        className="absolute left-1/2 top-1/2 h-[170px] w-[56px] -translate-x-1/2 -translate-y-1/2 rounded-[22px] border border-[#7be9de] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(184,246,237,0.92))] shadow-[0_24px_40px_rgba(78,222,209,0.18)]"
      />
      <motion.div
        variants={breatheX}
        className="absolute left-1/2 top-1/2 h-[56px] w-[170px] -translate-x-1/2 -translate-y-1/2 rounded-[22px] border border-[#7be9de] bg-[linear-gradient(90deg,rgba(255,255,255,0.96),rgba(184,246,237,0.92))] shadow-[0_24px_40px_rgba(78,222,209,0.18)]"
      />
      <motion.div
        variants={breathe}
        className="absolute left-1/2 top-1/2 h-[104px] w-[104px] -translate-x-1/2 -translate-y-1/2 rounded-[30px] border border-[#6ee7dc] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(208,255,248,0.94))] shadow-[0_22px_36px_rgba(78,222,209,0.16)]"
      />
      <motion.div
        variants={pulseA(0)}
        className="absolute left-1/2 top-1/2 h-[18px] w-[18px] -translate-x-[82px] -translate-y-[56px] rounded-full bg-[#88eee3]/55"
      />
      <motion.div
        variants={pulseA(0.6)}
        className="absolute left-1/2 top-1/2 h-[18px] w-[18px] translate-x-[64px]  -translate-y-[56px] rounded-full bg-white/70"
      />
      <motion.div
        variants={pulseA(1.1)}
        className="absolute left-1/2 top-1/2 h-[18px] w-[18px] -translate-x-[82px] translate-y-[40px]  rounded-full bg-white/70"
      />
      <motion.div
        variants={pulseA(1.6)}
        className="absolute left-1/2 top-1/2 h-[18px] w-[18px] translate-x-[64px]  translate-y-[40px]  rounded-full bg-[#88eee3]/55"
      />
    </>
  );
}

// ─── pink composition ─────────────────────────────────────────────────────────

function PinkComposition() {
  return (
    <>
      <motion.div
        variants={floatA}
        className="absolute left-1/2 top-1/2 h-[146px] w-[146px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[14px] border-[#f3a2c8] bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.95),rgba(255,239,246,0.82)_55%,rgba(255,255,255,0)_56%)] shadow-[0_24px_44px_rgba(239,142,189,0.18)]"
      />
      <motion.div
        variants={spinSlow}
        style={{ translateX: "-50%", translateY: "-50%" }}
        className="absolute left-1/2 top-1/2 h-[84px] w-[84px] rounded-[24px] border border-[#ef9cc4] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,232,243,0.92))]"
      />
      <motion.div
        variants={spinSmall}
        style={{ translateX: "26px", translateY: "-26px" }}
        className="absolute left-1/2 top-1/2 h-[48px] w-[48px] rounded-[16px] border border-white/90 bg-white/70"
      />
      <motion.div
        variants={pulseA(0)}
        className="absolute left-1/2 top-1/2 h-[32px] w-[32px] -translate-x-[54px] translate-y-[38px] rounded-full bg-[#f8bfd9]/55"
      />
    </>
  );
}

// ─── indigo composition ───────────────────────────────────────────────────────

function IndigoComposition() {
  return (
    <>
      <motion.div
        variants={orbitSlow}
        style={{ translateX: "-50%", translateY: "-50%" }}
        className="absolute left-1/2 top-1/2 h-[150px] w-[150px] rounded-full border-[14px] border-[#a6b0ff] bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.95),rgba(235,239,255,0.9)_58%,rgba(255,255,255,0)_59%)] shadow-[0_24px_46px_rgba(103,117,230,0.18)]"
      >
        <div className="absolute left-1/2 top-[-6px] h-[24px] w-[24px] -translate-x-1/2 rounded-full border border-white/80 bg-white/88 shadow-[0_10px_20px_rgba(103,117,230,0.18)]" />
      </motion.div>
      <motion.div
        variants={floatB}
        className="absolute left-1/2 top-1/2 h-[102px] w-[102px] -translate-x-1/2 -translate-y-1/2 rounded-[30px] border border-[#96a3ff] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(225,231,255,0.92))] shadow-[0_22px_38px_rgba(103,117,230,0.16)]"
      />
      <motion.div
        variants={shimmerA}
        className="absolute left-1/2 top-1/2 h-[12px] w-[72px] -translate-x-1/2 -translate-y-[16px] rounded-full bg-white/82"
      />
      <motion.div
        variants={shimmerA}
        className="absolute left-1/2 top-1/2 h-[12px] w-[44px] -translate-x-[38px] translate-y-[14px] rounded-full bg-[#dfe5ff]"
      />
      <motion.div
        variants={pulseA(0.3)}
        className="absolute left-1/2 top-1/2 h-[18px] w-[18px] translate-x-[58px] -translate-y-[44px] rounded-full bg-[#a4afff]/55"
      />
    </>
  );
}

// ─── amber composition ────────────────────────────────────────────────────────

function AmberComposition() {
  return (
    <>
      <motion.div
        variants={breathe}
        className="absolute left-1/2 top-1/2 h-[146px] w-[156px] -translate-x-1/2 -translate-y-1/2 rounded-[34px] border border-[#ffd07a] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,241,201,0.92))] shadow-[0_24px_44px_rgba(230,169,56,0.18)]"
      />
      <motion.div
        variants={shimmerA}
        className="absolute left-1/2 top-1/2 h-[14px] w-[88px] -translate-x-[64px] -translate-y-[50px] rounded-full bg-[#f0b64d]/35"
      />
      <motion.div
        variants={floatA}
        className="absolute left-1/2 top-1/2 h-[78px] w-[30px] -translate-x-[54px] translate-y-[16px] rounded-[16px] border border-white/90 bg-white/82 shadow-[0_12px_24px_rgba(230,169,56,0.08)]"
      />
      <motion.div
        variants={floatB}
        className="absolute left-1/2 top-1/2 h-[112px] w-[30px] -translate-x-[12px] rounded-[16px] border border-[#ffcf73] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,213,125,0.9))] shadow-[0_18px_30px_rgba(230,169,56,0.14)]"
      />
      <motion.div
        variants={floatC}
        className="absolute left-1/2 top-1/2 h-[58px] w-[30px] translate-x-[30px] translate-y-[26px] rounded-[16px] border border-white/90 bg-white/78 shadow-[0_12px_24px_rgba(230,169,56,0.08)]"
      />
      <motion.div
        variants={pulseA(0.5)}
        className="absolute left-1/2 top-1/2 h-[18px] w-[18px] translate-x-[56px] -translate-y-[48px] rounded-full bg-[#ffd070]/55"
      />
    </>
  );
}

const glowClassNameByType: Record<CourseIconType, string> = {
  blue: "bg-[radial-gradient(circle_at_22%_20%,rgba(129,183,255,0.24),transparent_28%),radial-gradient(circle_at_82%_72%,rgba(93,164,255,0.18),transparent_32%)]",
  orange:
    "bg-[radial-gradient(circle_at_22%_24%,rgba(255,171,145,0.28),transparent_26%),radial-gradient(circle_at_80%_72%,rgba(255,130,92,0.18),transparent_32%)]",
  mint: "bg-[radial-gradient(circle_at_20%_24%,rgba(133,238,228,0.28),transparent_26%),radial-gradient(circle_at_80%_76%,rgba(73,221,207,0.18),transparent_34%)]",
  pink: "bg-[radial-gradient(circle_at_24%_22%,rgba(247,191,219,0.3),transparent_28%),radial-gradient(circle_at_78%_76%,rgba(238,145,193,0.18),transparent_32%)]",
  indigo:
    "bg-[radial-gradient(circle_at_24%_20%,rgba(145,160,255,0.28),transparent_28%),radial-gradient(circle_at_78%_74%,rgba(104,118,234,0.18),transparent_34%)]",
  amber:
    "bg-[radial-gradient(circle_at_22%_22%,rgba(255,207,115,0.28),transparent_28%),radial-gradient(circle_at_78%_76%,rgba(230,169,56,0.18),transparent_34%)]",
};

// ─── public export ────────────────────────────────────────────────────────────

export function CourseIcon({
  type,
  className,
  animationMode = "hover",
}: CourseIconProps) {
  return (
    <IconFrame
      animationMode={animationMode}
      className={className}
      glowClassName={glowClassNameByType[type]}
    >
      {type === "blue" && <BlueComposition />}
      {type === "orange" && <OrangeComposition />}
      {type === "mint" && <MintComposition />}
      {type === "pink" && <PinkComposition />}
      {type === "indigo" && <IndigoComposition />}
      {type === "amber" && <AmberComposition />}
    </IconFrame>
  );
}
