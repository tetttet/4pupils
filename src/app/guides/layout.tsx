import type { ReactNode } from "react";
import HeaderGuides from "@/components/docs/layout/header-guides";
import { getPopularGuides } from "@/lib/guides";

const MAX_GUIDE_NAV_LABEL_LENGTH = 24;

const guideNavTitleAliases = [
  {
    pattern: /урок/i,
    secondaryPattern: /расписан/i,
    label: "Уроки и расписание",
  },
  {
    pattern: /доступ/i,
    secondaryPattern: /заяв/i,
    label: "Доступы и заявки",
  },
  {
    pattern: /онлайн-образован/i,
    secondaryPattern: /технолог/i,
    label: "Онлайн-образование",
  },
];

function fitGuideNavLabel(title: string) {
  if (title.length <= MAX_GUIDE_NAV_LABEL_LENGTH) {
    return title;
  }

  return `${title.slice(0, MAX_GUIDE_NAV_LABEL_LENGTH - 3).trim()}...`;
}

function getShortGuideTitle(title: string) {
  const normalizedTitle = title.replace(/\s+/g, " ").trim();
  const matchedAlias = guideNavTitleAliases.find(
    ({ pattern, secondaryPattern }) =>
      pattern.test(normalizedTitle) && secondaryPattern.test(normalizedTitle),
  );

  if (matchedAlias) {
    return matchedAlias.label;
  }

  const titleBeforeDash =
    normalizedTitle.split(/\s+[—–-]\s+/)[0]?.trim() || normalizedTitle;
  const withoutBrand = titleBeforeDash
    .replace(/\s+(?:в|на)\s+4pupils$/i, "")
    .trim();

  return fitGuideNavLabel(withoutBrand || titleBeforeDash);
}

export default function GuidesLayout({ children }: { children: ReactNode }) {
  const latestGuideLinks = getPopularGuides(2).map((guide) => ({
    href: `/guides/${guide.slug}`,
    label: getShortGuideTitle(guide.frontmatter.title),
    title: guide.frontmatter.title,
  }));

  return (
    <>
      <HeaderGuides links={latestGuideLinks} />
      {children}
    </>
  );
}
