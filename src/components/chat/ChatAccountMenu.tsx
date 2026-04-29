"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  LoaderCircle,
  LogIn,
  LogOut,
  Settings,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth-context";
import { buildAuthHref } from "@/lib/auth-redirect";
import type { User } from "@/types/user";

type AccountMenuItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

function getFullName(user: User | null) {
  return [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();
}

function getInitials(user: User | null) {
  const first = user?.first_name?.trim()[0] ?? "";
  const last = user?.last_name?.trim()[0] ?? "";
  return `${first}${last}`.toUpperCase() || "U";
}

function getRoleLabel(role?: User["role"] | null) {
  if (role === "teacher") return "Преподаватель";
  if (role === "admin") return "Администратор";
  if (role === "student") return "Студент";
  return "Пользователь";
}

function getMenuItems(role?: User["role"] | null): AccountMenuItem[] {
  if (role === "teacher") {
    return [
      { href: "/dashboard", icon: LayoutDashboard, label: "Главная" },
      { href: "/dashboard/teacher/profile", icon: UserRound, label: "Профиль" },
      {
        href: "/dashboard/teacher/settings",
        icon: Settings,
        label: "Настройки",
      },
    ];
  }

  if (role === "admin") {
    return [
      { href: "/dashboard", icon: LayoutDashboard, label: "Главная" },
      {
        href: "/dashboard/admin/users/students",
        icon: Users,
        label: "Пользователи",
      },
      {
        href: "/dashboard/admin/settings",
        icon: Settings,
        label: "Настройки",
      },
    ];
  }

  return [
    { href: "/platform", icon: LayoutDashboard, label: "Главная" },
    { href: "/platform/profile", icon: UserRound, label: "Профиль" },
    { href: "/platform/settings", icon: Settings, label: "Настройки" },
  ];
}

export function ChatAccountMenu() {
  const router = useRouter();
  const { loading, logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const fullName = getFullName(user) || "Аккаунт";
  const roleLabel = getRoleLabel(user?.role);
  const menuItems = useMemo(() => getMenuItems(user?.role), [user?.role]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  function navigateTo(href: string) {
    setIsOpen(false);
    router.push(href);
  }

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logout();
      setIsOpen(false);
      router.replace("/");
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <div
        aria-label="Загрузка аккаунта"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--border)] bg-[var(--control-hover)]"
        role="status"
      >
        <LoaderCircle className="h-4 w-4 animate-spin text-[var(--muted)]" />
      </div>
    );
  }

  if (!user) {
    return (
      <button
        aria-label="Войти в аккаунт"
        className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--header-bg)] px-3 text-sm font-semibold text-[var(--text)] shadow-sm transition hover:bg-[var(--control-hover)] focus:outline-none focus:ring-4 focus:ring-[var(--focus-ring)]"
        onClick={() =>
          router.push(buildAuthHref("/auth/sign-in", "/ai/homemade/atlas"))
        }
        type="button"
      >
        <LogIn className="h-4 w-4" />
        <span className="hidden sm:inline">Войти</span>
      </button>
    );
  }

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Открыть меню аккаунта"
        className="flex h-10 shrink-0 items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--header-bg)] px-1.5 pr-2 text-[var(--text)] shadow-sm transition hover:bg-[var(--control-hover)] focus:outline-none focus:ring-4 focus:ring-[var(--focus-ring)]"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <Avatar className="h-8 w-8 border border-[var(--border)]">
          <AvatarImage src={user.avatar_url ?? undefined} alt={fullName} />
          <AvatarFallback className="bg-[var(--accent)] text-xs font-semibold text-white">
            {getInitials(user)}
          </AvatarFallback>
        </Avatar>
        <ChevronDown
          className={`h-4 w-4 text-[var(--muted)] transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[var(--text)]" : ""
          }`}
        />
      </button>

      {isOpen ? (
        <div
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-72 max-w-[90vw] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--header-bg)] p-2 text-[var(--text)] shadow-2xl shadow-black/15 backdrop-blur-xl"
          role="menu"
        >
          <div className="flex items-center gap-3 rounded-xl bg-[var(--settings-row)] p-3">
            <Avatar className="h-10 w-10 border border-[var(--border)]">
              <AvatarImage src={user.avatar_url ?? undefined} alt={fullName} />
              <AvatarFallback className="bg-[var(--accent)] text-sm font-semibold text-white">
                {getInitials(user)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--text)]">
                {fullName}
              </p>
              <p className="truncate text-xs text-[var(--muted)]">
                {user.email || roleLabel}
              </p>
            </div>
          </div>

          <div className="my-2 h-px bg-[var(--border)]" />

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-[var(--text)] transition hover:bg-[var(--control-hover)] focus:outline-none focus:ring-4 focus:ring-[var(--focus-ring)]"
                  key={item.href}
                  onClick={() => navigateTo(item.href)}
                  role="menuitem"
                  type="button"
                >
                  <Icon className="h-4 w-4 text-[var(--accent)]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="my-2 h-px bg-[var(--border)]" />

          <button
            className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-[var(--danger)] transition hover:bg-[var(--danger-soft)] focus:outline-none focus:ring-4 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoggingOut}
            onClick={() => void handleLogout()}
            role="menuitem"
            type="button"
          >
            {isLoggingOut ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            <span>Выйти</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
