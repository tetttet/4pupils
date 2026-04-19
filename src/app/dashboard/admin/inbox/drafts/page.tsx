import InboxView from "@/components/dashboard/admin/inbox/inbox-view";

export default function DraftPage() {
  return <InboxView folder="draft" breadcrumbLabel="Черновики" isQuickView />;
}