import type { CSSProperties } from "react";

import ApprovedCoursesSection from "@/components/sections/approved-courses-section";
import CountDown from "@/components/sections/count-down";
import { FaqsSection } from "@/components/sections/faq-section";
import { GuidesSection } from "@/components/sections/guides-section";
import HeroVideo from "@/components/sections/hero-video";
import HowWeWorkWithTutors from "@/components/sections/how-we-work-with-tutors";
import Subjects from "@/components/sections/segmented";
import { getGuidesList } from "@/lib/guides";

const homeTheme = {
  "--frontier-home-primary": "#5D75CB",
  "--frontier-home-primary-strong": "#4C63B8",
  "--frontier-home-primary-deep": "#233067",
  "--frontier-home-primary-rgb": "93,117,203",
  "--frontier-home-primary-strong-rgb": "76,99,184",
  "--frontier-home-primary-deep-rgb": "35,48,103",
  "--frontier-home-surface": "#F7F8FF",
  "--frontier-home-surface-strong": "#ECEFFF",
  "--frontier-home-border": "#D7DDF8",
  "--frontier-home-border-rgb": "215,221,248",
  "--frontier-home-ink": "#202858",
  "--frontier-home-ink-muted": "#68719B",
  "--frontier-home-bg-start": "#F3F5FF",
  "--frontier-home-bg-mid": "#F8F9FF",
  "--frontier-home-bg-end": "#F1F4FF",
  "--primary": "#5D75CB",
  "--ring": "#5D75CB",
  background: "var(--frontier-home-bg-start)",
} as CSSProperties;

export default function Home() {
  const guides = getGuidesList().slice(0, 3);

  return (
    <div className="relative w-full" style={homeTheme}>
      {/* <Hero /> */}
      <HeroVideo />
      {/* <LogoCloud /> */}
      <CountDown />
      <Subjects />
      <ApprovedCoursesSection />
      <HowWeWorkWithTutors />
      <GuidesSection items={guides} home />
      <FaqsSection />
    </div>
  );
}
