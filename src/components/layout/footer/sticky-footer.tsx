import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import { footerActionLinks, footerLinkGroups } from "./nav-links";

export function StickyFooter() {
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
