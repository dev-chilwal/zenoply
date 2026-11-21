import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import CategoryIcon from "@/components/CategoryIcon";
import { allGuides, guidesByCategory, readingTime } from "@/lib/guides";
import { SITE } from "@/lib/site";
import { hubJsonLd, jsonLdScript, pageMetadata } from "@/lib/seo";

// The guides now span every category, not just the calculators the original
// copy described, so the description leads with the live count and topics.
const DESCRIPTION = `${allGuides().length} free how-to guides for PDFs, images, text, code and money: how each tool works, with worked examples and comparisons such as SIP vs FD and PPF vs FD.`;

export const metadata = pageMetadata({
  title: `How-To Guides: PDFs, Images, Code & Money | ${SITE.name}`,
  description: DESCRIPTION,
  path: "guides",
});

export default function GuidesHub() {
  const groups = guidesByCategory();
  const total = allGuides().length;

  return (
    <div className="cat">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(hubJsonLd({
          name: "Guides",
          path: "guides",
          description: DESCRIPTION,
          // Every guide, in the grouped order the page shows them.
          items: groups.flatMap((g) => g.guides.map((x) => ({ name: x.title, path: `guides/${x.slug}` }))),
        })) }}
      />
      <section className="cat-hero">
        <span className="glow glow-1" aria-hidden />
        <span className="glow glow-2" aria-hidden />
        <div className="container cat-hero-inner">
          <div className="fin-eyebrow">Home / Guides</div>
          <h1 className="fin-title">
            The <span className="accent-text">how</span> and{" "}
            <span className="accent-text">why</span> behind the tools.
          </h1>
          <p className="fin-sub">
            Plain-English explainers for the calculators and tools on Zenoply — the
            formulas, worked examples and the details that actually matter. Read the
            guide, then run the numbers.
          </p>
          <div className="fin-pills">
            <span className="pill pill-live">
              <span className="dot" />
              {total} guides
            </span>
            <span className="pill">{groups.length} topics</span>
            <span className="pill">Free · no signup</span>
          </div>
        </div>
      </section>

      <div className="container">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Guides" }]} />

        {groups.map((group) => (
          <section key={group.slug} className="guide-group">
            <div className="guide-group-head">
              <span className="guide-group-icon">
                <CategoryIcon name={group.icon} className="" />
              </span>
              <h2>{group.label}</h2>
              <span className="guide-group-count">{group.guides.length}</span>
            </div>

            <div className="guide-grid">
              {group.guides.map((g, i) => (
                <Link key={g.slug} href={`/guides/${g.slug}`} className="guide-card">
                  <div className="guide-card-top">
                    <span className="guide-index">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="tool-arrow" aria-hidden>
                      →
                    </span>
                  </div>
                  <div className="guide-card-title">{g.title}</div>
                  <div className="guide-card-desc">{g.desc}</div>
                  <div className="guide-card-foot">
                    <span className="guide-read">{readingTime(g)} min read</span>
                    {g.tool?.title && (
                      <span className="guide-pairs">{g.tool.title}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
