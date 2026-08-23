"use client";

import { useScroll } from "@/hooks/use-scroll";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";
import { DesktopNav } from "@/components/layout/header/desktop-nav";
import { MobileNav } from "@/components/layout/header/mobile-nav";
import { usePathname } from "next/navigation";

export function Header() {
  const scrolled = useScroll(16);
  const pathname = usePathname();
  const isHome = pathname === "/o" || pathname === "/o/";
  const isIntroduction = pathname === "/o/team/introduction";
  const isMarketing = isHome || isIntroduction;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        isMarketing && "bg-[#F3F5FF]",
      )}
    >
      <div
        className={cn(
          "mx-auto transition-all duration-300 ease-out",
          isMarketing
            ? scrolled
              ? "max-w-[1200px] px-4 py-2.5 sm:px-5"
              : "max-w-[1200px] px-4 pb-3 pt-4 sm:px-5 sm:pt-5"
            : scrolled
              ? "max-w-7xl px-4 pb-3 pt-3 sm:px-6 lg:px-8"
              : "max-w-full px-0 pb-0 pt-0 lg:px-28",
        )}
      >
        <nav
          className={cn(
            "flex items-center justify-between transition-all duration-300 ease-out",
            isMarketing
              ? scrolled
                ? "h-16 rounded-[22px] border border-white/90 bg-white/95 px-4 shadow-[0_16px_42px_rgba(35,48,103,0.12)] backdrop-blur-xl sm:px-6"
                : "h-[72px] rounded-[26px] border border-white bg-white px-4 shadow-[0_10px_32px_rgba(35,48,103,0.055)] sm:h-[78px] sm:px-7"
              : scrolled
                ? "h-16 rounded-lg border border-white/95 bg-white/95 px-4 shadow-[0_16px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:px-6"
                : "h-17 rounded-none border-b border-slate-200 bg-white px-4 shadow-none sm:px-6 lg:px-8",
          )}
        >
          <Logo className="shrink-0 rounded-full px-0 py-0 hover:bg-transparent" />
          <DesktopNav home={isMarketing} />
          <MobileNav home={isMarketing} />
        </nav>
      </div>
    </header>
  );
}
