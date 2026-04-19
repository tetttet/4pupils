import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

const InboxNoMessage = () => {
  return (
    <div className="grid h-full place-items-center">
      <Card className="max-w-lg rounded-md">
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
          <CardDescription>
            Выберите письмо слева, чтобы увидеть содержимое.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Тут просмотр письма: шапка, текст, теги, вложения и быстрые действия.
        </CardContent>
      </Card>
    </div>
  );
};

export default InboxNoMessage;
