"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  Archive,
  Inbox as InboxIcon,
  Search,
  Send,
  Star,
} from "lucide-react";

import type { MailListItem } from "@/types/mail";
import Tags from "@/components/ui/tags";
import DateShow from "@/components/ui/date-show";
import FancyAvatar from "@/components/ui/fancy-avatar";

const MailItem = ({
  m,
  isActive,
  collapsed,
  openMail,
}: {
  m: MailListItem;
  isActive: boolean;
  collapsed: boolean;
  openMail: (id: string) => void;
}) => {
  const name = m.sender
    ? `${m.sender.first_name} ${m.sender.last_name}`.trim()
    : "Неизвестный отправитель";

  return (
    <button
      key={m.mail_id}
      type="button"
      onClick={() => openMail(m.mail_id)}
      className={cn(
        "w-full rounded-md border p-3 text-left transition",
        "hover:bg-primary/5 hover:border-primary/40",
        isActive ? "border-primary/30 bg-primary/10" : "border-border bg-card",
        m.starred &&
          "border-yellow-400/50 bg-yellow-50/50 hover:bg-yellow-50/70 hover:border-yellow-400/70",
        collapsed && "p-2",
      )}
    >
      <div className="flex items-start gap-3">
        <FancyAvatar name={name} />

        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="truncate --web-kit-text font-semibold capitalize mb-0.5">
                {name}
              </div>

              <DateShow created_at={m.created_at} />
            </div>
            <div className="flex items-center gap-2">
              <div className="truncate text-[12px] font-bold text-foreground/80">
                {m.subject || "—"}
              </div>

              {m.starred && (
                <Star className="h-4 w-4 shrink-0 text-foreground/70" />
              )}

              {m.unread && (
                <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
              )}
            </div>

            <div className="mt-0.5 flex items-center gap-2">
              <div
                className={cn(
                  "text-[12px]",
                  m.unread ? "font-medium" : "text-foreground/80",
                )}
              >
                {m.preview || "—"}
              </div>
            </div>

            <div className="mt-2">
              <Tags m={m} />
            </div>
          </div>
        )}
      </div>

      {collapsed && (
        <div className="mt-2 flex items-center justify-between">
          {m.unread ? (
            <span className="h-2 w-2 rounded-full bg-primary" />
          ) : (
            <span className="h-2 w-2 rounded-full bg-muted" />
          )}

          {m.starred ? (
            <Star className="h-4 w-4 text-foreground/70" />
          ) : (
            <span className="h-4 w-4" />
          )}
        </div>
      )}
    </button>
  );
};

const InboxSidebar = ({
  collapsed,
  unreadCount,
  query,
  setQuery,
  filtered,
  activeId,
  openMail,
  onCompose,
  onOpenArchive,
  showComposeAction = true,
}: {
  collapsed: boolean;
  unreadCount: number;
  query: string;
  setQuery: (v: string) => void;
  filtered: MailListItem[];
  activeId: string; // хранит mail_id
  openMail: (id: string) => void;
  onCompose?: () => void;
  onOpenArchive?: () => void;
  showComposeAction?: boolean;
}) => {
  return (
    <aside className="sticky top-0 h-screen bg-card/40 backdrop-blur supports-backdrop-filter:bg-card/30">
      <div className="flex h-full flex-col bg-[#f8fafd]">
        {/* top bar */}
        <div className="flex items-center gap-2 p-4">
          <div className="flex items-center gap-2">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f3f4f6] text-black/70">
              <InboxIcon className="h-5 w-5" />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <div className="truncate --web-kit-text font-semibold">
                  Почта
                </div>
                <div className="truncate text-[11px] text-muted-foreground">
                  Непрочитано:{" "}
                  <span className="font-medium text-foreground">
                    {unreadCount}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* <div className="ml-auto flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setCollapsed(!collapsed)}
              aria-label="Toggle sidebar"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div> */}
        </div>

        {!collapsed && (
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск писем…"
                className="h-10 rounded-md pl-9"
              />
            </div>
          </div>
        )}

        <ScrollArea className="h-[calc(100vh-190px)]">
          <div className={cn("p-2", collapsed && "p-3")}>
            {filtered.length === 0 ? (
              <div className="px-3 py-10 text-center text-sm text-muted-foreground">
                Ничего не найдено
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((m) => {
                  const isActive = m.mail_id === activeId;
                  return (
                    <MailItem
                      key={m.mail_id}
                      m={m}
                      isActive={isActive}
                      collapsed={collapsed}
                      openMail={openMail}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* bottom actions */}
        <div className={cn("p-3", collapsed && "p-3")}>
          <div
            className={cn(
              "grid gap-2",
              !showComposeAction || collapsed ? "grid-cols-1" : "grid-cols-2",
            )}
          >
            {showComposeAction ? (
              <Button
                type="button"
                className={cn("", collapsed && "px-0")}
                onClick={onCompose}
              >
                <Send className="mr-2 h-4 w-4" />
                {!collapsed && "Написать"}
              </Button>
            ) : null}

            <Button
              type="button"
              variant="outline"
              className={cn("", collapsed && "px-0")}
              onClick={onOpenArchive}
            >
              <Archive className="mr-2 h-4 w-4" />
              {!collapsed && "Архив"}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default InboxSidebar;
