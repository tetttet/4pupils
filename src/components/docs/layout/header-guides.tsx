import Link from "next/link";
import React from "react";

const HeaderGuides = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white">
      <div className="mx-auto flex h-16 max-w-380 items-center justify-between px-6 sm:px-10 lg:px-16">
        <Link
          href="/o/"
        >
          <h1 className="text-[24px] font-semibold tracking-[-0.04em] text-black sm:text-[28px] select-none">
            4Pupils Руководства
          </h1>
        </Link>

        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full" />
          <div className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </header>
  );
};

export default HeaderGuides;
