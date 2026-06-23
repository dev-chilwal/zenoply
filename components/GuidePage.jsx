import Link from "next/link";
import Breadcrumbs from "./Breadcrumbs";
import { guideJsonLd } from "@/lib/seo";
import { getTool } from "@/lib/site";

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
  if (block.t === "h2") return <h2>{block.s}</h2>;
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

// Reusable shell for every guide page: schema + breadcrumbs + body + tool CTA + FAQ.
export default function GuidePage({ guide }) {
  const jsonLd = guideJsonLd(guide);
  const relatedTool = getTool(guide.category, guide.tool.slug);

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
            { label: "Guides", href: "/guides" },
            { label: guide.title },
          ]}
        />
        <h1>{guide.h1}</h1>
        <p className="lead">{guide.desc}</p>

        <article className="prose">
          {guide.body.map((b, i) => (
            <Block key={i} block={b} idx={i} />
          ))}
        </article>

        {relatedTool && (
          <section className="related">
            <h2>Try the tool</h2>
            <div className="card-grid">
              <Link href={`/${relatedTool.category}/${relatedTool.slug}`} className="card">
                <strong>{relatedTool.title}</strong>
                <span className="muted small">{relatedTool.desc}</span>
              </Link>
            </div>
          </section>
        )}

        {guide.faqs?.length > 0 && (
          <section className="prose">
            <h2>Frequently asked questions</h2>
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
      </div>
    </>
  );
}
