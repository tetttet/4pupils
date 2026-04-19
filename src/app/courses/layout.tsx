import CoursesFooter from "@/components/courses/courses-footer";
import CoursesHeader from "@/components/courses/courses-header";
import type { Metadata } from "next";

import type { ReactNode } from "react";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Каталог онлайн курсов - ${brand.upper}`,
  description:
    "Научитесь новым навыкам и расширьте свои знания с помощью наших онлайн курсов. Выбирайте из широкого спектра тем и учитесь в удобное для вас время.",
};

export default function CoursesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <CoursesHeader />
      {children}
      <CoursesFooter />
    </>
  );
}
