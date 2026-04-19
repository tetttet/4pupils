export const MAIL_INBOX_BADGE_REFRESH_EVENT = "mail:inbox-badge-refresh";

export function emitMailInboxBadgeRefresh() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent(MAIL_INBOX_BADGE_REFRESH_EVENT));
}
