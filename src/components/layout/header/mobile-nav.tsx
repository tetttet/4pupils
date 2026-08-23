"use client";

import { Logo } from "@/components/layout/logo";
import { MobileMenuShell } from "@/components/layout/header/mobile-menu-shell";
import { authLink, headerLinks } from "@/components/layout/header/nav-links";

export function MobileNav({ home = false }: { home?: boolean }) {
  return (
    <MobileMenuShell
      action={authLink}
      closeOnWidth={home ? 1280 : 768}
      links={headerLinks}
      menuId="site-mobile-menu"
      overlayBrand={
        <Logo className="rounded-full bg-white px-3 py-2 hover:bg-white" />
      }
      responsiveClassName={home ? "xl:hidden" : "md:hidden"}
    />
  );
}
