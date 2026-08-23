"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAuth } from "@/context/auth-context";
import { initials } from "@/lib/func";
import type { User } from "@/types/user";
import {
  BookOpen,
  ChevronDown,
  Inbox,
  LayoutGrid,
  type LucideIcon,
  LogOut,
  PanelLeft,
  Settings,
  UserRound,
  Users,
} from "lucide-react";

type MenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

function getRoleLabel(role?: User["role"] | null) {
  if (role === "teacher") return "Преподаватель";
  if (role === "admin") return "Администратор";
  if (role === "student") return "Студент";
  return "Пользователь";
}

function getMenuItems(role?: User["role"] | null): MenuItem[] {
  if (role === "teacher") {
    return [
      {
        label: "Главная",
        href: "/dashboard",
        icon: LayoutGrid,
      },
      {
        label: "Почта",
        href: "/dashboard/teacher/inbox",
        icon: Inbox,
      },
      {
        label: "Профиль",
        href: "/dashboard/teacher/profile",
        icon: UserRound,
      },
      {
        label: "Настройки",
        href: "/dashboard/teacher/settings",
        icon: Settings,
      },
    ];
  }

  if (role === "admin") {
    return [
      {
        label: "Главная",
        href: "/dashboard",
        icon: LayoutGrid,
      },
      {
        label: "Пользователи",
        href: "/dashboard/admin/users/students",
        icon: Users,
      },
      {
        label: "Курсы",
        href: "/dashboard/admin/courses",
        icon: BookOpen,
      },
      {
        label: "Настройки",
        href: "/dashboard/admin/settings",
        icon: Settings,
      },
    ];
  }

  return [
    {
      label: "Главная",
      href: "/dashboard",
      icon: LayoutGrid,
    },
    {
      label: "Профиль",
      href: "/platform/profile",
      icon: UserRound,
    },
    {
      label: "Настройки",
      href: "/platform/settings",
      icon: Settings,
    },
  ];
}

export function DashboardHeader({
  collapsed,
  onToggleSidebar,
}: {
  collapsed: boolean;
  onToggleSidebar: () => void;
}) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = React.useState(false);
  const toggleLabel = collapsed
    ? "Развернуть боковую панель"
    : "Свернуть боковую панель";
  const fullName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Аккаунт";
  const roleLabel = getRoleLabel(user?.role);
  const isTeacher = user?.role === "teacher";
  const menuItems = React.useMemo(() => getMenuItems(user?.role), [user?.role]);

  const handleNavigate = React.useCallback(
    (href: string) => {
      setUserMenuOpen(false);
      router.push(href);
    },
    [router],
  );

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex h-14 w-full items-center gap-3 px-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggleSidebar}
            aria-label={toggleLabel}
            title={toggleLabel}
            className="relative z-10 shrink-0"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6 shrink-0" />

          <div className="min-w-0 flex-1 p-2">
            <div className="truncate --web-kit-text font-semibold">
              {isTeacher ? "Рабочее пространство" : "Добро пожаловать"}
              {!isTeacher && user?.first_name && (
                <span className="ml-1 text-primary font-bold">
                  {user.first_name}
                  {user?.last_name && ` ${user.last_name}`}
                </span>
              )}
              {!isTeacher ? " 👋" : null}
            </div>

            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>Роль</span>
              <span className="font-medium">{roleLabel}</span>
            </div>
          </div>

          <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="ml-auto flex shrink-0 items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-slate-50 sm:px-3"
                aria-label="Открыть меню пользователя"
              >
                <Avatar className="h-9 w-9 border border-border/70">
                  <AvatarImage src={user?.avatar_url ?? undefined} alt={fullName} />
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {initials(fullName)}
                  </AvatarFallback>
                </Avatar>

                <div className="hidden min-w-0 sm:block">
                  <div className="max-w-44 truncate text-sm font-semibold text-foreground">
                    {fullName}
                  </div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {roleLabel}
                  </div>
                </div>

                <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-72 rounded-2xl border border-border/70 p-2"
            >
              <DropdownMenuLabel className="px-3 py-2.5 text-left">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Аккаунт
                </div>
                <div className="mt-2 truncate text-sm font-semibold text-foreground">
                  {fullName}
                </div>
                <div className="mt-1 truncate text-xs text-muted-foreground">
                  {user?.email ?? "Email не указан"}
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {menuItems.map((item) => {
                const Icon = item.icon;

                return (
                  <DropdownMenuItem
                    key={item.href}
                    onSelect={() => handleNavigate(item.href)}
                    className="rounded-xl px-3 py-2.5"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    {item.label}
                  </DropdownMenuItem>
                );
              })}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant="destructive"
                onSelect={() => {
                  setUserMenuOpen(false);
                  setLogoutConfirmOpen(true);
                }}
                className="rounded-xl px-3 py-2.5"
              >
                <LogOut className="h-4 w-4" />
                Выйти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <ConfirmDialog
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
        title="Выйти из аккаунта?"
        description="Сессия завершится, и для возврата в кабинет нужно будет войти заново."
        cancelText="Остаться"
        confirmText="Выйти"
        confirmVariant="destructive"
        onConfirm={logout}
      />
    </>
  );
}
