"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, LogOut, X } from "lucide-react";

import {
  STUDENT_PLATFORM_NAV,
  isStudentPlatformPathActive,
} from "@/components/platform/student-platform-config";
import { StudentGlassPanel } from "@/components/platform/student-surface";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/context/auth-context";
import {
  formatInboxUnreadCount,
  useStudentInbox,
} from "@/context/student-inbox-context";
import { useStudentPlatformPreferences } from "@/hooks/use-student-platform-preferences";
import { brand } from "@/lib/brand";
import { initials } from "@/lib/func";
import { cn } from "@/lib/utils";
import Image from "next/image";

type UserSidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onCollapseToggle: () => void;
  onCloseMobile: () => void;
};

export default function UserSidebar({
  collapsed,
  mobileOpen,
  onCollapseToggle,
  onCloseMobile,
}: UserSidebarProps) {
  return (
    <>
      <div
        aria-hidden
        onClick={onCloseMobile}
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-4 left-4 right-4 z-50 transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-[120%]",
        )}
      >
        <SidebarSurface
          collapsed={false}
          isMobile
          onCollapseToggle={onCollapseToggle}
          onCloseMobile={onCloseMobile}
        />
      </aside>

      <aside
        className={cn(
          "relative hidden shrink-0 transition-[width] duration-300 lg:block",
          collapsed ? "w-27.5" : "w-85",
        )}
      >
        <div className="sticky top-0 h-screen p-4">
          <SidebarSurface
            collapsed={collapsed}
            isMobile={false}
            onCollapseToggle={onCollapseToggle}
            onCloseMobile={onCloseMobile}
          />
        </div>
      </aside>
    </>
  );
}

