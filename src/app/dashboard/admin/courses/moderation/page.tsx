import ModerationQueue from "@/components/dashboard/admin/courses/moderation-queue";
import DashHeader from "@/components/ui/dash-header";

export default function AdminModerationPage() {
  return (
    <div className="space-y-4">
      <DashHeader
        title="Модерация курсов"
        subtitle="Просматривай отправленные курсы и принимай решение."
      />

      <div className="px-4 space-y-2">
        <ModerationQueue />
      </div>
    </div>
  );
}
