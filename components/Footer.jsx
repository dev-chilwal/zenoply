import Link from "next/link";
import { CATEGORIES, SITE } from "@/lib/site";

function shortName(name) {
  return name.replace(" Calculators", "").replace(" Tools", "");
}

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <div className="footer-brand">
              <span className="brand-mark" aria-hidden />
              <span className="logo">{SITE.name}</span>
            </div>
            <p className="muted small" style={{ margin: 0 }}>{SITE.tagline}.</p>
          </div>
          <div className="footer-cols">
            <div className="footer-col">
              <h4>Categories</h4>
              <ul>
                {CATEGORIES.map((c) => (
                  <li key={c.slug}><Link href={`/${c.slug}`}>{shortName(c.name)}</Link></li>
                ))}
              </ul>
            </div>
            <div className="footer-col">
              <h4>Learn</h4>
              <ul>
                <li><Link href="/guides">Guides</Link></li>
                <li><Link href="/privacy">Privacy</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <p className="footer-bottom">© {new Date().getFullYear()} {SITE.name}. Free online tools.</p>
      </div>
    </footer>
  );
}
