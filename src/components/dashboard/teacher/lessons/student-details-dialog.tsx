"use client";

import * as React from "react";
import {
  BadgeCheck,
  Copy,
  LoaderCircle,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { initials } from "@/lib/func";
import type { Enrollment } from "@/types/enrollment";
import type { User } from "@/types/user";

import { ENROLLMENT_STATUS_LABELS } from "@/components/dashboard/teacher/course-applications/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type TeacherStudentContact = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  status?: User["status"];
  role?: User["role"];
  created_at?: string;
  updated_at?: string;
  last_login_at?: string | null;
};

function getFullName(student: TeacherStudentContact | null) {
  if (!student) return "Студент";

  return (
    [student.first_name, student.last_name].filter(Boolean).join(" ").trim() ||
    student.email ||
    "Студент"
  );
}

function toTelHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function formatProgress(value?: number | string) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return "0%";
  }

  return `${Math.max(0, Math.min(100, Math.round(parsed)))}%`;
}

function getProfileStatusLabel(status?: User["status"]) {
  if (status === "blocked") return "Ограничен";
  if (status === "active") return "Активен";
  return "—";
}

async function copyText(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} скопирован`);
  } catch {
    toast.error("Не удалось скопировать значение");
  }
}

function InfoCard({
  icon,
  label,
  value,
  copyValue,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  copyValue?: string | null;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-zinc-500">
            <span className="text-zinc-400">{icon}</span>
            <span>{label}</span>
          </div>
          <div className="mt-2 break-words text-sm font-medium leading-6 text-zinc-900">
            {value}
          </div>
        </div>

        {copyValue ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void copyText(copyValue, label)}
          >
            <Copy className="h-4 w-4" />
            Копировать
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export default function StudentDetailsDialog({
  open,
  onOpenChange,
  student,
  enrollment,
  loading,
  profileError,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: TeacherStudentContact | null;
  enrollment: Enrollment | null;
  loading: boolean;
  profileError: string | null;
}) {
  const fullName = getFullName(student);
  const email = student?.email || enrollment?.student_email || "";
  const phone = student?.phone ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader className="gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={student?.avatar_url ?? undefined} alt={fullName} />
                <AvatarFallback>{initials(fullName)}</AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <DialogTitle className="truncate text-xl">{fullName}</DialogTitle>
                <DialogDescription className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
                  Короткая карточка ученика: только контакты и базовые поля,
                  которые реально нужны преподавателю.
                </DialogDescription>

                {loading ? (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-zinc-50 px-3 py-1 text-[11px] text-zinc-600">
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                    Загружаю полный профиль
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {email ? (
                <>
                  <Button asChild size="sm">
                    <a href={`mailto:${email}`}>
                      <Mail className="h-4 w-4" />
                      Написать
                    </a>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void copyText(email, "Email")}
                  >
                    <Copy className="h-4 w-4" />
                    Email
                  </Button>
                </>
              ) : null}

              {phone ? (
                <>
                  <Button asChild variant="outline" size="sm">
                    <a href={toTelHref(phone)}>
                      <Phone className="h-4 w-4" />
                      Позвонить
                    </a>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => void copyText(phone, "Телефон")}
                  >
                    <Copy className="h-4 w-4" />
                    Телефон
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        </DialogHeader>

        {profileError ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {profileError}. Ниже показываю данные, которые уже есть в записи курса.
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <InfoCard
            icon={<Mail className="h-4 w-4" />}
            label="Email"
            value={email || "Email пока не указан"}
            copyValue={email || null}
          />
          <InfoCard
            icon={<Phone className="h-4 w-4" />}
            label="Телефон"
            value={phone || "Телефон пока не добавлен"}
            copyValue={phone}
          />
          <InfoCard
            icon={<BadgeCheck className="h-4 w-4" />}
            label="Статус обучения"
            value={
              enrollment
                ? ENROLLMENT_STATUS_LABELS[enrollment.status]
                : "Информация недоступна"
            }
          />
          <InfoCard
            icon={<BadgeCheck className="h-4 w-4" />}
            label="Прогресс"
            value={enrollment ? formatProgress(enrollment.progress_percent) : "—"}
          />
          <InfoCard
            icon={<UserRound className="h-4 w-4" />}
            label="Имя"
            value={student?.first_name || "—"}
          />
          <InfoCard
            icon={<UserRound className="h-4 w-4" />}
            label="Фамилия"
            value={student?.last_name || "—"}
          />
          <InfoCard
            icon={<BadgeCheck className="h-4 w-4" />}
            label="Статус профиля"
            value={getProfileStatusLabel(student?.status)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
