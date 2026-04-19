"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";

import { MailAPI } from "@/lib/mail/api";
import type { MailDetail, MailFolder, MailListItem } from "@/types/mail";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
  Search,
  RefreshCcw,
  Send,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  Paperclip,
  ExternalLink,
  Download,
  Clock,
} from "lucide-react";

import Tags from "@/components/ui/tags";
import { normalizeTags } from "@/lib/mail/normalize-tags";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DateShow from "@/components/ui/date-show";

function initialsFromId(id?: string) {
  if (!id) return "—";
  return id.slice(0, 2).toUpperCase();
}

function firstLine(s?: string) {
  const x = (s || "").trim();
  if (!x) return "—";
  const line = x.split("\n")[0];
  return line.length > 120 ? line.slice(0, 120) + "…" : line;
}

function formatBytes(n?: number) {
  const bytes = typeof n === "number" ? n : 0;
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(2)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}

function formatPlainText(s: string) {
  // минимально: чтобы не ломать твой UI — можно заменить на твою formatPlainText из "@/lib/func"
  return s;
}

export default function InboxMyMessage() {
  const folder: MailFolder = "sent";

  const [items, setItems] = React.useState<MailListItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [q, setQ] = React.useState("");
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

  // Modal state
  const [open, setOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [detail, setDetail] = React.useState<MailDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = React.useState(false);
  const [detailError, setDetailError] = React.useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await MailAPI.list({ folder, limit: 80 });
      setItems(data);
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : "Не удалось загрузить отправленные";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, []);

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((m) => {
      return (
        (m.subject || "").toLowerCase().includes(s) ||
        (m.preview || "").toLowerCase().includes(s) ||
        (m.sender_id || "").toLowerCase().includes(s)
      );
    });
  }, [items, q]);

  async function openPopup(id: string) {
    setOpen(true);
    setSelectedId(id);
    setDetail(null);
    setDetailError(null);
    setLoadingDetail(true);

    try {
      const d = await MailAPI.get(id);
      setDetail(d);
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : "Не удалось загрузить письмо";
      setDetailError(msg);
    } finally {
      setLoadingDetail(false);
    }
  }

  function closePopup() {
    setOpen(false);
    setSelectedId(null);
    setDetail(null);
    setDetailError(null);
    setLoadingDetail(false);
  }

  const modalTags = normalizeTags(detail?.tags);

  return (
    <div className="px-4 pt-3">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="min-w-0">
                <div className="truncate text-[16px] font-semibold">
                  Отправленные
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <div className="relative">
                    <Send className="h-3 w-3 -mr-px" />
                  </div>
                  <span>
                    Писем:{" "}
                    <span className="text-foreground/80">{items.length}</span>
                  </span>
                  {loading ? (
                    <span className="inline-flex items-center gap-1">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      обновляю…
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Поиск по теме/превью…"
                className="w-70 rounded-md"
              />
            </div>

            <Button
              variant="outline"
              className="rounded-md"
              onClick={load}
              disabled={loading}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              {loading ? "Обновляю…" : "Обновить"}
            </Button>
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unique view: cards with “spark” accent */}
        <Card className="rounded-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Мои отправленные — лента
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-0">
            <ScrollArea className="h-[calc(100vh-400px)]">
              {loading ? (
                <div className="grid place-items-center py-16 text-sm text-muted-foreground">
                  <div className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Загружаю…
                  </div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="grid place-items-center py-16 text-sm text-muted-foreground">
                  Ничего не найдено
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((m) => {
                    const isOpen = !!expanded[m.mail_id];
                    return (
                      <motion.div
                        key={m.mail_id}
                        layout
                        className={cn(
                          "group relative overflow-hidden rounded-md border bg-card p-4",
                        )}
                      >
                        {/* colorful accent */}

                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="truncate text-sm font-semibold">
                                {m.subject || "Без темы"}
                              </div>
                              <Badge variant="secondary" className="rounded-xl">
                                <DateShow created_at={m.created_at} />
                              </Badge>
                            </div>

                            <div className="mt-1 text-sm text-muted-foreground">
                              {firstLine(m.preview)}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-md"
                              onClick={() =>
                                setExpanded((prev) => ({
                                  ...prev,
                                  [m.mail_id]: !prev[m.mail_id],
                                }))
                              }
                              aria-label="Toggle"
                            >
                              {isOpen ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>

                            <Button
                              className="rounded-md"
                              onClick={() => openPopup(m.mail_id)}
                            >
                              Открыть
                            </Button>
                          </div>
                        </div>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <Separator className="my-3" />
                              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5" />
                                  <DateShow created_at={m.created_at} />
                                </span>
                                <span className="font-mono border-l pl-2">
                                  ID почты: {m.mail_id}
                                </span>
                                <span className="font-mono border-l pl-2">
                                  Отправитель: {m.sender_id}
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* POPUP */}
      <Dialog
        open={open}
        onOpenChange={(v) => (v ? setOpen(true) : closePopup())}
      >
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
          {/* header strip */}
          <div className="relative border-b">
            <div className="flex items-start justify-between gap-3 p-5">
              <DialogHeader className="space-y-1">
                <DialogTitle className="pr-8">
                  {loadingDetail
                    ? "Открываю письмо…"
                    : detail?.subject || "Без темы"}
                </DialogTitle>
                <div className="text-xs text-muted-foreground">
                  {selectedId ? (
                    <span className="font-mono">{selectedId}</span>
                  ) : null}
                </div>
              </DialogHeader>
            </div>
          </div>

          {/* body */}
          <div className="p-5">
            {detailError ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                {detailError}
              </div>
            ) : loadingDetail ? (
              <div className="grid place-items-center py-14 text-sm text-muted-foreground">
                <div className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Загружаю детали…
                </div>
              </div>
            ) : !detail ? (
              <div className="grid place-items-center py-14 text-sm text-muted-foreground">
                Нет данных
              </div>
            ) : (
              <div className="space-y-4">
                {/* Meta row */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-11 w-11 rounded-full">
                      <AvatarFallback className="rounded-full">
                        {initialsFromId(detail.sender_id)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <div className="text-sm font-semibold">
                        Отправитель:{" "}
                        <span className="font-mono text-foreground/80">
                          {detail.sender_id}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Дата:{" "}
                        {detail.created_at ? (
                          <DateShow created_at={detail.created_at} />
                        ) : (
                          "—"
                        )}
                      </div>

                      <div className="mt-2">
                        <Tags m={detail} />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {detail.starred ? (
                      <Badge className="rounded-md" variant="secondary">
                        В избранном
                      </Badge>
                    ) : null}
                    {detail.important ? (
                      <Badge className="rounded-md" variant="secondary">
                        Важное
                      </Badge>
                    ) : null}
                    {modalTags.length ? (
                      <Badge className="rounded-md" variant="outline">
                        Меток: {modalTags.length}
                      </Badge>
                    ) : (
                      <Badge className="rounded-md" variant="outline">
                        Без меток
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Body */}
                <div className="rounded-md border bg-muted/30 p-4">
                  <pre className="whitespace-pre-wrap text-sm leading-6 text-foreground/90">
                    {formatPlainText(detail.body || "")}
                  </pre>
                </div>

                {/* Attachments */}
                {Array.isArray(detail.attachments) &&
                  detail.attachments.length > 0 && (
                    <div className="rounded-md border p-4">
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 text-sm font-semibold">
                          <Paperclip className="h-4 w-4" />
                          Вложения
                        </div>
                        <Badge variant="secondary" className="rounded-md">
                          {detail.attachments.length}
                        </Badge>
                      </div>

                      <div className="mt-3 space-y-2">
                        {detail.attachments.map((a) => (
                          <div
                            key={a.id}
                            className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium">
                                {a.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatBytes(a.size)} • {a.mime}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <a
                                href={a.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs hover:bg-muted"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Открыть
                              </a>
                              <a
                                href={a.url}
                                download
                                className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs hover:bg-muted"
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

                {/* Footer mini-details */}
                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">Статус</div>
                    <div className="mt-1 text-sm font-medium">
                      {detail.unread ? "Непрочитано" : "Прочитано"}
                    </div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">
                      ID Почты
                    </div>
                    <div className="mt-1 font-mono text-xs text-foreground/80">
                      {detail.id}
                    </div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">
                      Вложений
                    </div>
                    <div className="mt-1 text-sm font-medium">
                      {Array.isArray(detail.attachments)
                        ? detail.attachments.length
                        : 0}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
