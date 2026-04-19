import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Archive, MailOpen, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import React from "react";

const InboxHeader = ({
  active,
  name,
  email,
  activeHeader,
  loadingActive,
  loadingList,
  toggleStar,
  archiveMail,
  deleteMail,
  where,
  showComposeLink = true,
}: {
  active: {
    id: string;
    subject: string | null;
    sender_id: string | null;
    starred: boolean;
  };
  name: string;
  email: string | null;
  activeHeader: { dateLabel: string; timeLabel: string } | null;
  loadingActive: boolean;
  loadingList: boolean;
  toggleStar?: (id: string) => void;
  archiveMail?: (id: string) => void;
  deleteMail?: (id: string) => void;
  where?: string;
  showComposeLink?: boolean;
}) => {
  return (
    <div className="bg-[#f8fafd] flex items-center justify-between gap-3 p-4">
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold">
          {active?.subject ??
            (loadingActive ? "Загрузка..." : "Выберите письмо")}
        </div>

        {active ? (
          <div className="truncate text-xs text-muted-foreground">
            От: <span className="text-foreground font-medium">{name}</span>{" "}
            <span className="">&lt;{email}&gt;</span>
            <span className="mx-2 text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              {activeHeader?.dateLabel} {activeHeader?.timeLabel}
            </span>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            {loadingList
              ? "Загрузка писем..."
              : "Слева список входящих сообщений"}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {toggleStar && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-xl"
            disabled={!active}
            onClick={() => active && toggleStar(active.id)}
            aria-label="Star"
          >
            <Star
              className={cn(
                "h-4 w-4",
                active?.starred ? "text-foreground" : "text-muted-foreground",
              )}
            />
          </Button>
        )}

        {showComposeLink && where ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-xl"
            disabled={!active}
            aria-label="Open compose"
          >
            <Link href={`/dashboard/${where}/inbox/send`}>
              <MailOpen className="h-4 w-4 text-muted-foreground" />
            </Link>
          </Button>
        ) : null}

        {archiveMail && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-xl"
            disabled={!active}
            onClick={() => active && archiveMail(active.id)}
            aria-label="Archive"
          >
            <Archive className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}

        {deleteMail && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-xl"
            disabled={!active}
            onClick={() => active && deleteMail(active.id)}
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default InboxHeader;
