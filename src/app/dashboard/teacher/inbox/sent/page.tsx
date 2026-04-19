import TeacherInboxShell from "@/components/dashboard/teacher/inbox/teacher-inbox-shell";

export default function TeacherSentPage() {
  return (
    <TeacherInboxShell
      folder="sent"
      breadcrumbLabel="Отправленные"
      isQuickView
    />
  );
}
