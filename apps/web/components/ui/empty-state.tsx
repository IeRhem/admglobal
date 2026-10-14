import * as React from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@repo/ui/components/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center mt-12 w-full">
      <h2 className="font-heading text-2xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-muted-foreground">
        {description}
      </p>
      {actionLabel && actionHref && (
        <div className="mt-6 flex justify-center">
          <Link href={actionHref} className={buttonVariants()}>
            {actionLabel}
          </Link>
        </div>
      )}
    </div>
  );
}
