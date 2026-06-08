import { SITE } from "./site";

// Build Next.js metadata for a tool page.
export function toolMetadata(tool, category) {
  const url = `${SITE.domain}/${category.slug}/${tool.slug}`;
  const title = `${tool.title} — Free Online Tool | ${SITE.name}`;
  return {
    title,
    description: tool.desc,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: tool.desc,
      url,
      siteName: SITE.name,
      type: "website",
    },
    twitter: { card: "summary", title, description: tool.desc },
  };
}

// JSON-LD: SoftwareApplication + BreadcrumbList + optional FAQPage.
export function toolJsonLd(tool, category) {
  const url = `${SITE.domain}/${category.slug}/${tool.slug}`;
  const graph = [
    {
      "@type": "SoftwareApplication",
      name: tool.title,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any (web browser)",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: tool.desc,
      url,
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE.domain },
        { "@type": "ListItem", position: 2, name: category.name, item: `${SITE.domain}/${category.slug}` },
        { "@type": "ListItem", position: 3, name: tool.title, item: url },
      ],
    },
  ];
  if (tool.faqs?.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: tool.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}
