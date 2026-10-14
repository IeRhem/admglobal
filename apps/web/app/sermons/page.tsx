import { Suspense } from "react";
import { SermonLibrary } from "@/components/sermons/SermonLibrary";
import { getYouTubeVideos } from "@/lib/youtube-videos";

export const metadata = {
  title: "Sermons",
  description:
    "Watch sermons and messages from Arrow of Deliverance Ministries (ADMI) — Victory Chapel. Spirit-filled preaching and Bible teaching from Pastor Joseph Nwunuji and other ministers.",
  alternates: { canonical: "/sermons" },
};

async function SermonsList() {
  const youTubeVideos = await getYouTubeVideos();
  return <SermonLibrary videos={youTubeVideos} />;
}

export default function SermonsPage() {
  return (
    <section className="w-full px-4 pb-24 pt-32 md:px-10">
      <div className="mx-auto max-w-6xl">
        {/* Page header */}
        <div className="mb-12 ">
          <p className="mb-3 text-lg font-heading tracking-widest text-primary">
            Sermon library
          </p>
          <h1 className="font-heading text-5xl font-bold leading-none md:text-7xl">
            Messages for your journey.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Search through messages from Arrow of Deliverance Ministries and
            find a word for this season.
          </p>
        </div>

        {/* Library (featured hero + search + grid) */}
        <Suspense
          fallback={
            <div className="animate-pulse h-96 bg-muted rounded-2xl w-full"></div>
          }
        >
          <SermonsList />
        </Suspense>
      </div>
    </section>
  );
}
