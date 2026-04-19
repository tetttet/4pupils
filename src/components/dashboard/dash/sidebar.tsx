"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight, LogOut } from "lucide-react";

import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button, buttonVariants } from "@/components/ui/button";
import { ADMIN_NAV, STUDENT_NAV, TEACHER_NAV } from "@/constant/Nav";
import { useAuth } from "@/context/auth-context";
import { useInboxUnreadCount } from "@/hooks/use-inbox-unread-count";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type NavSubItem = {
  title: string;
  href: string;
  icon?: React.ElementType;
  badge?: string;
};
type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  subtitles?: NavSubItem[];
};

type Props = {
  collapsed: boolean;
  onToggle: () => void;
};

function isActivePath(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

function ConnectedSubItem({
  href,
  title,
  icon: Icon,
  active,
  isFirst,
  isLast,
  badge,
  inboxUnreadCount,
}: {
  href: string;
  title: string;
  icon?: React.ElementType;
  active: boolean;
  isFirst: boolean;
  isLast: boolean;
  badge?: string;
  inboxUnreadCount?: number;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-3 rounded-md px-3",
        "h-8 text-[13px] font-medium transition-colors",
        // ACTIVE: transparent primary (не “в полный цвет”)
        active
          ? "bg-[#e7eaed] hover:bg-[#e7eaed]/90"
          : "text-foreground/80 hover:bg-muted hover:text-foreground",
      )}
    >
      {/* Left rail: connectors + icon */}
      <div className="relative grid w-5 place-items-center">
        {/* vertical connectors */}
        {!isFirst && (
          <span
            className={cn(
              "absolute left-1/2 top-0 h-1/2 w-px -translate-x-1/2",
              "bg-border",
            )}
            aria-hidden
          />
        )}
        {!isLast && (
          <span
            className={cn(
              "absolute left-1/2 bottom-0 h-1/2 w-px -translate-x-1/2",
              "bg-border",
            )}
            aria-hidden
          />
        )}

        {/* node */}
        <span
          className={cn(
            "relative z-1 grid h-5 w-5 place-items-center rounded-md",
            active ? "" : "bg-muted",
          )}
        >
          {Icon ? (
            <Icon
              className={cn(
                "h-4 w-4",
                active ? "text-primary" : "text-muted-foreground",
              )}
            />
          ) : (
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                active ? "bg-primary" : "bg-muted-foreground/60",
              )}
            />
          )}
        </span>
      </div>

      <span className="min-w-0 flex-1 truncate">{title}</span>
      <div className="flex items-center gap-1.5">
        {badge && (
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-[11px] font-medium",
              active
                ? "bg-[#f3f4f6] text-[#0a0a0a]"
                : "bg-muted text-muted-foreground",
            )}
          >
            {badge}
          </span>
        )}

        <InboxNotificationBadge
          count={inboxUnreadCount ?? 0}
          inverted={false}
          compact
        />
      </div>
      {/* Animated active “underline/highlight” (smooth between routes) */}
      {active && (
        <motion.span
          layoutId="subitem-active"
          className="pointer-events-none absolute inset-0 rounded-md"
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
        />
      )}
    </Link>
  );
}

function isInboxRootHref(href: string) {
  return /\/inbox$/.test(href);
}

function formatCompactUnreadCount(count: number) {
  return count > 99 ? "99+" : String(count);
}

function pluralizeUnread(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return "новое";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return "новых";
  }

  return "новых";
}

function InboxNotificationBadge({
  count,
  inverted,
  compact = false,
}: {
  count: number;
  inverted: boolean;
  compact?: boolean;
}) {
  if (count <= 0) return null;

  const label = compact
    ? formatCompactUnreadCount(count)
    : `${formatCompactUnreadCount(count)} ${pluralizeUnread(count)}`;

  return (
    <motion.span
      key={`${compact ? "compact" : "default"}-${count}-${inverted ? "active" : "idle"}`}
      initial={{ opacity: 0.7, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 26 }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-tight",
        compact && "px-1.5",
        inverted
          ? "border-white/20 bg-white/14 text-white"
          : "border-sky-200 bg-sky-50 text-sky-700 shadow-sm",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full animate-pulse",
          inverted ? "bg-white" : "bg-sky-500",
        )}
      />
      <span>{label}</span>
    </motion.span>
  );
}

