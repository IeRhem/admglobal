import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { IconArrowLeft } from "@tabler/icons-react";
import { buttonVariants } from "@repo/ui/components/button";
import { getTestimonyById } from "@/lib/testimonies";

export const metadata = {
  title: "Testimonies | ADMI",
};

async function TestimonyContent({
  params,
}: PageProps<"/testimonies/[id]">) {
  const { id } = await params;
  const testimony = await getTestimonyById(id);
  if (!testimony) notFound();

  return (
    <section className="min-h-screen w-full max-w-3xl mx-auto px-4 py-16 md:py-24">
      <Link
        href="/#testimony"
        className={buttonVariants({ variant: "ghost", size: "sm" })}
      >
        <IconArrowLeft className="size-4" />
        Back to Testimonies
      </Link>

      <div className="mt-8">
        <span className="mb-4 inline-block rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {testimony.category}
        </span>

        <h1 className="mb-6 text-3xl font-heading font-bold leading-tight text-foreground md:text-5xl">
          {testimony.title}
        </h1>

        <div className="mb-8 flex items-center gap-3 border-b border-border pb-6">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-base font-semibold text-muted-foreground">
            {testimony.author.name
              .split(" ")
              .map((name) => name[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">
              {testimony.author.name}
            </p>
            <time className="text-sm text-muted-foreground" dateTime={testimony.date}>
              {new Date(`${testimony.date}T00:00:00`).toLocaleDateString()}
            </time>
          </div>
        </div>

        <p className="whitespace-pre-wrap text-lg leading-relaxed text-foreground/90">
          {testimony.fullStory}
        </p>

        {testimony.images.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 text-xl font-heading font-semibold text-foreground">
              Images
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {testimony.images.map((image, index) => (
                <div
                  key={image}
                  className="relative aspect-video w-full overflow-hidden rounded-xl border border-border shadow-sm"
                >
                  <Image
                    src={image}
                    alt={`Testimony image ${index + 1}`}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default function TestimonyPage(props: PageProps<"/testimonies/[id]">) {
  return (
    <Suspense
      fallback={
        <section
          className="mx-auto min-h-screen max-w-3xl animate-pulse px-4 py-16 md:py-24"
          aria-busy="true"
          aria-label="Loading testimony"
        >
          <div className="mb-8 h-8 w-48 rounded bg-muted" />
          <div className="mb-6 h-16 rounded bg-muted" />
          <div className="h-64 rounded-2xl bg-muted" />
        </section>
      }
    >
      <TestimonyContent params={props.params} />
    </Suspense>
  );
}
