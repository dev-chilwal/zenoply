import { SITE, CATEGORIES, liveTools } from "@/lib/site";
export default function sitemap() {
  const now = new Date();
  const home = [{ url: `${SITE.domain}/`, lastModified: now, priority: 1 }];
  const cats = CATEGORIES.map((c) => ({ url: `${SITE.domain}/${c.slug}/`, lastModified: now, priority: 0.8 }));
  const tools = liveTools().map((t) => ({ url: `${SITE.domain}/${t.category}/${t.slug}/`, lastModified: now, priority: 0.7 }));
  return [...home, ...cats, ...tools];
}
