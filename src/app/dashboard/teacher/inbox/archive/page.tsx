import TeacherInboxShell from "@/components/dashboard/teacher/inbox/teacher-inbox-shell";

export default function TeacherArchivePage() {
  return (
    <TeacherInboxShell
      folder="archived"
      breadcrumbLabel="Архив"
      isQuickView
    />
  );
}
