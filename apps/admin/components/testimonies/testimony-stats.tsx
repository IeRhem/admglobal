"use client";

import { Badge } from "@repo/ui/components/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  IconCircleCheck,
  IconClock,
  IconMessage,
  IconPhoto,
} from "@tabler/icons-react";
import type { AdminTestimonyItem } from "./types";

interface TestimonyStatsProps {
  testimonies: AdminTestimonyItem[];
}

export function TestimonyStats({ testimonies }: TestimonyStatsProps) {
  const total = testimonies.length;
  const verified = testimonies.filter((t) => t.isVerified).length;
  const pending = total - verified;
  const withImages = testimonies.filter(
    (t) => t.images && t.images.length > 0,
  ).length;

  const approvalRate = total > 0 ? Math.round((verified / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Testimonies</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {total}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconMessage className="size-3.5" />
              All Time
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Testimony submissions
          </div>
          <div className="text-muted-foreground">
            Received from web and services
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Approved & Live</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {verified}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            >
              <IconCircleCheck className="size-3.5 fill-emerald-500 text-white dark:text-card" />
              {approvalRate}% approved
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-emerald-600 dark:text-emerald-400">
            Visible to public
          </div>
          <div className="text-muted-foreground">
            Displayed on website & app
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Pending Review</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {pending}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={
                pending > 0
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "text-muted-foreground"
              }
            >
              <IconClock className="size-3.5" />
              {pending > 0 ? "Action needed" : "All clear"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {pending > 0 ? "Awaiting moderation" : "No pending items"}
          </div>
          <div className="text-muted-foreground">Review before publishing</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>With Photos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {withImages}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconPhoto className="size-3.5" />
              Media
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Visual stories
          </div>
          <div className="text-muted-foreground">Includes attached images</div>
        </CardFooter>
      </Card>
    </div>
  );
}
