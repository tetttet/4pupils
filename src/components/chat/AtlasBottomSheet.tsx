"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import type { AtlasDeepLinkCard } from "@/lib/atlas/types";
import { AtlasCoursePreview } from "./AtlasCoursePreview";
import { getAtlasVisualConfig } from "./atlas-card-visuals";

type AtlasBottomSheetProps = {
  card: AtlasDeepLinkCard | null;
  isOpen: boolean;
  onClose: () => void;
};

export function AtlasBottomSheet({
  card,
  isOpen,
  onClose,
}: AtlasBottomSheetProps) {
  const prefersReducedMotion = useReducedMotion();
  const isCoursePreviewCard = Boolean(
    card &&
      (card.visual === "courses" ||
        card.href === "/courses" ||
        card.href.includes("/courses")),
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  const visual = card ? getAtlasVisualConfig(card.visual) : null;
  const Icon = visual?.icon;

  return (
    <AnimatePresence>
      {isOpen && card ? (
        <>
          <motion.button
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1 }}
            aria-label="Закрыть карточку"
            className="fixed inset-0 z-40 bg-black/35 backdrop-blur-md"
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0 }}
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            onClick={onClose}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            type="button"
          />

          <motion.div
            animate={
              prefersReducedMotion
                ? { opacity: 1, y: 0 }
                : { opacity: 1, y: 0 }
            }
            aria-modal="true"
            className={`fixed inset-x-0 bottom-0 z-50 mx-auto w-full px-3 pb-3 sm:px-4 sm:pb-4 ${
              isCoursePreviewCard ? "max-w-5xl" : "max-w-xl"
            }`}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            initial={
              prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }
            }
            role="dialog"
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="overflow-hidden rounded-t-[30px] rounded-b-[28px] border border-white/55 bg-[var(--main-bg)]/96 shadow-[0_24px_80px_rgba(15,23,42,0.22)] backdrop-blur-2xl dark:border-white/8 dark:shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
              <div
                className="max-h-[88vh] overflow-y-auto overscroll-contain pr-1 sm:pr-1.5"
                style={{ scrollbarGutter: "stable" }}
              >
                <div className="flex justify-center pt-3">
                  <span className="h-1.5 w-12 rounded-full bg-[var(--border)]" />
                </div>

                <div className="space-y-5 px-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] pt-4 sm:px-6">
                  <div className="flex items-start gap-3">
                    {Icon && visual ? (
                      <div
                        className={`relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br ${visual.gradientClassName} shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:border-white/8`}
                      >
                        <div
                          aria-hidden="true"
                          className={`absolute -right-4 -top-4 h-14 w-14 rounded-full blur-xl ${visual.orbClassName}`}
                        />
                        <Icon className={`relative h-5 w-5 ${visual.iconClassName}`} />
                      </div>
                    ) : null}

                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
                        Быстрый переход
                      </p>
                      <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[var(--text)]">
                        {card.title}
                      </h3>
                      <p className="text-sm leading-6 text-[var(--muted)]">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  {isCoursePreviewCard ? (
                    <AtlasCoursePreview title={card.title} />
                  ) : (
                    <div>
                      <AtlasCoursePreview title={card.title} />
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Link
                      className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--action-bg)] px-4 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(15,118,110,0.28)] transition duration-300 hover:bg-[var(--action-hover)] active:scale-[0.98]"
                      href={card.href}
                      onClick={onClose}
                    >
                      <span>{card.actionLabel ?? "Открыть"}</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>

                    <button
                      className="inline-flex h-12 items-center justify-center rounded-2xl border border-[var(--bubble-border)] bg-[var(--assistant-bubble)] px-4 text-sm font-medium text-[var(--assistant-bubble-text)] transition duration-300 hover:bg-[var(--control-hover)] active:scale-[0.98]"
                      onClick={onClose}
                      type="button"
                    >
                      Закрыть
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
