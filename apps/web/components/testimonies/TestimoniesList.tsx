"use client";

import { useState } from "react";
import type { Testimony } from "@/lib/testimony-types";
import { TestimonySlide } from "@/components/landing/TestimonyCard";
import { Button } from "@repo/ui/components/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";

const CATEGORIES = ["All", "Testimony"] as const;
type Category = typeof CATEGORIES[number];

export function TestimoniesList({ testimonies }: { testimonies: Testimony[] }) {
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const filteredTestimonies = testimonies
    .filter((t) => (selectedCategory === "All" ? true : t.category === selectedCategory))
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  return (
    <section className="min-h-screen w-full px-4 py-16 md:py-24 max-w-7xl mx-auto">
      <div className="mb-12 text-center">
        <span className="text-primary text-lg font-semibold uppercase mb-2 block">
          Showmelujah Report
        </span>
        <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground">
          All Testimonies
        </h1>
        <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
          Read the amazing things God is doing in the lives of our members. Testimonies are proof of God&apos;s word at work.
        </p>
      </div>

      {/* Filters & Sorting */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 p-4 rounded-2xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-2 bg-muted rounded-2xl">

          {/* Categories */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground hover:bg-muted-foreground/10 border border-border"
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-muted-foreground">Sort by:</label>
            <Select
              value={sortOrder}
              onValueChange={(value) => {
                if (value === "newest" || value === "oldest") {
                  setSortOrder(value);
                }
              }}
            >
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>        
        <Link 
          href="/testify"
          className={"bg-foreground text-background p-1 px-6 rounded-full border-2"}
        >
          Share Your Testimony
        </Link>
      </div>

      {/* Grid of Testimonies */}
      {filteredTestimonies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:gap-6 justify-items-center">
          {filteredTestimonies.map((testimony) => (
            <div key={testimony.id} className="w-full flex justify-center [&>.testimony-slide]:w-full [&>.testimony-slide]:sm:w-full [&>.testimony-slide]:md:w-full [&>.testimony-slide]:px-0">
              <TestimonySlide testimony={testimony} />
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full">
          <EmptyState
            title="No testimonies shared yet"
            description="Be the first to share an encounter with God! Your story could inspire someone else."
            actionLabel="Share a Testimony"
            actionHref="/testify"
          />
        </div>
      )}
    </section>
  );
}
