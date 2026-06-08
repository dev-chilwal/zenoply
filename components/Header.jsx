import Link from "next/link";
import { CATEGORIES, SITE } from "@/lib/site";
import ThemeToggle from "./ThemeToggle";

function shortName(name) {
  return name.replace(" Calculators", "").replace(" Tools", "");
}

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="logo">{SITE.name}</Link>
        <nav className="nav">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/${c.slug}`}>{shortName(c.name)}</Link>
          ))}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
