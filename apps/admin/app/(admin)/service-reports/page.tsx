import { Suspense } from "react";
import type { Metadata } from "next";
import { ServiceReportForm } from "@/components/service-reports/service-report-form";
import { requirePageAccess } from "@/lib/branch-access";

export const metadata: Metadata = {
  title: "Daily Service Report | ADM Global Admin",
  description:
    "Record church service attendance, finances, expenses, and approvals.",
};

async function ServiceReportContent() {
  await requirePageAccess("/service-reports");
  return <ServiceReportForm />;
}

export default function ServiceReportsRoute() {
  return (
    <div className="flex flex-1 flex-col gap-6 py-4 md:py-6">
      <div className="flex flex-col gap-1 px-4 lg:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Daily Service Attendance &amp; Expenses
        </h1>
        <p className="text-sm text-muted-foreground">
          Complete and submit the service report immediately after each service.
        </p>
      </div>
      <Suspense
        fallback={
          <div
            aria-busy="true"
            className="mx-4 h-[36rem] animate-pulse rounded-xl border bg-muted/30 lg:mx-6"
          />
        }
      >
        <ServiceReportContent />
      </Suspense>
    </div>
  );
}
