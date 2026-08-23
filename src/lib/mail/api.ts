import type {
  CreateDraftPayload,
  UpdateDraftPayload,
  SendPayload,
  MailDetail,
  MailListItem,
  MailFolder,
  MailTag,
} from "@/types/mail";
import { emitMailInboxBadgeRefresh } from "@/lib/mail/inbox-events";
import { getUserFacingErrorMessage } from "@/lib/error-messages";
import { clientFetch } from "@/lib/client-fetch";

const UNREAD_COUNT_TTL_MS = 10_000;

let unreadCountCache: { value: number; expiresAt: number } | null = null;
let unreadCountRequest: { version: number; promise: Promise<number> } | null = null;
let unreadCountVersion = 0;

function invalidateUnreadCountCache() {
  unreadCountVersion += 1;
  unreadCountCache = null;
}

async function json<T>(r: Response): Promise<T> {
  const text = await r.text();
  if (!r.ok) {
    let errorPayload: unknown = text;
    try {
      errorPayload = JSON.parse(text);
    } catch {}
    throw new Error(
      getUserFacingErrorMessage(errorPayload, "Не удалось выполнить запрос", {
        status: r.status,
      }),
    );
  }
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export const MailAPI = {
  list: async (params?: {
    folder?: MailFolder;
    q?: string;
    limit?: number;
    offset?: number;
    unread?: boolean;
    starred?: boolean;
    important?: boolean;
    tag?: string;
  }) => {
    const sp = new URLSearchParams();
    if (params?.folder) sp.set("folder", params.folder);
    if (params?.q) sp.set("q", params.q);
    if (params?.limit) sp.set("limit", String(params.limit));
    if (params?.offset) sp.set("offset", String(params.offset));
    if (typeof params?.unread === "boolean") sp.set("unread", String(params.unread));
    if (typeof params?.starred === "boolean") sp.set("starred", String(params.starred));
    if (typeof params?.important === "boolean") sp.set("important", String(params.important));
    if (params?.tag) sp.set("tag", params.tag);

    const r = await clientFetch(
      `/api/mail${sp.toString() ? `?${sp.toString()}` : ""}`,
      { cache: "no-store" },
    );
    return json<MailListItem[]>(r);
  },

  countUnreadInbox: async () => {
    if (unreadCountCache && unreadCountCache.expiresAt > Date.now()) {
      return unreadCountCache.value;
    }

    if (
      unreadCountRequest &&
      unreadCountRequest.version === unreadCountVersion
    ) {
      return unreadCountRequest.promise;
    }

    const requestVersion = unreadCountVersion;
    const request = (async () => {
      const unreadItems = await MailAPI.list({
        folder: "inbox",
        unread: true,
        limit: 1,
        offset: 0,
      });
      const value = unreadItems[0]?.unread_count ?? unreadItems.length;

      if (requestVersion === unreadCountVersion) {
        unreadCountCache = {
          value,
          expiresAt: Date.now() + UNREAD_COUNT_TTL_MS,
        };
      }

      return value;
    })();
    unreadCountRequest = { version: requestVersion, promise: request };

    try {
      return await request;
    } finally {
      if (unreadCountRequest?.promise === request) {
        unreadCountRequest = null;
      }
    }
  },

  get: async (id: string) => {
    const r = await clientFetch(`/api/mail/${id}`, { cache: "no-store" });
    return json<MailDetail>(r);
  },

  createDraft: async (payload: CreateDraftPayload) => {
    const r = await clientFetch(`/api/mail/drafts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return json<{ mailId: string; threadId: string }>(r);
  },

  updateDraft: async (id: string, payload: UpdateDraftPayload) => {
    const r = await clientFetch(`/api/mail/${id}/draft`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return json<{ ok: true }>(r);
  },

  send: async (id: string, payload: SendPayload = {}) => {
    const r = await clientFetch(`/api/mail/${id}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return json<{ ok: true }>(r);
  },

  markRead: async (id: string, unread: boolean) => {
    const r = await clientFetch(`/api/mail/${id}/read`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unread }),
    });
    const result = await json(r);
    invalidateUnreadCountCache();
    emitMailInboxBadgeRefresh();
    return result;
  },

  moveFolder: async (id: string, folder: MailFolder) => {
    const r = await clientFetch(`/api/mail/${id}/folder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder }),
    });
    const result = await json(r);
    invalidateUnreadCountCache();
    emitMailInboxBadgeRefresh();
    return result;
  },

  updateFlags: async (id: string, flags: { starred?: boolean; important?: boolean }) => {
    const r = await clientFetch(`/api/mail/${id}/flags`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(flags),
    });
    return json(r);
  },

  replaceTags: async (id: string, tags: MailTag) => {
    const r = await clientFetch(`/api/mail/${id}/tags`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags }),
    });
    return json(r);
  },

  uploadAttachments: async (id: string, files: File[]) => {
    const fd = new FormData();
    for (const f of files) fd.append("files", f);

    const r = await clientFetch(`/api/mail/${id}/attachments`, {
      method: "POST",
      body: fd,
    });
    return json(r);
  },
};
