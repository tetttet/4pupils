"use client";

import * as React from "react";

import { useAuth } from "@/context/auth-context";
import {
  MAIL_INBOX_BADGE_REFRESH_EVENT,
} from "@/lib/mail/inbox-events";
import { MailAPI } from "@/lib/mail/api";

const INBOX_BADGE_POLL_MS = 30000;

export function useInboxUnreadCount() {
  const { user, loading } = useAuth();
  const userId = user?.id ?? null;
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [ready, setReady] = React.useState(false);
  const refreshIdRef = React.useRef(0);

  React.useEffect(() => {
    if (loading) return;

    async function refreshUnreadCount() {
      const refreshId = ++refreshIdRef.current;

      if (!userId) {
        React.startTransition(() => {
          setUnreadCount(0);
          setReady(true);
        });
        return;
      }

      try {
        const nextCount = await MailAPI.countUnreadInbox();
        if (refreshId !== refreshIdRef.current) return;

        React.startTransition(() => {
          setUnreadCount(nextCount);
          setReady(true);
        });
      } catch {
        if (refreshId !== refreshIdRef.current) return;

        React.startTransition(() => {
          setReady(true);
        });
      }
    }

    void refreshUnreadCount();

    if (!userId) return;

    const handleFocus = () => {
      void refreshUnreadCount();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void refreshUnreadCount();
      }
    };

    const handleMailRefresh = () => {
      void refreshUnreadCount();
    };

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void refreshUnreadCount();
      }
    }, INBOX_BADGE_POLL_MS);

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener(
      MAIL_INBOX_BADGE_REFRESH_EVENT,
      handleMailRefresh as EventListener,
    );

    return () => {
      refreshIdRef.current += 1;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener(
        MAIL_INBOX_BADGE_REFRESH_EVENT,
        handleMailRefresh as EventListener,
      );
    };
  }, [loading, userId]);

  return {
    unreadCount,
    hasUnread: unreadCount > 0,
    ready,
  };
}
