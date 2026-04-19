import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import React from "react";

const InboxDetails = ({
  active,
  tags,
}: {
  active: {
    id: string;
    unread: boolean;
    starred: boolean;
    important: boolean;
    attachments: unknown[];
  };
  tags: string[];
}) => {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-base">Детали</CardTitle>
        <CardDescription>Информация по письму и меткам.</CardDescription>
      </CardHeader>

      <CardContent className="grid gap-3 text-sm">
        <div className="flex items-center justify-between rounded-xl border p-3">
          <div className="text-muted-foreground">Статус</div>
          <div className="font-medium">
            {active.unread ? "Не прочитано" : "Прочитано"}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border p-3">
          <div className="text-muted-foreground">Метки</div>
          <div className="font-medium">
            {tags.length ? tags.join(", ") : "—"}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border p-3">
          <div className="text-muted-foreground">⭐ Starred</div>
          <div className="font-medium">{active.starred ? "Да" : "Нет"}</div>
        </div>

        <div className="flex items-center justify-between rounded-xl border p-3">
          <div className="text-muted-foreground">Важно</div>
          <div className="font-medium">{active.important ? "Да" : "Нет"}</div>
        </div>

        <div className="flex items-center justify-between rounded-xl border p-3">
          <div className="text-muted-foreground">Вложений</div>
          <div className="font-medium">
            {Array.isArray(active.attachments) ? active.attachments.length : 0}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InboxDetails;
