"use client";

import { useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";

import FlexiblePaymentSection from "@/components/workspace/flexible-payment-section";
import WorkSpaceCard from "@/components/workspace/workspace-card";

const LIGHT_BACKGROUND = "#f3f3f3";
const DARK_BACKGROUND = "#171719";
const LIGHT_TEXT = "#f3f3f3";
const DARK_TEXT = "#1b1b1b";
const DARK_MUTED_TEXT = "#7b7b7b";
const LIGHT_MUTED_TEXT = "#a5a5ad";

const ENTRY_SYNC_POINT = 0.2;
const DARKEN_START_POINT = 0.3;

export default function WorkspaceThemeTransition() {
  const flexibleSectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion() ?? false;

  const { scrollYProgress } = useScroll({
    target: flexibleSectionRef,
    offset: ["start 112%", "start 50%"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    mass: 0.34,
  });

  const transitionProgress = prefersReducedMotion ? scrollYProgress : smoothProgress;

  const workspaceBackground = useTransform(
    transitionProgress,
    [0, DARKEN_START_POINT, 1],
    [LIGHT_BACKGROUND, LIGHT_BACKGROUND, DARK_BACKGROUND],
  );

  const flexibleBackground = useTransform(
    transitionProgress,
    [0, ENTRY_SYNC_POINT, DARKEN_START_POINT, 1],
    [DARK_BACKGROUND, LIGHT_BACKGROUND, LIGHT_BACKGROUND, DARK_BACKGROUND],
  );

  const workspaceHeading = useTransform(
    transitionProgress,
    [0, DARKEN_START_POINT, 1],
    [DARK_TEXT, DARK_TEXT, LIGHT_TEXT],
  );

  const workspaceSubheading = useTransform(
    transitionProgress,
    [0, DARKEN_START_POINT, 1],
    [DARK_MUTED_TEXT, DARK_MUTED_TEXT, LIGHT_MUTED_TEXT],
  );

  const flexibleHeading = useTransform(
    transitionProgress,
    [0, ENTRY_SYNC_POINT, DARKEN_START_POINT, 1],
    [LIGHT_TEXT, DARK_TEXT, DARK_TEXT, LIGHT_TEXT],
  );

  return (
    <div className="relative overflow-x-clip">
      <WorkSpaceCard
        sectionStyle={{
          backgroundColor: workspaceBackground,
          willChange: "background-color",
        }}
        headingStyle={{
          color: workspaceHeading,
          willChange: "color",
        }}
        subheadingStyle={{
          color: workspaceSubheading,
          willChange: "color",
        }}
      />

      <FlexiblePaymentSection
        sectionRef={flexibleSectionRef}
        sectionStyle={{
          backgroundColor: flexibleBackground,
          willChange: "background-color",
        }}
        headingStyle={{
          color: flexibleHeading,
          willChange: "color",
        }}
      />
    </div>
  );
}
