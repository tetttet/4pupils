
import { StudentLessonsWorkspace } from "@/components/platform/student-lessons-workspace";
import { getMyCourseApplications } from "@/lib/course-application-server";
import { getMyEnrollments } from "@/lib/enrollment-server";

export default async function StudentLessonsPage() {
  const [applications, enrollments] = await Promise.all([
    getMyCourseApplications(),
    getMyEnrollments(),
  ]);

  return (
    <StudentLessonsWorkspace
      initialApplications={applications}
      initialEnrollments={enrollments}
    />
  );
}
