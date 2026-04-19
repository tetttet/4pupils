"use client";

import * as React from "react";
import {
  ArrowRight,
  Bell,
  ChevronDown,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  PanelLeft,
  Search,
  Settings2,
  UserRound,
} from "lucide-react";
import { motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";

import { getStudentPlatformItem } from "@/components/platform/student-platform-config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/context/auth-context";
import {
  formatInboxUnreadCount,
  useStudentInbox,
} from "@/context/student-inbox-context";
import { useApprovedCourses } from "@/hooks/use-approved-courses";
import { useUsersDirectory } from "@/hooks/use-users-directory";
import type { MailType } from "@/types/mail";
import type { Course } from "@/types/course";
import type { User } from "@/types/user";
import { brand } from "@/lib/brand";
import {
  getCourseCategoryLabel,
  getCourseLevelLabel,
  initials,
  normalizeText,
} from "@/lib/func";
import { cn } from "@/lib/utils";

type UserDashHeaderProps = {
  onOpenMobileMenu: () => void;
};

type HeaderCourseSearchItem = {
  courseId: string;
  title: string;
  titleText: string;
  href: string;
  meta: string;
  description: string;
  searchText: string;
};

function CandleIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 2.8C10.8 4.1 10.2 5.2 10.2 6.4C10.2 7.9 11.1 9 12.4 9C13.9 9 14.8 7.8 14.8 6.3C14.8 5.1 14 3.9 12 2.8Z"
        fill="url(#candle-flame)"
      />
      <path
        d="M12 8.9V11.3"
        stroke="url(#candle-wick)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <rect
        x="8.1"
        y="11.2"
        width="7.8"
        height="8.8"
        rx="2.2"
        fill="url(#candle-body)"
      />
      <path
        d="M8.8 14.3H15.2"
        stroke="rgba(255,255,255,0.65)"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      <path
        d="M9.2 17H14.8"
        stroke="rgba(255,255,255,0.42)"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="candle-flame" x1="12" y1="2.8" x2="12" y2="9">
          <stop stopColor="#FFF7ED" />
          <stop offset="0.42" stopColor="#FCD34D" />
          <stop offset="1" stopColor="#F97316" />
        </linearGradient>
        <linearGradient id="candle-body" x1="12" y1="11.2" x2="12" y2="20">
          <stop stopColor="#FFF7CC" />
          <stop offset="1" stopColor="#F8C55D" />
        </linearGradient>
        <linearGradient id="candle-wick" x1="12" y1="8.9" x2="12" y2="11.3">
          <stop stopColor="#6B3F20" />
          <stop offset="1" stopColor="#3F2A17" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function GameFireChip() {
  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="hidden xl:flex"
    >
      <div className="relative flex h-14 min-w-62.5 items-center gap-3 overflow-hidden rounded-[22px] border border-amber-200/80 px-4">
        <motion.div
          aria-hidden
          className="absolute -right-6 top-1/2 h-20 w-20 -translate-y-1/2 rounded-full bg-orange-300/25 blur-2xl"
          animate={{
            opacity: [0.25, 0.55, 0.25],
            scale: [0.9, 1.12, 0.9],
          }}
          transition={{
            duration: 2.6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
          <motion.span
            aria-hidden
            className="absolute h-11 w-11 rounded-full bg-orange-400/20 blur-md"
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [0.92, 1.12, 0.92],
            }}
            transition={{
              duration: 1.8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />

          <motion.span
            aria-hidden
            className="absolute bottom-0.5 h-7 w-7 rounded-[58%_58%_46%_46%/58%_58%_78%_78%] bg-linear-to-b from-yellow-200 via-orange-400 to-orange-600 blur-[0.5px]"
            animate={{
              scale: [0.96, 1.08, 0.98, 1.04, 0.96],
              rotate: [-5, 2, -3, 4, -5],
              y: [1, -2, 0, -1, 1],
            }}
            transition={{
              duration: 1.2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />

          <motion.span
            aria-hidden
            className="absolute bottom-2 h-3.5 w-3.5 rounded-[58%_58%_44%_44%/58%_58%_76%_76%] bg-linear-to-b from-white via-amber-100 to-yellow-200"
            animate={{
              opacity: [0.7, 1, 0.8, 1, 0.7],
              scale: [0.9, 1.08, 0.95, 1.04, 0.9],
              y: [0, -1.5, 0, -1, 0],
            }}
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />

          <motion.span
            aria-hidden
            className="absolute left-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-300"
            animate={{
              y: [4, -8, 4],
              x: [0, -2, 0],
              opacity: [0, 0.95, 0],
              scale: [0.8, 1.1, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeOut",
              delay: 0.15,
            }}
          />

          <motion.span
            aria-hidden
            className="absolute right-0.5 top-2 h-1 w-1 rounded-full bg-orange-400"
            animate={{
              y: [3, -7, 3],
              x: [0, 2, 0],
              opacity: [0, 0.9, 0],
              scale: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.35,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeOut",
              delay: 0.4,
            }}
          />

          <CandleIcon className="relative z-10 h-6 w-6 drop-shadow-[0_2px_10px_rgba(251,146,60,0.45)]" />
        </div>

        <div className="min-w-0">
          <div className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700/85">
            Учебный стрик
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-slate-950">
              100 дней подряд
            </span>
            <span className="truncate text-xs font-medium text-amber-700">
              огонь держится
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function buildCatalogHref(query: string) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return "/courses";
  }

  const searchParams = new URLSearchParams({ q: trimmedQuery });
  return `/courses?${searchParams.toString()}`;
}

function buildHeaderCourseSearchItem(course: Course): HeaderCourseSearchItem {
  const category = getCourseCategoryLabel(course);
  const level = getCourseLevelLabel(course.level);
  const description =
    course.short_description?.trim() || course.description?.trim() || "";

  return {
    courseId: course.course_id,
    title: course.title,
    titleText: normalizeText(course.title),
    href: `/o/courses/${course.slug}`,
    meta: [category, level !== "Любой уровень" ? level : null]
      .filter(Boolean)
      .join(" • "),
    description,
    searchText: normalizeText(
      [
        course.title,
        description,
        course.category,
        course.level,
        course.language,
        ...(course.tags ?? []),
        ...(course.outcomes ?? []),
      ].join(" "),
    ),
  };
}

export default function UserDashHeader({
  onOpenMobileMenu,
}: UserDashHeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [courseQuery, setCourseQuery] = React.useState("");
  const [courseSearchOpen, setCourseSearchOpen] = React.useState(false);
  const [notificationOpen, setNotificationOpen] = React.useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const {
    items: inboxItems,
    unreadCount,
    ready: inboxReady,
    refreshing: inboxRefreshing,
    error: inboxError,
    refresh: refreshInbox,
  } = useStudentInbox();
  const {
    courses,
    loading: coursesLoading,
    error: coursesError,
  } = useApprovedCourses();
  const deferredCourseQuery = React.useDeferredValue(courseQuery);

  const activeItem = React.useMemo(
    () => getStudentPlatformItem(pathname),
    [pathname],
  );
  const searchableCourses = React.useMemo(
    () =>
      [...courses]
        .sort((left, right) => left.title.localeCompare(right.title, "ru"))
        .map(buildHeaderCourseSearchItem),
    [courses],
  );
  const normalizedCourseQuery = React.useMemo(
    () => normalizeText(deferredCourseQuery),
    [deferredCourseQuery],
  );
  const matchedCourses = React.useMemo(() => {
    if (!normalizedCourseQuery) {
      return searchableCourses.slice(0, 6);
    }

    return searchableCourses
      .map((item) => ({
        item,
        startsWithMatch: item.titleText.startsWith(normalizedCourseQuery),
        titleMatch: item.titleText.includes(normalizedCourseQuery),
        generalMatch: item.searchText.includes(normalizedCourseQuery),
      }))
      .filter(({ titleMatch, generalMatch }) => titleMatch || generalMatch)
      .sort((left, right) => {
        if (left.startsWithMatch !== right.startsWithMatch) {
          return Number(right.startsWithMatch) - Number(left.startsWithMatch);
        }

        if (left.titleMatch !== right.titleMatch) {
          return Number(right.titleMatch) - Number(left.titleMatch);
        }

        return left.item.title.localeCompare(right.item.title, "ru");
      })
      .slice(0, 6)
      .map(({ item }) => item);
  }, [normalizedCourseQuery, searchableCourses]);
  const catalogHref = React.useMemo(
    () => buildCatalogHref(courseQuery),
    [courseQuery],
  );
  const notificationItems = React.useMemo(
    () =>
      [...inboxItems]
        .sort((left, right) => {
          if (left.unread !== right.unread) {
            return Number(right.unread) - Number(left.unread);
          }

          return (
            new Date(right.created_at).getTime() -
            new Date(left.created_at).getTime()
          );
        })
        .slice(0, 5),
    [inboxItems],
  );
  const notificationUsers = useUsersDirectory(
    notificationItems.map((item) => item.sender_id),
  );

  const fullName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Ученик";

  const profileCompletion = React.useMemo(() => {
    const fields = [
      user?.first_name,
      user?.last_name,
      user?.email,
      user?.phone,
      user?.avatar_url,
    ];

    return Math.round(
      (fields.filter((value) => Boolean(value?.trim())).length /
        fields.length) *
        100,
    );
  }, [
    user?.avatar_url,
    user?.email,
    user?.first_name,
    user?.last_name,
    user?.phone,
  ]);

  const handleNavigate = React.useCallback(
    (href: string) => {
      router.push(href);
    },
    [router],
  );

  const handleSearchNavigate = React.useCallback(
    (href: string) => {
      setCourseSearchOpen(false);
      handleNavigate(href);
    },
    [handleNavigate],
  );
  const handleInboxNavigate = React.useCallback(
    (mailId?: string) => {
      setNotificationOpen(false);

      const href = mailId
        ? `/platform/messages?mailId=${encodeURIComponent(mailId)}`
        : "/platform/messages";

      handleNavigate(href);
    },
    [handleNavigate],
  );

  const handleCourseSearchSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      handleSearchNavigate(catalogHref);
    },
    [catalogHref, handleSearchNavigate],
  );

  const handleLogout = React.useCallback(async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await logout();
      router.replace("/");
    } finally {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, logout, router]);

  React.useEffect(() => {
    setCourseSearchOpen(false);
    setNotificationOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-3 z-30 overflow-hidden rounded-[26px] border border-white/80 bg-white/95 shadow-[0_20px_60px_-38px_rgba(15,23,42,0.35)] backdrop-blur-xl lg:top-5 lg:rounded-[32px]">
      <motion.div
        aria-hidden
        className="absolute -right-10 top-3 h-28 w-28 rounded-full bg-sky-200/55 blur-3xl"
        animate={{
          x: [0, 10, 0],
          y: [0, -8, 0],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 5.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <motion.div
        aria-hidden
        className="absolute left-10 top-8 h-20 w-20 rounded-full bg-amber-200/45 blur-3xl"
        animate={{
          x: [0, -8, 0],
          y: [0, 8, 0],
          opacity: [0.35, 0.65, 0.35],
        }}
        transition={{
          duration: 6.2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <div className="mx-auto flex w-full max-w-400 flex-col gap-3 px-3 py-3 sm:px-6 sm:py-4 lg:gap-4 lg:px-8 lg:py-4">
        <motion.div
          key={activeItem.href}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative flex flex-wrap items-center gap-2.5 lg:flex-nowrap lg:items-center lg:justify-between lg:gap-3"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onOpenMobileMenu}
              className="h-9 w-9 shrink-0 rounded-[18px] border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden"
              aria-label="Открыть боковое меню"
            >
              <PanelLeft className="h-4.5 w-4.5" />
            </Button>

            <div className="min-w-0 flex-1">
              <h2 className="mt-0 truncate text-xl font-semibold leading-tight tracking-[-0.03em] text-slate-950 sm:text-2xl lg:text-[30px]">
                {activeItem.title}
              </h2>
            </div>
          </div>

          <div className="contents lg:flex lg:flex-none lg:items-center lg:justify-end lg:gap-3">
            <Popover open={courseSearchOpen} onOpenChange={setCourseSearchOpen}>
              <PopoverAnchor asChild>
                <div className="order-4 min-w-0 basis-full lg:order-none lg:w-60 lg:flex-none xl:w-80">
                  <form
                    onSubmit={handleCourseSearchSubmit}
                    className="flex h-11 w-full min-w-0 items-center gap-2 rounded-[18px] border border-slate-200 bg-white/90 px-3 text-sm font-medium text-slate-500 shadow-sm transition focus-within:border-sky-200 focus-within:bg-white focus-within:shadow-lg lg:h-14 lg:rounded-[22px] lg:px-4"
                  >
                    <Search className="h-3.5 w-3.5 shrink-0 text-sky-500 lg:h-4 lg:w-4" />

                    <input
                      type="search"
                      value={courseQuery}
                      onChange={(event) => {
                        setCourseQuery(event.target.value);
                        setCourseSearchOpen(true);
                      }}
                      onFocus={() => setCourseSearchOpen(true)}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          setCourseSearchOpen(false);
                          event.currentTarget.blur();
                        }
                      }}
                      placeholder="Найти курс или открыть каталог"
                      autoComplete="off"
                      aria-label="Поиск доступных курсов"
                      className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </form>
                </div>
              </PopoverAnchor>

              <PopoverContent
                align="start"
                sideOffset={10}
                className="w-[min(92vw,30rem)] rounded-[24px] border border-white/90 bg-white/97 p-0 shadow-2xl shadow-slate-950/10 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Каталог курсов
                    </div>
                    <div className="mt-1 truncate text-sm font-semibold text-slate-950">
                      {courseQuery.trim()
                        ? "Подходящие доступные курсы"
                        : "Все доступные курсы"}
                    </div>
                  </div>
                </div>

                <div className="max-h-90 overflow-y-auto p-2">
                  {coursesLoading ? (
                    <div className="flex items-center gap-3 rounded-[18px] px-3 py-6 text-sm text-slate-500">
                      <LoaderCircle className="h-4 w-4 animate-spin text-sky-500" />
                      Загружаем доступные курсы...
                    </div>
                  ) : coursesError ? (
                    <div className="rounded-[18px] border border-rose-100 bg-rose-50/80 px-4 py-4 text-sm text-rose-700">
                      Не удалось загрузить быстрый поиск. Каталог курсов всё
                      равно можно открыть.
                    </div>
                  ) : matchedCourses.length > 0 ? (
                    matchedCourses.map((course) => (
                      <button
                        key={course.courseId}
                        type="button"
                        onClick={() => handleSearchNavigate(course.href)}
                        className="flex w-full items-start gap-3 rounded-[18px] px-3 py-3 text-left transition hover:bg-slate-50"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-slate-900">
                            {course.title}
                          </div>

                          {course.meta ? (
                            <div className="mt-1 truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700/80">
                              {course.meta}
                            </div>
                          ) : null}

                          {course.description ? (
                            <div className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                              {course.description}
                            </div>
                          ) : null}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-[18px] border border-slate-200 bg-slate-50/80 px-4 py-4">
                      <div className="text-sm font-semibold text-slate-900">
                        Курсы не найдены
                      </div>
                      <div className="mt-1 text-xs leading-5 text-slate-500">
                        Попробуйте другой запрос или откройте весь каталог
                        доступных курсов.
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200 p-2">
                  <button
                    type="button"
                    onClick={() => handleSearchNavigate(catalogHref)}
                    className="flex w-full items-center justify-between rounded-[18px] px-3 py-3 text-left transition hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900">
                        {courseQuery.trim()
                          ? "Открыть результаты в каталоге"
                          : "Смотреть все доступные курсы"}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {coursesLoading
                          ? "Каталог обновляется..."
                          : `${courses.length} опубликованных курсов`}
                      </div>
                    </div>

                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            <GameFireChip />

            <Popover
              open={notificationOpen}
              onOpenChange={(open) => {
                setNotificationOpen(open);

                if (open) {
                  void refreshInbox();
                }
              }}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="order-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] border border-slate-200 bg-white/90 text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-950 lg:order-none lg:h-14 lg:w-14 lg:rounded-[22px]"
                  aria-label="Уведомления"
                >
                  <div className="relative">
                    <Bell className="h-4 w-4 lg:h-4.5 lg:w-4.5" />

                    {inboxReady && unreadCount > 0 ? (
                      <motion.span
                        className="absolute -right-2 -top-2 inline-flex px-1.5 py-1 items-center justify-center rounded-full bg-sky-500 text-[9px] font-bold leading-none text-white shadow-[0_10px_24px_-16px_rgba(14,165,233,0.9)]"
                        animate={{
                          scale: [1, 1.08, 1],
                          opacity: [0.92, 1, 0.92],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }}
                      >
                        {formatInboxUnreadCount(unreadCount)}
                      </motion.span>
                    ) : null}
                  </div>
                </button>
              </PopoverTrigger>

              <PopoverContent
                align="end"
                sideOffset={10}
                className="w-[min(92vw,24rem)] rounded-[24px] border border-white/90 bg-white/97 p-0 shadow-2xl shadow-slate-950/10 backdrop-blur-xl"
              >
                <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3">
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Уведомления
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-950">
                      {unreadCount > 0
                        ? `${formatInboxUnreadCount(unreadCount)} новых во входящих`
                        : "Все входящие просмотрены"}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => void refreshInbox()}
                    className="h-8 gap-1.5 rounded-full px-3 text-xs font-medium text-slate-500 hover:text-slate-900"
                  >
                    {inboxRefreshing ? (
                      <>
                        <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                        Обновляем
                      </>
                    ) : (
                      "Обновить"
                    )}
                  </Button>
                </div>

                <div className="max-h-96 overflow-y-auto p-2">
                  {!inboxReady ? (
                    <div className="flex items-center gap-3 rounded-[18px] px-3 py-6 text-sm text-slate-500">
                      <LoaderCircle className="h-4 w-4 animate-spin text-sky-500" />
                      Загружаем уведомления...
                    </div>
                  ) : inboxError && notificationItems.length === 0 ? (
                    <div className="rounded-[18px] border border-rose-100 bg-rose-50/80 px-4 py-4 text-sm text-rose-700">
                      Не удалось загрузить входящие уведомления. Попробуйте
                      обновить список.
                    </div>
                  ) : notificationItems.length > 0 ? (
                    notificationItems.map((item) => (
                      <button
                        key={item.mail_id}
                        type="button"
                        onClick={() => handleInboxNavigate(item.mail_id)}
                        className="flex w-full items-start gap-3 rounded-[18px] px-3 py-3 text-left transition hover:bg-slate-50"
                      >
                        <NotificationAvatar
                          user={notificationUsers[item.sender_id]}
                          senderId={item.sender_id}
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="truncate text-sm font-semibold text-slate-900">
                              {getInboxSenderName(
                                notificationUsers[item.sender_id],
                                item.sender_id,
                              )}
                            </div>

                            {item.unread ? (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-sky-500" />
                            ) : null}

                            <div className="ml-auto shrink-0 text-[11px] text-slate-400">
                              {formatInboxNotificationTime(item.created_at)}
                            </div>
                          </div>

                          <div className="mt-1 flex items-center gap-2">
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em]",
                                getInboxTypeClassName(item.type),
                              )}
                            >
                              {getInboxTypeLabel(item.type)}
                            </span>
                            <div className="truncate text-xs font-medium text-slate-600">
                              {item.subject?.trim() || "Без темы"}
                            </div>
                          </div>

                          <div className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                            {item.preview?.trim() ||
                              "Откройте письмо, чтобы посмотреть содержимое."}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-[18px] border border-slate-200 bg-slate-50/80 px-4 py-4">
                      <div className="text-sm font-semibold text-slate-900">
                        Входящих сообщений пока нет
                      </div>
                      <div className="mt-1 text-xs leading-5 text-slate-500">
                        Когда преподаватели или система напишут вам, новые
                        письма появятся здесь.
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200 p-2">
                  <button
                    type="button"
                    onClick={() => handleInboxNavigate()}
                    className="flex w-full items-center justify-between rounded-[18px] px-3 py-3 text-left transition hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900">
                        Открыть все сообщения
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Перейти в список входящих писем
                      </div>
                    </div>

                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="order-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] border border-slate-200 bg-white/92 p-0 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-lg lg:order-none lg:h-14 lg:w-14 lg:rounded-[22px] xl:w-auto xl:min-w-62 xl:justify-start xl:gap-3 xl:px-4"
                  aria-label="Открыть меню пользователя"
                >
                  <Avatar className="h-9 w-9 shrink-0 border border-slate-200 lg:h-10 lg:w-10">
                    <AvatarImage
                      src={user?.avatar_url || undefined}
                      alt={fullName}
                    />
                    <AvatarFallback className="bg-sky-100 text-xs font-semibold text-sky-700">
                      {initials(fullName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="hidden min-w-0 flex-1 leading-tight xl:block">
                    <div className="truncate text-sm font-semibold text-slate-900">
                      {fullName}
                    </div>
                    <div className="truncate text-xs font-medium text-slate-500">
                      Заполнен на {profileCompletion}%
                    </div>
                  </div>

                  <ChevronDown
                    className={cn(
                      "hidden h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 xl:block",
                      userMenuOpen ? "rotate-180 text-slate-700" : "",
                    )}
                  />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-[288px] rounded-[26px] border border-white/90 bg-white/95 p-2 shadow-2xl shadow-slate-950/10 backdrop-blur-xl"
              >
                <DropdownMenuLabel className="px-3 py-3 text-left">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Аккаунт ученика
                  </div>
                  <div className="mt-2 truncate text-sm font-semibold text-slate-950">
                    {fullName}
                  </div>
                  <div className="mt-1 truncate text-xs text-slate-500">
                    {user?.email ?? brand.studentEmail}
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-slate-200" />

                <DropdownMenuItem
                  onSelect={() => handleNavigate("/platform")}
                  className="rounded-[18px] px-3 py-3 text-sm text-slate-700 focus:bg-slate-100"
                >
                  <LayoutDashboard className="h-4 w-4 text-sky-600" />
                  Главная
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={() => handleNavigate("/platform/profile")}
                  className="rounded-[18px] px-3 py-3 text-sm text-slate-700 focus:bg-slate-100"
                >
                  <UserRound className="h-4 w-4 text-sky-600" />
                  Профиль
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={() => handleNavigate("/platform/settings")}
                  className="rounded-[18px] px-3 py-3 text-sm text-slate-700 focus:bg-slate-100"
                >
                  <Settings2 className="h-4 w-4 text-slate-500" />
                  Настройки
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-slate-200" />

                <DropdownMenuItem
                  disabled={isLoggingOut}
                  variant="destructive"
                  onSelect={() => {
                    void handleLogout();
                  }}
                  className="rounded-[18px] px-3 py-3 text-sm"
                >
                  {isLoggingOut ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>
      </div>
    </header>
  );
}

function NotificationAvatar({
  user,
  senderId,
}: {
  user?: User | null;
  senderId: string;
}) {
  const senderName = getInboxSenderName(user, senderId);

  return (
    <Avatar className="h-10 w-10 shrink-0 border border-slate-200">
      <AvatarImage src={user?.avatar_url || undefined} alt={senderName} />
      <AvatarFallback className="bg-sky-100 text-[11px] font-semibold text-sky-700">
        {initials(senderName)}
      </AvatarFallback>
    </Avatar>
  );
}

function getInboxSenderName(user?: User | null, senderId?: string | null) {
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ");

  if (fullName) {
    return fullName;
  }

  if (user?.email?.trim()) {
    return user.email;
  }

  return senderId?.trim() ? "Отправитель" : "Неизвестный отправитель";
}

function getInboxTypeLabel(type: MailType) {
  if (type === "notification") {
    return "Уведомление";
  }

  if (type === "system") {
    return "Система";
  }

  return "Сообщение";
}

function getInboxTypeClassName(type: MailType) {
  if (type === "notification") {
    return "bg-amber-50 text-amber-700";
  }

  if (type === "system") {
    return "bg-violet-50 text-violet-700";
  }

  return "bg-sky-50 text-sky-700";
}

function formatInboxNotificationTime(value: string) {
  const date = new Date(value);
  const now = new Date();

  const isSameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isSameDay) {
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });
}
