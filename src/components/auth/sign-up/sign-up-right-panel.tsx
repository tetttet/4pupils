"use client";

import * as React from "react";
import { Logo } from "@/components/layout/logo";
import { Badge } from "@/components/ui/badge";
import { SparklesIcon, ShieldCheckIcon, ZapIcon } from "lucide-react";

export function SignUpRightPanel() {
  return (
    <div className="relative hidden overflow-hidden border-l bg-secondary/30 p-10 lg:block">
      {/* background blobs */}
      <div className="pointer-events-none absolute -top-20 -right-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background" />

      {/* subtle pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "18px 18px",
        }}
      />

      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between">
          <Logo />
          <Badge variant="secondary" className="gap-2">
            <SparklesIcon className="h-3.5 w-3.5" />
            simple & comfy
          </Badge>
        </div>

        <div className="mt-auto space-y-4">
          <h2 className="text-3xl font-bold leading-tight">
            Учись. Преподавай. <br />
            Всё в одном месте.
          </h2>

          <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
            Регистрация займёт меньше минуты: сначала профиль, потом доступ.
            Никаких лишних полей — только самое нужное.
          </p>

          <div className="grid max-w-md grid-cols-1 gap-3 pt-2">
            <Feature
              icon={<ZapIcon className="h-4 w-4" />}
              title="Быстрый старт"
              text="Два шага и вы уже внутри."
            />
            <Feature
              icon={<ShieldCheckIcon className="h-4 w-4" />}
              title="Аккуратно и безопасно"
              text="Минимум данных — максимум пользы."
            />
            <Feature
              icon={<SparklesIcon className="h-4 w-4" />}
              title="Интуитивно и просто"
              text="Понятный интерфейс без лишних сложностей."
            />
          </div>

          <div className="pt-6 text-xs text-muted-foreground">
            Совет: если вы преподаватель — выбирайте <b className="text-black">Учитель</b>, сможете создавать
            задания и группы.
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border bg-background/60 p-3 shadow-sm">
      <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-muted/40">
        {icon}
      </div>
      <div className="space-y-0.5">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{text}</div>
      </div>
    </div>
  );
}
