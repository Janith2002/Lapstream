import type { MetadataRoute } from "next";
import { getSeasonSchedule, normalizeRace } from "@/lib/jolpica";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://lapstream.netlify.app";

export const revalidate = 86400; // 1 day

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const base: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    {
      url: `${SITE_URL}/calendar`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/standings`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  let raceUrls: MetadataRoute.Sitemap = [];
  try {
    const races = (await getSeasonSchedule()).map(normalizeRace);
    raceUrls = races.map((r) => ({
      url: `${SITE_URL}/race/${r.round}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // schedule unavailable — ship the static routes only
  }

  return [...base, ...raceUrls];
}
