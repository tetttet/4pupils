"use client";

import * as React from "react";

import { useAuth } from "@/context/auth-context";
import { MAIL_INBOX_BADGE_REFRESH_EVENT } from "@/lib/mail/inbox-events";
import { MailAPI } from "@/lib/mail/api";
import type { MailListItem } from "@/types/mail";

const INBOX_PREVIEW_LIMIT = 40;
const INBOX_POLL_MS = 30000;

type StudentInboxState = {
  items: MailListItem[];
  unreadCount: number;
  ready: boolean;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
};

type StudentInboxContextValue = StudentInboxState & {
  hasUnread: boolean;
  refresh: () => Promise<void>;
  markAsRead: (
    mailId: string,
    options?: { wasUnread?: boolean; readAt?: string | null },
  ) => Promise<void>;
};

const INITIAL_STATE: StudentInboxState = {
  items: [],
  unreadCount: 0,
  ready: false,
  loading: false,
  refreshing: false,
  error: null,
};

const StudentInboxContext =
  React.createContext<StudentInboxContextValue | null>(null);

function sortInboxItems(items: MailListItem[]) {
  return [...items].sort((left, right) => {
    return (
      new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
    );
  });
}

async function fetchInboxSnapshot() {
  const [items, unreadCount] = await Promise.all([
    MailAPI.list({
      folder: "inbox",
      limit: INBOX_PREVIEW_LIMIT,
    }),
    MailAPI.countUnreadInbox(),
  ]);

  return {
    items: sortInboxItems(items),
    unreadCount,
  };
}

export function formatInboxUnreadCount(count: number) {
  if (count > 99) {
    return "99+";
  }

  return String(Math.max(0, count));
}

export function StudentInboxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = React.useState<StudentInboxState>(INITIAL_STATE);

  const refresh = React.useCallback(async () => {
    if (authLoading) {
      return;
    }

    if (!user) {
      React.startTransition(() => {
        setState({
          ...INITIAL_STATE,
          ready: true,
        });
      });
      return;
    }

    setState((current) => ({
      ...current,
      loading: !current.ready,
      refreshing: current.ready,
      error: null,
    }));

    try {
      const snapshot = await fetchInboxSnapshot();

      React.startTransition(() => {
        setState({
          ...snapshot,
          ready: true,
          loading: false,
          refreshing: false,
          error: null,
        });
      });
    } catch (error) {
      React.startTransition(() => {
        setState((current) => ({
          ...current,
          ready: true,
          loading: false,
          refreshing: false,
          error:
            error instanceof Error
              ? error.message
              : "Не удалось загрузить входящие сообщения",
        }));
      });
    }
  }, [authLoading, user]);

  const markAsRead = React.useCallback<
    StudentInboxContextValue["markAsRead"]
  >(
    async (mailId, options) => {
      if (!mailId) {
        return;
      }

      const readAt = options?.readAt ?? new Date().toISOString();

      await MailAPI.markRead(mailId, false);

      React.startTransition(() => {
        setState((current) => {
          let decremented = false;

          const items = current.items.map((item) => {
            if (item.mail_id !== mailId || !item.unread) {
              return item;
            }

            decremented = true;
            return {
              ...item,
              unread: false,
              read_at: readAt,
            };
          });

          const unreadCount =
            decremented || options?.wasUnread
              ? Math.max(0, current.unreadCount - 1)
              : current.unreadCount;

          return {
            ...current,
            items,
            unreadCount,
          };
        });
      });
    },
    [],
  );

  React.useEffect(() => {
    if (authLoading) {
      return;
    }

    void refresh();

    if (!user) {
      return;
    }

    const handleFocus = () => {
      void refresh();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    };

    const handleInboxRefresh = () => {
      void refresh();
    };

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    }, INBOX_POLL_MS);

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener(
      MAIL_INBOX_BADGE_REFRESH_EVENT,
      handleInboxRefresh as EventListener,
    );

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener(
        MAIL_INBOX_BADGE_REFRESH_EVENT,
        handleInboxRefresh as EventListener,
      );
    };
  }, [authLoading, refresh, user]);

  const value = React.useMemo<StudentInboxContextValue>(
    () => ({
      ...state,
      hasUnread: state.unreadCount > 0,
      refresh,
      markAsRead,
    }),
    [markAsRead, refresh, state],
  );

  return (
    <StudentInboxContext.Provider value={value}>
      {children}
    </StudentInboxContext.Provider>
  );
}

export function useStudentInbox() {
  const context = React.useContext(StudentInboxContext);

  if (!context) {
    throw new Error(
      "useStudentInbox must be used inside <StudentInboxProvider>",
    );
  }

  return context;
}
