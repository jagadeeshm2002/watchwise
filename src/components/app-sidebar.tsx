"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  HomeIcon,
  Inbox,
  Map,
  PieChart,
  Plus,
  Search,
  Settings2,
  Sparkles,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Home from "@/app/page";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },

  navMain: [
    {
      title: "For You",
      url: "#",
      icon: Sparkles,
    },
    {
      title: "Create playlist",
      url: "#",
      icon: Plus,
    },
  
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar();
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenuButton asChild size="lg">
          <div className="flex items-center justify-between gap-2">
            <div
              className={`flex items-center gap-2 px-2 transition-all ${open ? "" : "hidden"}`}
            >
              <Image src={"/logo.svg"} alt="logo" width={30} height={30} />
              <p className="font-semibold text-xl">WatchWise</p>
              <span className="sr-only">watchwise</span>
            </div>
            <SidebarTrigger />
          </div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
