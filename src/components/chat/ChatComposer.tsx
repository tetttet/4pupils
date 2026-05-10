"use client";

import {
  type CSSProperties,
  type FormEvent,
  type PointerEvent,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownIcon, SendIcon, StopIcon } from "./icons";
import { ChatSuggestions } from "./ChatSuggestions";

const SHEET_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
const SCROLL_TRIGGER_DELTA = 8;

type ChatComposerProps = {
  activeError: string;
  chips: string[];
  input: string;
  inputRef: RefObject<HTMLInputElement | null>;
  isDisabled: boolean;
  isResponding: boolean;
  onChangeInput: (value: string) => void;
  onChipClick: (chip: string) => void;
  onRequestScrollToBottom: () => void;
  onStop: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  scrollRef: RefObject<HTMLDivElement | null>;
  showScrollToBottom: boolean;
};

function clampProgress(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function ChatComposer({
  activeError,
  chips,
  input,
  inputRef,
  isDisabled,
  isResponding,
  onChangeInput,
  onChipClick,
  onRequestScrollToBottom,
  onStop,
  onSubmit,
  scrollRef,
  showScrollToBottom,
}: ChatComposerProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isComposerOpen, setIsComposerOpen] = useState(true);
  const [composerHeight, setComposerHeight] = useState<number | null>(null);
  const [dragProgress, setDragProgress] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const composerInnerRef = useRef<HTMLDivElement>(null);
  const dragStartYRef = useRef(0);
  const dragStartProgressRef = useRef(1);
  const dragDeltaRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const ignoreNextClickRef = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);
  const currentProgressRef = useRef(1);
  const ignoreScrollUntilRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isComposerOpenRef = useRef(isComposerOpen);
  const lastScrollTopRef = useRef(0);
  const scrollFrameRef = useRef<number | null>(null);

  const visibleProgress = dragProgress ?? (isComposerOpen ? 1 : 0);
  const measuredHeight = composerHeight ?? 0;
  const resolvedHeight =
    composerHeight === null
      ? undefined
      : Math.max(0, measuredHeight * visibleProgress);
  const sheetOpacity = clampProgress(visibleProgress * 1.25);
  const isFullyCollapsed = visibleProgress < 0.04;
  const hasMessage = Boolean(input.trim());
  const canSubmit = hasMessage && !isDisabled && !isResponding;
  const isActionEnabled = isResponding || canSubmit;
  const actionLabel = isResponding
    ? "Остановить генерацию ответа"
    : "Отправить сообщение";
  const actionButtonStyle = {
    backgroundColor: isResponding
      ? "color-mix(in srgb, var(--send-bg) 84%, black 16%)"
      : canSubmit
        ? "var(--send-bg)"
        : "var(--send-disabled)",
    boxShadow: isResponding
      ? "0 14px 28px rgba(15,23,42,0.18)"
      : canSubmit
        ? "0 18px 34px rgba(15,23,42,0.2)"
        : "0 10px 22px rgba(15,23,42,0.08)",
    transition: prefersReducedMotion
      ? "background-color 160ms ease-in-out, box-shadow 160ms ease-in-out, opacity 160ms ease-in-out"
      : "background-color 220ms ease-in-out, box-shadow 220ms ease-in-out, opacity 180ms ease-in-out",
  } satisfies CSSProperties;
  const iconTransition = prefersReducedMotion
    ? { duration: 0.18, ease: "easeInOut" as const }
    : { type: "spring" as const, stiffness: 560, damping: 34, mass: 0.72 };

  const setComposerOpen = useCallback((nextOpen: boolean) => {
    ignoreScrollUntilRef.current = window.performance.now() + 220;
    currentProgressRef.current = nextOpen ? 1 : 0;
    setDragProgress(null);
    setIsComposerOpen(nextOpen);
  }, []);

  useEffect(() => {
    isComposerOpenRef.current = isComposerOpen;
  }, [isComposerOpen]);

  useEffect(() => {
    const node = composerInnerRef.current;

    if (!node) {
      return;
    }

    const measure = () => {
      setComposerHeight(node.offsetHeight + 1);
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(node);

    return () => observer.disconnect();
  }, [activeError, chips]);

  useEffect(() => {
    const scroller = scrollRef.current;

    if (!scroller) {
      return;
    }

    lastScrollTopRef.current = scroller.scrollTop;

    const onScroll = () => {
      if (scrollFrameRef.current !== null) {
        return;
      }

      scrollFrameRef.current = window.requestAnimationFrame(() => {
        scrollFrameRef.current = null;

        if (isDraggingRef.current) {
          return;
        }

        const currentScrollTop = scroller.scrollTop;

        if (window.performance.now() < ignoreScrollUntilRef.current) {
          lastScrollTopRef.current = currentScrollTop;
          return;
        }

        const delta = currentScrollTop - lastScrollTopRef.current;
        lastScrollTopRef.current = currentScrollTop;

        if (Math.abs(delta) < SCROLL_TRIGGER_DELTA) {
          return;
        }

        const inputIsFocused = document.activeElement === inputRef.current;

        if (
          delta < 0 &&
          currentScrollTop > 4 &&
          isComposerOpenRef.current &&
          !inputIsFocused
        ) {
          setComposerOpen(false);
          return;
        }

        if (delta > 0 && !isComposerOpenRef.current) {
          setComposerOpen(true);
        }
      });
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      scroller.removeEventListener("scroll", onScroll);

      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
        scrollFrameRef.current = null;
      }
    };
  }, [inputRef, scrollRef, setComposerOpen]);

  const startDrag = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      event.currentTarget.setPointerCapture(event.pointerId);
      activePointerIdRef.current = event.pointerId;
      dragStartYRef.current = event.clientY;
      dragStartProgressRef.current = visibleProgress;
      currentProgressRef.current = visibleProgress;
      dragDeltaRef.current = 0;
      hasDraggedRef.current = false;
      isDraggingRef.current = true;
      setIsDragging(true);
      setDragProgress(visibleProgress);
    },
    [visibleProgress],
  );

  const moveDrag = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (activePointerIdRef.current !== event.pointerId) {
        return;
      }

      const delta = dragStartYRef.current - event.clientY;
      const distance = Math.max(104, measuredHeight || 180);
      const nextProgress = clampProgress(
        dragStartProgressRef.current + delta / distance,
      );

      dragDeltaRef.current = delta;
      currentProgressRef.current = nextProgress;

      if (Math.abs(delta) > 4) {
        hasDraggedRef.current = true;
      }

      setDragProgress(nextProgress);
    },
    [measuredHeight],
  );

  const finishDrag = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (activePointerIdRef.current !== event.pointerId) {
        return;
      }

      const finalProgress = currentProgressRef.current;
      const finalDelta = dragDeltaRef.current;
      const shouldOpen =
        finalDelta > 34 || (finalDelta > -34 && finalProgress >= 0.5);

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      ignoreNextClickRef.current = hasDraggedRef.current;
      activePointerIdRef.current = null;
      isDraggingRef.current = false;
      setIsDragging(false);
      setComposerOpen(shouldOpen);
    },
    [setComposerOpen],
  );

  const cancelDrag = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (activePointerIdRef.current !== event.pointerId) {
        return;
      }

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      ignoreNextClickRef.current = hasDraggedRef.current;
      activePointerIdRef.current = null;
      isDraggingRef.current = false;
      setIsDragging(false);
      setComposerOpen(isComposerOpenRef.current);
    },
    [setComposerOpen],
  );

  const handleHandleClick = () => {
    if (ignoreNextClickRef.current) {
      ignoreNextClickRef.current = false;
      return;
    }

    setComposerOpen(!isComposerOpenRef.current);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    setComposerOpen(true);
    onSubmit(event);
  };

  const handleInputFocus = () => {
    setComposerOpen(true);

    window.setTimeout(() => {
      onRequestScrollToBottom();
    }, 250);
  };

  const sheetStyle: CSSProperties = {
    borderColor: isFullyCollapsed ? "transparent" : "var(--border)",
    height: resolvedHeight,
    opacity: sheetOpacity,
    overflow: "hidden",
    pointerEvents: isFullyCollapsed ? "none" : "auto",
    transform: `translateY(${(1 - visibleProgress) * 18}px)`,
    transition: isDragging
      ? "none"
      : [
          `height 540ms ${SHEET_EASE}`,
          `opacity 320ms ${EASE_OUT}`,
          `transform 540ms ${SHEET_EASE}`,
          "border-color 220ms ease",
          "background-color 300ms ease",
        ].join(", "),
    willChange: "height, opacity, transform",
  };

  const contentStyle: CSSProperties = {
    opacity: clampProgress((visibleProgress - 0.08) / 0.62),
    transform: `translateY(${(1 - visibleProgress) * 10}px)`,
    transition: isDragging
      ? "none"
      : `opacity 360ms ${EASE_OUT}, transform 460ms ${SHEET_EASE}`,
  };

  const collapsedHandleStyle: CSSProperties = {
    opacity: isFullyCollapsed ? 1 : 0,
    pointerEvents: isFullyCollapsed ? "auto" : "none",
    transform: `translateY(${isFullyCollapsed ? 0 : 12}px)`,
    transition: `opacity 220ms ${EASE_OUT}, transform 360ms ${SHEET_EASE}`,
  };

  return (
    <>
      <style>{`
        @keyframes chipRipple {
          to { transform: scale(2.5); opacity: 0; }
        }
        @keyframes chipIn {
          from { opacity: 0; transform: translateY(8px) scale(0.94); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes errorIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .chip-animated {
          animation: chipIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
      `}</style>

      <div className="relative z-10 shrink-0">
        <div
          className={`pointer-events-none absolute inset-x-0 z-20 flex justify-center transition-[opacity,transform] duration-300 ${
            showScrollToBottom
              ? "translate-y-0 opacity-100"
              : "translate-y-2 opacity-0"
          }`}
          style={{
            bottom: isFullyCollapsed
              ? "calc(max(env(safe-area-inset-bottom), 0.75rem) + 2.9rem)"
              : "calc(100% + 0.75rem)",
          }}
        >
          <button
            aria-label="Прокрутить к последнему сообщению"
            className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text)] shadow-[0_16px_36px_rgba(15,23,42,0.16)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(15,23,42,0.2)] active:translate-y-0"
            onClick={onRequestScrollToBottom}
            style={{
              backdropFilter: "blur(18px)",
              background:
                "color-mix(in srgb, var(--footer-bg) 76%, rgba(255,255,255,0.24))",
            }}
            tabIndex={showScrollToBottom ? 0 : -1}
            type="button"
          >
            <ArrowDownIcon />
          </button>
        </div>

        <footer
          aria-hidden={isFullyCollapsed}
          className="relative shrink-0 border-t bg-[var(--footer-bg)] transition-colors duration-300"
          inert={isFullyCollapsed ? true : undefined}
          style={sheetStyle}
        >
          <div
            className="px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2 sm:px-5"
            ref={composerInnerRef}
            style={contentStyle}
          >
            <button
              aria-label={
                isComposerOpen
                  ? "Скрыть поле сообщения"
                  : "Открыть поле сообщения"
              }
              className="mx-auto mb-2 flex h-6 w-16 touch-none cursor-grab items-center justify-center rounded-full active:cursor-grabbing"
              onClick={handleHandleClick}
              onPointerCancel={cancelDrag}
              onPointerDown={startDrag}
              onPointerMove={moveDrag}
              onPointerUp={finishDrag}
              style={{ touchAction: "none" }}
              type="button"
            >
              <span
                aria-hidden="true"
                className="h-1 rounded-full bg-[var(--border)] transition-[background-color,width] duration-300"
                style={{ width: isComposerOpen ? 34 : 46 }}
              />
            </button>

            <ChatSuggestions
              chips={chips}
              isDisabled={isDisabled}
              onChipClick={onChipClick}
            />

            <form className="flex items-end" onSubmit={handleSubmit}>
              <label className="sr-only" htmlFor="chat-input">
                Спросите Atlas
              </label>

              <div className="relative flex-1">
                <input
                  autoComplete="off"
                  autoCorrect="on"
                  className="min-h-14 w-full rounded-[28px] border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 pr-16 text-base text-[var(--text)] shadow-[0_14px_36px_rgba(15,23,42,0.08)] outline-none transition-[background-color,border-color,box-shadow,opacity] duration-200 placeholder:text-[var(--placeholder)] focus:border-[var(--accent)] focus:bg-[var(--input-focus-bg)] focus:ring-4 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
                  disabled={isDisabled}
                  enterKeyHint={isResponding ? "done" : "send"}
                  id="chat-input"
                  inputMode="text"
                  maxLength={1200}
                  onChange={(event) => onChangeInput(event.target.value)}
                  onFocus={handleInputFocus}
                  placeholder="Спросите Atlas о платформе..."
                  ref={inputRef}
                  value={input}
                />

                <motion.button
                  aria-label={actionLabel}
                  className="absolute bottom-1.5 right-1.5 grid h-11 w-11 select-none place-items-center rounded-2xl text-white focus:outline-none focus:ring-4 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed"
                  disabled={!isResponding && !canSubmit}
                  onClick={isResponding ? onStop : undefined}
                  style={actionButtonStyle}
                  type={isResponding ? "button" : "submit"}
                  whileHover={
                    isActionEnabled
                      ? {
                          scale: isResponding ? 1.02 : 1.04,
                          y: -1.5,
                        }
                      : undefined
                  }
                  whileTap={isActionEnabled ? { scale: 0.95 } : undefined}
                >
                  <span className="pointer-events-none relative flex h-6 w-6 items-center justify-center">
                    <motion.span
                      animate={{
                        opacity: isResponding ? 0 : 1,
                        rotate: isResponding ? -14 : 0,
                        scale: isResponding ? 0.68 : 1,
                        x: isResponding ? 3.5 : 0,
                        y: isResponding ? -2.5 : 0,
                      }}
                      className="absolute inset-0 flex items-center justify-center"
                      transition={iconTransition}
                    >
                      <SendIcon />
                    </motion.span>

                    <motion.span
                      animate={{
                        opacity: isResponding ? 1 : 0,
                        rotate: isResponding ? 0 : 10,
                        scale: isResponding ? 1 : 0.62,
                      }}
                      className="absolute inset-0 flex items-center justify-center"
                      transition={iconTransition}
                    >
                      <StopIcon />
                    </motion.span>
                  </span>
                </motion.button>
              </div>
            </form>

            {activeError ? (
              <p
                className="mt-2 text-xs text-[var(--danger)]"
                role="alert"
                style={{ animation: `errorIn 0.3s ${EASE_OUT} both` }}
              >
                {activeError}
              </p>
            ) : null}
          </div>
        </footer>

        <button
          aria-label="Открыть поле сообщения"
          className="absolute inset-x-0 bottom-[max(env(safe-area-inset-bottom),0.45rem)] z-20 mx-auto flex h-10 w-24 touch-none cursor-grab items-center justify-center rounded-full active:cursor-grabbing"
          onClick={handleHandleClick}
          onPointerCancel={cancelDrag}
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={finishDrag}
          style={{
            ...collapsedHandleStyle,
            touchAction: "none",
          }}
          type="button"
        >
          <span
            aria-hidden="true"
            className="h-1 w-12 rounded-full bg-[var(--border)] shadow-sm"
          />
        </button>
      </div>
    </>
  );
}
