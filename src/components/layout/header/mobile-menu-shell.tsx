"use client";

import { isActivePath } from "@/components/layout/header/header-nav-utils";
import type { HeaderNavLink } from "@/components/layout/header/nav-links";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { createPortal } from "react-dom";

const styles = `
  @keyframes menuSlideIn {
    from { clip-path: inset(0 0 100% 0); }
    to   { clip-path: inset(0 0 0% 0); }
  }
  @keyframes menuSlideOut {
    from { clip-path: inset(0 0 0% 0); }
    to   { clip-path: inset(0 0 100% 0); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeDown {
    from { opacity: 1; transform: translateY(0); }
    to   { opacity: 0; transform: translateY(18px); }
  }
  @keyframes submenuOpen {
    from { opacity: 0; transform: translateY(-6px); max-height: 0; }
    to   { opacity: 1; transform: translateY(0); max-height: 500px; }
  }
  @keyframes submenuClose {
    from { opacity: 1; transform: translateY(0); max-height: 500px; }
    to   { opacity: 0; transform: translateY(-6px); max-height: 0; }
  }

  .mobile-menu-overlay {
    animation: menuSlideIn 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .mobile-menu-overlay.closing {
    animation: menuSlideOut 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  .menu-item-animated {
    animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .menu-item-animated.closing {
    animation: fadeDown 0.25s cubic-bezier(0.4, 0, 0.2, 1) both;
  }

  .submenu-wrapper {
    overflow: hidden;
  }
  .submenu-wrapper.open {
    animation: submenuOpen 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .submenu-wrapper.closed-anim {
    animation: submenuClose 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    pointer-events: none;
  }

  .burger-btn {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    flex-shrink: 0;
  }
  .burger-bar {
    position: absolute;
    left: 50%;
    display: block;
    height: 2px;
    width: 20px;
    border-radius: 9999px;
    background: currentColor;
    transform-origin: center;
    margin-left: -10px;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                opacity 0.3s ease,
                width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .burger-bar:nth-child(1) { transform: translateY(-6px); }
  .burger-bar:nth-child(2) { transform: translateY(0); }
  .burger-bar:nth-child(3) { transform: translateY(6px); }

  .burger-btn.is-open .burger-bar:nth-child(1) {
    transform: translateY(0) rotate(45deg);
  }
  .burger-btn.is-open .burger-bar:nth-child(2) {
    opacity: 0;
    width: 0;
  }
  .burger-btn.is-open .burger-bar:nth-child(3) {
    transform: translateY(0) rotate(-45deg);
  }

  .chevron-icon {
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .chevron-icon.rotated {
    transform: rotate(180deg);
  }

  .auth-btn-wrap {
    animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .auth-btn-wrap.closing {
    animation: fadeDown 0.2s cubic-bezier(0.4, 0, 0.2, 1) both;
  }
`;

const CLOSE_DURATION_MS = 420;

type MobileMenuShellProps = {
  action: Pick<HeaderNavLink, "href" | "label">;
  closeOnWidth?: number;
  containerClassName?: string;
  links: HeaderNavLink[];
  menuId?: string;
  overlayBrand: React.ReactNode;
  responsiveClassName?: string;
};

