import type { Metadata } from "next";
import LearningFitWizard from "@/components/learning-fit/learning-fit-wizard";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Подбор обучения | ${brand.name}`,
  description:
    "Пятишаговый подбор, который помогает быстро найти наиболее подходящие курсы.",
};

export default function LearningFitPage() {
  return <LearningFitWizard />;
}
