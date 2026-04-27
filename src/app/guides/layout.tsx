import type { ReactNode } from "react";
import HeaderGuides from "@/components/docs/layout/header-guides";
import { getPopularGuides } from "@/lib/guides";

function getShortGuideTitle(title: string) {
  return title.split(/\s+[—–-]\s+/)[0]?.trim() || title;
}

export default function GuidesLayout({ children }: { children: ReactNode }) {
  const latestGuideLinks = getPopularGuides(2).map((guide) => ({
    href: `/guides/${guide.slug}`,
    label: getShortGuideTitle(guide.frontmatter.title),
  }));

  return (
    <>
      <HeaderGuides links={latestGuideLinks} />
      {children}
    </>
  );
}
