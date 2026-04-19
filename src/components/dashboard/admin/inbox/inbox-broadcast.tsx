"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Users,
  Send,
  Loader2,
  Info,
  Shield,
  GraduationCap,
  UserCog,
  Tag,
  CheckCircle2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { http } from "@/lib/http";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import type { User } from "@/types/user";
import type { MailTag } from "@/types/mail";
import Tags from "@/components/ui/tags";
import { MailAPI } from "@/lib/mail/api";

/**
 * InboxBroadcast
 * - Выбираешь аудиторию: всем / только admin / только teacher / только student
 * - Пишешь subject + body
 * - Опционально метки
 * - Нажимаешь "Отправить" → собираем ids пользователей и шлём письмо всем (через MailAPI, один draft на много получателей)
 *
 * ПРИМЕЧАНИЕ:
 * - Сейчас для простоты грузим /api/users 1 раз и фильтруем на клиенте.
 * - Если пользователей много: сделай серверный эндпоинт /api/users?role=teacher (или /api/users/search)
 */

type Recipient = Pick<User, "id" | "first_name" | "last_name" | "email" | "role">;

type Audience = "all" | "admin" | "teacher" | "student";

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

function audienceLabel(a: Audience) {
  switch (a) {
    case "all":
      return "Всем";
    case "admin":
      return "Только админам";
    case "teacher":
      return "Только учителям";
    case "student":
      return "Только ученикам";
  }
}

function audienceIcon(a: Audience) {
  switch (a) {
    case "all":
      return Users;
    case "admin":
      return Shield;
    case "teacher":
      return UserCog;
    case "student":
      return GraduationCap;
  }
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr));
}

function roleMatches(u: Recipient, a: Audience) {
  if (a === "all") return true;
  return u.role === a;
}

async function fetchAllUsers(): Promise<Recipient[]> {
  const r = await http(`/api/users`, { method: "GET" });
  if (!r.ok) {
    const data = await r.json().catch(() => ({}));
    throw new Error(data?.message || "Failed to load users");
  }
  const data = await r.json();
  return (data?.users ?? []) as Recipient[];
}

