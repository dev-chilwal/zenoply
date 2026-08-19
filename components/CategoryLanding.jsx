import Link from "next/link";
import { tagFor } from "@/lib/toolTags";

function shortName(name) {
  return name.replace(" Calculators", "").replace(" Tools", "");
}

// Per-category hero copy. Falls back to the category's own name/blurb.
const HERO = {
  finance: {
    pre: "Finance calculators that ", accent: "just work", post: ".",
    lead: "SIP, EMI, GST, FD, tax and loan calculators. Results the moment you type — and your salary and income figures never leave your browser.",
    noun: "calculators",
  },
  pdf: {
    pre: "Every ", accent: "PDF tool", post: " you need.",
    lead: "Merge, split, compress, convert, rotate and unlock PDFs — entirely in your browser. Your files are never uploaded.",
    noun: "tools",
  },
  text: {
    pre: "Text tools, ", accent: "fast and clean", post: ".",
    lead: "Count, convert, clean and reformat text instantly. No signup, no clutter — everything runs locally in your browser.",
    noun: "tools",
  },
  dev: {
    pre: "Developer tools, ", accent: "no clutter", post: ".",
    lead: "JSON, Base64, hashing, JWT, encoders and formatters. Instant, exact, and private — nothing leaves your browser.",
    noun: "tools",
  },
  convert: {
    pre: "Converters that ", accent: "just work", post: ".",
    lead: "Color, time, number and data-format converters. Fast, accurate and free — no signup, and every conversion runs locally in your browser.",
    noun: "converters",
  },
  image: {
    pre: "Image tools, ", accent: "right in your browser", post: ".",
    lead: "Resize, convert and compress images or make passport photos. Processed locally — your images are never uploaded.",
    noun: "tools",
  },
};

// One landing layout for every category: hero → tool grid → coming soon.
export default function CategoryLanding({ category, live, soon }) {
  const h = HERO[category.slug] || {
    pre: category.name, accent: "", post: "", lead: category.blurb, noun: "tools",
  };

  return (
    <div className="cat">
      <section className="cat-hero">
        <span className="glow glow-1" aria-hidden />
        <span className="glow glow-2" aria-hidden />
        <div className="container cat-hero-inner">
          <div className="fin-eyebrow">Home / {shortName(category.name)}</div>
          <h1 className="fin-title">
            {h.pre}
            {h.accent && <span className="accent-text">{h.accent}</span>}
            {h.post}
          </h1>
          <p className="fin-sub">{h.lead}</p>
          <div className="fin-pills">
            <span className="pill pill-live"><span className="dot" />{live.length} live tools</span>
            {soon.length > 0 && <span className="pill">{soon.length} coming soon</span>}
            <span className="pill">Updated weekly</span>
          </div>
        </div>
      </section>

      <div className="container">
        <section className="fin-section">
          <div className="fin-section-head">
            <h2>All {h.noun}</h2>
            <span className="fin-section-note">New tools added every week</span>
          </div>
          <div className="tool-grid">
            {live.map((t) => (
              <Link key={t.slug} href={`/${t.category}/${t.slug}`} className="tool-card">
                <div className="tool-card-top">
                  <span className="fin-tag">{tagFor(t)}</span>
                  <span className="tool-arrow" aria-hidden>→</span>
                </div>
                <div className="tool-name">{t.title}</div>
                <div className="tool-desc">{t.desc}</div>
              </Link>
            ))}
          </div>
        </section>

        {soon.length > 0 && (
          <section className="fin-soon">
            <h2>Coming soon</h2>
            <div className="soon-grid">
              {soon.map((t) => (
                <div key={t.slug} className="soon-card">
                  <div className="soon-top">
                    <span className="soon-tag">{tagFor(t)}</span>
                    <span className="soon-label">Soon</span>
                  </div>
                  <div className="soon-name">{t.title}</div>
                  <div className="soon-desc">{t.desc}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
