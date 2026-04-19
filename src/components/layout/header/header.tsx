"use client";

import { useScroll } from "@/hooks/use-scroll";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";
import { DesktopNav } from "@/components/layout/header/desktop-nav";
import { MobileNav } from "@/components/layout/header/mobile-nav";

export function Header() {
  const scrolled = useScroll(16);

  return (
    <header className="sticky top-0 z-50 w-full">
      <div
        className={cn(
          "mx-auto transition-all duration-300 ease-out",
          scrolled
            ? "max-w-7xl px-4 pb-3 pt-3 sm:px-6 lg:px-8"
            : "max-w-full px-0 lg:px-28 pb-0 pt-0",
        )}
      >
        <nav
          className={cn(
            "flex items-center justify-between transition-all duration-300 ease-out",
            scrolled
              ? "h-16 rounded-lg border border-white/95 bg-white/95 px-4 shadow-[0_16px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:px-6"
              : "h-17 rounded-none border-b border-slate-200 bg-white px-4 shadow-none sm:px-6 lg:px-8",
          )}
        >
          <Logo className="shrink-0 rounded-full px-0 py-0 hover:bg-transparent" />
          <DesktopNav />
          <MobileNav />
        </nav>
      </div>
    </header>
  );
}
