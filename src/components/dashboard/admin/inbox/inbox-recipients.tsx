"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronsUpDown, Loader2, Mail, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { getUserFacingErrorMessage } from "@/lib/error-messages";
import { http } from "@/lib/http";
import type { User } from "@/types/user";

/**
 * ✅ UX как Gmail:
 * - Вводишь текст → показываем подсказки пользователей
 * - Выбираешь → в UI показываем "First Last <email>"
 * - В payload передаём id (uuid) — формируем отдельный recipientsIds
 *
 * ВАЖНО:
 * - Компонент управляемый снаружи: recipientsIds + setters
 * - Можно легко заменить fetch на server-side search: /api/users?q=...&role=...
 */

type Recipient = Pick<
  User,
  "id" | "first_name" | "last_name" | "email" | "role"
>;

function initials(u: {
  first_name?: string | null;
  last_name?: string | null;
}) {
  const a = (u.first_name?.trim()?.[0] ?? "").toUpperCase();
  const b = (u.last_name?.trim()?.[0] ?? "").toUpperCase();
  const res = `${a}${b}`.trim();
  return res || "U";
}

function displayName(u: Recipient) {
  const fn = (u.first_name ?? "").trim();
  const ln = (u.last_name ?? "").trim();
  const full = `${fn} ${ln}`.trim();
  return full || (u.email ?? "").split("@")[0] || "User";
}

function formatChip(u: Recipient) {
  return `${displayName(u)} <${u.email}>`;
}

function useDebouncedValue<T>(value: T, delay = 250) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/** Заглушка: грузим всех 1 раз и фильтруем на клиенте.
 * Если база большая — лучше сделать эндпоинт поиска:
 * GET /api/users?q=ali&role=student&limit=20
 */
async function fetchAllUsers(): Promise<Recipient[]> {
  const r = await http(`/api/users`, { method: "GET" });
  if (!r.ok) {
    const data = await r.json().catch(() => ({}));
    throw new Error(
      getUserFacingErrorMessage(data, "Не удалось загрузить получателей", {
        status: r.status,
      }),
    );
  }
  const data = await r.json();
  return (data?.users ?? []) as Recipient[];
}

type RoleFilter = "all" | "students" | "teachers" | "admin";

function roleMatches(u: Recipient, filter: RoleFilter) {
  if (filter === "all") return true;
  if (filter === "students") return u.role === "student";
  if (filter === "teachers") return u.role === "teacher";
  if (filter === "admin") return u.role === "admin";
  return true;
}

type RecipientPickerProps = {
  label: "To" | "Cc" | "Bcc";
  valueIds: string[];
  onChangeIds: (ids: string[]) => void;

  users: Recipient[];
  loadingUsers?: boolean;

  roleFilter?: RoleFilter;
};

