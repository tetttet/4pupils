"use client";

import { ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { AtlasDeepLinkCard as AtlasDeepLinkCardData } from "@/lib/atlas/types";
import { getAtlasVisualConfig } from "./atlas-card-visuals";

type AtlasDeepLinkCardProps = {
  card: AtlasDeepLinkCardData;
  index?: number;
  onOpen: (card: AtlasDeepLinkCardData) => void;
};

export function AtlasDeepLinkCard({
  card,
  index = 0,
  onOpen,
}: AtlasDeepLinkCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const visual = getAtlasVisualConfig(card.visual);
  const Icon = visual.icon;

  return (
    <motion.button
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      className="group flex w-full items-center gap-3 rounded-2xl border border-[var(--bubble-border)]/90 bg-[var(--assistant-bubble)]/92 px-4 py-3 text-left shadow-[0_12px_34px_rgba(15,23,42,0.07)] backdrop-blur-xl transition duration-300 hover:border-[var(--accent)]/35 hover:bg-[var(--assistant-bubble)] active:scale-[0.98] dark:shadow-[0_16px_36px_rgba(0,0,0,0.24)]"
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 14 }}
      onClick={() => onOpen(card)}
      transition={
        prefersReducedMotion
          ? undefined
          : {
              delay: 0.2 + index * 0.05,
              duration: 0.28,
              ease: [0.22, 1, 0.36, 1],
            }
      }
      type="button"
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
    >
      <div
        className={`relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br ${visual.gradientClassName} shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:border-white/8`}
      >
        <div
          aria-hidden="true"
          className={`absolute -right-3 -top-3 h-12 w-12 rounded-full blur-xl ${visual.orbClassName}`}
        />
        <Icon className={`relative h-5 w-5 ${visual.iconClassName}`} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="truncate text-sm font-semibold text-[var(--assistant-bubble-text)]">
            {card.title}
          </h4>
        </div>
        <p className="mt-1 line-clamp-2 text-sm leading-5 text-[var(--muted)]">
          {card.description}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1 text-[var(--muted)] transition duration-300 group-hover:text-[var(--assistant-bubble-text)]">
        <span className="hidden text-xs font-medium sm:inline">
          {card.actionLabel ?? "Открыть"}
        </span>
        <ChevronRight className="h-4 w-4" />
      </div>
    </motion.button>
  );
}
