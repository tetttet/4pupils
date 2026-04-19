import React from "react";
import Link from "next/link";
import { brand } from "@/lib/brand";

type NavItem = {
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  { label: "Certified integrations", href: "#certified-integrations" },
  { label: "Success stories", href: "#success-stories" },
  { label: "Moodle App", href: "#moodle-app" },
  { label: "Get Moodle LMS", href: "#get-moodle-lms" },
  { label: "Need advice?", href: "#need-advice" },
];

export default function Hero() {
  return (
    <section className="w-full bg-white">
      {/* Верхняя зона */}
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-8 sm:px-6 md:px-10 md:pt-16 md:pb-14">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-12">
          {/* Left */}
          <div className="md:col-span-8">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full bg-[#0f3b57]"
              />
              <span className="text-base font-medium text-slate-800">
                {brand.lms}
              </span>
            </div>

            <h1
              className={[
                "mt-5 font-semibold text-[#0f3b57]",
                "text-[34px] leading-[1.06]",
                "sm:text-[40px] sm:leading-[1.05]",
                "md:text-[66px] md:leading-none",
              ].join(" ")}
            >
              Made by educators,
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              for educators
            </h1>
          </div>

          {/* Right */}
          <div className="md:col-span-4 md:pt-10">
            <p className="max-w-md text-[15px] leading-7 text-slate-600 sm:text-[16px]">
              With Moodle LMS, you can design learning that feels intuitive,
              supports diverse learners, and evolves with your goals.
            </p>
          </div>
        </div>
      </div>

      {/* Нижнее меню */}
      <div className="border-t border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-0 sm:px-6 md:px-10">
          <nav aria-label="Hero navigation" className="relative">
            {/* Mobile: scroll */}
            <ul
              className={[
                "flex items-center gap-2 px-4 py-3",
                "overflow-x-auto whitespace-nowrap",
                "[-webkit-overflow-scrolling:touch]",
                "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                "md:hidden",
              ].join(" ")}
            >
              {navItems.map((item) => (
                <li key={item.label} className="shrink-0">
                  <Link
                    href={item.href}
                    className={[
                      "inline-flex items-center rounded-full border border-slate-200",
                      "px-4 py-2 text-sm font-semibold text-[#0f3b57]",
                      "hover:bg-slate-50 active:bg-slate-100",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f3b57]/30",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Desktop: evenly spaced with dividers */}
            <ul className="hidden h-20 w-full items-center justify-between text-center md:flex">
              {navItems.map((item, idx) => {
                const isLast = idx === navItems.length - 1;

                return (
                  <React.Fragment key={item.label}>
                    <li className="flex-1">
                      <Link
                        href={item.href}
                        className="inline-flex w-full items-center justify-center px-3 text-base font-semibold text-[#0f3b57] hover:underline"
                      >
                        {item.label}
                      </Link>
                    </li>

                    {!isLast && (
                      <li
                        aria-hidden="true"
                        className="mx-2 h-7 w-px bg-slate-200"
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
}
