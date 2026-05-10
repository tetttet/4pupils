"use client";

import type { MouseEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";

type ChatSuggestionsProps = {
  chips: string[];
  isDisabled: boolean;
  onChipClick: (chip: string) => void;
};

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function ChatSuggestions({
  chips,
  isDisabled,
  onChipClick,
}: ChatSuggestionsProps) {
  const prefersReducedMotion = useReducedMotion();

  if (!chips.length) {
    return null;
  }

  const handleChipClick = (
    chip: string,
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    const button = event.currentTarget;
    const ripple = document.createElement("span");

    ripple.className = "chip-ripple";
    ripple.style.cssText = `
      position:absolute;inset:0;border-radius:inherit;
      background:var(--accent);opacity:0.18;
      transform:scale(0);animation:chipRipple 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    `;

    button.style.position = "relative";
    button.style.overflow = "hidden";
    button.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
    onChipClick(chip);
  };

  return (
    <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
      {chips.map((chip, index) => (
        <motion.button
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
          className="shrink-0 select-none rounded-full border border-[var(--chip-border)] bg-[var(--chip-bg)] px-3 py-2 text-xs font-medium text-[var(--chip-text)] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--chip-hover-bg)] hover:text-[var(--accent)] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isDisabled}
          initial={
            prefersReducedMotion ? undefined : { opacity: 0, y: 8, scale: 0.96 }
          }
          key={chip}
          onClick={(event) => handleChipClick(chip, event)}
          transition={
            prefersReducedMotion
              ? undefined
              : {
                  delay: index * 0.04,
                  duration: 0.28,
                  ease: EASE_OUT,
                }
          }
          type="button"
          whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
        >
          {chip}
        </motion.button>
      ))}
    </div>
  );
}
