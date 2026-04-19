import React from "react";

const H2Text = ({
  title,
  className,
}: {
  title: string;
  className?: string;
}) => {
  return (
    <h2
      className={`text-balance text-primary font-bold text-3xl md:text-5xl lg:font-black ${className}`}
      dangerouslySetInnerHTML={{ __html: title }}
    ></h2>
  );
};

export default H2Text;
