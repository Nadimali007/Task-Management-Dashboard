import {
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  Calendar,
  Users,
  Bell,
  User,
  Settings,
} from "lucide-react";

import { Link, useLocation } from "react-router-dom"; // 1. Added useLocation

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const mainNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Team", url: "/team", icon: Users },
];

const footerNavItems = [
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
];

export default function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="bg-black border-r border-gray-800 text-white">
      <SidebarHeader className="flex flex-col justify-between bg-black border-b border-gray-800 !px-3 !pt-3 !pb-3">
        <div>
          <span className=" text-2xl font-bold text-[#D2BBFF] tracking-tight">
            TaskMaster Pro
          </span>
          <p className="text-sm text-gray-400 mt-1">
            Enterprise SaaS
          </p>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-black py-6">
        <SidebarGroup className="px-4 py-0">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {mainNavItems.map((item) => {
                const isActive = location.pathname === item.url;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`!pl-3 w-full rounded-r-lg rounded-l-none border-l-3 transition-all duration-200 ${isActive
                        ? "border-[#D2BBFF] bg-zinc-800/80 text-white font-medium"
                        : "border-transparent hover:bg-gray-850 text-gray-400 hover:text-white"
                        }`}
                    >
                      <Link
                        to={item.url}
                        className="flex items-center gap-4 px-4 py-3"
                      >
                        <item.icon className={`h-5 w-5 shrink-0 ${isActive ? "text-[#D2BBFF]" : ""}`} />
                        <span>
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-black border-t border-gray-800 px-4 pt-4 pb-8">
        <SidebarMenu className="space-y-2">
          {footerNavItems.map((item) => {
            const isActive = location.pathname === item.url;

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className={` !pl-3 w-full rounded-r-lg rounded-l-none border-l-3 transition-all duration-200 ${isActive
                    ? "border-[#D2BBFF] bg-zinc-800/80 text-white font-medium"
                    : "border-transparent hover:bg-gray-850 text-gray-400 hover:text-white"
                    }`}
                >
                  <Link
                    to={item.url}
                    className="flex items-center gap-4 px-4 py-3"
                  >
                    <item.icon className={`h-5 w-5 shrink-0 ${isActive ? "text-[#D2BBFF]" : ""}`} />
                    <span>
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}