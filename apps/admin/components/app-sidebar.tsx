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
  IconActivity,
  IconBuildingChurch,
  IconClipboardCheck,
  IconUsers,
  IconCommand,
} from "@tabler/icons-react";
import { getUserPageAccess } from "@/lib/branch-access";

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
      title: "Branches",
      url: "/branches",
      icon: <IconBuildingChurch />,
    },
    {
      title: "Users",
      url: "/users",
      icon: <IconUsers />,
    },
    {
      title: "Activity log",
      url: "/activity-log",
      icon: <IconActivity />,
    },
    {
      title: "Service reports",
      url: "/service-reports",
      icon: <IconClipboardCheck />,
    },
  ],
};
export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const permittedPages =
    session?.user?.role === "admin"
      ? null
      : session?.user
        ? await getUserPageAccess(session.user.id)
        : [];
  const navItems =
    permittedPages === null
      ? data.navMain
      : data.navMain.filter((item) => permittedPages.includes(item.url));

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
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={session?.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
