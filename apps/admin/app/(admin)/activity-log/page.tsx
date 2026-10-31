import { Suspense } from "react";
import type { Metadata } from "next";
import { activity_log, db, desc } from "@repo/database";
import { requirePageAccess } from "@/lib/branch-access";

export const metadata: Metadata = {
  title: "Activity log | ADM Global Admin",
  description: "Review who changed branch and role settings and when.",
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

async function ActivityLogContent() {
  await requirePageAccess("/activity-log");
  const entries = await db
    .select({
      id: activity_log.id,
      actorName: activity_log.actorName,
      entityType: activity_log.entityType,
      description: activity_log.description,
      createdAt: activity_log.createdAt,
    })
    .from(activity_log)
    .orderBy(desc(activity_log.createdAt))
    .limit(500);

  return (
    <div className="flex flex-1 flex-col gap-6 py-4 md:py-6">
      <div className="flex flex-col gap-1 px-4 lg:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Activity log
        </h1>
        <p className="text-sm text-muted-foreground">
          A record of branch, staff, role, event, testimony, and user changes.
        </p>
      </div>
      <section className="mx-4 overflow-hidden rounded-xl border bg-card lg:mx-6">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="font-semibold">Recent activity</h2>
            <p className="text-sm text-muted-foreground">
              Showing the latest {entries.length}{" "}
              {entries.length === 1 ? "change" : "changes"}.
            </p>
          </div>
        </div>
        {entries.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">
            No activity has been recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Who</th>
                  <th className="px-5 py-3 font-medium">What happened</th>
                  <th className="px-5 py-3 font-medium">Area</th>
                  <th className="px-5 py-3 font-medium">When</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="whitespace-nowrap px-5 py-4 font-medium">
                      {entry.actorName}
                    </td>
                    <td className="px-5 py-4">{entry.description}</td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs capitalize text-muted-foreground">
                        {entry.entityType.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                      <time dateTime={entry.createdAt.toISOString()}>
                        {dateFormatter.format(entry.createdAt)}
                      </time>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default function ActivityLogRoute() {
  return (
    <Suspense
      fallback={
        <div className="mx-4 h-96 animate-pulse rounded-xl border bg-muted/30 lg:mx-6" />
      }
    >
      <ActivityLogContent />
    </Suspense>
  );
}
