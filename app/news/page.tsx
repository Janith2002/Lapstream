import { formatDistanceToNowStrict } from "date-fns";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import { getNews } from "@/lib/news";

export const revalidate = 1800;

export const metadata = {
  title: "News",
  description:
    "The latest motorsport headlines aggregated from leading outlets. Tap any story to read it at the source.",
  alternates: { canonical: "/news" },
};

export default async function NewsPage() {
  const items = await getNews(30).catch(() => []);

  return (
    <div className="space-y-8">
      <Reveal>
        <header>
          <h1 className="text-3xl font-black sm:text-4xl">Latest News</h1>
          <p className="mt-2 text-apex-muted">
            Headlines aggregated from leading motorsport outlets. Stories open at
            the original source — we don&apos;t republish full articles.
          </p>
        </header>
      </Reveal>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-apex-border bg-apex-panel p-10 text-center text-apex-muted">
          News is unavailable right now — please check back shortly.
        </div>
      ) : (
        <StaggerGroup
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          stagger={0.05}
        >
          {items.map((n, i) => (
            <StaggerItem key={n.link + i}>
              <a
                href={n.link}
                target="_blank"
                rel="noreferrer noopener"
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-apex-border bg-apex-panel transition hover:border-apex-accent/60"
              >
                <div className="relative aspect-video overflow-hidden bg-apex-bg">
                  {n.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={n.image}
                      alt=""
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-apex-border">
                      <span className="text-4xl font-black">L</span>
                    </div>
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-apex-bg/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-apex-accent2 backdrop-blur">
                    {n.source}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h2 className="font-bold leading-snug transition group-hover:text-apex-accent">
                    {n.title}
                  </h2>
                  {n.snippet && (
                    <p className="mt-2 line-clamp-2 text-sm text-apex-muted">
                      {n.snippet}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-3 text-xs text-apex-muted">
                    <span>
                      {n.date
                        ? `${formatDistanceToNowStrict(new Date(n.date))} ago`
                        : ""}
                    </span>
                    <span className="transition group-hover:translate-x-0.5">
                      Read →
                    </span>
                  </div>
                </div>
              </a>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
