import InboxView from "@/components/dashboard/admin/inbox/inbox-view";

export default function SentPage() {
  return <InboxView folder="sent" breadcrumbLabel="Отправленные" isQuickView />;
}