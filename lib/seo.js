import { SITE } from "./site.js";

// Serialise a JSON-LD graph for an inline <script type="application/ld+json">.
//
// Plain JSON.stringify is not safe here. The HTML parser does not understand
// JSON: the first literal </script in the payload ends the block, and the rest
// of the graph spills into the page as visible text. A tool page whose FAQ
// talks about script tags is enough to trigger it. U+2028 and U+2029 are the
// same class of problem for older parsers. All of these have \u escapes that
// JSON.parse reads back identically, so escaping them changes nothing but the
// bytes on the wire.
export function jsonLdScript(data) {
  return JSON.stringify(data).replace(
    /[<>&\u2028\u2029]/g,
    (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0")
  );
}

// The site as a publisher. The logo must be a raster of at least 112px that
// Google can crawl, so it points at the 512px PNG, not the SVG favicon.
const ORGANIZATION = {
  "@type": "Organization",
  "@id": `${SITE.domain}/#organization`,
  name: SITE.name,
  url: `${SITE.domain}/`,
  logo: {
    "@type": "ImageObject",
    url: `${SITE.domain}/icon-512.png`,
    width: 512,
    height: 512,
  },
};

// Homepage only: WebSite is what Google reads for the site name shown above
// each result (otherwise it falls back to the bare domain), and Organization
// supplies the logo. Both belong on the root URL and nowhere else.
export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE.domain}/#website`,
        name: SITE.name,
        alternateName: "zenoply.com",
        url: `${SITE.domain}/`,
        description: SITE.description,
        inLanguage: "en",
        publisher: { "@id": `${SITE.domain}/#organization` },
      },
      ORGANIZATION,
    ],
  };
}

// Category hubs and the guides index: a CollectionPage plus its breadcrumb.
// path is the hub's first segment ("pdf", "guides").
export function hubJsonLd({ name, path, description }) {
  const url = `${SITE.domain}/${path}/`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name,
        description,
        url,
        isPartOf: { "@id": `${SITE.domain}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE.domain}/` },
          { "@type": "ListItem", position: 2, name, item: url },
        ],
      },
    ],
  };
}

// Search results cut titles at ~60 characters. Tool titles get the
// " — Free Online Tool" suffix only when the whole title still fits.
export function toolTitle(tool) {
  const full = `${tool.title} — Free Online Tool | ${SITE.name}`;
  return full.length <= 60 ? full : `${tool.title} | ${SITE.name}`;
}

// A guide's <title>: metaTitle (short search title) when set, else title.
export function guideTitle(guide) {
  return `${guide.metaTitle || guide.title} | ${SITE.name}`;
}

// Build Next.js metadata for a tool page.
export function toolMetadata(tool, category) {
  const url = `${SITE.domain}/${category.slug}/${tool.slug}/`;
  const title = toolTitle(tool);
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

// First-publication date of a guide. Most guides were never revised after
// launch, so `updated` doubles as the publish date; a guide that was rewritten
// later carries its original date (from git history) in `published`.
export const guidePublished = (guide) => guide.published || guide.updated;

// Build Next.js metadata for a single guide page.
export function guideMetadata(guide) {
  const url = `${SITE.domain}/guides/${guide.slug}/`;
  // The lead (desc) can be long; search snippets want <= ~155 characters.
  const description = guide.metaDesc || guide.desc;
  const title = guideTitle(guide);
  const ogImage = { url: "/og.png", width: 1200, height: 630, alt: SITE.name };
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE.name,
      type: "article",
      ...(guidePublished(guide) ? { publishedTime: guidePublished(guide) } : {}),
      ...(guide.updated ? { modifiedTime: guide.updated } : {}),
      images: [ogImage],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
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
      publisher: ORGANIZATION,
      // Google's Article guidance: datePublished + dateModified, and an image
      // of at least 1200px wide (the site card is 1200x630).
      image: { "@type": "ImageObject", url: `${SITE.domain}/og.png`, width: 1200, height: 630 },
      ...(guidePublished(guide) ? { datePublished: guidePublished(guide) } : {}),
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
