"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { User, USER_ROLES } from "@/types/user";
import { useAuth } from "@/context/auth-context";
import { http } from "@/lib/http";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

import { toast } from "sonner";
import UserDetailedModal from "@/components/dashboard/admin/user/user-detailed-modal";
import { roleBadgeVariant, useDebounced } from "@/lib/func";

// lucide icons (shadcn default)
import {
  SlidersHorizontal,
  LayoutGrid,
  List,
  MoreHorizontal,
  RefreshCw,
  X,
} from "lucide-react";
import DashHeader from "@/components/ui/dash-header";

type AdminUpdatePayload = Partial<
  Pick<User, "first_name" | "last_name" | "phone" | "avatar_url" | "status">
> & {
  role?: USER_ROLES;
};

// ---- helpers for “CRM-like” look ----
function initials(first?: string | null, last?: string | null) {
  const a = (first?.trim()?.[0] ?? "").toUpperCase();
  const b = (last?.trim()?.[0] ?? "").toUpperCase();
  const s = `${a}${b}`.trim();
  return s || "U";
}

function formatDate(d?: string | Date | null) {
  if (!d) return "—";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

// If your User type doesn’t have these fields, we gracefully fallback.
function pickCreatedAt(u: Partial<User> | null | undefined) {
  return u?.created_at ?? u?.created_at ?? u?.created_at ?? null;
}
function pickUpdatedAt(u: Partial<User> | null | undefined) {
  return u?.updated_at ?? u?.updated_at ?? u?.updated_at ?? null;
}
function pickTags(u: Partial<User> | null | undefined): string[] {
  const t = u?.last_login_at;
  if (Array.isArray(t)) return t.filter(Boolean);
  if (typeof t === "string" && t.trim()) return [t.trim()];
  return []; // <-- no fake tag by default now
}

function statusPill(u: User) {
  // your system: "active" | "blocked"
  if (u.status === "active") return { label: "Active", dot: "bg-emerald-500" };
  if (u.status === "blocked") return { label: "Blocked", dot: "bg-rose-500" };
  return { label: String(u.status ?? "—"), dot: "bg-muted-foreground" };
}

function typeLabelFromRole(role: string) {
  if (role === "student") return "student";
  if (role === "teacher") return "teacher";
  if (role === "admin") return "admin";
  return role;
}

function softBadgeClass(kind: "type" | "tag") {
  return kind === "type"
    ? "bg-muted text-foreground border border-border"
    : "bg-muted/70 text-foreground border border-border";
}

type Filters = {
  status: "all" | "active" | "blocked";
  role: "all" | USER_ROLES;
  tag: "all" | string;
};

export default function UserListTable({ userType }: { userType: USER_ROLES }) {
  const { user, loading } = useAuth();
  const isAdmin = user?.role === "admin";

  const [users, setUsers] = useState<User[]>([]);
  const [fetching, setFetching] = useState(true);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search, 250);

  // “Display” toggle like screenshot
  const [displayMode, setDisplayMode] = useState<"list" | "grid">("list");

  // selection
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  // filter popover
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    status: "all",
    role: "all",
    tag: "all",
  });

  // edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  // details modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const title =
    userType === "student" ? "Аккаунты студентов" : "Аккаунты преподавателей";
  const description =
    userType === "student"
      ? "Управляйте аккаунтами студентов: редактируйте, меняйте роль, удаляйте."
      : "Управляйте аккаунтами преподавателей: редактируйте, меняйте роль, удаляйте.";

  const fetchUsers = useCallback(async () => {
    setFetching(true);
    try {
      const url = `/api/users?role=${userType}&limit=100&offset=0`;
      const r = await http(url, { method: "GET" });

      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        throw new Error(data?.message || "Failed to load users");
      }

      const data = await r.json();
      const list = (data?.users ?? []) as User[];
      setUsers(list);
      setSelectedIds({});
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load users");
      setUsers([]);
      setSelectedIds({});
    } finally {
      setFetching(false);
    }
  }, [userType]);

  useEffect(() => {
    if (!loading && isAdmin) fetchUsers();
  }, [loading, isAdmin, fetchUsers]);

  // collect available tags for filter dropdown
  const availableTags = useMemo(() => {
    const s = new Set<string>();
    users.forEach((u) => pickTags(u).forEach((t) => s.add(String(t))));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [users]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();

    return users.filter((u) => {
      // search
      if (q) {
        const hay =
          `${u.first_name ?? ""} ${u.last_name ?? ""} ${u.email ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      // status
      if (filters.status !== "all") {
        if (String(u.status) !== filters.status) return false;
      }

      // role
      if (filters.role !== "all") {
        if (String(u.role) !== filters.role) return false;
      }

      // tag
      if (filters.tag !== "all") {
        const tags = pickTags(u).map(String);
        if (!tags.includes(filters.tag)) return false;
      }

      return true;
    });
  }, [users, debouncedSearch, filters]);

  const filtersActive =
    filters.status !== "all" || filters.role !== "all" || filters.tag !== "all";

  const allChecked = useMemo(() => {
    if (!filtered.length) return false;
    return filtered.every((u) => selectedIds[String(u.id)] === true);
  }, [filtered, selectedIds]);

  const someChecked = useMemo(() => {
    if (!filtered.length) return false;
    const any = filtered.some((u) => selectedIds[String(u.id)] === true);
    return any && !allChecked;
  }, [filtered, selectedIds, allChecked]);

  const toggleAll = (checked: boolean) => {
    const next: Record<string, boolean> = { ...selectedIds };
    filtered.forEach((u) => {
      next[String(u.id)] = checked;
    });
    setSelectedIds(next);
  };

  const toggleOne = (id: string | number, checked: boolean) => {
    setSelectedIds((cur) => ({ ...cur, [String(id)]: checked }));
  };

  const openEdit = (u: User) => {
    setEditUser(u);
    setEditOpen(true);
  };

  const openDelete = (u: User) => {
    setDeleteUser(u);
    setDeleteOpen(true);
  };

  const onSaveEdit = async () => {
    if (!editUser) return;

    setSaving(true);

    const payload: AdminUpdatePayload = {
      first_name: editUser.first_name,
      last_name: editUser.last_name,
      phone: editUser.phone,
      avatar_url: editUser.avatar_url,
      role: editUser.role,
      status: editUser.status,
    };

    const prev = users;
    setUsers((cur) =>
      cur.map((u) =>
        u.id === editUser.id ? ({ ...u, ...payload } as User) : u,
      ),
    );

    try {
      const r = await http(`/api/users/${editUser.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        throw new Error(data?.message || "Update failed");
      }

      const data = await r.json().catch(() => ({}));
      const updated = (data?.user ?? null) as User | null;

      if (updated) {
        setUsers((cur) => cur.map((u) => (u.id === updated.id ? updated : u)));
      }

      toast.success("Updated");
      setEditOpen(false);
      setEditUser(null);
    } catch (e: unknown) {
      setUsers(prev);
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const onConfirmDelete = async () => {
    if (!deleteUser) return;

    setDeleting(true);

    const prev = users;
    setUsers((cur) => cur.filter((u) => u.id !== deleteUser.id));

    try {
      const r = await http(`/api/users/${deleteUser.id}`, { method: "DELETE" });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        throw new Error(data?.message || "Delete failed");
      }

      toast.success("Deleted");
      setDeleteOpen(false);
      setDeleteUser(null);
    } catch (e: unknown) {
      setUsers(prev);
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="text-sm text-muted-foreground">Forbidden</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <DashHeader title={title} subtitle={description} />

      {/* Toolbar: Filter (popover) left, Search/Reload/Display right */}
      <div className="px-4 flex items-center justify-between gap-3 flex-wrap">
        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={filtersActive ? "secondary" : "ghost"}
              className="gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filter
              {filtersActive && (
                <span className="ml-1 rounded-full bg-foreground/10 px-2 py-0.5 text-xs">
                  on
                </span>
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent align="start" className="w-90 p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">Filters</div>

              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => {
                  setFilters({ status: "all", role: "all", tag: "all" });
                }}
                disabled={!filtersActive}
              >
                <X className="h-4 w-4" />
                Reset
              </Button>
            </div>

            <Separator className="my-3" />

            <div className="space-y-4">
              {/* Status */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(v) =>
                    setFilters((cur) => ({
                      ...cur,
                      status: v as Filters["status"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Role</Label>
                <Select
                  value={filters.role}
                  onValueChange={(v) =>
                    setFilters((cur) => ({
                      ...cur,
                      role: v as Filters["role"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="student">student</SelectItem>
                    <SelectItem value="teacher">teacher</SelectItem>
                    <SelectItem value="admin">admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tag */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Tag</Label>
                <Select
                  value={filters.tag}
                  onValueChange={(v) =>
                    setFilters((cur) => ({ ...cur, tag: v as Filters["tag"] }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    {availableTags.length ? (
                      availableTags.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="__no_tags" disabled>
                        No tags in data
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-1 flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {filtered.length}
                  </span>{" "}
                  users
                </div>
                <Button
                  size="sm"
                  onClick={() => setFiltersOpen(false)}
                  className="px-4"
                >
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Search name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[320px] max-w-[70vw]"
          />

          <Button
            variant="outline"
            className="gap-2"
            onClick={fetchUsers}
            disabled={fetching}
          >
            <RefreshCw
              className={`h-4 w-4 ${fetching ? "animate-spin" : ""}`}
            />
            {fetching ? "Reloading..." : "Reload"}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                {displayMode === "list" ? (
                  <List className="h-4 w-4" />
                ) : (
                  <LayoutGrid className="h-4 w-4" />
                )}
                Display
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Mode</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setDisplayMode("list")}>
                <List className="h-4 w-4 mr-2" />
                List
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDisplayMode("grid")}>
                <LayoutGrid className="h-4 w-4 mr-2" />
                Grid
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* CONTENT: list(table) OR grid(cards) */}
      <div className="px-4 pb-6">
        {displayMode === "list" ? (
          <div className="overflow-hidden rounded-xl border bg-background">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-11">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={
                          allChecked
                            ? true
                            : someChecked
                              ? "indeterminate"
                              : false
                        }
                        onCheckedChange={(v) => toggleAll(Boolean(v))}
                        aria-label="Select all"
                      />
                    </div>
                  </TableHead>

                  <TableHead className="min-w-55">Имя</TableHead>
                  <TableHead className="min-w-65">Почта</TableHead>
                  <TableHead className="min-w-40">Дата создания</TableHead>
                  <TableHead className="min-w-40">
                    Последнее обновление
                  </TableHead>
                  <TableHead className="min-w-32">Роль</TableHead>
                  <TableHead className="min-w-32">Последний вход</TableHead>
                  <TableHead className="min-w-32">Статус</TableHead>
                  <TableHead className="w-14" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {fetching ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={9}>
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filtered.length ? (
                  filtered.map((u) => {
                    const id = String(u.id);
                    const createdAt = pickCreatedAt(u);
                    const updatedAt = pickUpdatedAt(u);
                    const status = statusPill(u);
                    const typeLabel = typeLabelFromRole(String(u.role));

                    return (
                      <TableRow
                        key={id}
                        className="hover:bg-muted/30 transition-colors"
                        onClick={() => {
                          setSelectedUser(u);
                          setModalOpen(true);
                        }}
                      >
                        <TableCell className="w-11">
                          <div
                            className="flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Checkbox
                              checked={selectedIds[id] === true}
                              onCheckedChange={(v) => toggleOne(id, Boolean(v))}
                              aria-label="Select row"
                            />
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full overflow-hidden bg-muted flex items-center justify-center text-xs font-semibold">
                              {u.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={u.avatar_url}
                                  alt={`${u.first_name ?? ""} ${u.last_name ?? ""}`}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span>
                                  {initials(u.first_name, u.last_name)}
                                </span>
                              )}
                            </div>

                            <div className="leading-tight">
                              <div className="font-medium">
                                {(u.first_name ?? "—") +
                                  " " +
                                  (u.last_name ?? "")}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {u.email ?? "—"}
                        </TableCell>

                        <TableCell>{formatDate(createdAt)}</TableCell>
                        <TableCell>{formatDate(updatedAt)}</TableCell>

                        <TableCell>
                          <Badge
                            className={softBadgeClass("type")}
                            variant="secondary"
                          >
                            {typeLabel}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col leading-tight">
                            <span className="text-sm font-medium">
                              {new Date(
                                u.last_login_at ?? "",
                              ).toLocaleDateString("ru-RU")}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(
                                u.last_login_at ?? "",
                              ).toLocaleTimeString("ru-RU", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
                            <span
                              className={`h-2 w-2 rounded-full ${status.dot}`}
                            />
                            <span className="text-muted-foreground">
                              {status.label}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="flex justify-end"
                          >
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => openEdit(u)}>
                                  Редактировать
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => openDelete(u)}
                                >
                                  Удалить
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center text-muted-foreground py-10"
                    >
                      Пользователи не найдены
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          // GRID MODE
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {fetching ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-xl border bg-background p-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="mt-3 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))
            ) : filtered.length ? (
              filtered.map((u) => {
                const id = String(u.id);
                const createdAt = pickCreatedAt(u);
                const updatedAt = pickUpdatedAt(u);
                const status = statusPill(u);
                const typeLabel = typeLabelFromRole(String(u.role));

                return (
                  <div
                    key={id}
                    className="rounded-xl border bg-background p-4 hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedUser(u);
                      setModalOpen(true);
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-muted flex items-center justify-center text-xs font-semibold shrink-0">
                          {u.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={u.avatar_url}
                              alt={`${u.first_name ?? ""} ${u.last_name ?? ""}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span>{initials(u.first_name, u.last_name)}</span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            {(u.first_name ?? "—") + " " + (u.last_name ?? "")}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {u.email ?? "—"}
                          </div>
                        </div>
                      </div>

                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selectedIds[id] === true}
                          onCheckedChange={(v) => toggleOne(id, Boolean(v))}
                          aria-label="Select user"
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEdit(u)}>
                              Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => openDelete(u)}
                            >
                              Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge
                        className={softBadgeClass("type")}
                        variant="secondary"
                      >
                        {typeLabel}
                      </Badge>

                      <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
                        <span
                          className={`h-2 w-2 rounded-full ${status.dot}`}
                        />
                        <span className="text-muted-foreground">
                          {status.label}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>
                        <div className="uppercase tracking-wide">Created</div>
                        <div className="text-foreground/90">
                          {formatDate(createdAt)}
                        </div>
                      </div>
                      <div>
                        <div className="uppercase tracking-wide">Updated</div>
                        <div className="text-foreground/90">
                          {formatDate(updatedAt)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        Последний вход
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <div className="flex flex-col leading-tight">
                          <span className="text-sm font-medium">
                            {new Date(u.last_login_at ?? "").toLocaleDateString(
                              "ru-RU",
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(u.last_login_at ?? "").toLocaleTimeString(
                              "ru-RU",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full rounded-xl border bg-background py-14 text-center text-muted-foreground">
                Пользователи не найдены
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog
        open={editOpen}
        onOpenChange={(v) => {
          if (!v) setEditUser(null);
          setEditOpen(v);
        }}
      >
        <DialogContent className="sm:max-w-130">
          <DialogHeader>
            <DialogTitle>Редактировать пользователя</DialogTitle>
            <DialogDescription>
              Обновите профиль, роль или статус.
            </DialogDescription>
          </DialogHeader>

          {editUser && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Имя</div>
                  <Input
                    value={editUser.first_name ?? ""}
                    onChange={(e) =>
                      setEditUser({ ...editUser, first_name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Фамилия</div>
                  <Input
                    value={editUser.last_name ?? ""}
                    onChange={(e) =>
                      setEditUser({ ...editUser, last_name: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Телефон</div>
                <Input
                  value={editUser.phone ?? ""}
                  onChange={(e) =>
                    setEditUser({ ...editUser, phone: e.target.value || null })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Роль</div>
                  <Select
                    value={editUser.role}
                    onValueChange={(v) =>
                      setEditUser({ ...editUser, role: v as USER_ROLES })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Роль" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">студент</SelectItem>
                      <SelectItem value="teacher">преподаватель</SelectItem>
                      <SelectItem value="admin">администратор</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Статус</div>
                  <Select
                    value={editUser.status}
                    onValueChange={(v) =>
                      setEditUser({ ...editUser, status: v as User["status"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">активен</SelectItem>
                      <SelectItem value="blocked">заблокирован</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-2">
                <div className="text-xs text-muted-foreground mb-1">
                  Preview
                </div>
                <Badge variant={roleBadgeVariant(editUser.role)}>
                  {editUser.role}
                </Badge>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setEditOpen(false);
                setEditUser(null);
              }}
              disabled={saving}
            >
              Отмена
            </Button>
            <Button onClick={onSaveEdit} disabled={saving || !editUser}>
              {saving ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UserDetailedModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        selectedUser={selectedUser}
      />

      {/* Delete confirm */}
      <AlertDialog
        open={deleteOpen}
        onOpenChange={(v) => {
          if (!v) setDeleteUser(null);
          setDeleteOpen(v);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие необратимо. Пользователь и связанные с ним токены
              обновления будут удалены.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmDelete} disabled={deleting}>
              {deleting ? "Удаление..." : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
