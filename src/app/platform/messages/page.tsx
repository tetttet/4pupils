import { Suspense } from "react";
import { StudentMessagesPageContent } from "@/components/platform/student-messages-page";

export default function StudentMessagesPage() {
  return (
    <Suspense fallback={<div />}>
      <StudentMessagesPageContent />
    </Suspense>
  );
}
