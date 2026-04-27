import Link from "next/link";
import React from "react";

const UnderAuth = ({ text }: { text: string }) => {
  return (
    <p className="text-start text-xs text-muted-foreground leading-relaxed">
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
