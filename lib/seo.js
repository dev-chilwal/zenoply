import { SITE } from "./site";

// Build Next.js metadata for a tool page.
export function toolMetadata(tool, category) {
  const url = `${SITE.domain}/${category.slug}/${tool.slug}/`;
  const title = `${tool.title} — Free Online Tool | ${SITE.name}`;
  const ogImage = { url: "/og.png", width: 1200, height: 630, alt: SITE.name };
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
      images: [ogImage],
    },
    twitter: { card: "summary_large_image", title, description: tool.desc, images: ["/og.png"] },
  };
}

// JSON-LD: SoftwareApplication + BreadcrumbList + optional FAQPage.
export function toolJsonLd(tool, category) {
  const url = `${SITE.domain}/${category.slug}/${tool.slug}/`;
  const graph = [
    {
      "@type": "SoftwareApplication",
      name: tool.title,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any (web browser)",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      isAccessibleForFree: true,
      featureList: [
        "Runs entirely in your browser",
        "No file upload",
        "No account required",
      ],
      description: tool.desc,
      url,
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE.domain}/` },
        { "@type": "ListItem", position: 2, name: category.name, item: `${SITE.domain}/${category.slug}/` },
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

// Build Next.js metadata for a single guide page.
export function guideMetadata(guide) {
  const url = `${SITE.domain}/guides/${guide.slug}/`;
  const title = `${guide.title} | ${SITE.name}`;
  const ogImage = { url: "/og.png", width: 1200, height: 630, alt: SITE.name };
  return {
    title,
    description: guide.desc,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: guide.desc,
      url,
      siteName: SITE.name,
      type: "article",
      images: [ogImage],
    },
    twitter: { card: "summary_large_image", title, description: guide.desc, images: ["/og.png"] },
  };
}

// JSON-LD for a guide: Article + BreadcrumbList + optional FAQPage.
export function guideJsonLd(guide) {
  const url = `${SITE.domain}/guides/${guide.slug}/`;
  const graph = [
    {
      "@type": "Article",
      headline: guide.h1 || guide.title,
      description: guide.desc,
      author: { "@type": "Organization", name: SITE.name },
      publisher: { "@type": "Organization", name: SITE.name },
      ...(guide.updated ? { dateModified: guide.updated } : {}),
      mainEntityOfPage: url,
      url,
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE.domain}/` },
        { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE.domain}/guides/` },
        { "@type": "ListItem", position: 3, name: guide.title, item: url },
      ],
    },
  ];
  if (guide.faqs?.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: guide.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}
