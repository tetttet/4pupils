import type { ReactNode } from "react";
import HeaderDocs from "@/components/docs/layout/header-docs";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <HeaderDocs />
      {children}
    </>
  );
}
