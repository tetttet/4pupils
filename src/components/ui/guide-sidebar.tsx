import Link from "next/link";
import type { GuideListItem } from "@/lib/guides";

type Props = {
  categories: string[];
  activeCategory?: string;
  popular: GuideListItem[];
};

export function GuidesSidebar({ categories, activeCategory, popular }: Props) {
  return (
    <aside className="sticky top-24 hidden h-[calc(100vh-64px)] w-full max-w-[320px] shrink-0 overflow-auto pr-6 lg:block">
      {/* Categories */}
      <div className="mb-10">
        <p className="text-xs font-semibold tracking-widest text-neutral-400">
          ВЫБЕРИТЕ КАТЕГОРИЮ
        </p>

        <nav className="mt-4 space-y-3">
          {categories.length ? (
            categories.map((c) => {
              const isActive = c === activeCategory;
              return (
                <Link
                  key={c}
                  href={`/guides?category=${encodeURIComponent(c)}`}
                  className={[
                    "block text-base font-medium",
                    isActive
                      ? "text-[#0f3b57] underline"
                      : "text-neutral-600 hover:text-neutral-900",
                  ].join(" ")}
                >
                  {c}
                </Link>
              );
            })
          ) : (
            <p className="mt-2 text-sm text-neutral-500">
              Добавь <code className="rounded bg-neutral-100 px-1">категорию</code>{" "}
              в frontmatter вашего MDX.
            </p>
          )}
        </nav>
      </div>

      {/* Popular */}
      <div>
        <p className="text-xs font-semibold tracking-widest text-neutral-400">
          САМЫЕ ПОПУЛЯРНЫЕ РУКОВОДСТВА
        </p>

        <div className="mt-4 divide-y divide-neutral-200">
          {popular.map((g) => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              prefetch={false}
              className="block py-4 text-sm font-medium text-neutral-700 hover:text-neutral-900"
            >
              {g.frontmatter.title}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
