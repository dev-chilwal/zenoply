import Link from "next/link";
import { tagFor } from "@/lib/toolTags";
import { readingTime } from "@/lib/guides";

function shortName(name) {
  return name.replace(" Calculators", "").replace(" Tools", "");
}

// Per-category hero copy. Falls back to the category's own name/blurb.
const HERO = {
  finance: {
    pre: "Free ", accent: "finance calculators", post: " for SIP, EMI, tax and loans.",
    lead: "SIP, EMI, FD, PPF, GST, income tax and in-hand salary calculators. Results the moment you type, shareable result links, and your salary and income figures never leave your browser.",
    noun: "calculators",
  },
  pdf: {
    pre: "Free online ", accent: "PDF tools", post: " that never upload your files.",
    lead: "Merge, split, compress, convert, crop, sign, protect and unlock PDFs, or OCR a scan into searchable text. Every page is processed in your own browser.",
    noun: "tools",
  },
  text: {
    pre: "Free online ", accent: "text tools", post: " to count, convert and clean.",
    lead: "Word and character counts, case conversion, line-break and duplicate-line removal, sorting and find and replace. No signup, no clutter, and nothing leaves your browser.",
    noun: "tools",
  },
  dev: {
    pre: "Free online ", accent: "developer tools", post: " for JSON, encoding and hashes.",
    lead: "Format JSON, SQL and XML, encode Base64 and URLs, hash and HMAC, decode JWTs, explain cron expressions and count LLM tokens. Exact, instant and private.",
    noun: "tools",
  },
  convert: {
    pre: "Free online ", accent: "converters", post: " for data, numbers and colors.",
    lead: "JSON to CSV, YAML and XML, HEX to RGB, Unix timestamps, number to words, Roman numerals, units and CGPA to percentage. Every conversion runs locally in your browser.",
    noun: "converters",
  },
  image: {
    pre: "Free online ", accent: "image tools", post: " to resize, compress and convert.",
    lead: "Compress to a target size, resize, crop and convert images, turn HEIC into JPG, make passport and exam photos, and strip EXIF data. Your images are never uploaded.",
    noun: "tools",
  },
  audio: {
    pre: "Free online ", accent: "audio cutter", post: " for MP3, WAV and M4A.",
    lead: "Cut and trim audio on a waveform, with lossless cuts for MP3. Decoded and saved by your own browser, so your recordings never leave your device.",
    noun: "tools",
  },
};

// One landing layout for every category: hero → tool grid → guides → coming soon.
export default function CategoryLanding({ category, live, soon, guides = [] }) {
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
            <span className="pill pill-live"><span className="dot" />{live.length} live {live.length === 1 ? "tool" : "tools"}</span>
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

        {guides.length > 0 && (
          <section className="fin-section hub-guides">
            <div className="fin-section-head">
              <h2>{guides.length === 1 ? "Guide" : "Guides"}</h2>
              <span className="fin-section-note">
                {guides.length} plain-English {guides.length === 1 ? "explainer" : "explainers"} ·{" "}
                <Link href="/guides">all guides</Link>
              </span>
            </div>
            <ul className="hub-guide-list">
              {guides.map((g) => (
                <li key={g.slug}>
                  <Link href={`/guides/${g.slug}`}>{g.title}</Link>
                  <span className="hub-guide-read">{readingTime(g)} min</span>
                </li>
              ))}
            </ul>
          </section>
        )}

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
