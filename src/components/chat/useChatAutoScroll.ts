"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

type ScrollToBottomOptions = {
  smooth: boolean;
};

type UseChatAutoScrollOptions = {
  activeChatId: string;
  isReady: boolean;
  isStreaming: boolean;
  nearBottomOffset?: number;
};

const MIN_FOLLOW_SCROLL_STEP = 10;
const MAX_FOLLOW_SCROLL_STEP = 26;
const FOLLOW_SCROLL_DISTANCE_FACTOR = 0.16;

function now() {
  return window.performance.now();
}

export function useChatAutoScroll({
  activeChatId,
  isReady,
  isStreaming,
  nearBottomOffset = 120,
}: UseChatAutoScrollOptions) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [isFollowModeActive, setIsFollowModeActive] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const animationFrameRef = useRef<number | null>(null);
  const scrollEventFrameRef = useRef<number | null>(null);
  const followModeRef = useRef(true);
  const hasPendingContentRef = useRef(false);
  const lastAutoScrollAtRef = useRef(0);
  const lastManualIntentAtRef = useRef(0);
  const lastActiveChatIdRef = useRef<string | null>(null);
  const previousStreamingRef = useRef(isStreaming);

  const setFollowModeState = useCallback((nextValue: boolean) => {
    if (followModeRef.current === nextValue) {
      return;
    }

    followModeRef.current = nextValue;
    setIsFollowModeActive(nextValue);
  }, []);

  const setScrollButtonVisibility = useCallback((nextValue: boolean) => {
    setShowScrollToBottom((current) =>
      current === nextValue ? current : nextValue,
    );
  }, []);

  const cancelAutoScroll = useCallback(() => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const getBottomDistance = useCallback(() => {
    const scroller = scrollRef.current;
    const bottomAnchor = bottomRef.current;

    if (!scroller || !bottomAnchor) {
      return Number.POSITIVE_INFINITY;
    }

    const scrollerBounds = scroller.getBoundingClientRect();
    const anchorBounds = bottomAnchor.getBoundingClientRect();

    return Math.max(0, anchorBounds.bottom - scrollerBounds.bottom);
  }, []);

  const isNearBottom = useCallback(() => {
    return getBottomDistance() <= nearBottomOffset;
  }, [getBottomDistance, nearBottomOffset]);

  const syncViewportState = useCallback(() => {
    const nearBottom = isNearBottom();

    if (nearBottom) {
      hasPendingContentRef.current = false;
      setScrollButtonVisibility(false);
      return true;
    }

    setScrollButtonVisibility(hasPendingContentRef.current);
    return false;
  }, [isNearBottom, setScrollButtonVisibility]);

  const stepTowardBottom = useCallback(function stepTowardBottom() {
    const scroller = scrollRef.current;

    if (!scroller || !followModeRef.current) {
      animationFrameRef.current = null;
      return;
    }

    const distance = getBottomDistance();

    if (distance <= 1) {
      animationFrameRef.current = null;
      lastAutoScrollAtRef.current = now();
      syncViewportState();
      return;
    }

    // A single RAF loop keeps "chasing" the growing bottom edge without
    // restarting a new smooth scroll for every streaming update.
    const step = Math.min(
      distance,
      Math.max(
        MIN_FOLLOW_SCROLL_STEP,
        Math.min(
          MAX_FOLLOW_SCROLL_STEP,
          distance * FOLLOW_SCROLL_DISTANCE_FACTOR,
        ),
      ),
    );
    lastAutoScrollAtRef.current = now();
    scroller.scrollTop += step;
    animationFrameRef.current = window.requestAnimationFrame(stepTowardBottom);
  }, [getBottomDistance, syncViewportState]);

  const scrollToBottom = useCallback(
    ({ smooth }: ScrollToBottomOptions) => {
      const scroller = scrollRef.current;

      if (!scroller) {
        return;
      }

      const distance = getBottomDistance();

      if (distance <= 0.5) {
        syncViewportState();
        return;
      }

      if (!smooth) {
        cancelAutoScroll();
        lastAutoScrollAtRef.current = now();
        scroller.scrollTop += distance;
        syncViewportState();
        return;
      }

      if (animationFrameRef.current !== null) {
        return;
      }

      animationFrameRef.current = window.requestAnimationFrame(stepTowardBottom);
    },
    [cancelAutoScroll, getBottomDistance, stepTowardBottom, syncViewportState],
  );

  const enableFollowMode = useCallback(() => {
    hasPendingContentRef.current = false;
    setScrollButtonVisibility(false);
    setFollowModeState(true);
  }, [setFollowModeState, setScrollButtonVisibility]);

  const disableFollowMode = useCallback(() => {
    cancelAutoScroll();
    setFollowModeState(false);
  }, [cancelAutoScroll, setFollowModeState]);

  useLayoutEffect(() => {
    if (!isReady || lastActiveChatIdRef.current === activeChatId) {
      return;
    }

    lastActiveChatIdRef.current = activeChatId;
    hasPendingContentRef.current = false;
    setScrollButtonVisibility(false);
    setFollowModeState(true);

    const frameId = window.requestAnimationFrame(() => {
      scrollToBottom({ smooth: false });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [
    activeChatId,
    isReady,
    scrollToBottom,
    setFollowModeState,
    setScrollButtonVisibility,
  ]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const scroller = scrollRef.current;

    if (!scroller) {
      return;
    }

    const registerManualIntent = () => {
      lastManualIntentAtRef.current = now();
      cancelAutoScroll();
    };

    const onScroll = () => {
      if (scrollEventFrameRef.current !== null) {
        return;
      }

      scrollEventFrameRef.current = window.requestAnimationFrame(() => {
        scrollEventFrameRef.current = null;

        const nearBottom = syncViewportState();
        const currentTime = now();
        const manualIntentIsRecent =
          currentTime - lastManualIntentAtRef.current < 180;
        const autoScrollIsRecent = currentTime - lastAutoScrollAtRef.current < 80;

        if (nearBottom) {
          setFollowModeState(true);
          return;
        }

        if (followModeRef.current && (manualIntentIsRecent || !autoScrollIsRecent)) {
          setFollowModeState(false);
        }
      });
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    scroller.addEventListener("wheel", registerManualIntent, { passive: true });
    scroller.addEventListener("touchstart", registerManualIntent, {
      passive: true,
    });
    scroller.addEventListener("touchmove", registerManualIntent, {
      passive: true,
    });

    return () => {
      scroller.removeEventListener("scroll", onScroll);
      scroller.removeEventListener("wheel", registerManualIntent);
      scroller.removeEventListener("touchstart", registerManualIntent);
      scroller.removeEventListener("touchmove", registerManualIntent);

      if (scrollEventFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollEventFrameRef.current);
        scrollEventFrameRef.current = null;
      }
    };
  }, [cancelAutoScroll, isReady, setFollowModeState, syncViewportState]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const scroller = scrollRef.current;
    const content = contentRef.current;

    if (!scroller || !content || typeof ResizeObserver === "undefined") {
      return;
    }

    const handleResize = () => {
      if (followModeRef.current) {
        scrollToBottom({ smooth: true });
        return;
      }

      // ResizeObserver also catches late layout shifts from richer content,
      // like cards, lazy media, or typewriter growth.
      if (!isNearBottom()) {
        hasPendingContentRef.current = true;
        setScrollButtonVisibility(true);
      }
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(scroller);
    observer.observe(content);

    return () => observer.disconnect();
  }, [isNearBottom, isReady, scrollToBottom, setScrollButtonVisibility]);

  useEffect(() => {
    if (!isReady || !followModeRef.current) {
      previousStreamingRef.current = isStreaming;
      return;
    }

    if (isStreaming) {
      scrollToBottom({ smooth: true });
    } else if (previousStreamingRef.current) {
      scrollToBottom({ smooth: true });
    }

    previousStreamingRef.current = isStreaming;
  }, [isReady, isStreaming, scrollToBottom]);

  useEffect(() => {
    return () => {
      cancelAutoScroll();

      if (scrollEventFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollEventFrameRef.current);
      }
    };
  }, [cancelAutoScroll]);

  return {
    bottomRef,
    contentRef,
    disableFollowMode,
    enableFollowMode,
    isFollowModeActive,
    isNearBottom,
    scrollRef,
    scrollToBottom,
    showScrollToBottom,
  };
}
