"use client";

import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Compass,
  GraduationCap,
  LayoutDashboard,
  Layers3,
  MessageSquareText,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import type { AtlasCardVisual } from "@/lib/atlas/types";

type AtlasVisualConfig = {
  gradientClassName: string;
  icon: LucideIcon;
  iconClassName: string;
  orbClassName: string;
};

const visualConfig: Record<AtlasCardVisual, AtlasVisualConfig> = {
  sparkles: {
    gradientClassName:
      "from-emerald-200/90 via-white to-teal-100 dark:from-emerald-500/20 dark:via-white/5 dark:to-teal-400/20",
    icon: Sparkles,
    iconClassName: "text-emerald-700 dark:text-emerald-300",
    orbClassName: "bg-emerald-400/20 dark:bg-emerald-300/10",
  },
  compass: {
    gradientClassName:
      "from-sky-200/90 via-white to-cyan-100 dark:from-sky-500/20 dark:via-white/5 dark:to-cyan-400/20",
    icon: Compass,
    iconClassName: "text-sky-700 dark:text-sky-300",
    orbClassName: "bg-sky-400/20 dark:bg-sky-300/10",
  },
  layers: {
    gradientClassName:
      "from-slate-200/90 via-white to-zinc-100 dark:from-slate-400/20 dark:via-white/5 dark:to-zinc-300/20",
    icon: Layers3,
    iconClassName: "text-slate-700 dark:text-slate-200",
    orbClassName: "bg-slate-400/20 dark:bg-slate-200/10",
  },
  shield: {
    gradientClassName:
      "from-amber-200/90 via-white to-orange-100 dark:from-amber-500/20 dark:via-white/5 dark:to-orange-400/20",
    icon: ShieldCheck,
    iconClassName: "text-amber-700 dark:text-amber-300",
    orbClassName: "bg-amber-400/20 dark:bg-amber-300/10",
  },
  book: {
    gradientClassName:
      "from-violet-200/90 via-white to-fuchsia-100 dark:from-violet-500/20 dark:via-white/5 dark:to-fuchsia-400/20",
    icon: BookOpen,
    iconClassName: "text-violet-700 dark:text-violet-300",
    orbClassName: "bg-violet-400/20 dark:bg-violet-300/10",
  },
  messages: {
    gradientClassName:
      "from-cyan-200/90 via-white to-sky-100 dark:from-cyan-500/20 dark:via-white/5 dark:to-sky-400/20",
    icon: MessageSquareText,
    iconClassName: "text-cyan-700 dark:text-cyan-300",
    orbClassName: "bg-cyan-400/20 dark:bg-cyan-300/10",
  },
  dashboard: {
    gradientClassName:
      "from-stone-200/90 via-white to-zinc-100 dark:from-stone-400/20 dark:via-white/5 dark:to-zinc-300/20",
    icon: LayoutDashboard,
    iconClassName: "text-stone-700 dark:text-stone-200",
    orbClassName: "bg-stone-400/20 dark:bg-stone-200/10",
  },
  users: {
    gradientClassName:
      "from-rose-200/90 via-white to-pink-100 dark:from-rose-500/20 dark:via-white/5 dark:to-pink-400/20",
    icon: Users,
    iconClassName: "text-rose-700 dark:text-rose-300",
    orbClassName: "bg-rose-400/20 dark:bg-rose-300/10",
  },
  courses: {
    gradientClassName:
      "from-blue-200/90 via-white to-indigo-100 dark:from-blue-500/20 dark:via-white/5 dark:to-indigo-400/20",
    icon: GraduationCap,
    iconClassName: "text-blue-700 dark:text-blue-300",
    orbClassName: "bg-blue-400/20 dark:bg-blue-300/10",
  },
  settings: {
    gradientClassName:
      "from-neutral-200/90 via-white to-slate-100 dark:from-neutral-400/20 dark:via-white/5 dark:to-slate-300/20",
    icon: Settings2,
    iconClassName: "text-neutral-700 dark:text-neutral-200",
    orbClassName: "bg-neutral-400/20 dark:bg-neutral-200/10",
  },
};

export function getAtlasVisualConfig(visual: AtlasCardVisual) {
  return visualConfig[visual];
}
