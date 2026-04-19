"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { APPLICATION_STATUS_META } from "./constants";
import { getUrlPreview } from "./utils";

export function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="border border-zinc-300 bg-white p-4">
      <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
        {value}
      </div>
      <div className="mt-2 text-sm leading-5 text-zinc-600">{note}</div>
    </div>
  );
}

export function ApplicationStatusBadge({
  status,
}: {
  status: keyof typeof APPLICATION_STATUS_META;
}) {
  const meta = APPLICATION_STATUS_META[status];

  return (
    <Badge
      variant="outline"
      className={cn("rounded-full border px-3 py-1 text-[11px]", meta.className)}
    >
      {meta.label}
    </Badge>
  );
}

export function CourseMetaBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full border px-3 py-1 text-[11px]", className)}
    >
      {children}
    </Badge>
  );
}

export function LinkField({
  label,
  href,
}: {
  label: string;
  href?: string | null;
}) {
  return (
    <div className="border border-zinc-200 bg-white p-4">
      <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </div>

      {href ? (
        <div className="mt-3 space-y-3">
          <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-[11px] leading-5 text-zinc-700 break-all">
            {href}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs leading-5 text-zinc-500">
              {getUrlPreview(href)}
            </div>

            <Button asChild variant="outline" size="sm">
              <a href={href} target="_blank" rel="noreferrer">
                Открыть
              </a>
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Материал не приложен.
        </p>
      )}
    </div>
  );
}

export function CompactLinkCell({
  label,
  href,
}: {
  label: string;
  href?: string | null;
}) {
  if (!href) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <div
        title={href}
        className="min-w-0 flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1 font-mono text-[11px] text-zinc-700"
      >
        <div className="truncate">
          <span className="text-zinc-500">{label}: </span>
          {getUrlPreview(href)}
        </div>
      </div>

      <Button asChild variant="outline" size="xs">
        <a href={href} target="_blank" rel="noreferrer">
          Открыть
        </a>
      </Button>
    </div>
  );
}
