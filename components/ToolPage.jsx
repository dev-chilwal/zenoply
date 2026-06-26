import Link from "next/link";
import Breadcrumbs from "./Breadcrumbs";
import { toolJsonLd } from "@/lib/seo";
import { relatedTools, getCategory, TOOLS } from "@/lib/site";

// Reusable shell for every tool page: schema + breadcrumbs + UI slot + how-to + FAQ + related.
export default function ToolPage({ tool, children, howTo }) {
  const category = getCategory(tool.category);
  const related = relatedTools(tool);
  const jsonLd = toolJsonLd(tool, category);

  // Finance calculators get the editorial layout: sidebar nav + serif title +
  // FAQ accordion + related list. The calculator itself (children) provides the
  // inputs / prose result / chart / summary rail via the calc building blocks.
  if (tool.category === "finance") {
    const financeTools = TOOLS.filter((t) => t.category === "finance" && t.live);
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="calc-page">
          <div className="calc-wrap calc-shell">
            <aside className="calc-side">
              <h2 className="side-title">Finance</h2>
              <ul className="side-nav">
                {financeTools.map((t) => (
                  <li key={t.slug}>
                    <Link
                      href={`/finance/${t.slug}`}
                      className={t.slug === tool.slug ? "active" : ""}
                      aria-current={t.slug === tool.slug ? "page" : undefined}
                    >
                      {t.title}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="side-foot">
                Calculations are estimates for illustrative purposes only.
              </p>
            </aside>

            <div className="calc-main-col">
              <nav className="calc-crumbs" aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <span className="sep">/</span>
                <Link href={`/${category.slug}`}>{category.name}</Link>
                <span className="sep">/</span>
                {tool.title}
              </nav>
              <h1>{tool.h1}</h1>
              <p className="calc-sub">{tool.desc}</p>
              <hr className="calc-rule" />

              {/* All finance calculators use the editorial CalcGrid layout
                  (inputs / prose result / chart / summary rail). New finance
                  calcs should return a <CalcGrid> from components/calc/Calc. */}
              {children}

              {howTo && (
                <section className="prose" style={{ marginTop: "2.5rem" }}>
                  <h2>How to use</h2>
                  {howTo}
                </section>
              )}

              <div className="calc-lower">
                {tool.faqs?.length > 0 && (
                  <div>
                    <h3>Frequently asked questions</h3>
                    {tool.faqs.map((f, i) => (
                      <details key={i} className="faq-acc" open={i === 0}>
                        <summary>{f.q}</summary>
                        <p>{f.a}</p>
                      </details>
                    ))}
                  </div>
                )}
                <div>
                  <h3>Related tools</h3>
                  <div className="rel-list">
                    {related.map((t) => (
                      <Link key={t.slug} href={`/${t.category}/${t.slug}`}>
                        <span>{t.title}</span>
                        <span className="arr" aria-hidden="true">&rarr;</span>
                      </Link>
                    ))}
                    <Link href="/finance">
                      <span>View all finance tools</span>
                      <span className="arr" aria-hidden="true">&rarr;</span>
                    </Link>
                  </div>
                  {tool.guide && (
                    <p className="calc-disclaimer" style={{ marginTop: "1rem" }}>
                      Read the guide:{" "}
                      <Link href={`/guides/${tool.guide.slug}`}>{tool.guide.title}</Link>
                    </p>
                  )}
                  <p className="calc-disclaimer">
                    Results are estimates for illustration only and not financial advice.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

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

        {tool.guide && (
          <section className="related">
            <h2>Learn more</h2>
            <div className="card-grid">
              <Link href={`/guides/${tool.guide.slug}`} className="card">
                <strong>{tool.guide.title}</strong>
                <span className="muted small">Read the guide</span>
              </Link>
            </div>
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
