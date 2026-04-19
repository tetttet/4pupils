import TeacherInboxShell from "@/components/dashboard/teacher/inbox/teacher-inbox-shell";

export default function TeacherFavoritesPage() {
  return (
    <TeacherInboxShell
      folder="inbox"
      breadcrumbLabel="Избранные"
      mode="favorites"
      isQuickView
    />
  );
}
