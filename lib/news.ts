import { XMLParser } from "fast-xml-parser";

// Aggregates free motorsport RSS feeds. We only store/show headline + link +
// thumbnail + short snippet and link OUT to the source (no full-article
// republishing). Runs server-side with ISR caching.

export interface NewsItem {
  title: string;
  link: string;
  source: string;
  date: string | null;
  image: string | null;
  snippet: string;
}

const FEEDS: { url: string; source: string }[] = [
  { url: "https://www.motorsport.com/rss/f1/news/", source: "Motorsport.com" },
  { url: "https://www.autosport.com/rss/f1/news/", source: "Autosport" },
  { url: "https://www.planetf1.com/feed", source: "PlanetF1" },
];

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

const REVALIDATE = 60 * 30; // 30 min

function asArray<T>(v: T | T[] | undefined): T[] {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractImage(item: any): string | null {
  const mc = asArray(item["media:content"]).find(
    (m: any) => m?.["@_url"] && (!m["@_medium"] || m["@_medium"] === "image"),
  );
  if (mc?.["@_url"]) return mc["@_url"];
  const mt = item["media:thumbnail"];
  if (mt?.["@_url"]) return mt["@_url"];
  const enc = asArray(item.enclosure).find((e: any) =>
    String(e?.["@_type"] || "").startsWith("image"),
  );
  if (enc?.["@_url"]) return enc["@_url"];
  const desc = typeof item.description === "string" ? item.description : "";
  const m = /<img[^>]+src=["']([^"']+)["']/i.exec(desc);
  return m?.[1] ?? null;
}

async function fetchFeed(url: string, source: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE },
      headers: { "User-Agent": "LapstreamBot/1.0 (+news aggregator)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const data = parser.parse(xml);
    const items = asArray(data?.rss?.channel?.item);
    return items
      .map((it: any): NewsItem | null => {
        const title = typeof it.title === "string" ? it.title : it.title?.["#text"];
        const link =
          typeof it.link === "string" ? it.link : it.link?.["@_href"] ?? it.guid;
        if (!title || !link) return null;
        const d = it.pubDate ? new Date(it.pubDate) : null;
        return {
          title: stripHtml(String(title)),
          link: String(link),
          source,
          date: d && !isNaN(d.getTime()) ? d.toISOString() : null,
          image: extractImage(it),
          snippet: stripHtml(String(it.description ?? "")).slice(0, 160),
        };
      })
      .filter((x): x is NewsItem => x !== null);
  } catch {
    return [];
  }
}

export async function getNews(limit = 30): Promise<NewsItem[]> {
  const results = await Promise.all(FEEDS.map((f) => fetchFeed(f.url, f.source)));
  const all = results.flat();

  // Dedupe by normalized title.
  const seen = new Set<string>();
  const deduped = all.filter((n) => {
    const key = n.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  deduped.sort((a, b) => {
    const ta = a.date ? Date.parse(a.date) : 0;
    const tb = b.date ? Date.parse(b.date) : 0;
    return tb - ta;
  });

  return deduped.slice(0, limit);
}
