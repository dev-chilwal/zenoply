import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { allGuides } from "@/lib/guides";
import { SITE } from "@/lib/site";

export const metadata = {
  title: `Guides — How-To Articles for Calculators & Tools | ${SITE.name}`,
  description:
    "Free, plain-English guides explaining how popular calculators work — EMI, percentages, mortgages and more. Learn the formulas, then use the tools.",
  alternates: { canonical: `${SITE.domain}/guides/` },
};

export default function GuidesHub() {
  const guides = allGuides();
  return (
    <div className="container">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Guides" }]} />
      <h1>Guides</h1>
      <p className="lead">
        Plain-English explainers for the calculators and tools on Zenoply — the formulas, worked
        examples and the details that actually matter.
      </p>

      <div className="card-grid">
        {guides.map((g) => (
          <Link key={g.slug} href={`/guides/${g.slug}`} className="card">
            <strong>{g.title}</strong>
            <span className="muted small">{g.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
