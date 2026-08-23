import type { Metadata } from "next";

import type { ReactNode } from "react";
import { brand } from "@/lib/brand";
import { ApprovedCoursesProvider } from "@/hooks/use-approved-courses";
import { getPublicCoursesPage } from "@/lib/public-course.server";

export const revalidate = 300;

export const metadata: Metadata = {
  title: `Каталог онлайн курсов - ${brand.upper}`,
  description:
    "Научитесь новым навыкам и расширьте свои знания с помощью наших онлайн курсов. Выбирайте из широкого спектра тем и учитесь в удобное для вас время.",
};

export default async function CoursesLayout({
  children,
}: {
  children: ReactNode;
}) {
  const initialPage = await getPublicCoursesPage();

  return (
    <ApprovedCoursesProvider
      initialCourses={initialPage?.courses}
      initialMeta={initialPage?.meta}
    >
      {children}
    </ApprovedCoursesProvider>
  );
}