export default function InboxBroadcast() {
  const [audience, setAudience] = React.useState<Audience>("all");
  const [users, setUsers] = React.useState<Recipient[]>([]);
  const [loadingUsers, setLoadingUsers] = React.useState(false);

  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");
  const [selectedTags, setSelectedTags] = React.useState<MailTag>([]);

  const [busy, setBusy] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [sentDraftId, setSentDraftId] = React.useState<string | null>(null);

  const targetUsers = React.useMemo(
    () => users.filter((u) => roleMatches(u, audience)),
    [users, audience],
  );

  const targetIds = React.useMemo(
    () => uniq(targetUsers.map((u) => u.id)),
    [targetUsers],
  );

  const canSend = React.useMemo(() => {
    return targetIds.length > 0 && (subject.trim().length > 0 || body.trim().length > 0);
  }, [targetIds.length, subject, body]);

  const loadUsers = React.useCallback(async () => {
    setLoadingUsers(true);
    try {
      const list = await fetchAllUsers();
      setUsers(list);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load users";
      toast.error(msg);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function toggleTag(t: MailTag[number]) {
    setSelectedTags((prev) => {
      const set = new Set(prev);
      if (set.has(t)) set.delete(t);
      else set.add(t);
      return Array.from(set) as MailTag;
    });
  }

  async function onSend() {
    setBusy(true);
    try {
      // создаём один draft с нужными получателями
      const { mailId } = await MailAPI.createDraft({
        subject: subject || "",
        preview: body ? body.slice(0, 140) : "",
        body: body || "",
        to: targetIds, // ✅ ids пользователей
        cc: [],
        bcc: [],
        tags: selectedTags,
        type: "user",
      });

      // На всякий случай — финальный update (если бэк ожидает)
      await MailAPI.updateDraft(mailId, {
        subject,
        preview: body ? body.slice(0, 140) : "",
        body,
        to: targetIds,
        cc: [],
        bcc: [],
        tags: selectedTags,
      });

      await MailAPI.send(mailId, { scheduledAt: null });

      setSentDraftId(mailId);
      setSent(true);
      toast.success(`Отправлено: ${audienceLabel(audience)} (${targetIds.length})`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Не удалось отправить рассылку";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    const Icon = CheckCircle2;
    return (
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-md border bg-card p-6"
        >
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Icon className="h-5 w-5" />
            Рассылка отправлена
          </div>

          <div className="mt-2 text-sm text-muted-foreground">
            Аудитория: <span className="text-foreground">{audienceLabel(audience)}</span>
            {" • "}
            Получателей: <span className="text-foreground">{targetIds.length}</span>
          </div>

          {sentDraftId ? (
            <div className="mt-2 text-sm text-muted-foreground">
              Draft ID: <span className="font-mono text-foreground">{sentDraftId}</span>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              onClick={() => {
                setSent(false);
                setSentDraftId(null);
                setAudience("all");
                setSubject("");
                setBody("");
                setSelectedTags([]);
              }}
            >
              Отправить ещё
            </Button>

            <Button variant="outline" onClick={loadUsers} disabled={loadingUsers}>
              {loadingUsers ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Обновить список пользователей
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const Icon = audienceIcon(audience);

  return (
    <div className="px-4 pt-3">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[16px] font-semibold">Рассылка</div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5" />
                Аудитория:{" "}
                <span className="text-foreground/80">{audienceLabel(audience)}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Получателей:{" "}
                <span className="text-foreground/80">
                  {loadingUsers ? "…" : targetIds.length}
                </span>
              </span>
              {loadingUsers ? (
                <Badge variant="secondary">загружаю пользователей…</Badge>
              ) : (
                <Badge variant="secondary">{users.length} всего</Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={onSend}
              disabled={!canSend || busy || loadingUsers}
              className="gap-2"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Отправить
            </Button>
          </div>
        </div>

        <Card className="rounded-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              Аудитория
            </CardTitle>
            <CardDescription>
              Выбери кому отправить — компонент сам соберёт всех пользователей этой роли.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <RadioGroup
              value={audience}
              onValueChange={(v) => setAudience(v as Audience)}
              className="grid gap-2 sm:grid-cols-2"
            >
              <div className="flex items-center space-x-2 rounded-md border p-3">
                <RadioGroupItem value="all" id="aud-all" />
                <Label htmlFor="aud-all" className="flex-1 cursor-pointer">
                  <div className="font-medium">Всем</div>
                  <div className="text-xs text-muted-foreground">admin + teacher + student</div>
                </Label>
                <Badge variant="secondary">
                  {loadingUsers ? "…" : users.length}
                </Badge>
              </div>

              <div className="flex items-center space-x-2 rounded-md border p-3">
                <RadioGroupItem value="admin" id="aud-admin" />
                <Label htmlFor="aud-admin" className="flex-1 cursor-pointer">
                  <div className="font-medium">Админам</div>
                  <div className="text-xs text-muted-foreground">role = admin</div>
                </Label>
                <Badge variant="secondary">
                  {loadingUsers ? "…" : users.filter((u) => u.role === "admin").length}
                </Badge>
              </div>

              <div className="flex items-center space-x-2 rounded-md border p-3">
                <RadioGroupItem value="teacher" id="aud-teacher" />
                <Label htmlFor="aud-teacher" className="flex-1 cursor-pointer">
                  <div className="font-medium">Учителям</div>
                  <div className="text-xs text-muted-foreground">role = teacher</div>
                </Label>
                <Badge variant="secondary">
                  {loadingUsers ? "…" : users.filter((u) => u.role === "teacher").length}
                </Badge>
              </div>

              <div className="flex items-center space-x-2 rounded-md border p-3">
                <RadioGroupItem value="student" id="aud-student" />
                <Label htmlFor="aud-student" className="flex-1 cursor-pointer">
                  <div className="font-medium">Ученикам</div>
                  <div className="text-xs text-muted-foreground">role = student</div>
                </Label>
                <Badge variant="secondary">
                  {loadingUsers ? "…" : users.filter((u) => u.role === "student").length}
                </Badge>
              </div>
            </RadioGroup>

            <Separator />

            <div className="space-y-2">
              <div className="text-sm font-semibold">Тема</div>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Тема рассылки"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold">Сообщение</div>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Текст рассылки…"
                className="min-h-45 resize-y"
              />
            </div>

            <div className="rounded-md border bg-muted/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Tag className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Метки</div>
                    <div className="text-xs text-muted-foreground">
                      Опционально: сохраняются в draft и помогут фильтровать письма.
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
                <Tags m={{ tags: selectedTags }} />
              </div>
            </div>

            <AnimatePresence>
              {!loadingUsers && targetIds.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
                >
                  В этой аудитории нет пользователей — отправлять некому.
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <div className="text-xs text-muted-foreground">
                Будет отправлено: <span className="text-foreground">{audienceLabel(audience)}</span>{" "}
                • <span className="text-foreground">{targetIds.length}</span> получателей
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={loadUsers} disabled={loadingUsers}>
                  {loadingUsers ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Обновить пользователей
                </Button>

                <Button
                  onClick={onSend}
                  disabled={!canSend || busy || loadingUsers}
                  className="gap-2"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Отправить
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Если пользователей много — лучше сделать серверный поиск/выборку по роли и не грузить всех на клиент.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
