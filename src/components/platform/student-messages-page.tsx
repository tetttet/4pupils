"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  Bell,
  ChevronLeft,
  ExternalLink,
  Inbox,
  Paperclip,
} from "lucide-react";

import { StudentGlassPanel } from "@/components/platform/student-surface";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  formatInboxUnreadCount,
  useStudentInbox,
} from "@/context/student-inbox-context";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useStudentPlatformPreferences } from "@/hooks/use-student-platform-preferences";
import { useUsersDirectoryState } from "@/hooks/use-users-directory";
import { getUserFacingErrorMessage } from "@/lib/error-messages";
import { MailAPI } from "@/lib/mail/api";
import {
  fmtDateTime,
  formatBytes,
  formatPlainText,
  initials,
} from "@/lib/func";
import { cn } from "@/lib/utils";
import type { MailDetail, MailListItem } from "@/types/mail";
import type { User } from "@/types/user";

const mailDetailCache = new Map<string, MailDetail>();
const mailDetailRequestCache = new Map<string, Promise<MailDetail>>();

function getCachedMailDetail(mailId: string | null | undefined) {
  const normalizedId = mailId?.trim() ?? "";

  if (!normalizedId) {
    return null;
  }

  return mailDetailCache.get(normalizedId) ?? null;
}

function setCachedMailDetail(detail: MailDetail) {
  mailDetailCache.set(detail.id, detail);
}

async function loadMailDetail(mailId: string) {
  const normalizedId = mailId.trim();

  if (!normalizedId) {
    throw new Error("Missing mail id");
  }

  const cachedDetail = mailDetailCache.get(normalizedId);
  if (cachedDetail) {
    return cachedDetail;
  }

  const pendingRequest = mailDetailRequestCache.get(normalizedId);
  if (pendingRequest) {
    return pendingRequest;
  }

  const request = MailAPI.get(normalizedId)
    .then((detail) => {
      setCachedMailDetail(detail);
      return detail;
    })
    .finally(() => {
      mailDetailRequestCache.delete(normalizedId);
    });

  mailDetailRequestCache.set(normalizedId, request);

  return request;
}

function prefetchMailDetail(mailId: string | null | undefined) {
  const normalizedId = mailId?.trim() ?? "";

  if (
    !normalizedId ||
    mailDetailCache.has(normalizedId) ||
    mailDetailRequestCache.has(normalizedId)
  ) {
    return;
  }

  void loadMailDetail(normalizedId).catch(() => {
    // Prefetch errors should not block UI interactions.
  });
}

