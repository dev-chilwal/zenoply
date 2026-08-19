import { SITE, CATEGORIES, liveTools } from "@/lib/site";
import { allGuides } from "@/lib/guides";
export default function sitemap() {
  const home = [{ url: `${SITE.domain}/`, priority: 1 }];
  const cats = CATEGORIES.map((c) => ({ url: `${SITE.domain}/${c.slug}/`, priority: 0.8 }));
  const tools = liveTools().map((t) => ({ url: `${SITE.domain}/${t.category}/${t.slug}/`, priority: 0.7 }));
  const guidesHub = [{ url: `${SITE.domain}/guides/`, priority: 0.7 }];
  const privacy = [{ url: `${SITE.domain}/privacy/`, priority: 0.3 }];
  const guides = allGuides().map((g) => ({ url: `${SITE.domain}/guides/${g.slug}/`, lastModified: g.updated, priority: 0.6 }));
  return [...home, ...cats, ...tools, ...guidesHub, ...guides, ...privacy];
}
