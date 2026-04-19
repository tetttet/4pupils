import React from "react";
import { cn } from "@/lib/utils";

const ButtonSend = ({
  text = "Хочу начать заниматься",
  className,
  type = "button",
  ...props
}: React.ComponentProps<"button"> & {
  text?: string;
}) => {
  return (
    <button
      type={type}
      className={cn(
        "rounded-lg bg-[#233067] px-12 py-6 text-[18px] font-semibold text-white shadow-[0_10px_18px_rgba(0,0,0,0.25)] transition hover:bg-[#1a244d] active:scale-[0.99]",
        className,
      )}
      {...props}
    >
      {text}
    </button>
  );
};

export default ButtonSend;
