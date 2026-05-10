import React from "react";
import Script from "next/script";
import { AtlasChat } from "@/components/chat/AtlasChat";
import {
  themeOverrideStorageKey,
  themeStorageKey,
} from "@/components/chat/chat-data";

const atlasThemeBootstrapScript = `
  (() => {
    const mediaQuery = "(prefers-color-scheme: dark)";

    try {
      const hasOverride =
        window.localStorage.getItem(${JSON.stringify(themeOverrideStorageKey)}) === "true";
      const storedTheme = window.localStorage.getItem(${JSON.stringify(themeStorageKey)});
      const theme =
        hasOverride && (storedTheme === "light" || storedTheme === "dark")
          ? storedTheme
          : window.matchMedia && window.matchMedia(mediaQuery).matches
            ? "dark"
            : "light";

      document.documentElement.dataset.atlasTheme = theme;
    } catch {
      document.documentElement.dataset.atlasTheme =
        window.matchMedia && window.matchMedia(mediaQuery).matches
          ? "dark"
          : "light";
    }
  })();
`;

const page = () => {
  return (
    <main className="atlas-page h-[100svh] min-h-[100svh] overflow-hidden supports-[height:100dvh]:h-[100dvh] supports-[height:100dvh]:min-h-[100dvh]">
      <Script
        id="atlas-theme-bootstrap"
        strategy="beforeInteractive"
      >{atlasThemeBootstrapScript}</Script>
      <AtlasChat />
    </main>
  );
};

export default page;
