"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES, SITE } from "@/lib/site";
import ThemeToggle from "./ThemeToggle";
import RegionSelect from "./RegionSelect";

function shortName(name) {
  return name.replace(" Calculators", "").replace(" Tools", "");
}

export default function Header() {
  const pathname = usePathname() || "/";
  const isActive = (slug) => pathname === `/${slug}` || pathname.startsWith(`/${slug}/`);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden />
          <span className="logo">{SITE.name}</span>
        </Link>
        <nav className="nav">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/${c.slug}`} className={isActive(c.slug) ? "active" : undefined}>
              {shortName(c.name)}
            </Link>
          ))}
          <Link href="/guides" className={isActive("guides") ? "active" : undefined}>
            Guides
          </Link>
        </nav>
        <Link href="/" className="header-cta">All tools</Link>
        <RegionSelect />
        <ThemeToggle />
      </div>
    </header>
  );
}
