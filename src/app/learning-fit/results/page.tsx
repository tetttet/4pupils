import type { Metadata } from "next";
import { Suspense } from "react";
import LearningFitResults from "@/components/learning-fit/learning-fit-results";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Рекомендации по курсам | ${brand.name}`,
  description:
    "Персональная подборка курсов на основе темы, уровня, цели, языка и бюджета.",
};

export default function LearningFitResultsPage() {
  return (
    <Suspense fallback={<div />}>
      <LearningFitResults />
    </Suspense>
  );
}
