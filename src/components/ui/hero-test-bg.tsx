import React from "react";
import { BookOpen } from "lucide-react";

export function HeroBackgroundTest() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Основной фон */}
      <div className="absolute inset-0 bg-[#5D75CB]" />

      {/* Мягкий градиент */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.10),transparent_30%),linear-gradient(135deg,#5D75CB_0%,#4C63B8_100%)]" />

      {/* Сетка */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)
          `,
          backgroundSize: "42px 42px",
        }}
      />

      {/* Световые пятна */}
      <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-indigo-200/10 blur-3xl" />

      {/* Лёгкий watermark */}
      <div className="absolute right-4 top-4 opacity-[0.06]">
        <BookOpen className="h-52 w-52 text-white" />
      </div>

      {/* Затемнение снизу */}
      <div className="absolute inset-0 bg-linear-to-b from-white/5 via-transparent to-black/10" />
    </div>
  );
}

export default HeroBackgroundTest;
