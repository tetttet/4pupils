import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { replaceLegacyBranding } from "@/lib/brand";

export type GuideFrontmatter = {
  title: string;
  description?: string;
  cover?: string;
  date?: string;

  // new
  category?: string; // e.g. "Business Guides"
  author?: string; // e.g. "Roy Rasmussen"
  readingTime?: string; // e.g. "13 minute reading"
};

export type GuideListItem = {
  slug: string;
  frontmatter: GuideFrontmatter;
};

const GUIDES_DIR = path.join(process.cwd(), "public", "markdowns");

function ensureDirExists() {
  if (!fs.existsSync(GUIDES_DIR)) {
    throw new Error(
      `Directory not found: ${GUIDES_DIR}. Create public/markdowns and add .mdx files.`,
    );
  }
}

export function getAllGuideSlugs(): string[] {
  ensureDirExists();
  return fs
    .readdirSync(GUIDES_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

function normalizeFrontmatter(
  data: Record<string, unknown>,
  fallbackSlug: string,
): GuideFrontmatter {
  return {
    title: replaceLegacyBranding(String(data.title ?? fallbackSlug)),
    description: data.description
      ? replaceLegacyBranding(String(data.description))
      : undefined,
    cover: data.cover ? String(data.cover) : undefined,
    date: data.date ? String(data.date) : undefined,
    category: data.category
      ? replaceLegacyBranding(String(data.category))
      : undefined,
    author: data.author ? String(data.author) : undefined,
    readingTime: data.readingTime ? String(data.readingTime) : undefined,
  };
}

export function getGuidesList(): GuideListItem[] {
  ensureDirExists();

  const items = getAllGuideSlugs().map((slug) => {
    const fullPath = path.join(GUIDES_DIR, `${slug}.mdx`);
    const source = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(source);

    return { slug, frontmatter: normalizeFrontmatter(data, slug) };
  });

  items.sort((a, b) => {
    const ad = a.frontmatter.date ? Date.parse(a.frontmatter.date) : 0;
    const bd = b.frontmatter.date ? Date.parse(b.frontmatter.date) : 0;
    return bd - ad;
  });

  return items;
}

export function getGuideSourceBySlug(slug: string): {
  slug: string;
  frontmatter: GuideFrontmatter;
  content: string;
} {
  ensureDirExists();

  const fullPath = path.join(GUIDES_DIR, `${slug}.mdx`);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Guide not found: ${slug}`);
  }

  const source = fs.readFileSync(fullPath, "utf8");
  const { content, data } = matter(source);

  return {
    slug,
    frontmatter: normalizeFrontmatter(data, slug),
    content: replaceLegacyBranding(content),
  };
}

// sidebar helpers
export function getAllCategories(): string[] {
  const list = getGuidesList();
  const set = new Set<string>();
  for (const item of list) {
    if (item.frontmatter.category) set.add(item.frontmatter.category);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function getPopularGuides(limit = 4): GuideListItem[] {
  // пока "popular" = последние по date; позже можешь заменить на views/featured
  return getGuidesList().slice(0, limit);
}
