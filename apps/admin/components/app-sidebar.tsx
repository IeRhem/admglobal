import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/sidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  IconLayoutDashboard,
  IconList,
  IconCalendarEvent,
  IconChartBar,
  IconFolder,
  IconUsers,
  IconCommand,
} from "@tabler/icons-react";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: <IconLayoutDashboard />,
    },
    {
      title: "Testimonies",
      url: "/testimonies",
      icon: <IconList />,
    },
    {
      title: "Events",
      url: "/events",
      icon: <IconCalendarEvent />,
    },
    {
      title: "Analytics",
      url: "#",
      icon: <IconChartBar />,
    },
    {
      title: "Projects",
      url: "#",
      icon: <IconFolder />,
    },
    {
      title: "Team",
      url: "#",
      icon: <IconUsers />,
    },
  ],
};
export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="#" />}
            >
              <IconCommand className="size-5!" />
              <span className="text-base font-semibold">ADM Global</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={session?.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
