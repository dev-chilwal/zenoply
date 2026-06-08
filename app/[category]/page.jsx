import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
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
    alternates: { canonical: `${SITE.domain}/${c.slug}` },
  };
}

export default function CategoryHub({ params }) {
  const category = getCategory(params.category);
  if (!category) notFound();

  const allTools = toolsInCategory(category.slug);
  const live = allTools.filter((t) => t.live);
  const soon = allTools.filter((t) => !t.live);

  return (
    <div className="container">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: category.name }]} />
      <h1>{category.name}</h1>
      <p className="lead">{category.blurb}</p>

      {soon.length > 0 && (
        <div className="banner" role="status">
          <div className="chip-row">
            <span className="chip chip-live"><span className="dot" />{live.length} Live</span>
            <span className="chip chip-soon"><span className="dot" />{soon.length} Coming soon</span>
          </div>
          <span className="banner-note">New tools added every week</span>
        </div>
      )}

      {live.length > 0 && (
        <div className="card-grid">
          {live.map((t) => (
            <Link key={t.slug} href={`/${t.category}/${t.slug}`} className="card">
              <strong>{t.title}</strong>
              <span className="muted small">{t.desc}</span>
            </Link>
          ))}
        </div>
      )}

      {soon.length > 0 && (
        <>
          <h2 className="soon-heading">Coming soon</h2>
          <div className="card-grid">
            {soon.map((t) => (
              <div key={t.slug} className="card card-soon" aria-disabled="true">
                <span className="soon-badge">Coming soon</span>
                <strong>{t.title}</strong>
                <span className="muted small">{t.desc}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
