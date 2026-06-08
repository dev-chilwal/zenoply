# Zenoply

Free online tools — SEO-driven utility site (Next.js App Router).

## Develop
```
npm install
npm run dev      # http://localhost:3000
```

## Build & run
```
npm run build
npm start
```

## Structure
- `app/` — routes. Homepage, `[category]` hubs, `[category]/[tool]` pages, sitemap & robots.
- `components/` — Header, Footer, Breadcrumbs, ToolPage shell, and `tools/` (one client component per tool).
- `lib/site.js` — single source of truth: categories + tool registry. **Add new tools here.**
- `lib/seo.js` — metadata + JSON-LD (SoftwareApplication / BreadcrumbList / FAQPage).

## Add a tool
1. Add an entry to `TOOLS` in `lib/site.js` (slug, category, title, desc, faqs).
2. Create the UI component in `components/tools/`.
3. Register it in the `REGISTRY` map in `app/[category]/[tool]/page.jsx`.
Metadata, schema, breadcrumbs, related-tools and sitemap update automatically.

## Deploy
Vercel (free tier, recommended for Next.js) — connect the repo and point zenoply.com's DNS at it.
