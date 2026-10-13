import { Suspense } from "react"
import type { Metadata } from "next"
import { db, desc, inArray, testimonial, testimonial_image } from "@repo/database"
import { getPresignedUrl } from "@/lib/r2"
import { TestimoniesTable } from "@/components/testimonies/testimonies-table"
import { TestimonyStats } from "@/components/testimonies/testimony-stats"
import type { AdminTestimonyItem } from "@/components/testimonies/types"

export const metadata: Metadata = {
  title: "Testimonies | ADM Global Admin",
  description: "Manage and moderate church member testimonies.",
}

async function getTestimonies(): Promise<AdminTestimonyItem[]> {
  try {
    const rows = await db
      .select()
      .from(testimonial)
      .orderBy(desc(testimonial.createdAt))

    const page_ids = rows.map((r) => r.id)
    const images =
      page_ids.length > 0
        ? await db
            .select()
            .from(testimonial_image)
            .where(inArray(testimonial_image.testimonialId, page_ids))
        : []

    const imagesByTestimonial = new Map<string, typeof images>()
    for (const img of images) {
      let resolvedImage = img.image
      if (img.image.startsWith("testimonials/")) {
        try {
          resolvedImage = await getPresignedUrl(img.image)
        } catch {
          resolvedImage = `/api/s3/download?key=${encodeURIComponent(img.image)}`
        }
      }

      const list = imagesByTestimonial.get(img.testimonialId) ?? []
      list.push({ ...img, image: resolvedImage })
      imagesByTestimonial.set(img.testimonialId, list)
    }

    return rows.map((item) => ({
      ...item,
      images: imagesByTestimonial.get(item.id) ?? [],
    }))
  } catch (error) {
    console.error("Failed to fetch testimonies from database:", error)
    return []
  }
}

async function TestimoniesContent() {
  const testimonies = await getTestimonies()

  return (
    <>
      {/* Metric Section Cards */}
      <TestimonyStats testimonies={testimonies} />

      {/* Interactive TanStack Data Table */}
      <TestimoniesTable initialData={testimonies} />
    </>
  )
}

function TestimoniesSkeleton() {
  return (
    <div className="flex flex-col gap-4 md:gap-6 animate-pulse" aria-busy="true">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 rounded-xl border bg-muted/40 p-4"
          />
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <div className="flex h-10 w-full items-center justify-between gap-4">
          <div className="h-9 w-64 rounded-md bg-muted/60" />
          <div className="h-9 w-32 rounded-md bg-muted/60" />
        </div>
        <div className="h-96 w-full rounded-lg border bg-muted/30" />
      </div>
    </div>
  )
}

export default function TestimoniesPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Page Title & Subtitle */}
          <div className="flex flex-col gap-1 px-4 lg:px-6">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Testimonies
            </h1>
            <p className="text-sm text-muted-foreground">
              Review, approve, and manage testimonies submitted by church members
              and visitors.
            </p>
          </div>

          <Suspense fallback={<TestimoniesSkeleton />}>
            <TestimoniesContent />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
