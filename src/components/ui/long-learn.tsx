import Image from "next/image";
import React from "react";

const LongLearn = ({
  longDescription,
  image,
}: {
  longDescription: string;
  image?: string;
}) => {
  return (
    <section className="w-full p-4">
      <div className="mx-auto max-w-355 px-4 md:px-6 lg:px-8">
        <div className="pt-10 md:pt-14">
          <h2 className="text-[28px] font-semibold leading-none tracking-[-0.04em] text-[#242424] md:text-[42px]">
            Что ещё входит в курс
          </h2>
          <div className="mt-10 flex w-full flex-col gap-6 md:flex-row md:items-start">
            <Image
              src={image ?? "/course-default-image.png"}
              alt="Course image"
              width={800}
              height={450}
              className="w-full rounded-[28px] object-cover md:w-1/3"
            />
            <div className="w-full rounded-[28px] bg-white px-6 py-6 md:w-2/3 md:px-8 md:py-7">
              <p className="text-[16px] md:text-[18px] leading-[1.45] tracking-[-0.02em] text-[#363636]">
                {longDescription.split("\n\n").map((paragraph, index) => (
                  <span key={index}>{paragraph}</span>
                ))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LongLearn;
