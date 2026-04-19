"use client";

import { Flame, Sparkles } from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

type StreakFireBadgeProps = {
  value: string;
  label?: string;
  hint?: string;
  compact?: boolean;
  className?: string;
};

export function StreakFireBadge({
  value,
  label = "Учебный стрик",
  hint,
  compact = false,
  className,
}: StreakFireBadgeProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden border border-amber-200/70 bg-gradient-to-r from-white via-amber-50 to-orange-50 shadow-sm",
        compact ? "rounded-[22px] px-3.5 py-2.5" : "rounded-[26px] px-4 py-3",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.24),transparent_48%)]"
      />

      <motion.div
        aria-hidden
        className="absolute right-2 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-amber-300/30 blur-2xl"
        animate={{
          opacity: [0.35, 0.6, 0.35],
          scale: [0.95, 1.08, 0.95],
        }}
        transition={{
          duration: 3.4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <div className="relative flex items-center gap-3">
        <motion.div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-white/90 shadow-sm",
            compact ? "h-9 w-9" : "h-11 w-11",
          )}
          animate={{
            scale: [1, 1.08, 1],
            rotate: [0, 5, -4, 0],
            boxShadow: [
              "0 0 0 rgba(251,191,36,0.0)",
              "0 10px 24px rgba(251,191,36,0.22)",
              "0 0 0 rgba(251,191,36,0.0)",
            ],
          }}
          transition={{
            duration: 2.8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <Flame
            className={cn(
              "text-amber-600",
              compact ? "h-4 w-4" : "h-5 w-5",
            )}
          />
        </motion.div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700/80">
            <span className="truncate">{label}</span>
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-orange-500" />
          </div>

          <div className="mt-1 flex items-baseline gap-2">
            <span
              className={cn(
                "truncate font-semibold tracking-[-0.02em] text-slate-950",
                compact ? "text-sm" : "text-base",
              )}
            >
              {value}
            </span>

            {hint ? (
              <span className="truncate text-xs text-slate-500">{hint}</span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
