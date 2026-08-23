"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import { footerActionLinks, footerLinkGroups } from "./nav-links";

export function StickyFooter() {
  const pathname = usePathname();
  const isHome = pathname === "/o" || pathname === "/o/";

  if (isHome) {
    return (
      <footer className="w-full bg-[#F3F5FF] pb-4 sm:pb-5">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-5">
          <div className="relative isolate overflow-hidden rounded-[30px] bg-[#202858] px-6 pb-6 pt-9 text-white sm:rounded-[34px] sm:px-9 sm:pb-7 sm:pt-11 lg:px-12">
            <div className="pointer-events-none absolute -bottom-56 -right-32 -z-10 size-[560px] rounded-full border-[96px] border-[#5D75CB] opacity-30" />
            <div className="pointer-events-none absolute -left-32 -top-44 -z-10 size-[420px] rounded-full border-[76px] border-white opacity-[0.035]" />

            <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
              <div className="max-w-sm">
                <div className="inline-flex rounded-[18px] bg-white px-4 py-2">
                  <Logo />
                </div>
                <p className="mt-6 text-[13px] leading-6 text-white/[0.68] sm:text-[14px]">
                  Мы помогаем преподавателям и образовательным командам по всему
                  миру, предоставляя современные, открытые и гибкие решения для
                  онлайн-обучения и развития.
                </p>
                <div className="mt-7 flex flex-wrap gap-2">
                  {footerActionLinks.map((link) => (
                    <a
                      aria-label={link.title}
                      className="grid size-10 place-items-center rounded-full border border-white/[0.14] bg-white/[0.07] text-white/80 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-[#233067]"
                      href={link.href}
                      key={link.title}
                    >
                      <link.icon className="size-4" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-3">
                {footerLinkGroups.map((group) => (
                  <div key={group.label}>
                    <h3 className="text-[12px] font-medium uppercase tracking-[0.12em] text-white/45">
                      {group.label}
                    </h3>
                    <ul className="mt-5 space-y-3 text-[13px] text-white/[0.72] sm:text-[14px]">
                      {group.links.map((link) => (
                        <li key={link.title}>
                          <a
                            className="inline-flex items-center transition duration-200 hover:translate-x-0.5 hover:text-white"
                            href={link.href}
                          >
                            {link.icon ? (
                              <link.icon className="me-1.5 size-4" />
                            ) : null}
                            {link.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-11 flex flex-col items-start justify-between gap-3 border-t border-white/[0.12] pt-6 text-[12px] text-white/50 sm:flex-row sm:items-center sm:text-[13px]">
              <p>
                &copy; {new Date().getFullYear()} <b>{brand.name}</b>, Все права
                защищены.
              </p>
              <Link
                className="transition-colors hover:text-white"
                href="/docs/privacy-policy"
              >
                Политика конфиденциальности
              </Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="w-full border-t bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="w-full min-w-2xs max-w-sm space-y-4">
            <Logo />
            <p className="text-muted-foreground text-sm">
              Мы помогаем преподавателям и образовательным командам по всему
              миру, предоставляя современные, открытые и гибкие решения для
              онлайн-обучения и развития.
            </p>
            <div className="flex gap-2">
              {footerActionLinks.map((link) => (
                <Button
                  asChild
                  key={link.title}
                  size="icon-sm"
                  variant="outline"
                >
                  <a aria-label={link.title} href={link.href}>
                    <link.icon className="size-4" />
                  </a>
                </Button>
              ))}
            </div>
          </div>
          <div className="grid w-full gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {footerLinkGroups.map((group) => (
              <div key={group.label}>
                <h3 className="text-sm uppercase">{group.label}</h3>
                <ul className="mt-4 space-y-2 text-muted-foreground text-sm md:text-xs lg:text-sm">
                  {group.links.map((link) => (
                    <li key={link.title}>
                      <a
                        className="inline-flex items-center transition-colors hover:text-foreground"
                        href={link.href}
                      >
                        {link.icon && <link.icon className="me-1 size-4" />}
                        {link.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-2 border-t pt-4 text-muted-foreground text-sm md:flex-row">
          <p>
            &copy; {new Date().getFullYear()} <b>{brand.name}</b>, Все права
            защищены.
          </p>
          <Link className="hover:text-foreground" href="/docs/privacy-policy">
            Политика конфиденциальности
          </Link>
        </div>
      </div>
    </footer>
  );
}
