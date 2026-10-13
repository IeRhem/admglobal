"use client"

import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/ui/components/breadcrumb"

const routeTitles: Record<string, string> = {
  events: "Events",
  testimonies: "Testimonies",
  dashboard: "Dashboard",
  analytics: "Analytics",
  projects: "Projects",
  team: "Team",
}

export function AdminBreadcrumb() {
  const pathname = usePathname()

  if (!pathname || pathname === "/" || pathname === "/dashboard") {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  const segments = pathname.split("/").filter(Boolean)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((seg, idx) => {
          const isLast = idx === segments.length - 1
          const href = "/" + segments.slice(0, idx + 1).join("/")
          const label =
            routeTitles[seg] ??
            seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ")

          return (
            <span key={href} className="inline-flex items-center gap-1.5 sm:gap-2.5">
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