export function MobileMenuShell({
  action,
  closeOnWidth = 768,
  containerClassName,
  links,
  menuId = "mobile-menu",
  overlayBrand,
  responsiveClassName = "md:hidden",
}: MobileMenuShellProps) {
  const [open, setOpen] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const [openSubmenus, setOpenSubmenus] = React.useState<
    Record<string, boolean>
  >({});
  const [mountMenu, setMountMenu] = React.useState(false);
  const closeTimeoutRef = React.useRef<number | null>(null);
  const pathname = usePathname();
  const previousPathnameRef = React.useRef(pathname);

  const clearCloseTimeout = React.useCallback(() => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const openMenu = React.useCallback(() => {
    clearCloseTimeout();
    setMountMenu(true);
    setClosing(false);
    setOpen(true);
  }, [clearCloseTimeout]);

  const closeMenu = React.useCallback(() => {
    if (!mountMenu) {
      return;
    }

    clearCloseTimeout();
    setClosing(true);
    closeTimeoutRef.current = window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
      setMountMenu(false);
      setOpenSubmenus({});
      closeTimeoutRef.current = null;
    }, CLOSE_DURATION_MS);
  }, [clearCloseTimeout, mountMenu]);

  React.useEffect(() => {
    return () => {
      clearCloseTimeout();
    };
  }, [clearCloseTimeout]);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    document.documentElement.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  React.useEffect(() => {
    const previousPathname = previousPathnameRef.current;
    previousPathnameRef.current = pathname;

    if (previousPathname !== pathname && open) {
      closeMenu();
    }
  }, [closeMenu, open, pathname]);

  React.useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= closeOnWidth) {
        closeMenu();
      }
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
    };
  }, [closeMenu, closeOnWidth]);

  const toggleSubmenu = React.useCallback((href: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [href]: !prev[href] }));
  }, []);

  return (
    <div className={cn("block", responsiveClassName, containerClassName)}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <button
        aria-controls={menuId}
        aria-expanded={open}
        aria-label={open ? "Закрыть меню" : "Открыть меню"}
        className={cn("burger-btn text-slate-950", open && "is-open")}
        onClick={open ? closeMenu : openMenu}
        type="button"
      >
        <span className="burger-bar" />
        <span className="burger-bar" />
        <span className="burger-bar" />
      </button>

      {mountMenu
        ? createPortal(
            <div
              aria-label="Мобильное меню"
              aria-modal="true"
              className={cn(
                "mobile-menu-overlay fixed inset-0 z-60 bg-[#1f295c] text-white",
                responsiveClassName,
                closing && "closing",
              )}
              id={menuId}
              role="dialog"
            >
              <div className="flex min-h-dvh flex-col overflow-hidden px-6 pb-8 pt-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">{overlayBrand}</div>

                  <button
                    aria-label="Закрыть меню"
                    className="burger-btn is-open text-white"
                    onClick={closeMenu}
                    type="button"
                  >
                    <span className="burger-bar" />
                    <span className="burger-bar" />
                    <span className="burger-bar" />
                  </button>
                </div>

                <nav className="mt-10 flex flex-col gap-0">
                  {links.map((item, index) => {
                    const isActive =
                      isActivePath(pathname, item.href) ||
                      item.submenu?.some((subItem) =>
                        isActivePath(pathname, subItem.href),
                      );
                    const hasSubmenu = Boolean(item.submenu?.length);
                    const isSubOpen = Boolean(openSubmenus[item.href]);

                    return (
                      <div
                        className={cn("menu-item-animated", closing && "closing")}
                        key={item.href}
                        style={{
                          animationDelay: closing
                            ? `${index * 0.03}s`
                            : `${0.08 + index * 0.06}s`,
                        }}
                      >
                        <div className="flex items-center justify-between py-3">
                          {hasSubmenu ? (
                            <button
                              className={cn(
                                "flex flex-1 items-center justify-between text-left text-[26px] font-medium leading-none transition-colors duration-200",
                                isActive
                                  ? "text-white"
                                  : "text-white/70 hover:text-white",
                              )}
                              onClick={() => toggleSubmenu(item.href)}
                              type="button"
                            >
                              {item.label}
                              <span
                                className={cn(
                                  "chevron-icon ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/50",
                                  isSubOpen && "rotated",
                                )}
                              >
                                <svg
                                  fill="none"
                                  height="16"
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2.5"
                                  viewBox="0 0 24 24"
                                  width="16"
                                >
                                  <polyline points="6 9 12 15 18 9" />
                                </svg>
                              </span>
                            </button>
                          ) : (
                            <Link
                              className={cn(
                                "text-[26px] font-medium leading-none transition-colors duration-200",
                                isActive
                                  ? "text-white"
                                  : "text-white/70 hover:text-white",
                              )}
                              href={item.href}
                              onClick={closeMenu}
                            >
                              {item.label}
                            </Link>
                          )}
                        </div>

                        {hasSubmenu ? (
                          <div
                            className={cn(
                              "submenu-wrapper",
                              isSubOpen ? "open" : "closed-anim",
                            )}
                            style={
                              !isSubOpen
                                ? { maxHeight: 0, opacity: 0 }
                                : undefined
                            }
                          >
                            <div className="flex flex-col pb-3 pl-2 pt-1">
                              {item.submenu?.map((subItem) => {
                                const isSubActive = isActivePath(
                                  pathname,
                                  subItem.href,
                                );

                                return (
                                  <Link
                                    className={cn(
                                      "py-2 text-[17px] font-medium leading-snug transition-colors duration-150",
                                      isSubActive
                                        ? "text-white"
                                        : "text-white/55 hover:text-white/85",
                                    )}
                                    href={subItem.href}
                                    key={subItem.href}
                                    onClick={closeMenu}
                                  >
                                    <span className="mr-2 text-white/25">-</span>
                                    {subItem.label}
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </nav>

                <div
                  className={cn("auth-btn-wrap mt-auto pt-8", closing && "closing")}
                  style={{
                    animationDelay: closing
                      ? "0s"
                      : `${0.08 + links.length * 0.06 + 0.04}s`,
                  }}
                >
                  <Link
                    className="flex h-14 w-full items-center justify-center rounded-lg bg-white text-[16px] font-semibold text-[#1f295c] transition-opacity hover:opacity-90 active:scale-[0.98]"
                    href={action.href}
                    onClick={closeMenu}
                  >
                    {action.label}
                  </Link>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
