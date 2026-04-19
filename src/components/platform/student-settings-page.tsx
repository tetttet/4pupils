"use client";

import Link from "next/link";
import * as React from "react";
import {
  ArrowUpRight,
  BookOpen,
  LayoutDashboard,
  Mail,
  MessageSquareText,
  PanelLeft,
  RotateCcw,
  Sparkles,
  WandSparkles,
  Type,
} from "lucide-react";

import { StudentPageShell } from "@/components/platform/student-page-shell";
import { StudentGlassPanel } from "@/components/platform/student-surface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  defaultStudentPlatformPreferences,
  studentPlatformDefaultPageOptions,
  studentPlatformFontSizeOptions,
  studentPlatformMessagePreviewOptions,
  type StudentPlatformPreferences,
  useStudentPlatformPreferences,
} from "@/hooks/use-student-platform-preferences";
import { cn } from "@/lib/utils";

type SettingSwitchRowProps = {
  icon: React.ComponentType<React.ComponentProps<"svg">>;
  title: string;
  note: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

type SettingSelectRowProps = {
  icon: React.ComponentType<React.ComponentProps<"svg">>;
  title: string;
  note: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onValueChange: (value: string) => void;
};

const presetItems: Array<{
  id: string;
  title: string;
  note: string;
  patch: Partial<StudentPlatformPreferences>;
}> = [
  {
    id: "default",
    title: "Стандарт",
    note: "Главная, обычный список, рекомендации включены",
    patch: {
      defaultPage: defaultStudentPlatformPreferences.defaultPage,
      sidebarCollapsed: defaultStudentPlatformPreferences.sidebarCollapsed,
      showRecommendedCourses:
        defaultStudentPlatformPreferences.showRecommendedCourses,
      messagePreview: defaultStudentPlatformPreferences.messagePreview,
    },
  },
  {
    id: "focus",
    title: "Фокус",
    note: "Уроки, компактный список, свернутое меню",
    patch: {
      defaultPage: "/platform/lessons",
      sidebarCollapsed: true,
      showRecommendedCourses: false,
      messagePreview: "compact",
    },
  },
  {
    id: "messages",
    title: "Сообщения",
    note: "Быстрый вход во входящие",
    patch: {
      defaultPage: "/platform/messages",
      sidebarCollapsed: false,
      showRecommendedCourses: false,
      messagePreview: "comfortable",
    },
  },
];

function matchesPreferences(
  current: StudentPlatformPreferences,
  target: Partial<StudentPlatformPreferences>,
) {
  return (Object.keys(target) as Array<keyof StudentPlatformPreferences>).every(
    (key) => current[key] === target[key],
  );
}

function getOptionLabel(
  options: readonly { value: string; label: string }[],
  value: string,
) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function SettingSwitchRow({
  icon: Icon,
  title,
  note,
  checked,
  onCheckedChange,
}: SettingSwitchRowProps) {
  return (
    <div className="rounded-[22px] border border-black/8 bg-[#fafafa] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#2d2d2d] text-white">
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-950">{title}</div>
            <p className="mt-1 text-sm leading-6 text-slate-600">{note}</p>
          </div>
        </div>

        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          aria-label={title}
          className="mt-0.5 data-[state=checked]:bg-[#2d2d2d] data-[state=unchecked]:bg-black/10"
        />
      </div>
    </div>
  );
}

function SettingSelectRow({
  icon: Icon,
  title,
  note,
  value,
  options,
  onValueChange,
}: SettingSelectRowProps) {
  return (
    <div className="rounded-[22px] border border-black/8 bg-[#fafafa] p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#2d2d2d] shadow-sm">
          <Icon className="h-4.5 w-4.5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-slate-950">{title}</div>
          <p className="mt-1 text-sm leading-6 text-slate-600">{note}</p>

          <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className="mt-3 h-11 w-full rounded-[18px] border-[#d9d9d9] bg-white px-4 text-left text-sm text-[#2d2d2d] shadow-none focus-visible:border-[#2d2d2d]/30 focus-visible:ring-[#2d2d2d]/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-[18px] border border-black/10 bg-white p-1 shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="rounded-xl px-3 py-2 text-sm text-slate-700 focus:bg-[#f5f5f5] focus:text-slate-950"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

export function StudentSettingsPageContent() {
  const {
    preferences,
    hydrated,
    setPreference,
    patchPreferences,
    resetPreferences,
  } = useStudentPlatformPreferences();
  const [flash, setFlash] = React.useState<null | "saved" | "reset">(null);

  React.useEffect(() => {
    if (!flash) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setFlash(null);
    }, 1500);

    return () => window.clearTimeout(timeoutId);
  }, [flash]);

  const defaultPageLabel = getOptionLabel(
    studentPlatformDefaultPageOptions,
    preferences.defaultPage,
  );
  const messagePreviewLabel = getOptionLabel(
    studentPlatformMessagePreviewOptions,
    preferences.messagePreview,
  );
  const fontSizeLabel = getOptionLabel(
    studentPlatformFontSizeOptions,
    preferences.fontSize,
  );

  return (
    <StudentPageShell
      eyebrow="Платформа / Настройки"
      title="Рабочие настройки"
      description="Подстроить платформу под себя. Выбирайте, что вам нужно, и ничего лишнего."
      aside={
        <>
          <div className="rounded-full border border-white/70 bg-white/85 px-4 py-2 text-sm font-medium text-slate-600">
            {hydrated ? "Применяется сразу" : "Загрузка"}
          </div>
          <div className="rounded-full border border-black/8 bg-[#2d2d2d] px-4 py-2 text-sm font-medium text-white">
            Только нужное
          </div>
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <StudentGlassPanel className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full bg-[#2d2d2d] px-3 py-1 text-white">
                5 настроек
              </Badge>
              <Badge
                variant="outline"
                className="rounded-full border-black/10 bg-white px-3 py-1 text-[#2d2d2d]"
              >
                3 режима
              </Badge>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-[20px] border border-[#2d2d2d]/10 bg-[#2d2d2d] px-4 py-3 text-white">
                <div className="text-xs font-medium text-white/70">Старт</div>
                <div className="mt-1 text-base font-semibold">
                  {defaultPageLabel}
                </div>
              </div>

              <div className="rounded-[20px] border border-black/10 bg-[#fafafa] px-4 py-3">
                <div className="text-xs font-medium text-slate-500">Меню</div>
                <div className="mt-1 text-base font-semibold text-slate-950">
                  {preferences.sidebarCollapsed ? "Свернут" : "Открыт"}
                </div>
              </div>

              <div className="rounded-[20px] border border-black/10 bg-[#fafafa] px-4 py-3">
                <div className="text-xs font-medium text-slate-500">
                  Сообщения
                </div>
                <div className="mt-1 text-base font-semibold text-slate-950">
                  {messagePreviewLabel}
                </div>
              </div>

              <div className="rounded-[20px] border border-black/10 bg-[#fafafa] px-4 py-3">
                <div className="text-xs font-medium text-slate-500">Текст</div>
                <div className="mt-1 text-base font-semibold text-slate-950">
                  {fontSizeLabel}
                </div>
              </div>
            </div>
          </StudentGlassPanel>

          <StudentGlassPanel className="p-5 sm:p-6">
            <div className="text-sm font-semibold text-slate-950">
              Основное
            </div>

            <div className="mt-4 grid gap-4">
              <SettingSelectRow
                icon={LayoutDashboard}
                title="Стартовый экран"
                note="Куда попадать первым."
                value={preferences.defaultPage}
                options={studentPlatformDefaultPageOptions}
                onValueChange={(value) => {
                  setPreference(
                    "defaultPage",
                    value as StudentPlatformPreferences["defaultPage"],
                  );
                  setFlash("saved");
                }}
              />

              <SettingSwitchRow
                icon={PanelLeft}
                title="Свернуть меню"
                note="Запоминается для большого экрана."
                checked={preferences.sidebarCollapsed}
                onCheckedChange={(checked) => {
                  setPreference("sidebarCollapsed", checked);
                  setFlash("saved");
                }}
              />

              <SettingSwitchRow
                icon={Sparkles}
                title="Рекомендации на главной"
                note="Показывать или скрывать блок."
                checked={preferences.showRecommendedCourses}
                onCheckedChange={(checked) => {
                  setPreference("showRecommendedCourses", checked);
                  setFlash("saved");
                }}
              />

              <SettingSelectRow
                icon={Mail}
                title="Вид списка сообщений"
                note="Обычный или компактный."
                value={preferences.messagePreview}
                options={studentPlatformMessagePreviewOptions}
                onValueChange={(value) => {
                  setPreference(
                    "messagePreview",
                    value as StudentPlatformPreferences["messagePreview"],
                  );
                  setFlash("saved");
                }}
              />

              <SettingSelectRow
                icon={Type}
                title="Размер текста"
                note="Обычный или крупнее по всей платформе."
                value={preferences.fontSize}
                options={studentPlatformFontSizeOptions}
                onValueChange={(value) => {
                  setPreference(
                    "fontSize",
                    value as StudentPlatformPreferences["fontSize"],
                  );
                  setFlash("saved");
                }}
              />
            </div>
          </StudentGlassPanel>
        </div>

        <div className="space-y-6">
          <StudentGlassPanel className="p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2d2d2d] text-white">
                <WandSparkles className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-950">
                  Готовые режимы
                </div>
                <div className="text-sm text-slate-600">
                  Один клик меняет всё сразу.
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              {presetItems.map((preset) => {
                const active = matchesPreferences(preferences, preset.patch);

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      patchPreferences(preset.patch);
                      setFlash("saved");
                    }}
                    className={cn(
                      "rounded-[22px] border px-4 py-4 text-left transition",
                      active
                        ? "border-[#2d2d2d] bg-[#2d2d2d] text-white"
                        : "border-black/8 bg-[#fafafa] text-slate-950 hover:border-black/15 hover:bg-white",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold">{preset.title}</div>
                      {active ? (
                        <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white">
                          Активен
                        </span>
                      ) : null}
                    </div>
                    <div
                      className={cn(
                        "mt-1 text-sm",
                        active ? "text-white/70" : "text-slate-600",
                      )}
                    >
                      {preset.note}
                    </div>
                  </button>
                );
              })}
            </div>
          </StudentGlassPanel>

          <StudentGlassPanel className="p-5 sm:p-6">
            <div className="text-sm font-semibold text-slate-950">
              Быстрые действия
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <Button
                asChild
                className="h-10 rounded-full bg-[#2d2d2d] text-white shadow-[0_14px_30px_-18px_rgba(17,17,17,0.55)] hover:bg-[#181818] sm:h-11"
              >
                <Link href={preferences.defaultPage}>
                  Открыть мой старт
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-10 rounded-full border-[#d7d7d7] bg-white text-[#2d2d2d] hover:bg-[#f6f6f6] sm:h-11"
              >
                <Link href="/platform/lessons">
                  Открыть уроки
                  <BookOpen className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-10 rounded-full border-[#d7d7d7] bg-white text-[#2d2d2d] hover:bg-[#f6f6f6] sm:h-11"
              >
                <Link href="/platform/messages">
                  Открыть сообщения
                  <MessageSquareText className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </StudentGlassPanel>

          <StudentGlassPanel className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-950">
                  Сброс
                </div>
                <div className="text-sm text-slate-600">
                  Вернуть стандарт.
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetPreferences();
                  setFlash("reset");
                }}
                className="h-10 rounded-full border-[#d7d7d7] bg-white px-4 text-[#2d2d2d] hover:bg-[#f6f6f6] sm:h-11"
              >
                <RotateCcw className="h-4 w-4" />
                Сбросить
              </Button>
            </div>

            <div
              className={cn(
                "mt-4 rounded-[20px] border px-4 py-3 text-sm",
                flash === "reset"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : flash === "saved"
                    ? "border-sky-200 bg-sky-50 text-sky-700"
                    : "border-black/8 bg-[#fafafa] text-slate-600",
              )}
            >
              {flash === "reset"
                ? "Настройки сброшены."
                : flash === "saved"
                  ? "Изменения сохранены."
                  : "Сохраняется в этом браузере."}
            </div>
          </StudentGlassPanel>
        </div>
      </div>
    </StudentPageShell>
  );
}
