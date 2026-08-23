import Link from "next/link";
import React from "react";
import { cn } from "@/lib/utils";

const UnderAuth = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => {
  return (
    <p
      className={cn(
        "text-start text-xs leading-relaxed text-muted-foreground",
        className,
      )}
    >
      Нажимая «{text}», вы соглашаетесь с{" "}
      <Link
        className="underline underline-offset-4 hover:text-primary"
        href="/docs/privacy-policy"
      >
        политикой конфиденциальности
      </Link>
      .
    </p>
  );
};

export default UnderAuth;
