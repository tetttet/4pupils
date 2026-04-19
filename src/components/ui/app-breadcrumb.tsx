"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type Crumb = {
  label: React.ReactNode;
  href?: string; // если нет href — считается текущей страницей
};

type SegmentLabelMap =
  | Record<string, React.ReactNode>
  | ((segment: string, href: string) => React.ReactNode | null | undefined);

type AppBreadcrumbProps = {
  /** Явно переданные крошки — самый предсказуемый вариант */
  items?: Crumb[];

  /** Автогенерация из pathname */
  autoFromPath?: boolean;

  /** Домой */
  homeLabel?: React.ReactNode;
  homeHref?: string;

  /**
   * Маппинг сегментов:
   * - объект: { users: "Пользователи" }
   * - функция: (segment, href) => "..." (можно скрывать сегменты, возвращая null)
   */
  labels?: SegmentLabelMap;

  /** Максимум крошек, иначе показываем ... в центре */
  maxItems?: number;

  className?: string;
};

function defaultLabelize(seg: string) {
  // decode + чуть-чуть “человечности”
  const s = decodeURIComponent(seg);
  return s.replace(/[-_]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function buildFromPath(
  pathname: string,
  labels?: SegmentLabelMap,
  homeLabel: React.ReactNode = "Главная",
  homeHref = "/",
): Crumb[] {
  const clean = pathname.split("?")[0].split("#")[0];
  const segments = clean.split("/").filter(Boolean);

  const crumbs: Crumb[] = [{ label: homeLabel, href: homeHref }];

  let acc = "";
  for (const seg of segments) {
    acc += `/${seg}`;
    const href = acc;

    let label: React.ReactNode | null | undefined;
    if (typeof labels === "function") label = labels(seg, href);
    else if (labels && seg in labels) label = labels[seg];

    // если label === null → скрываем сегмент
    if (label === null) continue;

    crumbs.push({
      label: label ?? defaultLabelize(seg),
      href, // пока ставим href, текущую страницу отметим ниже
    });
  }

  // Последнюю делаем “current” (без href)
  if (crumbs.length > 0) {
    const last = crumbs[crumbs.length - 1];
    crumbs[crumbs.length - 1] = { label: last.label };
  }

  return crumbs;
}

function collapseMiddle(items: Crumb[], maxItems: number) {
  if (items.length <= maxItems) return { head: items, tail: [] as Crumb[] };

  // сохраняем: 2 первых + 2 последних (можно настроить)
  const headCount = 2;
  const tailCount = 2;

  const head = items.slice(0, headCount);
  const tail = items.slice(items.length - tailCount);

  return { head, tail };
}

export function AppBreadcrumb({
  items,
  autoFromPath = false,
  homeLabel = "Главная",
  homeHref = "/",
  labels,
  maxItems = 6,
  className,
}: AppBreadcrumbProps) {
  const pathname = usePathname();

  const computed = React.useMemo(() => {
    if (items?.length) return items;
    if (autoFromPath)
      return buildFromPath(pathname || "/", labels, homeLabel, homeHref);
    // по умолчанию хотя бы “Главная”
    return [{ label: homeLabel, href: homeHref }];
  }, [items, autoFromPath, pathname, labels, homeLabel, homeHref]);

  // нормализуем: если у последней есть href — считаем её текущей
  const normalized = React.useMemo(() => {
    if (!computed.length) return computed;
    const last = computed[computed.length - 1];
    if (last.href) {
      return [...computed.slice(0, -1), { label: last.label }];
    }
    return computed;
  }, [computed]);

  const { head, tail } = React.useMemo(
    () => collapseMiddle(normalized, maxItems),
    [normalized, maxItems],
  );

  const showEllipsis = tail.length > 0;

  return (
    <Breadcrumb
      className={`${className} px-4 py-2 border-b bg-background/70 backdrop-blur supports-backdrop-filter:bg-background/60`}
    >
      <BreadcrumbList>
        {head.map((c, idx) => {
          const isLast = !showEllipsis && idx === head.length - 1;
          return (
            <React.Fragment key={`h-${idx}`}>
              <BreadcrumbItem className="min-w-0 --web-kit-text cursor-pointer">
                {c.href && !isLast ? (
                  <BreadcrumbLink asChild className="truncate">
                    <Link
                      href={c.href}
                      className="text-[#6d727b] hover:text-[rgba(255,255,255,0.7)]"
                    >
                      {c.label}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="truncate text-[#6e737c] hover:text-black font-semibold">
                    {c.label}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {(idx < head.length - 1 || showEllipsis) && (
                <BreadcrumbSeparator className="text-black" />
              )}
            </React.Fragment>
          );
        })}

        {showEllipsis && (
          <>
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-black" />

            {tail.map((c, idx) => {
              const isLast = idx === tail.length - 1;
              return (
                <React.Fragment key={`t-${idx}`}>
                  <BreadcrumbItem className="min-w-0">
                    {c.href && !isLast ? (
                      <BreadcrumbLink asChild className="truncate">
                        <Link
                          href={c.href}
                          className="text-[#6d727b] hover:text-[rgba(255,255,255,0.7)]"
                        >
                          {c.label}
                        </Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="truncate text-[#6e737c] hover:text-[rgba(255,255,255,0.7)] font-semibold">
                        {c.label}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {idx < tail.length - 1 && (
                    <BreadcrumbSeparator className="text-black" />
                  )}
                </React.Fragment>
              );
            })}
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
