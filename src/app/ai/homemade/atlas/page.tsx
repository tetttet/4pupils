import React from "react";
import { AtlasChat } from "@/components/chat/AtlasChat";

const page = () => {
  return (
    <main className="h-[100svh] min-h-[100svh] overflow-hidden bg-background supports-[height:100dvh]:h-[100dvh] supports-[height:100dvh]:min-h-[100dvh]">
      <AtlasChat />
    </main>
  );
};

export default page;
