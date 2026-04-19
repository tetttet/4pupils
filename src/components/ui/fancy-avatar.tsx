import React from "react";
import { Avatar, AvatarFallback } from "./avatar";
import { initials } from "@/lib/func";

const FancyAvatar = ({ name }: { name: string }) => {
  return (
    <Avatar className="h-10 w-10 rounded-full">
      <AvatarFallback
        className="rounded-full bg-primary"
        style={{
          color: "white",
        }}
      >
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
};

export default FancyAvatar;
