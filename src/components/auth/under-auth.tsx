import React from "react";

const UnderAuth = ({ text }: { text: string }) => {
  return (
    <p className="text-start text-xs text-muted-foreground leading-relaxed">
      Нажимая «{text}», вы соглашаетесь с{" "}
      <a className="underline underline-offset-4 hover:text-primary" href="#">
        Terms of Service
      </a>{" "}
      и{" "}
      <a className="underline underline-offset-4 hover:text-primary" href="#">
        Privacy Policy
      </a>
      .
    </p>
  );
};

export default UnderAuth;
