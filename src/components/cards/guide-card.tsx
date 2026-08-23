import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

type Props = {
  href: string;
  title: string;
  cover?: string;
  date?: string;
  description?: string;
  home?: boolean;
  priority?: boolean;
};

export function GuideCard({
  href,
  title,
  cover,
  date,
  description,
  home = false,
  priority = false,
}: Props) {
  if (home) {
    return (
      <Link
        href={href}
        prefetch={false}
        className="group grid h-full overflow-hidden rounded-[30px] border border-white bg-white p-3 shadow-[0_12px_34px_rgba(35,48,103,0.055)] outline-none transition duration-500 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(35,48,103,0.11)] focus-visible:ring-2 focus-visible:ring-[#5D75CB] focus-visible:ring-offset-2 md:grid-cols-[1.2fr_0.8fr]"
      >
        <div className="overflow-hidden rounded-[24px] bg-[#ECEFFF]">
          <div className="relative aspect-[16/10] h-full min-h-[260px] w-full md:min-h-[340px]">
            <Image
              src={cover ?? "/images/guides/guide-1.jpg"}
              alt={title}
              fill
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
              sizes="(max-width: 767px) 100vw, 58vw"
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-col p-4 sm:p-6 md:p-7">
          {date ? (
            <p className="w-fit rounded-full bg-[#F3F5FF] px-3 py-1.5 text-[11px] font-medium text-[#68719B] sm:text-[12px]">
              {date}
            </p>
          ) : null}

          <h3 className="mt-5 text-[26px] font-medium leading-[1.05] tracking-[-0.04em] text-[#202858] sm:text-[30px]">
            {title}
          </h3>

          {description ? (
            <p className="mt-4 line-clamp-4 text-[13px] leading-6 text-[#68719B] sm:text-[14px]">
              {description}
            </p>
          ) : null}

          <span className="mt-auto inline-flex items-center justify-end border-t border-[#ECEFFF] pt-5">
            <span className="grid size-10 place-items-center rounded-full bg-[#233067] text-white transition-transform duration-300 group-hover:rotate-6">
              <ArrowUpRight className="size-4" />
            </span>
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      prefetch={false}
      className="group block rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/20"
    >
      <div className="overflow-hidden rounded-2xl bg-neutral-100">
        <div className="relative aspect-video w-full">
          <Image
            src={cover ?? "/images/guides/guide-1.jpg"}
            alt={title}
            fill
            className="h-full w-full object-cover transition-transform duration-333 group-hover:scale-[1.05]"
            priority={priority}
            sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
          />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>

          {date ? (
            <p className="shrink-0 text-sm text-neutral-500 whitespace-nowrap">
              {date}
            </p>
          ) : null}
        </div>

        {description ? (
          <p className="mt-1 line-clamp-2 text-sm text-neutral-600">
            {description}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