function RecipientPicker({
  label,
  valueIds,
  onChangeIds,
  users,
  loadingUsers,
  roleFilter = "all",
}: RecipientPickerProps) {
  const selected = React.useMemo(
    () =>
      valueIds
        .map((id) => users.find((u) => u.id === id))
        .filter(Boolean) as Recipient[],
    [valueIds, users],
  );

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const debouncedQuery = useDebouncedValue(query, 200);

  const suggestions = React.useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    const pool = users.filter((u) => roleMatches(u, roleFilter));

    // если пустой запрос — показываем топ (первые 10) невыбранные
    const base = q
      ? pool.filter((u) => {
          const full =
            `${u.first_name ?? ""} ${u.last_name ?? ""}`.toLowerCase();
          const email = (u.email ?? "").toLowerCase();
          return full.includes(q) || email.includes(q);
        })
      : pool;

    const notPicked = base.filter((u) => !valueIds.includes(u.id));
    return notPicked.slice(0, 12);
  }, [debouncedQuery, users, valueIds, roleFilter]);

  const add = React.useCallback(
    (u: Recipient) => {
      if (valueIds.includes(u.id)) return;
      onChangeIds([...valueIds, u.id]);
      setQuery("");
      setOpen(false);
    },
    [onChangeIds, valueIds],
  );

  const remove = React.useCallback(
    (id: string) => {
      onChangeIds(valueIds.filter((x) => x !== id));
    },
    [onChangeIds, valueIds],
  );

  return (
    <div className="flex flex-wrap items-start gap-2">
      <div className="w-10 pt-2 text-sm text-muted-foreground">{label}</div>

      <div className="min-w-65 flex-1">
        <div className="flex flex-wrap items-center gap-2 rounded-md border bg-background px-2 py-2">
          {selected.map((u) => (
            <span
              key={u.id}
              className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-2 py-1 text-sm"
              title={u.email}
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-background text-xs font-semibold">
                {initials(u)}
              </span>
              <span className="max-w-60 truncate">{formatChip(u)}</span>
              <button
                type="button"
                className="rounded-full p-1 text-muted-foreground hover:text-foreground"
                onClick={() => remove(u.id)}
                aria-label="Remove recipient"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex min-w-45 flex-1 items-center gap-2 rounded-md px-2 py-1 text-left text-sm outline-none",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                )}
                onClick={() => setOpen(true)}
              >
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span
                  className={cn(
                    "text-muted-foreground",
                    query && "text-foreground",
                  )}
                >
                  {query ? query : "Добавить получателя…"}
                </span>
                <span className="ml-auto inline-flex items-center gap-2 text-muted-foreground">
                  {loadingUsers ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  <ChevronsUpDown className="h-4 w-4" />
                </span>
              </button>
            </PopoverTrigger>

            <PopoverContent className="w-130 p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Введите имя или email…"
                  value={query}
                  onValueChange={setQuery}
                />
                <CommandList>
                  {loadingUsers ? (
                    <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Загружаю пользователей…
                    </div>
                  ) : null}

                  {!loadingUsers && suggestions.length === 0 ? (
                    <CommandEmpty>Ничего не найдено.</CommandEmpty>
                  ) : null}

                  <CommandGroup heading="Пользователи">
                    {suggestions.map((u) => {
                      const isSelected = valueIds.includes(u.id);
                      return (
                        <CommandItem
                          key={u.id}
                          value={u.id}
                          onSelect={() => add(u)}
                          className="py-2"
                        >
                          <div className="flex w-full items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full border bg-muted text-sm font-semibold">
                              {initials(u)}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <div className="truncate text-sm font-medium">
                                  {displayName(u)}
                                </div>
                                <Badge variant="secondary" className="shrink-0">
                                  {u.role}
                                </Badge>
                              </div>
                              <div className="truncate text-xs text-muted-foreground">
                                {u.email}
                              </div>
                            </div>

                            <div className="ml-2">
                              <Check
                                className={cn(
                                  "h-4 w-4",
                                  isSelected ? "opacity-100" : "opacity-0",
                                )}
                              />
                            </div>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* hidden "raw" view if тебе всё ещё нужен человекочитаемый текст */}
        {/* <div className="mt-2 text-xs text-muted-foreground">
          Передаём IDs: {valueIds.join(", ")}
        </div> */}
      </div>
    </div>
  );
}

type InboxRecipientsProps = {
  // ✅ теперь "сырой текст" не нужен, но оставлю совместимость (можно выпилить)
  toRaw: string;
  setToRaw: (v: string) => void;
  ccRaw: string;
  setCcRaw: (v: string) => void;
  bccRaw: string;
  setBccRaw: (v: string) => void;

  // ✅ НОВОЕ: реальные ids, которые ты отправляешь на backend
  toIds: string[];
  setToIds: (v: string[]) => void;
  ccIds: string[];
  setCcIds: (v: string[]) => void;
  bccIds: string[];
  setBccIds: (v: string[]) => void;

  setShowBcc: (v: boolean) => void;
  setShowCc: (v: boolean) => void;
  showBcc: boolean;
  showCc: boolean;
};

export default function InboxRecipients({
  toRaw,
  setToRaw,
  ccRaw,
  setCcRaw,
  bccRaw,
  setBccRaw,

  toIds,
  setToIds,
  ccIds,
  setCcIds,
  bccIds,
  setBccIds,

  setShowBcc,
  setShowCc,
  showBcc,
  showCc,
}: InboxRecipientsProps) {
  const [roleFilter, setRoleFilter] = React.useState<RoleFilter>("all");
  const [users, setUsers] = React.useState<Recipient[]>([]);
  const [fetching, setFetching] = React.useState(false);

  const fetchUsers = React.useCallback(async () => {
    setFetching(true);
    try {
      const list = await fetchAllUsers();
      setUsers(list);
    } catch (e: unknown) {
      const msg = getUserFacingErrorMessage(
        e,
        "Не удалось загрузить получателей",
      );
      toast.error(msg);
      setUsers([]);
    } finally {
      setFetching(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ✅ Совместимость: если где-то ещё используется toRaw/ccRaw/bccRaw как uuid CSV
  // синхронизируем ids → raw
  React.useEffect(() => setToRaw(toIds.join(", ")), [toIds, setToRaw]);
  React.useEffect(() => setCcRaw(ccIds.join(", ")), [ccIds, setCcRaw]);
  React.useEffect(() => setBccRaw(bccIds.join(", ")), [bccIds, setBccRaw]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-sm text-muted-foreground">Фильтр:</div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={roleFilter === "all" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setRoleFilter("all")}
          >
            Все
          </Button>
          <Button
            type="button"
            variant={roleFilter === "students" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setRoleFilter("students")}
          >
            Students
          </Button>
          <Button
            type="button"
            variant={roleFilter === "teachers" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setRoleFilter("teachers")}
          >
            Teachers
          </Button>
          <Button
            type="button"
            variant={roleFilter === "admin" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setRoleFilter("admin")}
          >
            Admin
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setShowCc(!showCc)}
          >
            Cc
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setShowBcc(!showBcc)}
          >
            Bcc
          </Button>
        </div>
      </div>

      <RecipientPicker
        label="To"
        valueIds={toIds}
        onChangeIds={setToIds}
        users={users}
        loadingUsers={fetching}
        roleFilter={roleFilter}
      />

      <AnimatePresence initial={false}>
        {showCc && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <RecipientPicker
              label="Cc"
              valueIds={ccIds}
              onChangeIds={setCcIds}
              users={users}
              loadingUsers={fetching}
              roleFilter={roleFilter}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {showBcc && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <RecipientPicker
              label="Bcc"
              valueIds={bccIds}
              onChangeIds={setBccIds}
              users={users}
              loadingUsers={fetching}
              roleFilter={roleFilter}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Если хочешь оставить старые Input (uuid csv) как fallback/дебаг — раскомментируй */}
      {/* <div className="space-y-2">
        <Input value={toRaw} onChange={(e) => setToRaw(e.target.value)} />
        {showCc ? <Input value={ccRaw} onChange={(e) => setCcRaw(e.target.value)} /> : null}
        {showBcc ? <Input value={bccRaw} onChange={(e) => setBccRaw(e.target.value)} /> : null}
      </div> */}
    </div>
  );
}