export function StudentMessagesPageContent() {
  const searchParams = useSearchParams();
  const requestedMailId = searchParams.get("mailId");
  const { items, unreadCount, ready, error, refresh, markAsRead } =
    useStudentInbox();
  const { preferences } = useStudentPlatformPreferences();
  const { width } = useMediaQuery();
  const [selectedId, setSelectedId] = React.useState("");
  const [activeMail, setActiveMail] = React.useState<MailDetail | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detailError, setDetailError] = React.useState<string | null>(null);
  const [mobileDetailOpen, setMobileDetailOpen] = React.useState(false);
  const handledRequestedMailIdRef = React.useRef<string | null>(null);
  const isCompactLayout = width > 0 && width < 768;

  React.useEffect(() => {
    if (!items.length) {
      setSelectedId("");
      setActiveMail(null);
      setDetailError(null);
      setDetailLoading(false);
      setMobileDetailOpen(false);
      return;
    }

    if (
      requestedMailId &&
      items.some((item) => item.mail_id === requestedMailId)
    ) {
      if (requestedMailId !== selectedId) {
        setSelectedId(requestedMailId);
      }
      return;
    }

    if (!selectedId || !items.some((item) => item.mail_id === selectedId)) {
      setSelectedId(items[0].mail_id);
    }
  }, [items, requestedMailId, selectedId]);

  const syncReadState = React.useCallback(
    (detail: MailDetail) => {
      if (!detail.unread) {
        return detail;
      }

      const readAt = detail.read_at ?? new Date().toISOString();
      const nextDetail = {
        ...detail,
        unread: false,
        read_at: readAt,
      };

      setCachedMailDetail(nextDetail);

      void markAsRead(detail.id, {
        wasUnread: true,
        readAt,
      }).catch(() => {
        setCachedMailDetail(detail);
        void refresh();
      });

      return nextDetail;
    },
    [markAsRead, refresh],
  );

  React.useEffect(() => {
    let cancelled = false;

    if (!selectedId) {
      setActiveMail(null);
      setDetailError(null);
      setDetailLoading(false);
      return;
    }

    const cachedDetail = getCachedMailDetail(selectedId);
    setDetailError(null);

    if (cachedDetail) {
      setActiveMail(syncReadState(cachedDetail));
      setDetailLoading(false);
      return;
    }

    setDetailLoading(true);

    void loadMailDetail(selectedId)
      .then((detail) => {
        if (cancelled) {
          return;
        }

        setActiveMail(syncReadState(detail));
      })
      .catch((loadError) => {
        if (cancelled) {
          return;
        }

        setActiveMail((current) =>
          current?.id === selectedId ? current : null,
        );
        setDetailError(
          getUserFacingErrorMessage(loadError, "Не удалось открыть сообщение"),
        );
      })
      .finally(() => {
        if (!cancelled) {
          setDetailLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedId, syncReadState]);

  React.useEffect(() => {
    if (!selectedId || !isCompactLayout) {
      setMobileDetailOpen(false);
    }
  }, [isCompactLayout, selectedId]);

  React.useEffect(() => {
    if (!requestedMailId) {
      handledRequestedMailIdRef.current = null;
      return;
    }

    if (!isCompactLayout) {
      return;
    }

    const hasRequestedItem = items.some(
      (item) => item.mail_id === requestedMailId,
    );

    if (!hasRequestedItem) {
      return;
    }

    if (handledRequestedMailIdRef.current === requestedMailId) {
      return;
    }

    setMobileDetailOpen(true);
    handledRequestedMailIdRef.current = requestedMailId;
  }, [isCompactLayout, items, requestedMailId]);

  React.useEffect(() => {
    if (!isCompactLayout || !mobileDetailOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isCompactLayout, mobileDetailOpen]);

  React.useEffect(() => {
    if (!items.length) {
      return;
    }

    const selectedIndex = items.findIndex(
      (item) => item.mail_id === selectedId,
    );
    const visibleWindow =
      selectedIndex >= 0
        ? items.slice(
            Math.max(0, selectedIndex - 1),
            Math.min(items.length, selectedIndex + 3),
          )
        : items.slice(0, 3);

    visibleWindow.forEach((item) => {
      if (item.mail_id !== selectedId) {
        prefetchMailDetail(item.mail_id);
      }
    });
  }, [items, selectedId]);

  const senderIds = React.useMemo(() => {
    const ids = items.map((item) => item.sender_id);

    if (activeMail?.sender_id) {
      ids.push(activeMail.sender_id);
    }

    return ids;
  }, [activeMail, items]);
  const { usersById: senderDirectory, isPending: isSenderPending } =
    useUsersDirectoryState(senderIds);
  const selectedListItem = React.useMemo(
    () => items.find((item) => item.mail_id === selectedId) ?? null,
    [items, selectedId],
  );
  const selectedSender = activeMail
    ? senderDirectory[activeMail.sender_id]
    : selectedListItem
      ? senderDirectory[selectedListItem.sender_id]
      : null;
  const selectedSenderLoading = activeMail
    ? isSenderPending(activeMail.sender_id)
    : selectedListItem
      ? isSenderPending(selectedListItem.sender_id)
      : false;
  const detailMatchesSelection = activeMail?.id === selectedId;
  const showDetailLoadingOverlay =
    detailLoading && Boolean(activeMail) && !detailMatchesSelection;
  const activeListItemId =
    !isCompactLayout || mobileDetailOpen ? selectedId : null;
  const compactMessagePreview = preferences.messagePreview === "compact";

  const handleSelect = React.useCallback(
    (id: string) => {
      if (!id) {
        return;
      }

      if (id === selectedId) {
        if (isCompactLayout) {
          setMobileDetailOpen(true);
        }

        return;
      }

      React.startTransition(() => {
        setSelectedId(id);
        setDetailError(null);
        if (isCompactLayout) {
          setMobileDetailOpen(true);
        }
      });
    },
    [isCompactLayout, selectedId],
  );
  const handleCloseMobileDetail = React.useCallback(() => {
    setMobileDetailOpen(false);
  }, []);
  const mobileDetailTitle =
    activeMail?.subject?.trim() ||
    selectedListItem?.subject?.trim() ||
    "Сообщение";

  return (
    <>
      <div className="grid gap-4 md:gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <StudentGlassPanel className="overflow-hidden">
          <div className="border-b border-black/6 px-4 py-4 sm:px-5 sm:py-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[15px] font-semibold text-slate-950 sm:text-base">
                  Входящие
                </div>
                <div className="mt-1 text-xs text-slate-500 sm:text-sm">
                  Кто и что вам написал
                </div>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700 sm:px-3 sm:py-1.5 sm:text-xs">
                <Bell className="h-3.5 w-3.5" />
                {unreadCount > 0
                  ? `${formatInboxUnreadCount(unreadCount)} новых`
                  : "Без новых"}
              </div>
            </div>
          </div>

          <div className="max-h-[70vh] overflow-y-auto p-2.5 sm:p-3">
            {!ready ? (
              <MessageListSkeleton />
            ) : error && items.length === 0 ? (
              <div className="rounded-[20px] border border-rose-100 bg-rose-50/80 px-4 py-4 text-sm text-rose-700 sm:rounded-[22px]">
                Не удалось загрузить входящие сообщения. Попробуйте обновить
                список.
              </div>
            ) : items.length > 0 ? (
              <div className="space-y-2">
                {items.map((item) => (
                  <MessageListItem
                    key={item.mail_id}
                    item={item}
                    active={item.mail_id === activeListItemId}
                    sender={senderDirectory[item.sender_id]}
                    senderLoading={isSenderPending(item.sender_id)}
                    compact={compactMessagePreview}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            ) : (
              <div className="flex min-h-72 flex-col items-center justify-center rounded-[22px] border border-dashed border-slate-200 px-6 text-center sm:min-h-90 sm:rounded-[24px]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 sm:h-14 sm:w-14">
                  <Inbox className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="mt-4 text-[15px] font-semibold text-slate-950 sm:text-base">
                  Входящих пока нет
                </div>
                <div className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                  Когда вам напишут преподаватели или система, письма появятся
                  здесь.
                </div>
              </div>
            )}
          </div>
        </StudentGlassPanel>

        <MessageDetailPane
          mode="desktop"
          className="hidden md:block"
          ready={ready}
          detailError={detailError}
          detailMatchesSelection={detailMatchesSelection}
          activeMail={activeMail}
          detailLoading={detailLoading}
          showDetailLoadingOverlay={showDetailLoadingOverlay}
          sender={selectedSender}
          senderLoading={selectedSenderLoading}
        />
      </div>

      {isCompactLayout && mobileDetailOpen ? (
        <MessageDetailPane
          mode="mobile"
          ready={ready}
          detailError={detailError}
          detailMatchesSelection={detailMatchesSelection}
          activeMail={activeMail}
          detailLoading={detailLoading}
          showDetailLoadingOverlay={showDetailLoadingOverlay}
          sender={selectedSender}
          senderLoading={selectedSenderLoading}
          title={mobileDetailTitle}
          onBack={handleCloseMobileDetail}
        />
      ) : null}
    </>
  );
}

function MessageDetailPane({
  ready,
  detailError,
  detailMatchesSelection,
  activeMail,
  detailLoading,
  showDetailLoadingOverlay,
  sender,
  senderLoading,
  mode = "desktop",
  className,
  title = "Сообщение",
  onBack,
}: {
  ready: boolean;
  detailError: string | null;
  detailMatchesSelection: boolean;
  activeMail: MailDetail | null;
  detailLoading: boolean;
  showDetailLoadingOverlay: boolean;
  sender?: User | null;
  senderLoading: boolean;
  mode?: "desktop" | "mobile";
  className?: string;
  title?: string;
  onBack?: () => void;
}) {
  const isMobileMode = mode === "mobile";
  const shouldShowMobileSkeleton =
    isMobileMode && showDetailLoadingOverlay && !detailMatchesSelection;
  const detailContent = !ready ? (
    <MessageDetailSkeleton />
  ) : detailError && !detailMatchesSelection ? (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="rounded-[22px] border border-rose-100 bg-rose-50/80 px-5 py-5 text-sm text-rose-700 sm:rounded-[24px]">
        {detailError}
      </div>
    </div>
  ) : shouldShowMobileSkeleton ? (
    <MessageDetailSkeleton />
  ) : activeMail ? (
    <div className="relative h-full">
      <div
        className={cn(
          "h-full transition duration-200",
          showDetailLoadingOverlay
            ? "pointer-events-none select-none opacity-35 blur-[2px]"
            : "",
        )}
      >
        <MessageDetailView
          mail={activeMail}
          sender={sender}
          senderLoading={senderLoading}
        />
      </div>

      {!isMobileMode && showDetailLoadingOverlay ? (
        <MessageDetailLoadingOverlay />
      ) : null}
    </div>
  ) : detailLoading ? (
    <MessageDetailSkeleton />
  ) : (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 text-center",
        isMobileMode ? "min-h-[52vh] py-10" : "min-h-120",
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500 sm:h-16 sm:w-16">
        <Inbox className="h-6 w-6 sm:h-7 sm:w-7" />
      </div>
      <div className="mt-5 text-base font-semibold text-slate-950 sm:text-lg">
        Выберите сообщение
      </div>
      <div className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        Слева отображается список писем. Нажмите на нужное сообщение, чтобы
        открыть его содержимое.
      </div>
    </div>
  );

  if (isMobileMode) {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 flex flex-col bg-[#f5f7fb] md:hidden",
          className,
        )}
      >
        <div className="border-b border-black/6 bg-white/95 px-3 py-3 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Входящие
              </div>
              <div className="mt-1 truncate pr-4 text-sm font-semibold text-slate-950">
                {title}
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-9 rounded-full border border-slate-200 bg-white px-3 text-slate-700 hover:bg-slate-50 hover:text-slate-950"
            >
              <ChevronLeft className="h-4 w-4" />
              Назад
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <StudentGlassPanel className="min-h-full overflow-hidden">
            {detailContent}
          </StudentGlassPanel>
        </div>
      </div>
    );
  }

  return (
    <StudentGlassPanel className={cn("overflow-hidden", className)}>
      {detailContent}
    </StudentGlassPanel>
  );
}

function MessageListItem({
  item,
  active,
  sender,
  senderLoading,
  compact,
  onSelect,
}: {
  item: MailListItem;
  active: boolean;
  sender?: User | null;
  senderLoading: boolean;
  compact: boolean;
  onSelect: (id: string) => void;
}) {
  const senderName = getSenderName(sender, senderLoading);
  const senderRole = getUserRoleLabel(sender?.role);

  return (
    <button
      type="button"
      onClick={() => onSelect(item.mail_id)}
      aria-pressed={active}
      className={cn(
        "w-full rounded-[20px] border px-3 text-left transition duration-200 sm:rounded-[24px] sm:px-4",
        compact ? "py-2.5 sm:py-3" : "py-3 sm:py-4",
        active
          ? "border-[#2d2d2d] bg-[#2d2d2d]"
          : "border-transparent bg-white/80 hover:-translate-y-px hover:border-slate-200 hover:bg-slate-50/90",
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar
          className={cn(
            "h-10 w-10 shrink-0 sm:h-11 sm:w-11",
            active ? "border border-white/10" : "border border-white/80",
          )}
        >
          <AvatarImage src={sender?.avatar_url || undefined} alt={senderName} />
          <AvatarFallback
            className={cn(
              "text-[11px] font-semibold",
              active ? "bg-white/10 text-white" : "bg-sky-100 text-sky-700",
            )}
          >
            {initials(senderName)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {senderLoading ? (
              <div
                className={cn(
                  "h-4 w-28 animate-pulse rounded-full",
                  active ? "bg-white/12" : "bg-slate-100",
                )}
              />
            ) : (
              <div
                className={cn(
                  "truncate text-[13px] font-semibold sm:text-sm",
                  active ? "text-white" : "text-slate-900",
                )}
              >
                {senderName}
              </div>
            )}

            {item.unread ? (
              <span
                className={cn(
                  "h-2 w-2 shrink-0 rounded-full",
                  active ? "bg-sky-300" : "bg-sky-500",
                )}
              />
            ) : null}

            <div
              className={cn(
                "ml-auto shrink-0 text-[10px] sm:text-[11px]",
                active ? "text-white/48" : "text-slate-400",
              )}
            >
              {formatListDate(item.created_at)}
            </div>
          </div>

          <div className="mt-1.5 hidden flex-wrap items-center gap-2 sm:flex">
            {senderLoading ? (
              <div
                className={cn(
                  "h-5 w-24 animate-pulse rounded-full",
                  active ? "bg-white/10" : "bg-slate-100",
                )}
              />
            ) : senderRole ? (
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-normal",
                  active
                    ? "border border-white/10 bg-white/[0.07] text-white/70"
                    : "border border-slate-200 bg-white text-slate-500",
                )}
              >
                {senderRole}
              </span>
            ) : null}
          </div>

          <div
            className={cn(
              "mt-1.5 truncate text-[13px] font-medium leading-5 sm:text-sm",
              active ? "text-white/90" : "text-slate-900",
            )}
          >
            {item.subject?.trim() || "Без темы"}
          </div>

          <div
            className={cn(
              compact
                ? "mt-1 line-clamp-1 text-[12px] leading-5 sm:text-[13px] sm:leading-5"
                : "mt-1 line-clamp-2 text-[12px] leading-5 sm:mt-2 sm:text-sm sm:leading-6",
              active ? "text-white/62" : "text-slate-500",
            )}
          >
            {item.preview?.trim() ||
              "Откройте письмо, чтобы посмотреть содержимое."}
          </div>
        </div>
      </div>
    </button>
  );
}

function MessageDetailView({
  mail,
  sender,
  senderLoading,
}: {
  mail: MailDetail;
  sender?: User | null;
  senderLoading: boolean;
}) {
  const senderName = getSenderName(sender, senderLoading);
  const senderRole = getUserRoleLabel(sender?.role);
  const senderMeta = sender?.email?.trim() || "Данные отправителя недоступны";
  const date = fmtDateTime(mail.created_at);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-black/6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <Avatar className="h-11 w-11 shrink-0 sm:h-13 sm:w-13">
              <AvatarImage
                src={sender?.avatar_url || undefined}
                alt={senderName}
              />
              <AvatarFallback className="bg-sky-100 text-[13px] font-semibold text-sky-700 sm:text-sm">
                {initials(senderName)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {senderLoading ? (
                  <div className="h-6 w-40 animate-pulse rounded-full bg-slate-100" />
                ) : (
                  <div className="truncate text-base font-semibold text-slate-950 sm:text-lg">
                    {senderName}
                  </div>
                )}

                {senderRole ? (
                  <span className="tracking-normal rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase text-slate-600">
                    {senderRole}
                  </span>
                ) : null}

                {!mail.read_at ? (
                  <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-semibold uppercase text-white">
                    Новое
                  </span>
                ) : null}
              </div>

              {senderLoading ? (
                <div className="mt-2 h-4 w-52 animate-pulse rounded-full bg-slate-100" />
              ) : (
                <div className="mt-1 text-[13px] text-slate-500 sm:text-sm">
                  {senderMeta}
                </div>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-[20px] border border-slate-200 bg-slate-50/80 px-3 py-2 text-[13px] text-slate-600 sm:rounded-[22px] sm:px-4 sm:py-3 sm:text-sm">
            <div>{date.dateLabel}</div>
            <div className="text-xs uppercase text-slate-400">
              {date.timeLabel}
            </div>
          </div>
        </div>
        <div className="mt-3 text-xl font-semibold text-slate-950 sm:text-2xl lg:text-3xl">
          {mail.subject?.trim() || "Без темы"}
        </div>
      </div>

      <div className="flex-1 space-y-5 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <pre className="whitespace-pre-wrap text-[13px] leading-6 text-slate-700 sm:text-sm sm:leading-7">
          {formatPlainText(mail.body || "")}
        </pre>

        {mail.attachments.length > 0 ? (
          <div className="rounded-[22px] border border-black/8 bg-slate-50/80 p-4 sm:rounded-[26px] sm:p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <Paperclip className="h-4 w-4 text-slate-500" />
              Вложения
            </div>

            <div className="mt-4 space-y-3">
              {mail.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex flex-col gap-3 rounded-[24px] border border-white/80 bg-white px-3.5 py-3.5 sm:rounded-4xl sm:px-4 sm:py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900">
                      {attachment.name}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {formatBytes(attachment.size)} • {attachment.mime}
                    </div>
                  </div>

                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-950 sm:text-xs"
                  >
                    Открыть
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MessageListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-[20px] border border-white/70 bg-white/80 px-3 py-3 sm:rounded-[24px] sm:px-4 sm:py-4"
        >
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 shrink-0 rounded-full bg-slate-100 sm:h-11 sm:w-11" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-4 w-32 rounded-full bg-slate-100" />
                <div className="ml-auto h-3 w-14 rounded-full bg-slate-100" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-24 rounded-full bg-slate-100" />
                <div className="h-4 w-20 rounded-full bg-slate-100" />
              </div>
              <div className="h-3.5 w-full rounded-full bg-slate-100" />
              <div className="h-3.5 w-3/4 rounded-full bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MessageDetailSkeleton({ className }: { className?: string } = {}) {
  return (
    <div
      className={cn(
        "animate-pulse space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 rounded-full bg-slate-100 sm:h-13 sm:w-13" />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="h-5 w-44 rounded-full bg-slate-100" />
          <div className="h-4 w-28 rounded-full bg-slate-100" />
          <div className="h-8 w-2/3 rounded-full bg-slate-100" />
        </div>
        <div className="hidden h-16 w-28 rounded-[22px] bg-slate-100 sm:block" />
      </div>

      <div className="h-20 rounded-[22px] bg-slate-100/80" />

      <div className="space-y-3 rounded-[26px] border border-black/8 bg-white p-5">
        <div className="h-4 w-full rounded-full bg-slate-100" />
        <div className="h-4 w-11/12 rounded-full bg-slate-100" />
        <div className="h-4 w-4/5 rounded-full bg-slate-100" />
        <div className="h-4 w-full rounded-full bg-slate-100" />
        <div className="h-4 w-2/3 rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

function MessageDetailLoadingOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden bg-white/78 backdrop-blur-[3px]">
      <MessageDetailSkeleton />
    </div>
  );
}

function getSenderName(user?: User | null, loading = false) {
  const fullName = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .join(" ");

  if (fullName) {
    return fullName;
  }

  if (user?.email?.trim()) {
    return user.email;
  }

  if (loading) {
    return "Загрузка отправителя";
  }

  return "Неизвестный отправитель";
}

function getUserRoleLabel(role?: User["role"] | null) {
  if (role === "teacher") {
    return "Преподаватель";
  }

  if (role === "admin") {
    return "Администратор";
  }

  if (role === "student") {
    return "Ученик";
  }

  return null;
}

function formatListDate(value: string) {
  const date = new Date(value);
  const now = new Date();

  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
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
