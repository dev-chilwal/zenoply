import Link from "next/link";
import { CATEGORIES, liveTools, SITE } from "@/lib/site";
import CategoryIcon from "@/components/CategoryIcon";

export default function Home() {
  const live = liveTools();
  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>{SITE.tagline}</h1>
          <p className="lead">{SITE.description}</p>
        </div>
      </section>

      <section className="container">
        <h2>Browse by category</h2>
        <div className="card-grid">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/${c.slug}`} className="card cat-card">
              <CategoryIcon name={c.slug} />
              <strong>{c.name}</strong>
              <span className="muted small">{c.blurb}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container">
        <h2>Available now</h2>
        <div className="card-grid">
          {live.map((t) => (
            <Link key={t.slug} href={`/${t.category}/${t.slug}`} className="card">
              <strong>{t.title}</strong>
              <span className="muted small">{t.desc}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
