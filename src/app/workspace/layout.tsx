import HeaderWorkspace from "@/components/docs/layout/header-workspace";
import type { Metadata } from "next";

import type { ReactNode } from "react";
import { brand } from "@/lib/brand";
import WorkspaceFooter from "@/components/workspace/workspace-footer";

export const metadata: Metadata = {
  title: `Корпоративный - ${brand.upper}`,
  description:
    "Корпоративный раздел для управления корпоративными клиентами, их курсами и пользователями.",
};

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <HeaderWorkspace />
      {children}
      <WorkspaceFooter />
    </>
  );
}
