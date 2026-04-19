"use client";

import { useEffect, useState } from "react";

export function useScroll(threshold: number = 10) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const next = window.scrollY > threshold;

      setScrolled((prev) => {
        if (prev === next) return prev;
        return next;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  return scrolled;
}
