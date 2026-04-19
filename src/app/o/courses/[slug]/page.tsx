import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PublicCourseLanding from "@/components/courses/public-course-page";
import { brand } from "@/lib/brand";
import {
  getAppBaseUrl,
  getCourseSeoDescription,
  getPublicCourse,
} from "@/lib/public-course";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getPublicCourse(slug);

  if (!course) {
    return {
      title: `Курс не найден | ${brand.name}`,
      description: "Публичная страница курса не найдена или больше недоступна.",
    };
  }

  const baseUrl = await getAppBaseUrl();
  const title = `${course.title} | ${brand.name}`;
  const description = getCourseSeoDescription(course);
  const courseUrl = `${baseUrl}/o/courses/${course.slug}`;
  const previewImage = `${baseUrl}/o/courses/${course.slug}/opengraph-image`;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    alternates: {
      canonical: courseUrl,
    },
    openGraph: {
      title,
      description,
      url: courseUrl,
      type: "website",
      locale: "ru_RU",
      siteName: brand.name,
      images: [
        {
          url: previewImage,
          width: 1200,
          height: 630,
          alt: `${course.title} preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [previewImage],
    },
  };
}

export default async function PublicCourseSlugPage({ params }: PageProps) {
  const { slug } = await params;

  const course = await getPublicCourse(slug);
  if (!course) return notFound();

  return <PublicCourseLanding course={course} />;
}
