"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { StudentInboxProvider } from "@/context/student-inbox-context";
import {
  StudentPlatformPreferencesProvider,
  useStudentPlatformPreferences,
} from "@/hooks/use-student-platform-preferences";

import UserDashHeader from "./user-dash-header";
import UserSidebar from "./user-sidebar";

export function UserDashShell({ children }: { children: React.ReactNode }) {
  return (
    <StudentPlatformPreferencesProvider>
      <UserDashShellContent>{children}</UserDashShellContent>
    </StudentPlatformPreferencesProvider>
  );
}

function UserDashShellContent({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { preferences, hydrated, setPreference } =
    useStudentPlatformPreferences();

  const pathname = usePathname();

  React.useEffect(() => {
    if (!hydrated) {
      return;
    }

    setCollapsed(preferences.sidebarCollapsed);
  }, [hydrated, preferences.sidebarCollapsed]);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  React.useEffect(() => {
    document.documentElement.dataset.platformFontSize = preferences.fontSize;

    return () => {
      delete document.documentElement.dataset.platformFontSize;
    };
  }, [preferences.fontSize]);

  const handleCollapseToggle = React.useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      setPreference("sidebarCollapsed", next);
      return next;
    });
  }, [setPreference]);

  return (
    <div className="student-platform-root relative min-h-screen bg-gray-100">
      <StudentInboxProvider>
        <div className="relative flex min-h-screen">
          <UserSidebar
            collapsed={collapsed}
            mobileOpen={mobileOpen}
            onCollapseToggle={handleCollapseToggle}
            onCloseMobile={() => setMobileOpen(false)}
          />

          <div className="flex min-w-0 flex-1 flex-col px-4 pb-4 pt-5">
            <UserDashHeader onOpenMobileMenu={() => setMobileOpen(true)} />

            <main className="flex-1 pb-8 pt-4 lg:pb-10 lg:pt-6">
              <div className="mx-auto w-full max-w-400">{children}</div>
            </main>
          </div>
        </div>
      </StudentInboxProvider>
    </div>
  );
}
