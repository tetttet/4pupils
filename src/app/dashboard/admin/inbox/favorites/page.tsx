"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import InboxSidebar from "@/components/dashboard/admin/inbox/inbox-sidebar";
import { getUserFacingErrorMessage } from "@/lib/error-messages";
import { fmtDateTime } from "@/lib/func";

import type { MailDetail, MailListItem, MailFolder } from "@/types/mail";
import { MailAPI } from "@/lib/mail/api";
// import { normalizeTags } from "@/lib/mail/normalize-tags";
import InboxHeader from "@/components/dashboard/admin/inbox/inbox-header";
// import InboxDetails from "@/components/dashboard/admin/inbox-details";
import InboxMain from "@/components/dashboard/admin/inbox/inbox-main";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { User } from "@/types/user";
import { fetchUserById } from "@/services/user";
import { AppBreadcrumb } from "@/components/ui/app-breadcrumb";
import InboxNoMessage from "@/components/dashboard/admin/inbox/inbox-no-message";

export default function Inbox() {
  const folder: MailFolder = "inbox";

  const [mails, setMails] = React.useState<MailListItem[]>([]);
  const [query, setQuery] = React.useState("");
  const [activeId, setActiveId] = React.useState<string>("");

  const [active, setActive] = React.useState<MailDetail | null>(null);

  const [collapsed] = React.useState(false);
  const [loadingList, setLoadingList] = React.useState(false);
  const [loadingActive, setLoadingActive] = React.useState(false);

  // Reply UI state
  const [replyOpen, setReplyOpen] = React.useState(false);
  const [replySubject, setReplySubject] = React.useState("");
  const [replyBody, setReplyBody] = React.useState("");
  const [replyFiles, setReplyFiles] = React.useState<File[]>([]);
  const [replyBusy, setReplyBusy] = React.useState(false);
  const [replyError, setReplyError] = React.useState<string | null>(null);
  const [replySent, setReplySent] = React.useState(false);

  //
  const [sender, setSender] = React.useState<User | null>(null);

  // Confirm dialog state (archive/delete)
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmBusy, setConfirmBusy] = React.useState(false);
  const [confirmPayload, setConfirmPayload] = React.useState<{
    action: "delete" | "archive";
    id: string;
  } | null>(null);

  function askConfirm(action: "delete" | "archive", id: string) {
    setConfirmPayload({ action, id });
    setConfirmOpen(true);
  }

  async function loadList() {
    setLoadingList(true);
    const t = toast.loading("Загружаю письма...");
    try {
      const data = await MailAPI.list({ folder, limit: 50 });
      setMails(data);

      // если активный id исчез (удален/перемещен) — сбросить
      if (activeId && !data.some((m) => m.mail_id === activeId)) {
        // НЕ сбрасываем active, если пользователь сейчас отвечает.
        // Но в inbox логично, что письмо могло уйти в архив/корзину.
        if (!replyOpen) {
          setActiveId("");
          setActive(null);
        }
      }

      toast.success("Список обновлён");
    } catch (e) {
      toast.error(getUserFacingErrorMessage(e, "Не удалось загрузить список"));
    } finally {
      toast.dismiss(t);
      setLoadingList(false);
    }
  }

  React.useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const starredOnly = mails.filter((m) => m.starred);
    if (!q) return starredOnly;

    return starredOnly.filter((m) => {
      const hay = `${m.sender_id} ${m.subject} ${m.preview}`.toLowerCase();
      return hay.includes(q);
    });
  }, [mails, query]);

  const unreadCount = React.useMemo(
    () => mails.reduce((acc, m) => acc + (m.starred && m.unread ? 1 : 0), 0),
    [mails],
  );

  const openMail = async (id: string) => {
    setActiveId(id);
    setLoadingActive(true);

    // сброс reply UI при открытии другого письма
    setReplyOpen(false);
    setReplySent(false);
    setReplyError(null);
    setReplyFiles([]);
    setReplyBody("");
    setReplySubject("");

    const t = toast.loading("Открываю письмо...");
    try {
      const detail = await MailAPI.get(id);
      setActive(detail);

      // mark as read
      if (detail.unread) {
        await MailAPI.markRead(id, false);

        const nowIso = new Date().toISOString();
        setActive((prev) =>
          prev ? { ...prev, unread: false, read_at: nowIso } : prev,
        );
        setMails((prev) =>
          prev.map((m) =>
            m.mail_id === id ? { ...m, unread: false, read_at: nowIso } : m,
          ),
        );
      }

      toast.success("Письмо открыто");
    } catch (e) {
      toast.error(getUserFacingErrorMessage(e, "Не удалось открыть письмо"));
    } finally {
      toast.dismiss(t);
      setLoadingActive(false);
    }
  };

  const archiveMail = async (id: string) => {
    await toast.promise(
      (async () => {
        await MailAPI.moveFolder(id, "archived");
        setMails((prev) => prev.filter((m) => m.mail_id !== id));
        if (activeId === id) {
          setActiveId("");
          setActive(null);
          setReplyOpen(false);
        }
      })(),
      {
        loading: "Архивирую...",
        success: "Письмо в архиве",
        error: (e) =>
          getUserFacingErrorMessage(e, "Не удалось архивировать"),
      },
    );
  };

  const deleteMail = async (id: string) => {
    await toast.promise(
      (async () => {
        await MailAPI.moveFolder(id, "trash");
        setMails((prev) => prev.filter((m) => m.mail_id !== id));
        if (activeId === id) {
          setActiveId("");
          setActive(null);
          setReplyOpen(false);
        }
      })(),
      {
        loading: "Удаляю...",
        success: "Письмо перемещено в корзину",
        error: (e) => getUserFacingErrorMessage(e, "Не удалось удалить"),
      },
    );
  };

  // wrappers that show confirm dialog
  const requestArchive = (id: string) => askConfirm("archive", id);
  const requestDelete = (id: string) => askConfirm("delete", id);

  const activeHeader = React.useMemo(() => {
    if (!active) return null;
    return fmtDateTime(active.created_at);
  }, [active]);

  // const tags = normalizeTags(active?.tags);

  function quoteOriginal(a: MailDetail) {
    const dt = fmtDateTime(a.created_at);
    const head = `\n\n---\nOn ${dt.dateLabel} ${dt.timeLabel}, ${a.sender_id} wrote:\n`;
    return head + (a.body ? a.body : "");
  }

  function addReplyFiles(list: FileList | null) {
    if (!list || !list.length) return;
    setReplyFiles((prev) => [...prev, ...Array.from(list)]);
  }

  function removeReplyFile(idx: number) {
    setReplyFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function onStartReply() {
    if (!active) return;

    setReplySent(false);
    setReplyError(null);
    setReplyOpen(true);

    const subj = active.subject?.trim() || "";
    const normalized = subj.toLowerCase().startsWith("re:")
      ? subj
      : `Re: ${subj || "message"}`;
    setReplySubject(normalized);

    // не вставляем цитату автоматически в поле, но можно:
    // setReplyBody(quoteOriginal(active));
    setReplyBody("");
    toast.message("Ответ: режим редактирования открыт");
  }

  async function onSendReply() {
    if (!active) return;

    setReplyBusy(true);
    setReplyError(null);
    setReplySent(false);

    try {
      const body = (replyBody || "").trim() + quoteOriginal(active);

      await toast.promise(
        (async () => {
          // 1) draft
          const { mailId } = await MailAPI.createDraft({
            subject: replySubject || `Re: ${active.subject || ""}`,
            preview: body ? body.slice(0, 140) : "",
            body,
            to: [active.sender_id], // пока uuid пользователя (ты потом подтянешь людей/почты)
            cc: [],
            bcc: [],
            tags: [],
            type: "user",
          });

          // 2) attachments
          if (replyFiles.length) {
            await MailAPI.uploadAttachments(mailId, replyFiles);
            setReplyFiles([]);
          }

          // 3) send
          await MailAPI.send(mailId, { scheduledAt: null });

          // ui state
          setReplySent(true);
          setReplyBody("");
          setReplyOpen(false);

          // refresh list
          await loadList();
        })(),
        {
          loading: replyFiles.length
            ? "Отправляю ответ и загружаю вложения..."
            : "Отправляю ответ...",
          success: "Ответ отправлен",
          error: (e) =>
            getUserFacingErrorMessage(e, "Не удалось отправить ответ"),
        },
      );
    } catch (e: unknown) {
      const errorMessage = getUserFacingErrorMessage(
        e,
        "Не удалось отправить ответ",
      );
      setReplyError(errorMessage);
      // toast уже показан в toast.promise error, но пусть локально будет тоже
    } finally {
      setReplyBusy(false);
    }
  }

  async function onConfirmAction() {
    if (!confirmPayload) return;

    setConfirmBusy(true);
    try {
      if (confirmPayload.action === "delete") {
        await deleteMail(confirmPayload.id);
      } else {
        await archiveMail(confirmPayload.id);
      }
      setConfirmOpen(false);
      setConfirmPayload(null);
    } finally {
      setConfirmBusy(false);
    }
  }

  React.useEffect(() => {
    let isMounted = true;

    if (!active) {
      setSender(null);
      return;
    }

    fetchUserById(active.sender_id || "")
      .then((user) => {
        if (isMounted) {
          setSender(user);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSender(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [active]);

  const name = sender
    ? `${sender.first_name} ${sender.last_name}`.trim()
    : "Неизвестный отправитель";

  return (
    <div className="w-full bg-background">
      <AppBreadcrumb
        items={[
          { label: "Главная", href: "/dashboard" },
          { label: "Почта", href: "/dashboard/admin/inbox" },
          { label: "Входящие", href: "/dashboard/admin/inbox" },
        ]}
      />
      <motion.div
        className="grid h-full grid-cols-1 lg:grid-cols-none"
        animate={{
          gridTemplateColumns: collapsed ? "110px 1fr" : "380px 1fr",
        }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
      >
        {/* LEFT */}
        <InboxSidebar
          collapsed={collapsed}
          unreadCount={unreadCount}
          query={query}
          setQuery={setQuery}
          filtered={filtered}
          activeId={activeId}
          openMail={openMail}
        />

        {/* RIGHT */}
        <div className="flex min-w-0 flex-1 flex-col bg-[#f8fafd]">
          {/* header */}
          <InboxHeader
            active={
              active
                ? {
                    id: active.id,
                    subject: active.subject ?? null,
                    sender_id: active.sender_id ?? null,
                    starred: active.starred,
                  }
                : {
                    id: "",
                    subject: null,
                    sender_id: null,
                    starred: false,
                  }
            }
            name={name}
            email={sender?.email || null}
            activeHeader={activeHeader}
            loadingActive={loadingActive}
            loadingList={loadingList}
            where="admin"
          />

          {/* content */}
          <div className="flex-1 overflow-auto bg-white rounded-3xl overflow-y-hidden mb-4">
            {!active ? (
              <InboxNoMessage />
            ) : (
              <div className="space-y-4">
                {/* MAIN MAIL CARD */}
                <InboxMain
                  active={active}
                  name={name}
                  email={sender?.email || null}
                  activeHeader={activeHeader}
                  replyOpen={replyOpen}
                  setReplyOpen={setReplyOpen}
                  replySubject={replySubject}
                  setReplySubject={setReplySubject}
                  replyBody={replyBody}
                  setReplyBody={setReplyBody}
                  replyFiles={replyFiles}
                  addReplyFiles={addReplyFiles}
                  removeReplyFile={removeReplyFile}
                  onStartReply={onStartReply}
                  onSendReply={onSendReply}
                  replyBusy={replyBusy}
                  replyError={replyError}
                  setReplyError={setReplyError}
                  replySent={replySent}
                  archiveMail={requestArchive}
                  deleteMail={requestDelete}
                  isquickview={true}
                />

                {/* DETAILS CARD */}
                {/* <InboxDetails active={active} tags={tags} /> */}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Confirm dialog for archive/delete */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        loading={confirmBusy}
        title={
          confirmPayload?.action === "delete"
            ? "Удалить письмо?"
            : "Архивировать письмо?"
        }
        description={
          confirmPayload?.action === "delete"
            ? "Письмо будет перемещено в корзину. Это действие можно отменить, вернув письмо из корзины."
            : "Письмо будет перемещено в архив."
        }
        confirmText={
          confirmPayload?.action === "delete" ? "Удалить" : "В архив"
        }
        cancelText="Отмена"
        confirmVariant={
          confirmPayload?.action === "delete" ? "destructive" : "default"
        }
        onConfirm={onConfirmAction}
      />
    </div>
  );
}
