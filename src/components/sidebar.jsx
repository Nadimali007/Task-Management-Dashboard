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

import { Link } from "react-router-dom";

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
  SidebarTrigger,
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
  return (
    <Sidebar className="bg-black border-r border-gray-800 text-white">
      <SidebarHeader className="flex flex-row items-center justify-between bg-black border-b border-gray-800 px-6 py-6">
  <div>
    <span className="text-2xl font-bold text-white">
      TaskMaster Pro
    </span>

    <p className="text-sm text-gray-400">
      Enterprise SaaS
    </p>
  </div>
</SidebarHeader>

      <SidebarContent className="bg-black px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="rounded-lg hover:bg-gray-800 transition-all duration-200"
                  >
                    <Link
                      to={item.url}
                      className="flex items-center gap-4 px-4 py-3 text-gray-200 hover:text-white"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span className="font-medium">
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-black border-t border-gray-800 px-3 py-4">
        <SidebarMenu className="space-y-2">
          {footerNavItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                className="rounded-lg hover:bg-gray-800 transition-all duration-200"
              >
                <Link
                  to={item.url}
                  className="flex items-center gap-4 px-4 py-3 text-gray-200 hover:text-white"
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className="font-medium">
                    {item.title}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}