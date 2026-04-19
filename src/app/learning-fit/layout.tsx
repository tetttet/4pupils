import type { ReactNode } from "react";

import CoursesFooter from "@/components/courses/courses-footer";
import CoursesHeader from "@/components/courses/courses-header";

export default function LearningFitLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <CoursesHeader />
      {children}
      <CoursesFooter />
    </>
  );
}
