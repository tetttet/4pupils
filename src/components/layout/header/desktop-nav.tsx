"use client";

import { isActivePath } from "@/components/layout/header/header-nav-utils";
import { ArrowUpRight, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { authLink, headerLinks } from "@/components/layout/header/nav-links";
import { cn } from "@/lib/utils";
import BaseButton from "@/components/ui/base-button";

export function DesktopNav({ home = false }: { home?: boolean }) {
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = React.useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const navItemClassName = home
    ? "inline-flex h-10 items-center rounded-full px-2 text-[14px] font-medium tracking-[-0.01em] text-[#3F4568] transition duration-200 hover:bg-[#F3F5FF] hover:text-[#202858]"
    : "inline-flex h-10 items-center rounded-lg px-2 text-[16px] font-medium text-slate-700 transition-colors hover:text-slate-950";

  React.useEffect(() => {
    setOpenGroup(null);
  }, [pathname]);

  React.useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpenGroup(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenGroup(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div
      className={cn(
        "hidden items-center",
        home ? "gap-1.5 xl:flex" : "gap-4 md:flex",
      )}
      ref={containerRef}
    >
      {headerLinks.map((item) => {
        const hasSubmenu = Boolean(item.submenu?.length);
        const hasActiveChild = item.submenu?.some((subItem) =>
          isActivePath(pathname, subItem.href),
        );
        const isActive = isActivePath(pathname, item.href) || hasActiveChild;
        const isOpen = openGroup === item.label;
        const toggleGroup = () =>
          setOpenGroup((current) =>
            current === item.label ? null : item.label,
          );

        return (
          <div className="relative flex items-center" key={item.label}>
            {hasSubmenu ? (
              <button
                aria-expanded={isOpen}
                aria-haspopup="menu"
                className={cn(
                  navItemClassName,
                  "cursor-pointer",
                  isActive && "text-[#1f295c]",
                )}
                onClick={toggleGroup}
                type="button"
              >
                {item.label}
              </button>
            ) : (
              <Link
                className={cn(navItemClassName, isActive && "text-[#1f295c]")}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.label}
              </Link>
            )}

            {hasSubmenu ? (
              <>
                <button
                  aria-expanded={isOpen}
                  aria-haspopup="menu"
                  className={cn(
                    "-ml-3 inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-700 transition-colors hover:text-slate-950",
                    (isOpen || hasActiveChild) && "text-[#1f295c]",
                  )}
                  onClick={toggleGroup}
                  type="button"
                >
                  {isOpen ? (
                    <ChevronUp aria-hidden="true" className="size-4" />
                  ) : (
                    <ChevronDown aria-hidden="true" className="size-4" />
                  )}
                </button>

                {isOpen ? (
                  <div
                    className={cn(
                      "absolute left-1/2 top-[calc(100%+14px)] z-20 w-40 -translate-x-1/2 border bg-white p-3 shadow-[0_24px_60px_rgba(15,23,42,0.14)]",
                      home
                        ? "rounded-[22px] border-[#D7DDF8]"
                        : "rounded-2xl border-slate-200",
                    )}
                    role="menu"
                  >
                    <div className="flex flex-col gap-1">
                      {item.submenu?.map((subItem) => {
                        const isSubItemActive = isActivePath(
                          pathname,
                          subItem.href,
                        );

                        return (
                          <Link
                            className={cn(
                              "rounded-[18px] p-2 text-[16px] font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950",
                              isSubItemActive && "bg-slate-50 text-[#1f295c]",
                            )}
                            href={subItem.href}
                            key={subItem.href}
                            onClick={() => setOpenGroup(null)}
                            role="menuitem"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {subItem.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        );
      })}
      {home ? (
        <Link
          className="group ml-2 inline-flex h-12 items-center gap-3 rounded-full bg-[#233067] pl-5 pr-2 text-[14px] font-medium text-white shadow-[0_10px_24px_rgba(35,48,103,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#19224c] hover:shadow-[0_14px_30px_rgba(35,48,103,0.24)]"
          href={authLink.href}
        >
          {authLink.label}
          <span className="grid size-8 place-items-center rounded-full bg-white text-[#233067] transition-transform duration-300 group-hover:rotate-6">
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </span>
        </Link>
      ) : (
        <BaseButton href={authLink.href} label={authLink.label} />
      )}
    </div>
  );
}
