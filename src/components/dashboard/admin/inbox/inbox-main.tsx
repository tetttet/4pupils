import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import FancyAvatar from "@/components/ui/fancy-avatar";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Tags from "@/components/ui/tags";
import { Textarea } from "@/components/ui/textarea";
import {
  formatBytes,
  formatPlainText,
  initials,
  initialsFromId,
} from "@/lib/func";
import {
  Archive,
  Download,
  ExternalLink,
  Loader2,
  Paperclip,
  Reply,
  Send,
  Trash2,
  X,
} from "lucide-react";
import React from "react";

const InboxMain = ({
  active,
  name,
  email,
  activeHeader,
  archiveMail,
  deleteMail,
  replyOpen,
  setReplyOpen,
  replySubject,
  setReplySubject,
  replyBody,
  setReplyBody,
  replyFiles,
  addReplyFiles,
  removeReplyFile,
  replyBusy,
  replyError,
  setReplyError,
  onSendReply,
  onStartReply,
  replySent,
  isquickview,
}: {
  active: {
    id: string;
    sender_id: string;
    subject: string | null;
    preview: string | null;
    body: string | null;
    unread: boolean;
    starred: boolean;
    important: boolean;
    attachments: {
      id: string;
      name: string;
      size: number;
      mime: string;
      url: string;
    }[];
    tags: string[]; // Add this line to specify the tags property
  };
  name: string;
  email: string | null;
  activeHeader: { dateLabel: string; timeLabel: string } | null;
  archiveMail: (id: string) => void;
  deleteMail?: (id: string) => void;
  // Reply state and handlers
  replyOpen: boolean;
  setReplyOpen: (v: boolean) => void;
  replySubject: string;
  setReplySubject: (v: string) => void;
  replyBody: string;
  setReplyBody: (v: string) => void;
  replyFiles: File[];
  addReplyFiles: (files: FileList | null) => void;
  removeReplyFile: (index: number) => void;
  replyBusy: boolean;
  replyError: string | null;
  setReplyError: (v: string | null) => void;
  onSendReply: () => void;
  onStartReply: () => void;
  replySent: boolean;
  isquickview?: boolean;
}) => {
  return (
    <Card className="border-none">
      <CardHeader className="space-y-3">
        <div className="flex items-start gap-3">
          <FancyAvatar name={name} />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="truncate text-base font-semibold">{name}</div>

              {active.unread && (
                <Badge className="rounded-xl" variant="default">
                  новое
                </Badge>
              )}

              <div className="ml-auto text-xs text-muted-foreground">
                {activeHeader?.dateLabel} • {activeHeader?.timeLabel}
              </div>
            </div>
            <div className="truncate text-sm text-muted-foreground">
              {email || initialsFromId(active.sender_id)}
            </div>

            <Tags m={{ tags: active.tags }} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-lg font-semibold leading-tight">
            {active.subject || "—"}
          </div>
          <div className="text-sm text-muted-foreground">
            {active.preview || "—"}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* BODY */}
        <div className="rounded-md border bg-muted/30 p-4">
          <pre className="whitespace-pre-wrap text-sm leading-6 text-foreground/90">
            {formatPlainText(active.body || "")}
          </pre>
        </div>

        {/* ATTACHMENTS (original mail) */}
        {Array.isArray(active.attachments) && active.attachments.length > 0 && (
          <div className="rounded-2xl border p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Вложения</div>
              <Badge variant="secondary">{active.attachments.length}</Badge>
            </div>

            <div className="mt-3 space-y-2">
              {active.attachments.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{a.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatBytes(a.size)} • {a.mime}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs hover:bg-muted"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Открыть
                    </a>
                    <a
                      href={a.url}
                      download
                      className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs hover:bg-muted"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Скачать
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QUICK ACTIONS */}
        {!isquickview && (
          <div className="flex flex-wrap gap-2">
            <Button onClick={onStartReply} className="gap-2">
              <Reply className="h-4 w-4" />
              Ответить
            </Button>

            <Button
              variant="outline"
              onClick={() => archiveMail(active.id)}
              className="gap-2"
            >
              <Archive className="h-4 w-4" />
              Архивировать
            </Button>

            {deleteMail && (
              <Button
                variant="outline"
                onClick={() => deleteMail(active.id)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Удалить
              </Button>
            )}
          </div>
        )}

        {/* INLINE REPLY */}
        {replySent && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm">
            Ответ отправлен
          </div>
        )}

        {replyOpen && (
          <div className="rounded-2xl border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">
                Ответить:{" "}
                <span className="font-mono text-xs">{active.sender_id}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setReplyOpen(false);
                  setReplyError(null);
                }}
                aria-label="Close reply"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-2">
              <div className="text-xs text-muted-foreground">Тема</div>
              <Input
                value={replySubject}
                onChange={(e) => setReplySubject(e.target.value)}
                placeholder="Re: ..."
                className="h-10"
              />
            </div>

            <div className="grid gap-2">
              <div className="text-xs text-muted-foreground">Сообщение</div>
              <Textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Напишите ответ…"
                className="min-h-35 resize-y"
              />
            </div>

            <Separator />

            {/* Reply attachments (upload on send) */}
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <Paperclip className="h-4 w-4" />
                Прикрепить файлы
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => addReplyFiles(e.target.files)}
                />
              </label>

              {replyFiles.length > 0 && (
                <Badge variant="secondary">
                  выбрано файлов: {replyFiles.length}
                </Badge>
              )}
            </div>

            {replyFiles.length > 0 && (
              <div className="space-y-2">
                {replyFiles.map((f, idx) => (
                  <div
                    key={`${f.name}-${idx}`}
                    className="flex items-center justify-between gap-2 rounded-xl border px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm">{f.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatBytes(f.size)} • {f.type || "file"}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeReplyFile(idx)}
                      aria-label="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {replyError && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                {replyError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setReplyOpen(false);
                  setReplyError(null);
                }}
                disabled={replyBusy}
              >
                Отмена
              </Button>

              <Button
                onClick={onSendReply}
                disabled={
                  replyBusy || (!replyBody.trim() && replyFiles.length === 0)
                }
                className="gap-2"
              >
                {replyBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Отправить
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InboxMain;
