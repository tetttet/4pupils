import Link from "next/link";

type Props = {
  href: string;
  title: string;
  cover?: string;
  date?: string;
  description?: string;
};

export function GuideCard({ href, title, cover, date, description }: Props) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/20"
    >
      <div className="overflow-hidden rounded-2xl bg-neutral-100">
        <div className="relative aspect-video w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover ?? "/images/guides/guide-1.jpg"}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-333 group-hover:scale-[1.23]"
            loading="lazy"
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
