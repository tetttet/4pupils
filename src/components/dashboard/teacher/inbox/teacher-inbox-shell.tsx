"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import InboxHeader from "@/components/dashboard/admin/inbox/inbox-header";
import InboxMain from "@/components/dashboard/admin/inbox/inbox-main";
import InboxNoMessage from "@/components/dashboard/admin/inbox/inbox-no-message";
import InboxSidebar from "@/components/dashboard/admin/inbox/inbox-sidebar";
import { AppBreadcrumb } from "@/components/ui/app-breadcrumb";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { getUserFacingErrorMessage } from "@/lib/error-messages";
import { fmtDateTime } from "@/lib/func";
import { MailAPI } from "@/lib/mail/api";
import { fetchUserById } from "@/services/user";

import type { MailDetail, MailFolder, MailListItem } from "@/types/mail";
import type { User } from "@/types/user";

type TeacherInboxShellProps = {
  folder: MailFolder;
  breadcrumbLabel: string;
  mode?: "folder" | "favorites";
  isQuickView?: boolean;
};

const TEACHER_INBOX_ROOT = "/dashboard/teacher/inbox";

export default function TeacherInboxShell({
  folder,
  breadcrumbLabel,
  mode = "folder",
  isQuickView = false,
}: TeacherInboxShellProps) {
  const router = useRouter();

  const [mails, setMails] = React.useState<MailListItem[]>([]);
  const [query, setQuery] = React.useState("");
  const deferredQuery = React.useDeferredValue(query);
  const [activeId, setActiveId] = React.useState("");
  const [active, setActive] = React.useState<MailDetail | null>(null);

  const [collapsed] = React.useState(false);
  const [loadingList, setLoadingList] = React.useState(false);
  const [loadingActive, setLoadingActive] = React.useState(false);

  const [replyOpen, setReplyOpen] = React.useState(false);
  const [replySubject, setReplySubject] = React.useState("");
  const [replyBody, setReplyBody] = React.useState("");
  const [replyFiles, setReplyFiles] = React.useState<File[]>([]);
  const [replyBusy, setReplyBusy] = React.useState(false);
  const [replyError, setReplyError] = React.useState<string | null>(null);
  const [replySent, setReplySent] = React.useState(false);

  const [sender, setSender] = React.useState<User | null>(null);

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmBusy, setConfirmBusy] = React.useState(false);
  const [confirmPayload, setConfirmPayload] = React.useState<{
    action: "delete" | "archive";
    id: string;
  } | null>(null);

  const visibleMails = React.useMemo(() => {
    if (mode === "favorites") {
      return mails.filter((mail) => mail.starred);
    }

    return mails.filter((mail) => mail.folder === folder);
  }, [folder, mails, mode]);

  const filtered = React.useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    if (!normalizedQuery) return visibleMails;

    return visibleMails.filter((mail) => {
      const haystack =
        `${mail.sender_id} ${mail.subject} ${mail.preview}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [deferredQuery, visibleMails]);

  const unreadCount = React.useMemo(
    () =>
      visibleMails.reduce(
        (count, mail) => count + (mail.unread ? 1 : 0),
        0,
      ),
    [visibleMails],
  );

  const loadList = React.useCallback(async () => {
    setLoadingList(true);
    const toastId = toast.loading("Загружаю письма...");

    try {
      const data = await MailAPI.list({ folder, limit: 50 });
      setMails(data);

      if (activeId) {
        const nextActive = data.find((mail) => mail.mail_id === activeId);
        const stillVisible =
          !!nextActive && (mode !== "favorites" || nextActive.starred);

        if (!stillVisible && !replyOpen) {
          setActiveId("");
          setActive(null);
        }
      }

      toast.success("Список обновлён");
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error, "Не удалось загрузить список"));
    } finally {
      toast.dismiss(toastId);
      setLoadingList(false);
    }
  }, [activeId, folder, mode, replyOpen]);

  React.useEffect(() => {
    void loadList();
  }, [loadList]);

  function askConfirm(action: "delete" | "archive", id: string) {
    setConfirmPayload({ action, id });
    setConfirmOpen(true);
  }

  const openMail = async (id: string) => {
    setActiveId(id);
    setLoadingActive(true);

    setReplyOpen(false);
    setReplySent(false);
    setReplyError(null);
    setReplyFiles([]);
    setReplyBody("");
    setReplySubject("");

    const toastId = toast.loading("Открываю письмо...");

    try {
      const detail = await MailAPI.get(id);
      setActive(detail);

      if (detail.unread) {
        await MailAPI.markRead(id, false);

        const nowIso = new Date().toISOString();
        setActive((prev) =>
          prev ? { ...prev, unread: false, read_at: nowIso } : prev,
        );
        setMails((prev) =>
          prev.map((mail) =>
            mail.mail_id === id
              ? { ...mail, unread: false, read_at: nowIso }
              : mail,
          ),
        );
      }

      toast.success("Письмо открыто");
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error, "Не удалось открыть письмо"));
    } finally {
      toast.dismiss(toastId);
      setLoadingActive(false);
    }
  };

  const toggleStar = async (id: string) => {
    const currentMail = mails.find((mail) => mail.mail_id === id);
    const nextStarred = !(currentMail?.starred ?? active?.starred ?? false);

    setMails((prev) =>
      prev.map((mail) =>
        mail.mail_id === id ? { ...mail, starred: nextStarred } : mail,
      ),
    );
    setActive((prev) =>
      prev && prev.id === id ? { ...prev, starred: nextStarred } : prev,
    );

    await toast.promise(
      (async () => {
        try {
          await MailAPI.updateFlags(id, { starred: nextStarred });

          if (mode === "favorites" && !nextStarred && activeId === id) {
            setActiveId("");
            setActive(null);
            setReplyOpen(false);
          }
        } catch (error) {
          await loadList();

          if (activeId === id) {
            setActive(await MailAPI.get(id));
          }

          throw error;
        }
      })(),
      {
        loading: nextStarred
          ? "Добавляю в избранное..."
          : "Убираю из избранного...",
        success: nextStarred ? "В избранном" : "Убрано из избранного",
        error: (error) =>
          getUserFacingErrorMessage(error, "Не удалось обновить флаг"),
      },
    );
  };

  const archiveMail = async (id: string) => {
    await toast.promise(
      (async () => {
        await MailAPI.moveFolder(id, "archived");
        setMails((prev) => prev.filter((mail) => mail.mail_id !== id));

        if (activeId === id) {
          setActiveId("");
          setActive(null);
          setReplyOpen(false);
        }
      })(),
      {
        loading: "Архивирую...",
        success: "Письмо в архиве",
        error: (error) =>
          getUserFacingErrorMessage(error, "Не удалось архивировать"),
      },
    );
  };

  const deleteMail = async (id: string) => {
    await toast.promise(
      (async () => {
        await MailAPI.moveFolder(id, "trash");
        setMails((prev) => prev.filter((mail) => mail.mail_id !== id));

        if (activeId === id) {
          setActiveId("");
          setActive(null);
          setReplyOpen(false);
        }
      })(),
      {
        loading: "Удаляю...",
        success: "Письмо перемещено в корзину",
        error: (error) =>
          getUserFacingErrorMessage(error, "Не удалось удалить"),
      },
    );
  };

  const requestArchive = (id: string) => askConfirm("archive", id);
  const requestDelete = (id: string) => askConfirm("delete", id);

  const activeHeader = React.useMemo(() => {
    if (!active) return null;
    return fmtDateTime(active.created_at);
  }, [active]);

  function quoteOriginal(mail: MailDetail) {
    const dt = fmtDateTime(mail.created_at);
    const head =
      `\n\n---\nOn ${dt.dateLabel} ${dt.timeLabel}, ${mail.sender_id} wrote:\n`;
    return head + (mail.body ? mail.body : "");
  }

  function addReplyFiles(list: FileList | null) {
    if (!list || !list.length) return;
    setReplyFiles((prev) => [...prev, ...Array.from(list)]);
  }

  function removeReplyFile(index: number) {
    setReplyFiles((prev) => prev.filter((_, idx) => idx !== index));
  }

  async function onStartReply() {
    if (!active) return;

    setReplySent(false);
    setReplyError(null);
    setReplyOpen(true);

    const subject = active.subject?.trim() || "";
    const normalizedSubject = subject.toLowerCase().startsWith("re:")
      ? subject
      : `Re: ${subject || "message"}`;

    setReplySubject(normalizedSubject);
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
          const { mailId } = await MailAPI.createDraft({
            subject: replySubject || `Re: ${active.subject || ""}`,
            preview: body ? body.slice(0, 140) : "",
            body,
            to: [active.sender_id],
            cc: [],
            bcc: [],
            tags: [],
            type: "user",
          });

          if (replyFiles.length) {
            await MailAPI.uploadAttachments(mailId, replyFiles);
            setReplyFiles([]);
          }

          await MailAPI.send(mailId, { scheduledAt: null });

          setReplySent(true);
          setReplyBody("");
          setReplyOpen(false);

          await loadList();
        })(),
        {
          loading: replyFiles.length
            ? "Отправляю ответ и загружаю вложения..."
            : "Отправляю ответ...",
          success: "Ответ отправлен",
          error: (error) =>
            getUserFacingErrorMessage(error, "Не удалось отправить ответ"),
        },
      );
    } catch (error: unknown) {
      setReplyError(
        getUserFacingErrorMessage(error, "Не удалось отправить ответ"),
      );
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

  const canManageCurrent = !isQuickView;
  const canToggleStar = folder === "inbox" || mode === "favorites";

  return (
    <div className="teacher-workspace w-full bg-background">
      <AppBreadcrumb
        items={[
          { label: "Главная", href: "/dashboard" },
          { label: "Почта", href: TEACHER_INBOX_ROOT },
          { label: breadcrumbLabel },
        ]}
      />

      <motion.div
        className="grid h-full grid-cols-1 lg:grid-cols-none"
        animate={{
          gridTemplateColumns: collapsed ? "110px 1fr" : "380px 1fr",
        }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
      >
        <InboxSidebar
          collapsed={collapsed}
          unreadCount={unreadCount}
          query={query}
          setQuery={setQuery}
          filtered={filtered}
          activeId={activeId}
          openMail={openMail}
          onOpenArchive={() => router.push(`${TEACHER_INBOX_ROOT}/archive`)}
          showComposeAction={false}
        />

        <div className="flex min-w-0 flex-1 flex-col bg-[#f8fafd]">
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
            toggleStar={canToggleStar ? toggleStar : undefined}
            archiveMail={canManageCurrent ? requestArchive : undefined}
            deleteMail={canManageCurrent ? requestDelete : undefined}
            where="teacher"
            showComposeLink={false}
          />

          <div className="mb-4 flex-1 overflow-y-hidden rounded-3xl bg-white">
            {!active ? (
              <InboxNoMessage />
            ) : (
              <div className="space-y-4">
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
                  deleteMail={canManageCurrent ? requestDelete : undefined}
                  isquickview={isQuickView}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>

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
