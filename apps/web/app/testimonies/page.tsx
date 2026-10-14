import { Suspense } from "react";
import { TestimoniesList } from "@/components/testimonies/TestimoniesList";
import { getTestimonies } from "@/lib/testimonies";
import type { Testimony } from "@/lib/testimony-types";

async function TestimoniesContent() {
  let testimonies: Testimony[];
  try {
    testimonies = await getTestimonies();
  } catch (error: any) {
    if (error?.digest) throw error;
    console.error("Failed to load testimonies:", error);
    testimonies = [];
  }
  return <TestimoniesList testimonies={testimonies} />;
}

export default function TestimoniesPage() {
  return (
    <Suspense
      fallback={
        <div
          className="mx-auto min-h-screen max-w-7xl animate-pulse px-4 py-16 md:py-24"
          aria-busy="true"
          aria-label="Loading testimonies"
        >
          <div className="mx-auto mb-12 h-36 max-w-2xl rounded-2xl bg-muted" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="h-80 rounded-2xl bg-muted" />
            <div className="h-80 rounded-2xl bg-muted" />
            <div className="h-80 rounded-2xl bg-muted" />
          </div>
        </div>
      }
    >
      <TestimoniesContent />
    </Suspense>
  );
}
