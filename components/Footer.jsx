import Link from "next/link";
import { CATEGORIES, SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="logo">{SITE.name}</div>
            <p className="muted">{SITE.tagline}</p>
          </div>
          <div>
            <h4>Categories</h4>
            <ul>
              {CATEGORIES.map((c) => (
                <li key={c.slug}><Link href={`/${c.slug}`}>{c.name}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Learn</h4>
            <ul>
              <li><Link href="/guides">Guides</Link></li>
            </ul>
          </div>
        </div>
        <p className="muted small">© {new Date().getFullYear()} {SITE.name}. Free online tools.</p>
      </div>
    </footer>
  );
}
