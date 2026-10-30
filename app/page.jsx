import Link from "next/link";
import { CATEGORIES, liveTools, SITE } from "@/lib/site";
import CategoryIcon from "@/components/CategoryIcon";

// Keyword-led homepage copy: the root layout's title/description are the
// brand defaults, which say nothing about what the site actually does.
const TOOL_COUNT = liveTools().length;
const TITLE = `Free Online Tools for PDF, Images, Text, Code & Finance | ${SITE.name}`;
const DESCRIPTION = `${TOOL_COUNT} free online tools: merge and compress PDFs, resize and convert images, SIP, EMI and tax calculators, JSON and text utilities. Nothing uploaded, no signup.`;

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE.domain}/` },
  openGraph: {
    title: TITLE, description: DESCRIPTION, url: `${SITE.domain}/`, siteName: SITE.name, type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/og.png"] },
};

export default function Home() {
  const live = liveTools();
  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Free online tools for PDFs, images, text, code and money</h1>
          <p className="lead">
            {live.length} tools that just work: merge and compress PDFs, resize and convert images, run
            SIP, EMI and income tax calculators, format JSON and clean up text. Everything runs in your
            browser, so nothing is uploaded, and there is no signup.
          </p>
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
        <h2>All {live.length} tools</h2>
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
