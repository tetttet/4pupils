import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Logo } from "@/components/layout/logo";

type AuthMode = "sign-in" | "sign-up";

type AuthShellProps = {
  children: ReactNode;
  mode: AuthMode;
};

const panelContent = {
  "sign-in": {
    label: "4P Education",
    title: "Добро пожаловать обратно",
    description:
      "Продолжайте обучение, работайте с материалами и следите за своим прогрессом в едином личном кабинете.",
    note: "Курсы, задания и обратная связь — в одном пространстве.",
  },
  "sign-up": {
    label: "4P Education",
    title: "Образование начинается с первого шага",
    description:
      "Создайте аккаунт, выберите свою роль и получите доступ к возможностям образовательной платформы.",
    note: "Регистрация займёт не больше пары минут.",
  },
} as const;

const authPhotoSrc = "/images/bg/bg-article.jpg";

export function AuthShell({ children, mode }: AuthShellProps) {
  const content = panelContent[mode];

  return (
    <main className="min-h-screen bg-[#F4F6F8]">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="flex min-h-screen flex-col bg-white px-5 py-5 sm:px-8 sm:py-7 lg:px-10 xl:px-14">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <Logo className="shrink-0 [&_img]:h-auto [&_img]:w-[130px] sm:[&_img]:w-[150px]" />
            <Link
              href="/o"
              className="group inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3.5 text-[12px] font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50 sm:px-4 sm:text-[13px]"
            >
              <ArrowLeftIcon
                aria-hidden="true"
                className="size-3.5 transition-transform group-hover:-translate-x-0.5"
              />
              На главную
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center py-10 sm:py-14 lg:py-12">
            <div className="w-full max-w-[440px]">{children}</div>
          </div>

          <p className="border-t border-slate-200 pt-5 text-[11px] text-slate-400">
            © {new Date().getFullYear()} 4P Education
          </p>
        </section>

        <aside className="relative hidden min-h-screen overflow-hidden bg-slate-950 lg:block">
          <Image
            src={authPhotoSrc}
            alt="Библиотека образовательной платформы"
            fill
            priority
            sizes="50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,14,22,0.28)_0%,rgba(4,14,22,0.20)_35%,rgba(4,14,22,0.94)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 p-10 text-white xl:p-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">
              {content.label}
            </p>
            <h2 className="mt-5 max-w-[570px] text-[42px] font-semibold leading-[1.05] tracking-[-0.035em] xl:text-[54px]">
              {content.title}
            </h2>
            <p className="mt-5 max-w-[520px] text-[14px] leading-7 text-white/75 xl:text-[15px]">
              {content.description}
            </p>
            <div className="mt-8 max-w-[520px] border-t border-white/25 pt-5">
              <p className="text-[12px] font-medium text-white/70">
                {content.note}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
