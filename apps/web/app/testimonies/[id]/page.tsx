import { testimonies } from "@/lib/testimonies";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { IconArrowLeft } from "@tabler/icons-react";
import { buttonVariants } from "@repo/ui/components/button";

export async function generateStaticParams() {
  return testimonies.map((t) => ({ id: t.id }));
}

export async function generateMetadata(props: PageProps<"/testimonies/[id]">) {
  const { id } = await props.params;
  const testimony = testimonies.find((t) => t.id === id);
  if (!testimony) return { title: "Testimony Not Found" };
  return {
    title: `${testimony.title} | ADMI Testimonies`,
    description: testimony.excerpt,
  };
}

export default async function TestimonyPage(
  props: PageProps<"/testimonies/[id]">
) {
  const { id } = await props.params;
  const testimony = testimonies.find((t) => t.id === id);

  if (!testimony) notFound();

  const categoryColors: Record<string, string> = {
    Healing: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    Breakthroughs:
      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    Deliverance:
      "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
    Salvation:
      "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
    Provision:
      "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  };

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
        {/* Category badge */}
        <span
          className={`inline-block text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-4 ${categoryColors[testimony.category] ?? ""}`}
        >
          {testimony.category}
        </span>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-6 leading-tight">
          {testimony.title}
        </h1>

        {/* Author info */}
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
          {testimony.author.avatar ? (
            <Image
              src={testimony.author.avatar}
              alt={testimony.author.name}
              width={48}
              height={48}
              className="rounded-full object-cover size-12"
            />
          ) : (
            <div className="size-12 rounded-full bg-muted flex items-center justify-center text-base font-semibold text-muted-foreground">
              {testimony.author.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
          )}
          <div>
            <p className="text-base font-semibold text-foreground">
              {testimony.author.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {testimony.author.location}
            </p>
          </div>
        </div>

        {/* Full story */}
        <div className="relative">
          <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">
            {testimony.fullStory}
          </p>
        </div>

        {/* Testimony Images */}
        {testimony.images && testimony.images.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-heading font-semibold text-foreground mb-6">Images</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {testimony.images.map((image, idx) => (
                <div key={idx} className="relative w-full aspect-video rounded-xl overflow-hidden border border-border shadow-sm">
                  <Image
                    src={image}
                    alt={`Testimony image ${idx + 1}`}
                    fill
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
