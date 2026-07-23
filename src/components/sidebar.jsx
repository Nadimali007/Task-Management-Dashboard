import {
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  Calendar,
  Users,
  Bell,
  User,
  Settings,
  PlusCircle,
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";

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
import { Button } from "@/components/ui/button";

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

const SPECIAL_PAGES = ["/team", "/calendar", "/profile"];

const ALLOWED_ROLES = ["manager", "admin", "lead", "cto", "product manager"];

export default function AppSidebar({ userRole = "" }) {
  const location = useLocation();

  const sessionUser = JSON.parse(sessionStorage.getItem("user") || "{}");
  const localUser = JSON.parse(localStorage.getItem("user") || "{}");

  const effectiveRole = (
    userRole ||
    sessionUser?.role ||
    localUser?.role ||
    ""
  ).toLowerCase();

  const isSpecialPage = SPECIAL_PAGES.includes(location.pathname);
  const isAuthorizedRole = ALLOWED_ROLES.includes(effectiveRole);

  const shouldTransformLayout = isSpecialPage && isAuthorizedRole;

  const contentItems = shouldTransformLayout
    ? [...mainNavItems, ...footerNavItems]
    : mainNavItems;

  const renderMenuItem = (item) => {
    const isActive = location.pathname === item.url;
    const Icon = item.icon;

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          className={`!pl-3 w-full rounded-r-lg rounded-l-none border-l-3 transition-all duration-200 ${isActive
            ? "border-[#D2BBFF] bg-zinc-800/80 text-white font-medium"
            : "border-transparent hover:bg-gray-850 text-gray-400 hover:text-white"
            }`}
        >
          <Link to={item.url} className="flex items-center gap-4 px-4 py-3">
            <Icon
              className={`h-5 w-5 shrink-0 ${isActive ? "text-[#D2BBFF]" : ""
                }`}
            />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar className="bg-black border-r border-gray-800 text-white">
      <SidebarHeader className="flex flex-col justify-between bg-black border-b border-gray-800 !px-3 !pt-3 !pb-3">
        <div>
          <span className="text-2xl font-bold text-[#D2BBFF] tracking-tight">
            TaskMaster Pro
          </span>
          <p className="text-sm text-gray-400 mt-1">Enterprise SaaS</p>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-black py-6">
        <SidebarGroup className="px-4 py-0">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {contentItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-black border-t border-gray-800 px-4 pt-4 pb-8">
        {shouldTransformLayout ? (
          <Button
className="w-[95%] !my-3 !mx-2 bg-[#7C3AED] hover:bg-[#6D28D9] !cursor-pointer text-white flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors">            <PlusCircle className="  h-4 w-4" />
            <span >New Project</span>
          </Button>
        ) : (
          <SidebarMenu className="space-y-2">
            {footerNavItems.map(renderMenuItem)}
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}