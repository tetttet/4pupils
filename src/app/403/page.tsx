import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "403 | Доступ запрещен",
  description: "У пользователя нет прав для просмотра этой страницы.",
};

export default function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <ShieldAlert className="h-16 w-16 text-red-500" />
      <h1 className="mt-4 text-2xl font-bold text-gray-900">403</h1>
      <p className="text-lg text-gray-600">Доступ запрещен</p>
      <p className="text-muted-foreground p-2 mx-auto text-center">
        У пользователя нет прав для просмотра этой страницы.
      </p>
      <Button asChild className="mt-4">
        <Link href="/">Вернуться на главную</Link>
      </Button>
    </div>
  );
}
