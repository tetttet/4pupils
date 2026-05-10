"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { AtlasDeepLinkCard, AtlasIntroPayload } from "@/lib/atlas/types";
import { AtlasBottomSheet } from "./AtlasBottomSheet";
import { AtlasDeepLinkCard as AtlasDeepLinkCardView } from "./AtlasDeepLinkCard";
import { AtlasFeatureCard } from "./AtlasFeatureCard";

type AtlasIntroResponseProps = {
  intro: AtlasIntroPayload;
};

export function AtlasIntroResponse({ intro }: AtlasIntroResponseProps) {
  const prefersReducedMotion = useReducedMotion();
  const [activeLink, setActiveLink] = useState<AtlasDeepLinkCard | null>(null);

  return (
    <>
      <motion.div
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        className="mt-4 space-y-4"
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
        transition={
          prefersReducedMotion
            ? undefined
            : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
        }
      >
        {intro.featureCards.length ? (
          <section className="space-y-3 mt-10">
            {intro.featureTitle ? (
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
                {intro.featureTitle}
              </p>
            ) : null}

            <div className="space-y-3">
              <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-5 sm:px-5 [&::-webkit-scrollbar]:hidden">
                {intro.featureCards.map((card, index) => (
                  <div className="min-w-full snap-center" key={card.title}>
                    <AtlasFeatureCard card={card} index={index} />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-1.5">
                {intro.featureCards.map((card) => (
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-6 rounded-full bg-[var(--bubble-border)]"
                    key={`feature-indicator-${card.title}`}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {intro.deepLinks.length ? (
          <section className="space-y-3 mt-10">
            {intro.deepLinksTitle ? (
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
                {intro.deepLinksTitle}
              </p>
            ) : null}

            <div className="space-y-2.5">
              {intro.deepLinks.map((card, index) => (
                <AtlasDeepLinkCardView
                  card={card}
                  index={index}
                  key={card.href}
                  onOpen={setActiveLink}
                />
              ))}
            </div>
          </section>
        ) : null}
      </motion.div>

      <AtlasBottomSheet
        card={activeLink}
        isOpen={Boolean(activeLink)}
        onClose={() => setActiveLink(null)}
      />
    </>
  );
}
