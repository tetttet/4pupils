"use client";

import { isActivePath } from "@/components/layout/header/header-nav-utils";
import { MobileMenuShell } from "@/components/layout/header/mobile-menu-shell";
import type { HeaderNavLink } from "@/components/layout/header/nav-links";
import BaseButton from "@/components/ui/base-button";
import { cn } from "@/lib/utils";
import Image from "next/image";
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

  return (
    <header
      className={
        "sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-300"
      }
    >
      <div className="mx-auto max-w-380 px-6 sm:px-10 lg:px-16">
        <div className="relative flex h-16 items-center gap-4">
          <Link
            className={cn(
              "relative z-20 inline-flex shrink-0 items-center transition-all duration-300 ease-out hover:-translate-y-0.5",
            )}
            href="/o/"
          >
            <Image
              src="/logos/logo-corporative.png"
              alt="4Pupil Корпоративный"
              width={195}
              height={32}
              className="h-auto w-[158px] sm:w-[178px] xl:w-[195px]"
              priority
              sizes="(min-width: 1280px) 195px, (min-width: 640px) 178px, 158px"
            />
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
                className="inline-flex max-w-full rounded-full border border-white bg-white px-4 py-2 backdrop-blur-sm transition-all hover:bg-white/14"
                href="/o/"
              >
                <Image
                  src="/logos/logo-corporative.png"
                  alt="4Pupil Корпоративный"
                  width={195}
                  height={32}
                  className="h-auto w-[160px] sm:w-[185px]"
                  sizes="(min-width: 640px) 185px, 160px"
                />
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
