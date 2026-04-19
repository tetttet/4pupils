import type { ReactNode } from "react";
import HeaderGuides from "@/components/docs/layout/header-guides";

export default function GuidesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <HeaderGuides />
      {children}
    </>
  );
}
