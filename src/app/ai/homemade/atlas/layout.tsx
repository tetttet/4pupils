import type { ReactNode } from "react";

import { AuthProvider } from "@/context/auth-context";

export default function AtlasLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
