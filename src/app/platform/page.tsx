import { StudentOverview } from "@/components/platform/student-overview";
import { getMyEnrollments } from "@/lib/enrollment-server";

export default async function PlatformOverviewPage() {
  const enrollments = await getMyEnrollments();

  return <StudentOverview initialEnrollments={enrollments} />;
}
