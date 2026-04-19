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
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (loading) return;

    async function refreshUnreadCount() {
      if (!user) {
        React.startTransition(() => {
          setUnreadCount(0);
          setReady(true);
        });
        return;
      }

      try {
        const nextCount = await MailAPI.countUnreadInbox();

        React.startTransition(() => {
          setUnreadCount(nextCount);
          setReady(true);
        });
      } catch {
        React.startTransition(() => {
          setReady(true);
        });
      }
    }

    void refreshUnreadCount();

    if (!user) return;

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
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener(
        MAIL_INBOX_BADGE_REFRESH_EVENT,
        handleMailRefresh as EventListener,
      );
    };
  }, [loading, user]);

  return {
    unreadCount,
    hasUnread: unreadCount > 0,
    ready,
  };
}
