import Link from "next/link";

type HeroStat = {
  value: string;
  description: string;
};

export default function CareerChoiceHero({
  tags,
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  rating,
  students,
  highlight,
}: {
  tags: string[];
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  rating: HeroStat;
  students: HeroStat;
  highlight: HeroStat;
}) {
  const tagsLabel = tags.length ? tags.join(" • ") : "Онлайн-курс";

  return (
    <section className="w-full p-4 md:p-8">
      <div className="relative mx-auto w-full max-w-340 overflow-hidden rounded-[32px] border border-black/5 bg-[#191919] text-white shadow-[0_30px_90px_rgba(0,0,0,0.18)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.04),transparent_28%),linear-gradient(135deg,#233067_0%,#1b2554_100%)]" />
        <div className="relative z-10 flex min-h-140 w-full flex-col justify-between gap-10 px-6 py-6 sm:px-8 sm:py-8 md:px-10 md:py-10 lg:flex-row lg:gap-8 lg:px-12 lg:py-12">
          <div className="flex w-full max-w-160 flex-col justify-between">
            <div>
              <div className="inline-flex items-center rounded-full border border-white px-5 py-3 text-[13px] font-semibold leading-none tracking-[-0.02em] text-white sm:text-[14px] md:text-[15px]">
                {tagsLabel}
              </div>

              <h1 className="mt-8 max-w-255 text-[26px] font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:text-[42px] md:text-[48px] lg:text-[50px]">
                {title}
              </h1>

              <p className="mt-6 max-w-140 text-[16px] font-medium leading-[1.32] tracking-[-0.025em] text-white/88 sm:text-[18px] md:text-[20px]">
                {subtitle}
              </p>
            </div>

            <div className="mt-8">
              <Link
                href={ctaHref}
                className="flex h-14 w-full max-w-105 items-center justify-center rounded-3xl bg-white px-6 text-[16px] font-semibold tracking-[-0.02em] text-[#202020] transition hover:bg-[#f1f1f1] sm:h-16 sm:text-[16px]"
              >
                {ctaLabel}
              </Link>
            </div>
          </div>

          <div className="relative flex min-h-70 w-full flex-1 items-end justify-end">
            <div className="pointer-events-none absolute right-0 bottom-0 flex w-full max-w-100 flex-col gap-3">
              <div className="ml-auto w-full rounded-4xl bg-[#a0a0d9] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.24)] sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#a0a0d9] shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-6 w-6"
                    >
                      <path d="M12 2.5l2.91 5.89 6.5.95-4.7 4.58 1.11 6.47L12 17.77l-5.82 3.06 1.11-6.47-4.7-4.58 6.5-.95L12 2.5z" />
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <div className="text-[24px] font-semibold leading-none tracking-[-0.05em] text-white sm:text-[26px]">
                      {rating.value}
                    </div>
                    <p className="mt-1.5 text-[13px] font-medium leading-[1.2] tracking-[-0.02em] text-white/95 sm:text-[14px]">
                      {rating.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="ml-auto w-full rounded-4xl bg-[#5970c3] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.24)] sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#5970c3] shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6"
                    >
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                      <path d="M7.75 7.75l8.5 8.5" />
                      <path d="M16.25 7.75l-8.5 8.5" />
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <div className="text-[24px] font-semibold leading-none tracking-[-0.05em] text-white sm:text-[26px]">
                      {students.value}
                    </div>
                    <p className="mt-1.5 text-[13px] font-medium leading-[1.2] tracking-[-0.02em] text-white/95 sm:text-[14px]">
                      {students.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full rounded-4xl bg-[#3e7edf] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.24)] sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#3e7edf] shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6"
                    >
                      <path d="M12 2.75v18.5" />
                      <path d="M16.75 6.5c0-1.52-2.13-2.75-4.75-2.75S7.25 4.98 7.25 6.5s2.13 2.75 4.75 2.75 4.75 1.23 4.75 2.75S14.62 14.75 12 14.75 7.25 15.98 7.25 17.5s2.13 2.75 4.75 2.75 4.75-1.23 4.75-2.75" />
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <div className="text-[24px] font-semibold leading-none tracking-[-0.05em] text-white sm:text-[26px]">
                      {highlight.value}
                    </div>
                    <p className="mt-1.5 text-[13px] font-medium leading-[1.2] tracking-[-0.02em] text-white/95 sm:text-[14px]">
                      {highlight.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-[#233067]/18 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
