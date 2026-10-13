"use client"

import * as React from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar"
import { Badge } from "@repo/ui/components/badge"
import { Button } from "@repo/ui/components/button"
import {
  IconCalendarEvent,
  IconCheck,
  IconChevronRight,
  IconList,
  IconShieldCheck,
  IconSparkles,
  IconUserCircle,
} from "@tabler/icons-react"

interface AdminWelcomeCardProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
}

export function AdminWelcomeCard({ user }: AdminWelcomeCardProps) {
  const name = user?.name || "Administrator"
  const email = user?.email || "admin@admglobal.org"
  const initials =
    name
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AD"

  const todayStr = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date())

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-card via-card to-primary/5 p-5 sm:p-6 shadow-xs">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Admin profile & greeting */}
        <div className="flex items-start sm:items-center gap-4">
          <Avatar size="lg" className="size-14 sm:size-16 rounded-xl border-2 border-primary/20 shadow-xs">
            <AvatarImage src={user?.image ?? undefined} alt={name} />
            <AvatarFallback className="rounded-xl text-base font-bold bg-primary/15 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Welcome back, {name}
              </h1>
              <Badge
                variant="secondary"
                className="gap-1 border-primary/20 bg-primary/10 text-primary font-semibold text-xs"
              >
                <IconShieldCheck className="size-3.5" />
                Verified Admin
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="font-mono text-foreground/80">{email}</span>
              <span className="hidden sm:inline">•</span>
              <span>{todayStr}</span>
            </div>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-none border-border/50">
          <Link href="/events">
            <Button size="sm" className="h-9 gap-1.5 text-xs font-medium shadow-xs">
              <IconCalendarEvent className="size-4" />
              Manage Events
            </Button>
          </Link>
          <Link href="/testimonies">
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs font-medium">
              <IconList className="size-4" />
              Moderate Testimonies
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
