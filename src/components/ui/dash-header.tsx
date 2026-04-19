import React from "react";

const DashHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => {
  return (
    <div className="px-4 pt-4">
      <div className="text-[16px] font-semibold">{title}</div>
      <div className="text-sm text-muted-foreground">{subtitle}</div>
    </div>
  );
};

export default DashHeader;
