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
  const url = `${SITE.domain}/${c.slug}/`;
  const description = c.metaDesc || c.blurb;
  // openGraph is replaced, not merged, so without this a hub would inherit the
  // homepage's og:url and title from the root layout.
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title, description, url, siteName: SITE.name, type: "website",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: SITE.name }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
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
