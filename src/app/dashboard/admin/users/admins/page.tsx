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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import UserDetailedModal from "@/components/dashboard/admin/user/user-detailed-modal";
import { roleBadgeVariant } from "@/lib/func";

type AdminUpdatePayload = Partial<
  Pick<User, "first_name" | "last_name" | "phone" | "avatar_url" | "status">
> & {
  role?: USER_ROLES;
};

export type roleBadgeVariantFn = (
  role: string,
) => "default" | "secondary" | "destructive";

export default function Page() {
  const { user, loading } = useAuth();

  const [admins, setAdmins] = useState<User[]>([]);
  const [fetching, setFetching] = useState(true);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search, 250);

  // edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  // for detailed user modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isAdmin = user?.role === "admin";

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return admins;
    return admins.filter((u) => {
      const s = `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase();
      return s.includes(q);
    });
  }, [admins, debouncedSearch]);

  const fetchAdmins = useCallback(async () => {
    setFetching(true);
    try {
      // ✅ filter role server-side for speed
      const url = `/api/users?role=admin&limit=10&offset=0`;
      const r = await http(url, { method: "GET" });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        throw new Error(data?.message || "Failed to load users");
      }
      const data = await r.json();
      const list = (data?.users ?? []) as User[];
      setAdmins(list);
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message || "Failed to load admins");
      } else {
        toast.error("Failed to load admins");
      }
      setAdmins([]);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && isAdmin) fetchAdmins();
  }, [loading, isAdmin, fetchAdmins]);

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

    // build payload diff (to avoid unnecessary updates)
    const payload: AdminUpdatePayload = {
      first_name: editUser.first_name,
      last_name: editUser.last_name,
      phone: editUser.phone,
      avatar_url: editUser.avatar_url,
      role: editUser.role,
      status: editUser.status,
    };

    // optimistic update
    const prev = admins;
    setAdmins((cur) =>
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
        setAdmins((cur) => cur.map((u) => (u.id === updated.id ? updated : u)));
      }

      toast.success("Updated");
      setEditOpen(false);
      setEditUser(null);
    } catch (e: Error | unknown) {
      setAdmins(prev);
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const onConfirmDelete = async () => {
    if (!deleteUser) return;

    setDeleting(true);

    // optimistic remove
    const prev = admins;
    setAdmins((cur) => cur.filter((u) => u.id !== deleteUser.id));

    try {
      const r = await http(`/api/users/${deleteUser.id}`, { method: "DELETE" });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        throw new Error(data?.message || "Delete failed");
      }

      toast.success("Deleted");
      setDeleteOpen(false);
      setDeleteUser(null);
    } catch (e: Error | unknown) {
      setAdmins(prev);
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (loading)
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-48" />
      </div>
    );

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="text-sm text-muted-foreground">Forbidden</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xl font-semibold">Аккаунты администраторов</div>
          <div className="text-sm text-muted-foreground">
            Управляйте аккаунтами администраторов: редактируйте, меняйте роль,
            удаляйте.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Поиск по имени или email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Button variant="secondary" onClick={fetchAdmins} disabled={fetching}>
            {fetching ? "Перезагрузка..." : "Перезагрузить"}
          </Button>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-65">Имя</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-35">Роль</TableHead>
              <TableHead className="w-35">Статус</TableHead>
              <TableHead className="w-35">Последний вход</TableHead>
              <TableHead className="w-45 text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {fetching ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : filtered.length ? (
              filtered.map((u) => (
                <TableRow
                  key={u.id}
                  onClick={() => {
                    setSelectedUser(u);
                    setModalOpen(true);
                  }}
                  className="cursor-pointer"
                >
                  <TableCell className="font-medium capitalize">
                    {u.first_name} {u.last_name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {u.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleBadgeVariant(u.role)}>{u.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        u.status === "active" ? "secondary" : "destructive"
                      }
                    >
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {u.last_login_at
                      ? new Date(u.last_login_at).toLocaleString()
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {/* <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(u)}
                    >
                      Редактировать
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => openDelete(u)}
                    >
                      Удалить
                    </Button> */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUser(u);
                        setModalOpen(true);
                      }}
                    >
                      Просмотр
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-10"
                >
                  Студенты не найдены
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
                    value={editUser.first_name}
                    onChange={(e) =>
                      setEditUser({ ...editUser, first_name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Фамилия</div>
                  <Input
                    value={editUser.last_name}
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

// tiny hook for debounce (fast search without re-render spam)
function useDebounced<T>(value: T, delayMs: number) {
  const [v, setV] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setV(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return v;
}
