"use client";

import Image from "next/image";

import { Logo } from "@/components/layout/logo";
import { brand } from "@/lib/brand";

const signUpPhotoSrc = "/images/bg/bg-article.jpg";

export function SignUpRightPanel() {
  return (
    <div className="relative hidden overflow-hidden border-l bg-black lg:block">
      {/* Replace signUpPhotoSrc above when the final sign-up photo is ready. */}
      <Image
        src={signUpPhotoSrc}
        alt="Учебное пространство"
        fill
        priority
        sizes="50vw"
        className="object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-black/45" />

      <div className="relative z-10 flex h-full min-h-screen flex-col p-10 text-white">
        <div className="inline-flex w-fit rounded-md bg-white/90 px-3 py-2 shadow-sm">
          <Logo />
        </div>

        <div className="mt-auto max-w-xl space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
            {brand.name}
          </p>
          <h2 className="text-5xl font-bold leading-tight">
            Начните обучение в своём кабинете
          </h2>
          <p className="max-w-md text-base leading-relaxed text-white/80">
            Создайте аккаунт, выберите роль и получите доступ к курсам,
            материалам и инструментам платформы.
          </p>
          <div className="flex max-w-md items-center gap-4 border-t border-white/25 pt-5">
            <p className="text-sm text-white/75">
              Регистрация занимает пару шагов: профиль, доступ и сразу можно
              продолжать работу.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
