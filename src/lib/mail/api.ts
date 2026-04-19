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

async function json<T>(r: Response): Promise<T> {
  const text = await r.text();
  if (!r.ok) {
    let msg = text;
    try {
      msg = JSON.parse(text)?.message || msg;
    } catch {}
    throw new Error(msg || `HTTP ${r.status}`);
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

    const r = await fetch(`/api/mail${sp.toString() ? `?${sp.toString()}` : ""}`, { cache: "no-store" });
    return json<MailListItem[]>(r);
  },

  countUnreadInbox: async () => {
    const pageSize = 100;
    const maxPages = 50;
    let total = 0;

    for (let pageIndex = 0; pageIndex < maxPages; pageIndex += 1) {
      const page = await MailAPI.list({
        folder: "inbox",
        unread: true,
        limit: pageSize,
        offset: pageIndex * pageSize,
      });

      total += page.length;

      if (page.length < pageSize) {
        break;
      }
    }

    return total;
  },

  get: async (id: string) => {
    const r = await fetch(`/api/mail/${id}`, { cache: "no-store" });
    return json<MailDetail>(r);
  },

  createDraft: async (payload: CreateDraftPayload) => {
    const r = await fetch(`/api/mail/drafts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return json<{ mailId: string; threadId: string }>(r);
  },

  updateDraft: async (id: string, payload: UpdateDraftPayload) => {
    const r = await fetch(`/api/mail/${id}/draft`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return json<{ ok: true }>(r);
  },

  send: async (id: string, payload: SendPayload = {}) => {
    const r = await fetch(`/api/mail/${id}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return json<{ ok: true }>(r);
  },

  markRead: async (id: string, unread: boolean) => {
    const r = await fetch(`/api/mail/${id}/read`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unread }),
    });
    const result = await json(r);
    emitMailInboxBadgeRefresh();
    return result;
  },

  moveFolder: async (id: string, folder: MailFolder) => {
    const r = await fetch(`/api/mail/${id}/folder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder }),
    });
    const result = await json(r);
    emitMailInboxBadgeRefresh();
    return result;
  },

  updateFlags: async (id: string, flags: { starred?: boolean; important?: boolean }) => {
    const r = await fetch(`/api/mail/${id}/flags`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(flags),
    });
    return json(r);
  },

  replaceTags: async (id: string, tags: MailTag) => {
    const r = await fetch(`/api/mail/${id}/tags`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags }),
    });
    return json(r);
  },

  uploadAttachments: async (id: string, files: File[]) => {
    const fd = new FormData();
    for (const f of files) fd.append("files", f);

    const r = await fetch(`/api/mail/${id}/attachments`, { method: "POST", body: fd });
    return json(r);
  },
};
