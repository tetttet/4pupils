import Link from "next/link";
import React from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

import {
  getAllGuideSlugs,
  getGuideSourceBySlug,
  getAllCategories,
  getPopularGuides,
} from "@/lib/guides";
import { GuidesSidebar } from "@/components/ui/guide-sidebar";
import { ArrowLeft } from "lucide-react";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllGuideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const guide = getGuideSourceBySlug(slug);

  return {
    title: guide.frontmatter.title,
    description: guide.frontmatter.description ?? "",
  };
}

const mdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className="mt-8 text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl"
      {...props}
    />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="mt-10 text-xl font-semibold tracking-tight text-neutral-900 md:text-2xl"
      {...props}
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="mt-8 text-lg font-semibold tracking-tight text-neutral-900"
      {...props}
    />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mt-4 leading-7 text-neutral-800" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="mt-4 list-disc pl-6 text-neutral-800" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="mt-4 list-decimal pl-6 text-neutral-800" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="mt-2" {...props} />
  ),
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <table
        className="min-w-[720px] w-full table-fixed border-collapse text-left text-sm text-neutral-800 [&_th:nth-child(1)]:w-[22%] [&_th:nth-child(2)]:w-[32%] [&_th:nth-child(3)]:w-[46%]"
        {...props}
      />
    </div>
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-neutral-50 text-neutral-950" {...props} />
  ),
  tbody: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody className="divide-y divide-neutral-200" {...props} />
  ),
  tr: (props: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr className="align-top" {...props} />
  ),
  th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th
      className="border-b border-neutral-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600"
      {...props}
    />
  ),
  td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td className="px-4 py-4 leading-6 text-neutral-800" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a className="underline underline-offset-4 hover:opacity-80" {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code className="rounded bg-neutral-100 px-1 py-0.5 text-sm" {...props} />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="mt-4 overflow-x-auto rounded-xl bg-neutral-900 p-4 text-neutral-100"
      {...props}
    />
  ),
};

function MetaRow({
  author,
  date,
  readingTime,
}: {
  author?: string;
  date?: string;
  readingTime?: string;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-500">
      {author ? <span>От: {author}</span> : null}
      {date ? (
        <span>
          {new Date(date).toLocaleDateString("ru-RU", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      ) : null}
      {readingTime ? <span>{readingTime}</span> : null}
    </div>
  );
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuideSourceBySlug(slug);

  const categories = getAllCategories();
  const popular = getPopularGuides(4);

  const activeCategory = guide.frontmatter.category;

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex gap-10">
        {/* LEFT SIDEBAR (desktop) */}
        <GuidesSidebar
          categories={categories}
          activeCategory={activeCategory}
          popular={popular}
        />

        {/* RIGHT CONTENT */}
        <div className="min-w-0 flex-1">
          {/* Top back link (mobile + desktop) */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/guides"
              className="text-sm text-neutral-600 hover:text-neutral-900 hover:underline"
            >
              <ArrowLeft className="mr-1 inline-block" size={18} /> Назад к руководствам
            </Link>
          </div>

          {/* Breadcrumbs */}
          <div className="text-sm text-neutral-500">
            <Link href="/guides" className="hover:text-neutral-900">
              Руководства
            </Link>
            <span className="mx-2">{">"}</span>
            <span className="text-neutral-700">
              {guide.frontmatter.category ?? "Бизнес руководства"}
            </span>
          </div>

          {/* Title + description + meta */}
          <header className="mt-4">
            <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 md:text-5xl">
              {guide.frontmatter.title}
            </h1>

            {guide.frontmatter.description ? (
              <p className="mt-4 max-w-3xl text-lg text-neutral-600">
                {guide.frontmatter.description}
              </p>
            ) : null}

            <MetaRow
              author={guide.frontmatter.author}
              date={guide.frontmatter.date}
              readingTime={guide.frontmatter.readingTime}
            />
          </header>

          {/* Hero image */}
          {guide.frontmatter.cover ? (
            <div className="mt-10 overflow-hidden rounded-2xl bg-neutral-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={guide.frontmatter.cover}
                alt={guide.frontmatter.title}
                className="h-auto w-full object-cover"
              />
            </div>
          ) : null}

          {/* Content */}
          <article className="mt-10 max-w-3xl">
            <MDXRemote
              source={guide.content}
              options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
              components={mdxComponents}
            />
          </article>

          {/* Mobile sidebar (optional) */}
          <div className="mt-16 border-t border-neutral-200 pt-10 lg:hidden">
            <p className="text-xs font-semibold tracking-widest text-neutral-400">
              БОЛЬШЕ РУКОВОДСТВ
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {popular.map((g) => (
                <Link
                  key={g.slug}
                  href={`/guides/${g.slug}`}
                  className="rounded-xl border border-neutral-200 p-4 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  {g.frontmatter.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
