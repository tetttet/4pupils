import type { Metadata } from "next";

import About from "@/components/team/About";
import Hero from "@/components/team/Hero";
import Ready from "@/components/team/Ready";
import { brand, withBrandPrefix } from "@/lib/brand";

export const metadata: Metadata = {
  title: withBrandPrefix("О платформе"),
  description: `${brand.name} — открытая образовательная платформа для учеников и преподавателей.`,
};

export default function TeamIntroductionPage() {
  return (
    <main className="bg-[#F3F5FF]">
      <Hero />
      <About />
      <Ready />
    </main>
  );
}
