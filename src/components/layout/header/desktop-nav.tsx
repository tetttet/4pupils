"use client";

import { isActivePath } from "@/components/layout/header/header-nav-utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { authLink, headerLinks } from "@/components/layout/header/nav-links";
import { cn } from "@/lib/utils";
import BaseButton from "@/components/ui/base-button";

const navItemClassName =
  "inline-flex h-10 items-center rounded-lg px-2 text-[16px] font-medium text-slate-700 transition-colors hover:text-slate-950";

export function DesktopNav() {
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = React.useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

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
    <div className="hidden items-center gap-7 md:flex" ref={containerRef}>
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
                    className="absolute left-1/2 top-[calc(100%+14px)] z-20 w-40 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_24px_60px_rgba(15,23,42,0.14)]"
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
      <BaseButton href={authLink.href} label={authLink.label} />
    </div>
  );
}
