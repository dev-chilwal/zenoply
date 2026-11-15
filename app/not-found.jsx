import Link from "next/link";
import { CATEGORIES, getTool, toolsInCategory, SITE } from "@/lib/site";
import { allGuides } from "@/lib/guides";
import CategoryIcon from "@/components/CategoryIcon";

// Served for every unknown URL (Cloudflare Pages returns out/404.html with a
// 404 status). Old links, typos and retired slugs land here, so the page's job
// is to route the visitor onward: every category with its live tool count, the
// most-used tools, and the guides index. Next adds robots noindex itself.
export const metadata = {
  title: `Page Not Found | ${SITE.name}`,
  description: "This page does not exist. Browse every free Zenoply tool by category, or jump to a popular tool or guide.",
};

const POPULAR = [
  ["pdf", "compress-pdf"],
  ["pdf", "merge-pdf"],
  ["image", "image-compressor"],
  ["image", "image-resizer"],
  ["finance", "sip-calculator"],
  ["finance", "emi-calculator"],
  ["finance", "income-tax-calculator"],
  ["dev", "json-formatter"],
  ["text", "word-counter"],
];

export default function NotFound() {
  const popular = POPULAR.map(([c, s]) => getTool(c, s)).filter((t) => t && t.live);
  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Page not found</h1>
          <p className="lead">
            That address doesn’t match any page on {SITE.name}. It may have been mistyped or moved.
            Every tool is still free and still runs in your browser. Pick a category below, or start
            from one of the most used tools.
          </p>
          <Link href="/" className="btn">Back to home</Link>
        </div>
      </section>

      <section className="container">
        <h2>Browse by category</h2>
        <div className="card-grid">
          {CATEGORIES.map((c) => {
            const n = toolsInCategory(c.slug).filter((t) => t.live).length;
            return (
              <Link key={c.slug} href={`/${c.slug}`} className="card cat-card">
                <CategoryIcon name={c.slug} />
                <strong>{c.name}</strong>
                <span className="muted small">{n} {n === 1 ? "tool" : "tools"} · {c.blurb}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container">
        <h2>Popular tools</h2>
        <div className="card-grid">
          {popular.map((t) => (
            <Link key={t.slug} href={`/${t.category}/${t.slug}`} className="card">
              <strong>{t.title}</strong>
              <span className="muted small">{t.desc}</span>
            </Link>
          ))}
        </div>
        <p className="muted" style={{ marginTop: "1.5rem" }}>
          Looking for an explanation rather than a tool? Read one of the{" "}
          <Link href="/guides">{allGuides().length} guides</Link>.
        </p>
      </section>
    </>
  );
}
