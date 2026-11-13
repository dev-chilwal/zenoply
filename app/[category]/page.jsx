import { notFound } from "next/navigation";
import CategoryLanding from "@/components/CategoryLanding";
import { CATEGORIES, getCategory, toolsInCategory, SITE } from "@/lib/site";
import { hubJsonLd, jsonLdScript, pageMetadata } from "@/lib/seo";
import { guidesByCategory } from "@/lib/guides";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export function generateMetadata({ params }) {
  const c = getCategory(params.category);
  if (!c) return {};
  return pageMetadata({
    title: `${c.name} — Free Online Tools | ${SITE.name}`,
    description: c.metaDesc || c.blurb,
    path: c.slug,
  });
}

export default function CategoryHub({ params }) {
  const category = getCategory(params.category);
  if (!category) notFound();

  const allTools = toolsInCategory(category.slug);
  const live = allTools.filter((t) => t.live);
  const soon = allTools.filter((t) => !t.live);
  // Hubs sit one click from the homepage, so listing the category's guides here
  // gives every guide a shallow inbound link (hubs previously linked none).
  const guides = guidesByCategory().find((g) => g.slug === category.slug)?.guides || [];

  const jsonLd = hubJsonLd({
    name: category.name,
    path: category.slug,
    description: category.metaDesc || category.blurb,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <CategoryLanding category={category} live={live} soon={soon} guides={guides} />
    </>
  );
}
