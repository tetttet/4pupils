"use client";

import * as React from "react";
import { Sidebar } from "@/components/dashboard/dash/sidebar";
import { DashboardHeader } from "@/components/dashboard/dash/dashboard-header";
import { DashboardFooter } from "@/components/dashboard/dash/dashboard-footer";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const toggleSidebar = React.useCallback(() => {
    setCollapsed((value) => !value);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />

        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader
            collapsed={collapsed}
            onToggleSidebar={toggleSidebar}
          />

          <main className="flex-1">
            <div className="w-full">{children}</div>
          </main>

          <DashboardFooter />
        </div>
      </div>
    </div>
  );
}
