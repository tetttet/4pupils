import { GuidesSection } from "@/components/sections/guides-section";
import { brand } from "@/lib/brand";
import { getGuidesList } from "@/lib/guides";

export const metadata = {
  title: "Guides",
};

type PageProps = {
  searchParams?: Promise<{ category?: string }>;
};

export default async function GuidesPage({ searchParams }: PageProps) {
  const { category } = (await searchParams) ?? {};

  const allGuides = getGuidesList();

  const guides = category
    ? allGuides.filter((g) => g.frontmatter.category === category)
    : allGuides;

  return (
    <main className="">
      <GuidesSection
        title={
          category
            ? category
            : `${brand.name} проводник <br />  к уверенному старту`
        }
        moreHref="/"
        moreText="На главную"
        items={guides}
      />
    </main>
  );
}
