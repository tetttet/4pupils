"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  Paperclip,
  Send,
  X,
  Save,
  Loader2,
  Tag,
  Clock,
  CheckCircle2,
  Info,
} from "lucide-react";

import { MailAPI } from "@/lib/mail/api";
import type { MailTag } from "@/types/mail";
import Tags from "@/components/ui/tags";
import InboxRecipients from "./inbox-recipients";

function uniq(arr: string[]) {
  return Array.from(new Set(arr));
}

function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number) {
  let t: NodeJS.Timeout | undefined;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(2)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}

const ALL_TAGS: MailTag[number][] = [
  "important",
  "work",
  "personal",
  "spam",
  "teacher",
  "student",
  "admin",
];

function tagLabel(t: MailTag[number]) {
  switch (t) {
    case "important":
      return "Важно";
    case "work":
      return "Работа";
    case "personal":
      return "Личное";
    case "spam":
      return "Спам";
    case "teacher":
      return "Teacher";
    case "student":
      return "Student";
    case "admin":
      return "Admin";
    default:
      return t;
  }
}

export default function InboxSend() {
  const [draftId, setDraftId] = React.useState<string | null>(null);

  const [toIds, setToIds] = React.useState<string[]>([]);
  const [ccIds, setCcIds] = React.useState<string[]>([]);
  const [bccIds, setBccIds] = React.useState<string[]>([]);

  const [showCc, setShowCc] = React.useState(false);
  const [showBcc, setShowBcc] = React.useState(false);

  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");

  const [selectedTags, setSelectedTags] = React.useState<MailTag>([]);

  const [toRaw, setToRaw] = React.useState("");
  const [ccRaw, setCcRaw] = React.useState("");
  const [bccRaw, setBccRaw] = React.useState("");

  const [files, setFiles] = React.useState<File[]>([]);
  const [uploaded, setUploaded] = React.useState<
    { id: string; name: string; url: string; size: number; mime: string }[]
  >([]);

  const [busy, setBusy] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [autosaveState, setAutosaveState] = React.useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const to = React.useMemo(() => uniq(toIds), [toIds]);
  const cc = React.useMemo(() => uniq(ccIds), [ccIds]);
  const bcc = React.useMemo(() => uniq(bccIds), [bccIds]);

  const canSend = React.useMemo(() => {
    return (
      to.length > 0 && (subject.trim().length > 0 || body.trim().length > 0)
    );
  }, [to.length, subject, body]);

  async function ensureDraft() {
    if (draftId) return draftId;

    const { mailId } = await MailAPI.createDraft({
      subject: subject || "",
      preview: body ? body.slice(0, 140) : "",
      body: body || "",
      to,
      cc,
      bcc,
      tags: selectedTags,
      type: "user",
    });

    setDraftId(mailId);
    setAutosaveState("saved");
    return mailId;
  }

  async function uploadPending(id: string) {
    if (!files.length) return;
    const res = await MailAPI.uploadAttachments(id, files);
    // allow backend to return either [] or {attachments:[]}
    const list = Array.isArray(res)
      ? res
      : ((
          res as {
            attachments?: {
              id: string;
              name: string;
              url: string;
              size: number;
              mime: string;
            }[];
          }
        )?.attachments ?? []);
    setUploaded((prev) => [...prev, ...list]);
    setFiles([]);
  }

  async function saveDraftNow() {
    setError(null);
    setSaving(true);
    setAutosaveState("saving");

    try {
      const id = await ensureDraft();

      await MailAPI.updateDraft(id, {
        subject,
        preview: body ? body.slice(0, 140) : "",
        body,
        to,
        cc,
        bcc,
        tags: selectedTags,
      });

      await uploadPending(id);

      setAutosaveState("saved");
    } catch (e: unknown) {
      setAutosaveState("error");
      setError(
        e instanceof Error ? e.message : "Не удалось сохранить черновик",
      );
    } finally {
      setSaving(false);
    }
  }

  // Autosave (без лагов): только updateDraft, без upload, debounce 900ms
  const autosave = React.useMemo(
    () =>
      debounce(async () => {
        if (!draftId) return;

        setAutosaveState("saving");
        try {
          await MailAPI.updateDraft(draftId, {
            subject,
            preview: body ? body.slice(0, 140) : "",
            body,
            to,
            cc,
            bcc,
            tags: selectedTags,
          });
          setAutosaveState("saved");
        } catch {
          setAutosaveState("error");
        }
      }, 900),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      draftId,
      subject,
      body,
      toIds.join("|"),
      ccIds.join("|"),
      bccIds.join("|"),
      selectedTags.join("|"),
    ],
  );

  React.useEffect(() => {
    autosave();
  }, [autosave]);

  async function onSend() {
    setError(null);
    setBusy(true);

    try {
      const id = await ensureDraft();

      // перед отправкой — точный save
      await MailAPI.updateDraft(id, {
        subject,
        preview: body ? body.slice(0, 140) : "",
        body,
        to,
        cc,
        bcc,
        tags: selectedTags,
      });

      await uploadPending(id);

      await MailAPI.send(id, { scheduledAt: null });
      setSent(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Не удалось отправить письмо");
    } finally {
      setBusy(false);
    }
  }

  function addFiles(list: FileList | null) {
    if (!list || !list.length) return;
    setFiles((prev) => [...prev, ...Array.from(list)]);
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  function toggleTag(t: MailTag[number]) {
    setSelectedTags((prev) => {
      const set = new Set(prev);
      if (set.has(t)) set.delete(t);
      else set.add(t);
      return Array.from(set) as MailTag;
    });
  }

  const meta = React.useMemo(() => {
    const recipients = to.length + cc.length + bcc.length;
    const attachCount = files.length + uploaded.length;
    const preview = (body || "").trim().slice(0, 140);
    return { recipients, attachCount, preview };
  }, [to.length, cc.length, bcc.length, files.length, uploaded.length, body]);

  if (sent) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-md border bg-card p-6"
          >
            <div className="flex items-center gap-2 text-lg font-semibold">
              <CheckCircle2 className="h-5 w-5" />
              Письмо отправлено
            </div>

            <div className="mt-2 text-sm text-muted-foreground">
              Draft ID: <span className="font-mono">{draftId}</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  setDraftId(null);

                  setToIds([]);
                  setCcIds([]);
                  setBccIds([]);

                  setToRaw("");
                  setCcRaw("");
                  setBccRaw("");

                  setShowCc(false);
                  setShowBcc(false);
                  setSubject("");
                  setBody("");
                  setSelectedTags([]);
                  setFiles([]);
                  setUploaded([]);
                  setSent(false);
                  setError(null);
                  setAutosaveState("idle");
                }}
              >
                Написать ещё
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const autosaveBadge = (() => {
    if (!draftId)
      return <Badge variant="outline">черновик ещё не создан</Badge>;
    if (autosaveState === "saving")
      return <Badge variant="secondary">сохраняю…</Badge>;
    if (autosaveState === "saved")
      return <Badge variant="secondary">сохранено</Badge>;
    if (autosaveState === "error")
      return <Badge variant="destructive">ошибка сохранения</Badge>;
    return <Badge variant="secondary">готово</Badge>;
  })();

  return (
    <div className="px-4 pt-3">
      <div className="space-y-4">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[16px] font-semibold">Новое письмо</div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5" />
                Получателей:{" "}
                <span className="text-foreground/80">{meta.recipients}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Paperclip className="h-3.5 w-3.5" />
                Вложений:{" "}
                <span className="text-foreground/80">{meta.attachCount}</span>
              </span>
              {draftId ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Draft:{" "}
                  <span className="font-mono text-foreground/80">
                    {draftId.slice(0, 8)}…
                  </span>
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={saveDraftNow}
              disabled={saving || busy}
              className="gap-2"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Сохранить
            </Button>

            <Button
              onClick={onSend}
              disabled={!canSend || busy}
              className="gap-2"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Отправить
            </Button>
          </div>
        </div>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-md border bg-card"
        >
          <div className="p-5 space-y-4">
            {/* Recipients */}
            <InboxRecipients
              toRaw={toRaw}
              setToRaw={setToRaw}
              ccRaw={ccRaw}
              setCcRaw={setCcRaw}
              bccRaw={bccRaw}
              setBccRaw={setBccRaw}
              toIds={toIds}
              setToIds={setToIds}
              ccIds={ccIds}
              setCcIds={setCcIds}
              bccIds={bccIds}
              setBccIds={setBccIds}
              showCc={showCc}
              showBcc={showBcc}
              setShowCc={setShowCc}
              setShowBcc={setShowBcc}
            />

            <Separator />

            {/* Subject */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-10 text-sm text-muted-foreground">Тема</div>
              <div className="min-w-65 flex-1">
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Тема письма"
                  className="h-10"
                />
              </div>
              {autosaveBadge}
            </div>

            {/* Tags */}
            <div className="rounded-md border bg-muted/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Tag className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Метки</div>
                    <div className="text-xs text-muted-foreground">
                      Выберите метки для письма (сохраняются в draft)
                    </div>
                  </div>
                </div>
                <Badge variant="secondary">{selectedTags.length}</Badge>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {ALL_TAGS.map((t) => {
                  const active = selectedTags.includes(t);
                  return (
                    <Button
                      key={t}
                      type="button"
                      variant={active ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleTag(t)}
                      className={cn("rounded-md")}
                    >
                      {tagLabel(t)}
                    </Button>
                  );
                })}
              </div>

              <div className="mt-2">
                {/* reuse your Tags UI */}
                <Tags m={{ tags: selectedTags }} />
              </div>
            </div>

            <Separator />

            {/* Body */}
            <div className="space-y-2">
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Напишите письмо…"
                className="min-w-65 resize-y"
              />
              <div className="text-xs text-muted-foreground">
                Автосохранение: после создания черновика (кнопка “Сохранить” или
                первая отправка). Вложения автосохранением не грузятся — только
                при “Сохранить” или “Отправить”.
              </div>
              {meta.preview ? (
                <div className="text-xs text-muted-foreground">
                  Preview:{" "}
                  <span className="text-foreground/80">{meta.preview}</span>
                </div>
              ) : null}
            </div>

            {/* Attachments */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <Paperclip className="h-4 w-4" />
                Прикрепить файлы
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => addFiles(e.target.files)}
                />
              </label>
              {draftId ? (
                <Badge variant="secondary" className="font-mono">
                  draft: {draftId.slice(0, 8)}…
                </Badge>
              ) : null}
            </div>

            <AnimatePresence>
              {files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="rounded-md border p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">
                      Файлы к загрузке
                    </div>
                    <Badge variant="secondary">{files.length}</Badge>
                  </div>

                  <div className="mt-3 space-y-2">
                    {files.map((f, idx) => (
                      <div
                        key={`${f.name}-${idx}`}
                        className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">
                            {f.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatBytes(f.size)} • {f.type || "file"}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(idx)}
                          aria-label="Remove file"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={saveDraftNow}
                      disabled={saving || busy}
                      className="gap-2"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      Загрузить сейчас
                    </Button>
                    <div className="text-xs text-muted-foreground self-center">
                      Загрузится в Cloudinary и сохранится в базе.
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {uploaded.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="rounded-md border p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Загружено</div>
                    <Badge variant="secondary">{uploaded.length}</Badge>
                  </div>

                  <div className="mt-3 space-y-2">
                    {uploaded.map((a) => (
                      <div
                        key={a.id}
                        className="flex flex-col gap-2 rounded-md border px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">
                            {a.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatBytes(a.size)} • {a.mime}
                          </div>
                        </div>

                        <a
                          href={a.url}
                          target="_blank"
                          rel="noreferrer"
                          className={cn(
                            "text-xs text-muted-foreground hover:text-foreground underline",
                          )}
                        >
                          открыть
                        </a>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