function InboxCornerBadge({
  count,
  inverted,
}: {
  count: number;
  inverted: boolean;
}) {
  if (count <= 0) return null;

  return (
    <motion.span
      key={`corner-${count}-${inverted ? "active" : "idle"}`}
      initial={{ opacity: 0.7, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 26 }}
      className={cn(
        "absolute -right-2 -top-2 inline-flex min-w-5 items-center justify-center rounded-full px-1 py-0.5 text-[9px] font-bold leading-none shadow-sm",
        inverted
          ? "bg-white text-primary"
          : "bg-sky-500 text-white ring-2 ring-[#f3f4f6]",
      )}
    >
      {formatCompactUnreadCount(count)}
    </motion.span>
  );
}

export function Sidebar({ collapsed, onToggle }: Props) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { unreadCount, ready } = useInboxUnreadCount();
  const [openLogoutConfirm, setOpenLogoutConfirm] = React.useState(false);
  const toggleLabel = collapsed
    ? "Развернуть боковую панель"
    : "Свернуть боковую панель";

  const navItems: NavItem[] = React.useMemo(() => {
    if (user?.role === "student") return STUDENT_NAV as unknown as NavItem[];
    if (user?.role === "teacher") return TEACHER_NAV as unknown as NavItem[];
    if (user?.role === "admin") return ADMIN_NAV as unknown as NavItem[];
    return [];
  }, [user?.role]);

  const roleLabel = React.useMemo(() => {
    if (user?.role === "teacher") return "Преподаватель";
    if (user?.role === "admin") return "Администратор";
    if (user?.role === "student") return "Студент";
    return "Панель управления";
  }, [user?.role]);

  const [open, setOpen] = React.useState<Record<string, boolean>>({});

  // Auto-open group when any subitem is active
  React.useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const item of navItems) {
      const hasSub = !!item.subtitles?.length;
      if (!hasSub) continue;

      const subActive = item.subtitles!.some((s) =>
        isActivePath(pathname, s.href),
      );
      if (subActive) next[item.href] = true;
    }
    setOpen((prev) => ({ ...prev, ...next }));
  }, [pathname, navItems]);

  const toggleGroup = React.useCallback((href: string) => {
    setOpen((prev) => ({ ...prev, [href]: !prev[href] }));
  }, []);

  return (
    <>
      <motion.aside
        animate={{ width: collapsed ? 72 : 280 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className={cn(
          "sticky top-0 h-screen shrink-0 overflow-hidden border-r will-change-[width]",
          "bg-[#f3f4f6] text-foreground",
        )}
      >
        <div className="flex h-full flex-col">
          <div
            className={cn(
              "px-3 py-3",
              collapsed ? "space-y-2" : "flex items-center justify-between gap-2",
            )}
          >
            <Link
              href="/dashboard"
              className={cn(
                "flex min-w-0 items-center gap-2",
                collapsed && "justify-center",
              )}
            >
              <div className="grid h-9 w-9 place-items-center rounded-full border bg-background">
                <span className="text-sm font-semibold">{brand.short}</span>
              </div>

              {!collapsed && (
                <div className="leading-tight">
                  <div className="text-sm font-semibold">{brand.lms}</div>
                  <div className="text-xs text-muted-foreground">Dashboard</div>
                </div>
              )}
            </Link>

            <Button
              type="button"
              variant="outline"
              size={collapsed ? "sm" : "icon-sm"}
              onClick={onToggle}
              aria-label={toggleLabel}
              title={toggleLabel}
              className={cn(
                "shrink-0 border-border/70 bg-background/80 text-muted-foreground transition-colors hover:bg-background hover:text-foreground",
                collapsed && "w-full justify-center px-0",
              )}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          <ScrollArea className="min-h-0 flex-1 px-2 pb-4">
            <motion.div layout className="mt-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const hasSub = !!item.subtitles?.length;

                const active = isActivePath(pathname, item.href);
                const subActive = !!item.subtitles?.some((s) =>
                  isActivePath(pathname, s.href),
                );
                const groupOpen = !!open[item.href];
                const inboxUnreadCount =
                  ready && isInboxRootHref(item.href) ? unreadCount : 0;

                const baseBtn = cn(
                  buttonVariants({
                    variant: active || subActive ? "default" : "ghost",
                    size: "sm",
                  }),
                  "relative h-8 w-full justify-start gap-3 px-3 text-[13px] font-medium transition-colors",
                  active || subActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "text-foreground/90 hover:bg-muted",
                );

                const ActiveTopHighlight =
                  (active || subActive) && !hasSub ? (
                    <motion.span
                      layoutId="topitem-active"
                      className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-primary/15"
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                    />
                  ) : null;

                const TopRow = hasSub ? (
                  collapsed ? (
                    <Link href={item.href} className={cn(baseBtn)}>
                      <span className="relative">
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            active || subActive
                              ? "text-primary-foreground"
                              : "text-muted-foreground",
                          )}
                        />
                        <InboxCornerBadge
                          count={inboxUnreadCount}
                          inverted={active || subActive}
                        />
                      </span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleGroup(item.href)}
                      aria-expanded={groupOpen}
                      className={cn(baseBtn, "pr-2")}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          active || subActive
                            ? "text-primary-foreground"
                            : "text-muted-foreground",
                        )}
                      />

                      <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                        <span className="truncate">{item.title}</span>

                        <div className="flex items-center gap-2">
                          <InboxNotificationBadge
                            count={inboxUnreadCount}
                            inverted={active || subActive}
                          />

                          {item.badge && (
                            <span
                              className={cn(
                                "rounded-md px-2 py-0.5 text-[11px] font-medium",
                                active || subActive
                                  ? "bg-primary-foreground/15 text-primary-foreground"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              {item.badge}
                            </span>
                          )}

                          <motion.span
                            animate={{ rotate: groupOpen ? 180 : 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 420,
                              damping: 30,
                            }}
                            className="grid place-items-center"
                          >
                            <ChevronDown
                              className={cn(
                                "h-2 w-2",
                                active || subActive
                                  ? "text-primary-foreground"
                                  : "text-muted-foreground",
                              )}
                            />
                          </motion.span>
                        </div>
                      </div>

                      {(active || subActive) && (
                        <motion.span
                          layoutId="topgroup-active"
                          className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-primary/15"
                          transition={{
                            type: "spring",
                            stiffness: 420,
                            damping: 36,
                          }}
                        />
                      )}
                    </button>
                  )
                ) : (
                  <Link href={item.href} className={baseBtn}>
                    {ActiveTopHighlight}

                    <span className="relative">
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          active
                            ? "text-primary-foreground"
                            : "text-muted-foreground",
                        )}
                      />
                      <InboxCornerBadge count={inboxUnreadCount} inverted={active} />
                    </span>

                    {!collapsed && (
                      <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                        <span className="truncate">{item.title}</span>

                        <div className="flex items-center gap-2">
                          <InboxNotificationBadge
                            count={inboxUnreadCount}
                            inverted={active}
                          />

                          {item.badge && (
                            <span
                              className={cn(
                                "rounded-md px-2 py-0.5 text-[11px] font-medium",
                                active
                                  ? "bg-primary-foreground/15 text-primary-foreground"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </Link>
                );

                return (
                  <motion.div key={item.href} layout className="space-y-1">
                    {TopRow}

                    {!collapsed && hasSub && (
                      <AnimatePresence initial={false}>
                        {groupOpen && (
                          <motion.div
                            key={`${item.href}-submenu`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <div className="ml-3 space-y-1 border-l pl-3">
                              {item.subtitles!.map((sub, idx) => {
                                const subIsActive = isActivePath(pathname, sub.href);

                                return (
                                  <ConnectedSubItem
                                    key={sub.href}
                                    href={sub.href}
                                    title={sub.title}
                                    icon={sub.icon}
                                    active={subIsActive}
                                    isFirst={idx === 0}
                                    isLast={idx === item.subtitles!.length - 1}
                                    badge={sub.badge}
                                    inboxUnreadCount={
                                      ready && isInboxRootHref(sub.href)
                                        ? unreadCount
                                        : 0
                                    }
                                  />
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </ScrollArea>

          <div className="mt-auto border-t p-3">
            <div
              className={cn(
                "rounded-md border bg-background p-3 shadow-sm",
                collapsed && "p-2",
              )}
            >
              <div
                className={cn(
                  "flex items-center gap-3",
                  collapsed && "justify-center",
                )}
              >
                <div className="grid h-9 w-9 place-items-center rounded-full bg-muted text-sm font-semibold">
                  {user?.first_name?.[0]?.toUpperCase() ?? "U"}
                </div>

                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {user?.first_name ? `${user.first_name}` : "Аккаунт"}
                      {user?.last_name ? ` ${user.last_name}` : ""}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {roleLabel}
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                aria-label="Выйти"
                className={cn(
                  "mt-3 w-full",
                  collapsed ? "justify-center px-0" : "justify-start",
                )}
                onClick={() => setOpenLogoutConfirm(true)}
              >
                <LogOut className="h-4 w-4" />
                {!collapsed && "Выйти"}
              </Button>
            </div>
          </div>
        </div>
      </motion.aside>

      <ConfirmDialog
        open={openLogoutConfirm}
        onOpenChange={setOpenLogoutConfirm}
        title="Выйти из аккаунта?"
        description="Сессия завершится и для возврата в кабинет нужно будет войти заново."
        cancelText="Остаться"
        confirmText="Выйти"
        confirmVariant="destructive"
        onConfirm={logout}
      />
    </>
  );
}
