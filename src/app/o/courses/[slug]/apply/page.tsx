import { notFound } from "next/navigation";
import CourseApplicationFormPage from "@/components/courses/course-application-form-page";
import { buildAuthHref } from "@/lib/auth-redirect";
import { getMyCourseApplications } from "@/lib/course-application-server";
import { getMe } from "@/lib/me";
import { getPublicCourse } from "@/lib/public-course";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export default async function PublicCourseApplicationPage({ params }: PageProps) {
  const { slug } = await params;

  const [course, viewer] = await Promise.all([getPublicCourse(slug), getMe()]);
  if (!course) return notFound();

  const myApplications = viewer ? await getMyCourseApplications() : [];
  const currentApplication =
    myApplications.find((application) => application.course_id === course.course_id) ??
    null;

  const courseHref = `/o/courses/${course.slug}#course-access`;
  const applyHref = `/o/courses/${course.slug}/apply`;

  return (
    <CourseApplicationFormPage
      course={course}
      viewer={viewer}
      currentApplication={currentApplication}
      courseHref={courseHref}
      signInHref={buildAuthHref("/auth/sign-in", applyHref)}
      signUpHref={buildAuthHref("/auth/sign-up", applyHref)}
    />
  );
}
