import type { MetadataRoute } from "next";
import {
  getSeasonSchedule,
  normalizeRace,
  getDriverStandings,
  getConstructorStandings,
} from "@/lib/jolpica";

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
    {
      url: `${SITE_URL}/news`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.8,
    },
  ];

  const dynamic: MetadataRoute.Sitemap = [];
  try {
    const races = (await getSeasonSchedule()).map(normalizeRace);
    for (const r of races)
      dynamic.push({
        url: `${SITE_URL}/race/${r.round}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
  } catch {}
  try {
    const drivers = await getDriverStandings();
    for (const d of drivers)
      dynamic.push({
        url: `${SITE_URL}/driver/${d.Driver.driverId}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
      });
  } catch {}
  try {
    const teams = await getConstructorStandings();
    for (const c of teams)
      dynamic.push({
        url: `${SITE_URL}/team/${c.Constructor.constructorId}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
      });
  } catch {}

  return [...base, ...dynamic];
}
