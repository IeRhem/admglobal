import type { Metadata } from "next";
import { Suspense } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { AdminBreadcrumb } from "@/components/admin-breadcrumb";
import { Separator } from "@repo/ui/components/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@repo/ui/components/sidebar";

export const metadata: Metadata = {
  title: "Admin | ADM Global",
  description: "ADM Global Administration",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
        } as React.CSSProperties
      }
    >
      <Suspense>
        <AppSidebar />
      </Suspense>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
          />
          <Suspense
            fallback={
              <span className="h-4 w-16 animate-pulse rounded bg-muted" />
            }
          >
            <AdminBreadcrumb />
          </Suspense>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
