import TeacherInboxShell from "@/components/dashboard/teacher/inbox/teacher-inbox-shell";

export default function TeacherDraftsPage() {
  return (
    <TeacherInboxShell
      folder="draft"
      breadcrumbLabel="Черновики"
      isQuickView
    />
  );
}
