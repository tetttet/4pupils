import CourseCreateForm from "@/components/dashboard/teacher/course-create-form";

type TeacherEditCoursePageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function TeacherEditCoursePage({
  params,
}: TeacherEditCoursePageProps) {
  const { courseId } = await params;

  return <CourseCreateForm mode="edit" courseId={courseId} />;
}
