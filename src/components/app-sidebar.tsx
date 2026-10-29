import { Link, useRouterState } from "@tanstack/react-router";
import {
  ClipboardCheck,
  History,
  ImagePlus,
  Info,
  LayoutDashboard,
  ScanEye,
  Eye,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "New Screening", url: "/screening", icon: ImagePlus },
  { title: "Results", url: "/results", icon: ClipboardCheck },
  { title: "Explainability", url: "/explainability", icon: ScanEye },
  { title: "Screening History", url: "/history", icon: History },
  { title: "About", url: "/about", icon: Info },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (url: string) =>
    url === "/" ? pathname === "/" : pathname.startsWith(url);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/" className="gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-foreground ring-1 ring-sidebar-border">
                  <Eye className="size-5" aria-hidden="true" />
                </span>
                <span className="grid leading-tight">
                  <span className="font-display text-base font-semibold tracking-tight">
                    EyeCare
                  </span>
                  <span className="truncate text-[11px] text-sidebar-muted">
                    DR Screening · Research Demo
                  </span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Screening</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon aria-hidden="true" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <p className="px-3 pb-2 text-[11px] leading-snug text-sidebar-muted group-data-[collapsible=icon]:hidden">
          Research prototype. All outputs are mock data — not medical advice.
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