function SidebarSurface({
  collapsed,
  isMobile,
  onCollapseToggle,
  onCloseMobile,
}: {
  collapsed: boolean;
  isMobile: boolean;
  onCollapseToggle: () => void;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { unreadCount, ready } = useStudentInbox();
  const { preferences } = useStudentPlatformPreferences();

  const fullName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Ученик";
  const email = user?.email ?? brand.studentEmail;
  const inboxBadge =
    ready && unreadCount > 0 ? formatInboxUnreadCount(unreadCount) : undefined;

  const workspaceItems = STUDENT_PLATFORM_NAV.filter(
    (item) =>
      item.href !== "/platform/profile" && item.href !== "/platform/settings",
  );
  const accountItems = STUDENT_PLATFORM_NAV.filter((item) =>
    ["/platform/settings", "/platform/profile"].includes(item.href),
  ).sort((a, b) => {
    const order = ["/platform/settings", "/platform/profile"];
    return order.indexOf(a.href) - order.indexOf(b.href);
  });

  return (
    <TooltipProvider delayDuration={120}>
      <StudentGlassPanel className="flex h-full flex-col overflow-hidden p-4">
        <div className="relative flex h-full flex-col">
          <div
            className={cn(
              "flex gap-3",
              collapsed && !isMobile
                ? "flex-col items-center justify-start"
                : "items-start justify-between",
            )}
          >
            <Link
              href={preferences.defaultPage}
              onClick={onCloseMobile}
              className={cn(
                "group flex min-w-0 items-center gap-3",
                collapsed && !isMobile ? "justify-center" : "",
              )}
            >
              <Image
                src="/logos/logo-black-1.png"
                alt={`${brand.lms} Logo`}
                width={160}
                height={50}
                className="w-11 h-11 rounded-full"
              />

              {!collapsed || isMobile ? (
                <div className="min-w-0">
                  <div className="truncate text-[15px] font-semibold leading-5 text-[#181818]">
                    {brand.student}
                  </div>
                  <div className="truncate text-[12px] font-medium leading-5 text-slate-500">
                    Пространство для обучения
                  </div>
                </div>
              ) : null}
            </Link>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={isMobile ? onCloseMobile : onCollapseToggle}
              className={cn(
                "h-9 w-9 rounded-full border border-white/70 bg-white/75 text-slate-600 hover:bg-white hover:text-slate-950",
                collapsed && !isMobile ? "mt-1" : "",
              )}
              aria-label={
                isMobile ? "Закрыть боковую панель" : "Свернуть боковую панель"
              }
            >
              {isMobile ? (
                <X className="h-4 w-4" />
              ) : collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {!collapsed || isMobile ? (
            <div className="mt-5 rounded-[24px] border border-white/70 bg-[#2d2d2d] px-5 py-5 text-white">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
                Сегодня
              </p>

              <div className="mt-3 text-[22px] font-semibold leading-[1.15] tracking-[-0.03em]">
                Продолжай учиться в своём темпе
              </div>

              <p className="mt-2 text-[13px] text-white/72">
                У тебя готовы два урока, сегодня запланировано одно занятие, а
                ближайшее задание идёт по графику.
              </p>
            </div>
          ) : null}

          <div className="mt-6 flex-1 overflow-y-auto pb-4">
            <div className="flex min-h-full flex-col">
              <div>
                <SidebarSectionLabel
                  hidden={collapsed && !isMobile}
                  label="Обучение"
                />

                <div className="mt-2 space-y-2">
                  {workspaceItems.map((item) => (
                    <SidebarNavItem
                      key={item.href}
                      item={item}
                      badge={
                        item.href === "/platform/messages"
                          ? inboxBadge
                          : item.badge
                      }
                      active={isStudentPlatformPathActive(pathname, item.href)}
                      collapsed={collapsed && !isMobile}
                      onNavigate={onCloseMobile}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <SidebarSectionLabel
                  hidden={collapsed && !isMobile}
                  label="Аккаунт"
                />

                <div className="mt-2 space-y-2">
                  {accountItems.map((item) => (
                    <SidebarNavItem
                      key={item.href}
                      item={item}
                      badge={item.badge}
                      active={isStudentPlatformPathActive(pathname, item.href)}
                      collapsed={collapsed && !isMobile}
                      onNavigate={onCloseMobile}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "mt-auto border-t border-black/10",
              collapsed && !isMobile ? "p-2.5" : "p-3",
            )}
          >
            <div
              className={cn(
                "flex items-center gap-3",
                collapsed && !isMobile ? "justify-center" : "",
              )}
            >
              <Avatar className="h-10 w-10 border border-white/70 shadow-sm">
                <AvatarImage
                  src={user?.avatar_url || undefined}
                  alt={fullName}
                />
                <AvatarFallback className="bg-sky-100 text-[13px] font-semibold text-sky-700">
                  {initials(fullName)}
                </AvatarFallback>
              </Avatar>

              {!collapsed || isMobile ? (
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold leading-5 text-slate-900">
                    {fullName}
                  </div>
                  <div className="truncate text-[11px] font-medium leading-4 text-slate-500">
                    {email}
                  </div>
                </div>
              ) : null}
            </div>

            {!collapsed || isMobile ? (
              <Button
                type="button"
                variant="outline"
                onClick={logout}
                className="mt-3 h-10 w-full rounded-full border-white/70 bg-white/90 text-[13px] font-medium text-slate-700 shadow-sm hover:bg-white"
              >
                <LogOut className="h-4 w-4" />
                Выйти
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={logout}
                className="mt-2 flex h-10 w-full items-center justify-center rounded-full border border-white/70 bg-white/90 text-slate-700 shadow-sm hover:bg-white"
                aria-label="Выйти"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </StudentGlassPanel>
    </TooltipProvider>
  );
}

function SidebarSectionLabel({
  label,
  hidden,
  className,
}: {
  label: string;
  hidden?: boolean;
  className?: string;
}) {
  if (hidden) return null;

  return (
    <div
      className={cn(
        "px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400",
        className,
      )}
    >
      {label}
    </div>
  );
}

function SidebarNavItem({
  item,
  badge,
  active,
  collapsed,
  onNavigate,
}: {
  item: (typeof STUDENT_PLATFORM_NAV)[number];
  badge?: string;
  active: boolean;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  const Icon = item.icon;

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "group relative flex items-center gap-3 overflow-hidden rounded-4xl border p-2 transition-all duration-300",
        collapsed ? "justify-center px-2 py-2.5" : "",
        active
          ? "border-white/80 bg-white/90 text-slate-950 shadow-[0_20px_40px_-30px_rgba(56,189,248,0.85)]"
          : "border-transparent bg-transparent text-slate-600 hover:border-white/65 hover:bg-white/65 hover:text-slate-900",
      )}
    >
      <div
        className={cn(
          "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-3xl border transition-colors duration-300",
          active
            ? "border-sky-100 bg-sky-50 text-sky-600"
            : "border-white/60 bg-white/72 text-slate-500 group-hover:text-slate-700",
        )}
      >
        <Icon className="h-4.5 w-4.5" />

        {badge ? (
          <span className="absolute -right-1 -top-1 inline-flex items-center justify-center rounded-full bg-sky-500 px-1.5 py-1 text-[9px] font-bold leading-none text-white shadow-[0_6px_18px_-10px_rgba(14,165,233,0.9)]">
            {badge}
          </span>
        ) : null}
      </div>

      {!collapsed ? (
        <>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold leading-5">
              {item.title}
            </div>
            <div className="truncate text-[11px] font-medium leading-4 text-slate-500">
              {item.description}
            </div>
          </div>

          {badge ? (
            <div
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                active
                  ? "bg-slate-950 text-white"
                  : "bg-slate-100 text-slate-600",
              )}
            >
              {badge}
            </div>
          ) : null}
        </>
      ) : null}

      {active ? (
        <div className="pointer-events-none absolute inset-0 rounded-4xl ring-1 ring-inset ring-white/70" />
      ) : null}
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={14}>
        {item.title}
      </TooltipContent>
    </Tooltip>
  );
}
