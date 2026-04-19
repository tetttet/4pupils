import { RequireTeacher } from "@/components/auth/require-auth-custom";
import type { ReactNode } from "react";

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return <RequireTeacher>{children}</RequireTeacher>;
}
