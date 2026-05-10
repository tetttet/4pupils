"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { AtlasFeatureCard as AtlasFeatureCardData } from "@/lib/atlas/types";
import { getAtlasVisualConfig } from "./atlas-card-visuals";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

type AtlasFeatureCardProps = {
  card: AtlasFeatureCardData;
  index?: number;
};

export function AtlasFeatureCard({
  card,
  index = 0,
}: AtlasFeatureCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const visual = getAtlasVisualConfig(card.visual);
  const Icon = visual.icon;

  const content = (
    <>
      <div
        className={`relative overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br ${visual.gradientClassName} p-4 dark:border-white/8`}
      >
        <div
          aria-hidden="true"
          className={`absolute inset-auto right-0 top-0 h-20 w-20 -translate-y-4 translate-x-4 rounded-full blur-2xl ${visual.orbClassName}`}
        />
        <div
          className={`relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/60 bg-white/80 shadow-sm backdrop-blur ${visual.iconClassName} dark:border-white/10 dark:bg-white/8`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="space-y-2 px-1">
        <h4 className="text-sm font-semibold tracking-[-0.02em] text-[var(--assistant-bubble-text)]">
          {card.title}
        </h4>
        <p className="text-sm leading-6 text-[var(--muted)]">
          {card.description}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between px-1 pt-1 text-sm font-medium text-[var(--assistant-bubble-text)]">
        <span>{card.actionLabel}</span>
        {card.href ? (
          <ArrowUpRight className="h-4 w-4 text-[var(--muted)]" />
        ) : (
          <span className="h-2 w-2 rounded-full bg-[var(--accent)]/65" />
        )}
      </div>
    </>
  );

  const motionProps = prefersReducedMotion
    ? {}
    : {
        animate: { opacity: 1, y: 0, scale: 1 },
        initial: { opacity: 0, y: 18, scale: 0.98 },
        transition: {
          delay: 0.08 + index * 0.06,
          duration: 0.3,
          ease: EASE_OUT,
        },
        whileHover: card.href ? { y: -2 } : undefined,
        whileTap: { scale: 0.98 },
      };

  const className =
    "group flex h-full min-h-[13.5rem] flex-col gap-4 rounded-[28px] border border-[var(--bubble-border)] bg-[var(--assistant-bubble)]/88 p-4 backdrop-blur-xl transition duration-300 hover:border-[var(--accent)]/30";

  if (card.href) {
    return (
      <motion.div {...motionProps}>
        <Link className={className} href={card.href}>
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div {...motionProps} className={className}>
      {content}
    </motion.div>
  );
}
