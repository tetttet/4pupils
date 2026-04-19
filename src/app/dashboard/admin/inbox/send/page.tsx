"use client";
import InboxBroadcast from "@/components/dashboard/admin/inbox/inbox-broadcast";
import InboxMyMessage from "@/components/dashboard/admin/inbox/inbox-my-message";
import InboxSend from "@/components/dashboard/admin/inbox/inbox-send";
import { AppBreadcrumb } from "@/components/ui/app-breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useState } from "react";

const breadcrumbsByTab = {
  "my-messages": [
    { label: "Главная", href: "/dashboard" },
    { label: "Почта", href: "/dashboard/admin/inbox" },
    { label: "Отправить", href: "/dashboard/admin/inbox/send" },
    { label: "Мои сообщения" },
  ],
  "send-message": [
    { label: "Главная", href: "/dashboard" },
    { label: "Почта", href: "/dashboard/admin/inbox" },
    { label: "Отправить", href: "/dashboard/admin/inbox/send" },
    { label: "Отправить сообщение" },
  ],
  broadcast: [
    { label: "Главная", href: "/dashboard" },
    { label: "Почта", href: "/dashboard/admin/inbox" },
    { label: "Отправить", href: "/dashboard/admin/inbox/send" },
    { label: "Рассылка" },
  ],
} as const;

const tabTriggerClass = cn(
  "relative rounded-none px-8 py-4 text-sm font-medium",
  "text-muted-foreground transition-colors",
  "hover:text-foreground",
  "data-[state=active]:text-foreground",
  "data-[state=active]:after:absolute",
  "data-[state=active]:after:left-0",
  "data-[state=active]:after:right-0",
  "data-[state=active]:after:-bottom-px",
  "data-[state=active]:after:h-[2px]",
  "data-[state=active]:after:bg-primary",
);

const Page = () => {
  const [tab, setTab] = useState<
    "my-messages" | "send-message" | "broadcast"
  >("my-messages");

  return (
    <Tabs
      value={tab}
      onValueChange={(v) => setTab(v as typeof tab)}
      className="w-full"
    >
      {/* 🔝 Breadcrumb всегда сверху, но динамический */}
      <AppBreadcrumb items={[...breadcrumbsByTab[tab]]} />

      <TabsList className="h-auto rounded-none bg-transparent border-b border-border p-0 -mt-2">
        <TabsTrigger value="my-messages" className={`--web-kit-text ${tabTriggerClass}`}>
          Мои сообщения
        </TabsTrigger>
        <TabsTrigger value="send-message" className={`--web-kit-text ${tabTriggerClass}`}>
          Отправить сообщение
        </TabsTrigger>
        <TabsTrigger value="broadcast" className={`--web-kit-text ${tabTriggerClass}`}>
          Сделать рассылку
        </TabsTrigger>
      </TabsList>

      <TabsContent value="my-messages">
        <InboxMyMessage />
      </TabsContent>

      <TabsContent value="send-message">
        <InboxSend />
      </TabsContent>

      <TabsContent value="broadcast">
        <InboxBroadcast />
      </TabsContent>
    </Tabs>
  );
};

export default Page;

