import React from "react";

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysDiff(from: Date, to: Date) {
  const ms = startOfDay(from).getTime() - startOfDay(to).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDateSmart(iso: string) {
  const date = new Date(iso);
  const now = new Date();

  const diff = daysDiff(now, date);

  if (diff === 0) {
    return `Сегодня, ${fmtTime(date)}`;
  }

  if (diff === 1) {
    return `Вчера, ${fmtTime(date)}`;
  }

  if (diff === 2) {
    return `Позавчера, ${fmtTime(date)}`;
  }

  if (diff < 7) {
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const DateShow = ({ created_at }: { created_at: string }) => {
  return (
    <div className="ml-auto shrink-0 text-xs text-muted-foreground">
      {fmtDateSmart(created_at)}
    </div>
  );
};

export default DateShow;
