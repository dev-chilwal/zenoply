import Link from "next/link";
import Breadcrumbs from "./Breadcrumbs";
import { guideJsonLd, jsonLdScript } from "@/lib/seo";
import { getTool } from "@/lib/site";
import { headingId, readingTime, guideToc, GUIDE_CATEGORIES } from "@/lib/guides";

// Parse a tiny [label](href) inline-link syntax into React nodes so guide
// body text can link to tools without raw HTML. Plain text passes through.
function renderInline(text, keyBase) {
  const parts = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <Link key={`${keyBase}-${i++}`} href={m[2]}>
        {m[1]}
      </Link>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function Block({ block, idx }) {
  if (block.t === "h2")
    return <h2 id={headingId(block.s)}>{block.s}</h2>;
  if (block.t === "h3") return <h3>{block.s}</h3>;
  if (block.t === "p") return <p>{renderInline(block.s, `p${idx}`)}</p>;
  if (block.t === "ul")
    return (
      <ul>
        {block.items.map((it, j) => (
          <li key={j}>{renderInline(it, `ul${idx}-${j}`)}</li>
        ))}
      </ul>
    );
  if (block.t === "ol")
    return (
      <ol>
        {block.items.map((it, j) => (
          <li key={j}>{renderInline(it, `ol${idx}-${j}`)}</li>
        ))}
      </ol>
    );
  return null;
}

function formatDate(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[m - 1]} ${d}, ${y}`;
}

// Reusable shell for every guide page: schema + breadcrumbs + body + tool CTA + FAQ.
export default function GuidePage({ guide }) {
  const jsonLd = guideJsonLd(guide);
  const relatedTool = getTool(guide.category, guide.tool.slug);
  const toc = guideToc(guide);
  const minutes = readingTime(guide);
  const updated = formatDate(guide.updated);
  const cat = GUIDE_CATEGORIES.find((c) => c.slug === guide.category);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <div className="container tool-layout guide-page">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Guides", href: "/guides" },
            { label: guide.title },
          ]}
        />

        <header className="guide-head">
          <div className="fin-eyebrow">{cat ? cat.label : "Guide"}</div>
          <h1 className="guide-title">{guide.h1}</h1>
          <p className="guide-lead">{guide.desc}</p>
          <div className="guide-meta">
            <span>{minutes} min read</span>
            {updated && (
              <>
                <span className="guide-meta-dot" aria-hidden />
                <span>Updated {updated}</span>
              </>
            )}
          </div>
        </header>

        <div className="guide-shell">
          <article className="prose guide-body">
            {guide.body.map((b, i) => (
              <Block key={i} block={b} idx={i} />
            ))}

            {guide.faqs?.length > 0 && (
              <section className="guide-faq">
                <h2 id="faq">Frequently asked questions</h2>
                <dl className="faq">
                  {guide.faqs.map((f, i) => (
                    <div key={i}>
                      <dt>{f.q}</dt>
                      <dd>{f.a}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
          </article>

          <aside className="guide-aside">
            {toc.length > 0 && (
              <nav className="guide-toc" aria-label="On this page">
                <div className="guide-toc-title">On this page</div>
                <ul>
                  {toc.map((h) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`}>{h.text}</a>
                    </li>
                  ))}
                  {guide.faqs?.length > 0 && (
                    <li>
                      <a href="#faq">FAQ</a>
                    </li>
                  )}
                </ul>
              </nav>
            )}

            {relatedTool && (
              <Link
                href={`/${relatedTool.category}/${relatedTool.slug}`}
                className="guide-tool-card"
              >
                <span className="guide-tool-label">Try the tool</span>
                <span className="guide-tool-name">{relatedTool.title}</span>
                <span className="guide-tool-desc">{relatedTool.desc}</span>
                <span className="guide-tool-cta">
                  Open tool <span aria-hidden>→</span>
                </span>
              </Link>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
