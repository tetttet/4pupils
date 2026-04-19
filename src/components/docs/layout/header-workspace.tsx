"use client";

import { isActivePath } from "@/components/layout/header/header-nav-utils";
import { MobileMenuShell } from "@/components/layout/header/mobile-menu-shell";
import type { HeaderNavLink } from "@/components/layout/header/nav-links";
import BaseButton from "@/components/ui/base-button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const workspaceLinks = [
  {
    label: "Компаниям",
    href: "/workspace/company",
  },
  {
    label: "Платформа",
    href: "/platform",
  },
  {
    label: "Руководства",
    href: "/guides",
  },
] satisfies HeaderNavLink[];

const workspaceAction = {
  href: "/courses",
  label: "Все курсы",
};

const HeaderWorkspace = () => {
  const pathname = usePathname();
  const [scrollProgress, setScrollProgress] = React.useState(0);

  React.useEffect(() => {
    let frameId = 0;

    const handleScroll = () => {
      cancelAnimationFrame(frameId);

      frameId = window.requestAnimationFrame(() => {
        const nextProgress = Math.min(window.scrollY / 160, 1);

        setScrollProgress((prev) =>
          Math.abs(prev - nextProgress) < 0.01 ? prev : nextProgress,
        );
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrolled = scrollProgress > 0.08;
  const titleStyle: React.CSSProperties = {
    left: `${scrollProgress * 50}%`,
    transform: `translate(${scrollProgress * -50}%, -50%) scale(${1 - scrollProgress * 0.08})`,
  };

  return (
    <header
      className={
        "sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-300"
      }
    >
      <div className="mx-auto max-w-380 px-6 sm:px-10 lg:px-16">
        <div className="relative flex h-16 items-center">
          <Link
            className="absolute top-1/2 z-10 max-w-[calc(100%-4.5rem)] origin-center truncate text-[20px] font-semibold tracking-[-0.04em] text-black transition-[color] duration-300 ease-out select-none sm:max-w-[calc(100%-5rem)] sm:text-[24px] lg:text-[28px] xl:max-w-none"
            href="/o/"
            style={titleStyle}
          >
            4Pupils Корпоративный
          </Link>

          <nav
            className={cn(
              "relative z-20 ml-auto hidden items-center gap-2 overflow-hidden whitespace-nowrap transition-all duration-300 xl:flex",
              scrolled
                ? "max-w-0 translate-x-4 opacity-0 pointer-events-none"
                : "max-w-160 translate-x-0 opacity-100",
            )}
          >
            {workspaceLinks.map((item) => {
              const isActive = isActivePath(pathname, item.href);

              return (
                <Link
                  className={cn(
                    "inline-flex h-10 items-center px-4 text-[16px] font-medium transition-all duration-300",
                    isActive
                      ? "text-black"
                      : "text-black/80 hover:text-black focus-visible:text-black",
                  )}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
            <BaseButton
              href={workspaceAction.href}
              label={workspaceAction.label}
            />
          </nav>

          <MobileMenuShell
            action={workspaceAction}
            closeOnWidth={1280}
            containerClassName="ml-auto"
            links={workspaceLinks}
            menuId="workspace-mobile-menu"
            overlayBrand={
              <Link
                className="inline-flex max-w-full text-[22px] font-semibold tracking-[-0.04em] text-white transition-opacity hover:opacity-90 sm:text-[26px]"
                href="/o/"
              >
                4Pupil Корпоративный
              </Link>
            }
            responsiveClassName="xl:hidden"
          />
        </div>
      </div>
    </header>
  );
};

export default HeaderWorkspace;
