import { notFound } from "next/navigation";
import CategoryLanding from "@/components/CategoryLanding";
import { CATEGORIES, getCategory, toolsInCategory, SITE } from "@/lib/site";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export function generateMetadata({ params }) {
  const c = getCategory(params.category);
  if (!c) return {};
  const title = `${c.name} — Free Online Tools | ${SITE.name}`;
  return {
    title,
    description: c.blurb,
    alternates: { canonical: `${SITE.domain}/${c.slug}/` },
  };
}

export default function CategoryHub({ params }) {
  const category = getCategory(params.category);
  if (!category) notFound();

  const allTools = toolsInCategory(category.slug);
  const live = allTools.filter((t) => t.live);
  const soon = allTools.filter((t) => !t.live);

  return <CategoryLanding category={category} live={live} soon={soon} />;
}
