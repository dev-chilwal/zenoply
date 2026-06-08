import Link from "next/link";
import Breadcrumbs from "./Breadcrumbs";
import { toolJsonLd } from "@/lib/seo";
import { relatedTools, getCategory } from "@/lib/site";

// Reusable shell for every tool page: schema + breadcrumbs + UI slot + how-to + FAQ + related.
export default function ToolPage({ tool, children, howTo }) {
  const category = getCategory(tool.category);
  const related = relatedTools(tool);
  const jsonLd = toolJsonLd(tool, category);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container tool-layout">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: category.name, href: `/${category.slug}` },
            { label: tool.title },
          ]}
        />
        <h1>{tool.h1}</h1>
        <p className="lead">{tool.desc}</p>

        {/* Tool UI — instant, above the fold */}
        <section className="tool-ui">{children}</section>

        {howTo && (
          <section className="prose">
            <h2>How to use</h2>
            {howTo}
          </section>
        )}

        {tool.faqs?.length > 0 && (
          <section className="prose">
            <h2>Frequently asked questions</h2>
            <dl className="faq">
              {tool.faqs.map((f, i) => (
                <div key={i}>
                  <dt>{f.q}</dt>
                  <dd>{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {related.length > 0 && (
          <section className="related">
            <h2>Related tools</h2>
            <div className="card-grid">
              {related.map((t) => (
                <Link key={t.slug} href={`/${t.category}/${t.slug}`} className="card">
                  <strong>{t.title}</strong>
                  <span className="muted small">{t.desc}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
