// Meta description lint for tools and guides.
//   node scripts/check-meta.mjs   (npm run check-meta)
// - A guide's search description is metaDesc when set, else desc. It must be
//   <= 160 characters so Google shows it without cutting mid-sentence; desc
//   itself can run longer because it is also the on-page lead.
// - metaDesc, when present, must be <= 155 and must be shorter than desc.
// - Live tool descriptions must be <= 170 (the 31 Oct 2026 Phase 4 limit)
//   and >= 120: shorter ones leave most of the snippet unused and read as
//   generic (the 8 Nov 2026 pass lifted the last ten, all 98-124 chars).
// - Search titles (<title>) must be <= 60 characters; a guide whose title is
//   longer needs a metaTitle, which must be shorter than title.
// - No two pages may share a search description.
// - Guide dates are YYYY-MM-DD; an optional `published` (original launch date
//   of a guide revised later) must be earlier than `updated`.
// - Every same-site [label](/path) link in a guide body must resolve to a
//   live page, and every guide/tool cross-reference must exist.
import { TOOLS, CATEGORIES } from "../lib/site.js";
import { GUIDES } from "../lib/guides.js";
import { toolTitle, guideTitle } from "../lib/seo.js";

const errors = [];
const seen = new Map();
const claim = (text, who) => {
  const key = text.trim().toLowerCase();
  if (seen.has(key)) errors.push(`${who}: same description as ${seen.get(key)}`);
  else seen.set(key, who);
};

for (const g of GUIDES) {
  const who = `guide ${g.slug}`;
  const meta = g.metaDesc || g.desc;
  if (!meta) errors.push(`${who}: no desc`);
  else if (meta.length > 160) errors.push(`${who}: search description is ${meta.length} chars (> 160) - add a metaDesc`);
  if (g.metaDesc) {
    if (g.metaDesc.length > 155) errors.push(`${who}: metaDesc is ${g.metaDesc.length} chars (> 155)`);
    if (g.metaDesc.length >= g.desc.length) errors.push(`${who}: metaDesc is not shorter than desc - drop it`);
  }
  if (meta) claim(meta, who);
  const title = guideTitle(g);
  if (title.length > 60) errors.push(`${who}: search title is ${title.length} chars (> 60) - add a metaTitle`);
  if (g.metaTitle && g.metaTitle.length >= g.title.length) errors.push(`${who}: metaTitle is not shorter than title - drop it`);
  // Dates feed Article datePublished/dateModified and og:article times.
  const isDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d));
  if (!g.updated || !isDate(g.updated)) errors.push(`${who}: updated must be a YYYY-MM-DD date`);
  if (g.published !== undefined) {
    if (!isDate(g.published)) errors.push(`${who}: published must be a YYYY-MM-DD date`);
    else if (g.published >= g.updated) errors.push(`${who}: published is not before updated - drop it`);
  }
}
for (const t of TOOLS.filter((t) => t.live)) {
  const who = `tool ${t.category}/${t.slug}`;
  if (!t.desc) errors.push(`${who}: no desc`);
  else {
    if (t.desc.length > 170) errors.push(`${who}: desc is ${t.desc.length} chars (> 170)`);
    if (t.desc.length < 120) errors.push(`${who}: desc is ${t.desc.length} chars (< 120) - say what the tool does`);
    claim(t.desc, who);
  }
  const title = toolTitle(t);
  if (title.length > 60) errors.push(`${who}: search title is ${title.length} chars (> 60) - shorten the tool title`);
}

// Internal links. GuidePage renders [label](/path) as a link only when the
// href is a same-site path; anything else (e.g. quoted javascript: syntax in
// the Markdown guide) stays literal text. Every same-site path must resolve,
// and every guide/tool cross-reference must point at a real page.
const PAGES = new Set(["/", "/guides", "/privacy"]);
for (const c of CATEGORIES) PAGES.add(`/${c.slug}`);
for (const t of TOOLS.filter((t) => t.live)) PAGES.add(`/${t.category}/${t.slug}`);
for (const g of GUIDES) PAGES.add(`/guides/${g.slug}`);
const guideSlugs = new Set(GUIDES.map((g) => g.slug));
let linkCount = 0;
for (const g of GUIDES) {
  const who = `guide ${g.slug}`;
  const texts = [];
  for (const b of g.body) {
    if (b.s) texts.push(b.s);
    if (b.items) texts.push(...b.items);
  }
  for (const text of texts) {
    for (const m of text.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)) {
      const href = m[2];
      if (!/^\/(?!\/)/.test(href)) continue; // rendered as plain text
      linkCount++;
      const path = href.split("#")[0].replace(/\/$/, "") || "/";
      if (!PAGES.has(path)) errors.push(`${who}: link to ${href} does not resolve to a page`);
    }
  }
  if (!PAGES.has(`/${g.category}/${g.tool.slug}`)) errors.push(`${who}: tool ${g.category}/${g.tool.slug} is not a live tool in that category`);
}
for (const t of TOOLS.filter((t) => t.live)) {
  for (const ref of [t.guide, ...(t.moreGuides || [])].filter(Boolean)) {
    if (!guideSlugs.has(ref.slug)) errors.push(`tool ${t.category}/${t.slug}: guide ${ref.slug} does not exist`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  console.error(`\n${errors.length} meta description problem(s).`);
  process.exit(1);
}
console.log(`Internal links OK: ${linkCount} guide links resolve.`);
console.log(`Meta titles + descriptions OK: ${GUIDES.length} guides (${GUIDES.filter((g) => g.metaDesc).length} with metaDesc), ${TOOLS.filter((t) => t.live).length} live tools.`);
