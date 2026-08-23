import type { ReactNode } from "react";

import { AuthProvider } from "@/context/auth-context";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthProvider initialUser={null}>{children}</AuthProvider>;
}
