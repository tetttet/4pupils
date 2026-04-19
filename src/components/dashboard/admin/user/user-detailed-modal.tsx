import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  Shield,
  Calendar,
  Clock,
  Fingerprint,
  User as UserIcon,
  Image as ImageIcon,
  CheckCircle2,
  Ban,
} from "lucide-react";
import { roleBadgeVariant } from "@/lib/func";

/** Types */
export type USER_ROLES = "student" | "teacher" | "admin";

export type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  status: "active" | "blocked";
  role: USER_ROLES;
  last_login_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

type Props = {
  modalOpen: boolean;
  setModalOpen: (v: boolean) => void;
  selectedUser: User | null;
};

function cn(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

function formatDateTime(v?: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function formatDate(v?: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

function initials(first?: string, last?: string) {
  const a = (first ?? "").trim().slice(0, 1).toUpperCase();
  const b = (last ?? "").trim().slice(0, 1).toUpperCase();
  const s = `${a}${b}`.trim();
  return s || "U";
}

function labelRole(role?: USER_ROLES) {
  if (!role) return "—";
  if (role === "admin") return "Администратор";
  if (role === "teacher") return "Преподаватель";
  return "Студент";
}

function labelStatus(status?: User["status"]) {
  if (!status) return "—";
  return status === "active" ? "Активен" : "Заблокирован";
}

function statusBadgeVariant(status?: User["status"]) {
  return status === "active" ? "secondary" : "destructive";
}

function copyToClipboard(text: string) {
  if (!text) return;
  void navigator.clipboard?.writeText(text);
}

/** UI helpers */
function Field({
  icon,
  label,
  value,
  mono,
  copy,
  copyValue,
  className,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  copy?: boolean;
  copyValue?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-md border bg-muted/20 p-3", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {icon ? <span className="shrink-0">{icon}</span> : null}
            <span className="truncate">{label}</span>
          </div>
          <div
            className={cn(
              "mt-1 wrap-break-word text-sm",
              mono && "font-mono text-[13px]",
            )}
          >
            {value}
          </div>
        </div>

        {copy && typeof value !== "undefined" ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0"
            onClick={() => copyToClipboard(copyValue ?? String(value))}
            title="Скопировать"
          >
            Копировать
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export default function UserDetailedModal({
  modalOpen,
  setModalOpen,
  selectedUser,
}: Props) {
  const fullName = selectedUser
    ? `${selectedUser.first_name} ${selectedUser.last_name}`.trim()
    : "Пользователь";

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="sm:max-w-190">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12 rounded-full">
              <AvatarImage
                src={selectedUser?.avatar_url ?? undefined}
                alt={fullName}
              />
              <AvatarFallback className="rounded-full">
                {initials(selectedUser?.first_name, selectedUser?.last_name)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <DialogTitle className="truncate mb-2">{fullName}</DialogTitle>
              <DialogDescription className="mt-1 flex flex-wrap items-center gap-2">
                <Badge
                  className="-ml-1"
                  variant={roleBadgeVariant(selectedUser?.role ?? "student")}
                >
                  {labelRole(selectedUser?.role)}
                </Badge>

                <Badge variant={statusBadgeVariant(selectedUser?.status)}>
                  <span className="mr-1 inline-flex items-center">
                    {selectedUser?.status === "active" ? (
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                    ) : (
                      <Ban className="mr-1 h-3.5 w-3.5" />
                    )}
                    {labelStatus(selectedUser?.status)}
                  </span>
                </Badge>

                {selectedUser?.last_login_at ? (
                  <span className="text-xs text-muted-foreground">
                    Последний вход: {formatDateTime(selectedUser.last_login_at)}
                  </span>
                ) : null}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        {/* Content */}
        {!selectedUser ? (
          <div className="rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
            Пользователь не выбран.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Контакты */}
            <section className="space-y-3">
              <div className="text-sm font-medium">Контакты</div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field
                  icon={<Mail className="h-4 w-4" />}
                  label="Email"
                  value={selectedUser.email || "—"}
                  copy
                  copyValue={selectedUser.email}
                />
                <Field
                  icon={<Phone className="h-4 w-4" />}
                  label="Телефон"
                  value={selectedUser.phone ?? "—"}
                  copy={Boolean(selectedUser.phone)}
                  copyValue={selectedUser.phone ?? undefined}
                />
              </div>
            </section>

            {/* Профиль */}
            <section className="space-y-3">
              <div className="text-sm font-medium">Профиль</div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field
                  icon={<UserIcon className="h-4 w-4" />}
                  label="Имя"
                  value={selectedUser.first_name || "—"}
                />
                <Field
                  icon={<UserIcon className="h-4 w-4" />}
                  label="Фамилия"
                  value={selectedUser.last_name || "—"}
                />
                <Field
                  icon={<Shield className="h-4 w-4" />}
                  label="Роль"
                  value={
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={roleBadgeVariant(
                          selectedUser.role ?? "student",
                        )}
                      >
                        {labelRole(selectedUser.role)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        ({selectedUser.role})
                      </span>
                    </div>
                  }
                />
                <Field
                  icon={<ImageIcon className="h-4 w-4" />}
                  label="Аватар URL"
                  value={selectedUser.avatar_url ?? "—"}
                  mono
                  copy={Boolean(selectedUser.avatar_url)}
                  copyValue={selectedUser.avatar_url ?? undefined}
                />
              </div>
            </section>

            {/* Система */}
            <section className="space-y-3">
              <div className="text-sm font-medium">Система</div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field
                  icon={<Fingerprint className="h-4 w-4" />}
                  label="User ID"
                  value={selectedUser.id}
                  mono
                  copy
                  copyValue={selectedUser.id}
                />
                <Field
                  icon={<Calendar className="h-4 w-4" />}
                  label="Создан"
                  value={formatDateTime(selectedUser.created_at ?? null)}
                  copy={Boolean(selectedUser.created_at)}
                  copyValue={selectedUser.created_at ?? undefined}
                />
                <Field
                  icon={<Clock className="h-4 w-4" />}
                  label="Обновлён"
                  value={formatDateTime(selectedUser.updated_at ?? null)}
                  copy={Boolean(selectedUser.updated_at)}
                  copyValue={selectedUser.updated_at ?? undefined}
                />
                <Field
                  icon={<Clock className="h-4 w-4" />}
                  label="Последний вход"
                  value={formatDateTime(selectedUser.last_login_at ?? null)}
                  copy={Boolean(selectedUser.last_login_at)}
                  copyValue={selectedUser.last_login_at ?? undefined}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Field
                  label="Дата создания (коротко)"
                  value={formatDate(selectedUser.created_at ?? null)}
                />
                <Field
                  label="Дата обновления (коротко)"
                  value={formatDate(selectedUser.updated_at ?? null)}
                />
                <Field
                  label="Статус (сырое значение)"
                  value={selectedUser.status}
                  mono
                />
              </div>
            </section>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
