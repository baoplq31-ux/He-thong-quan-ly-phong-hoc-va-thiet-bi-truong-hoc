"use client";

import {
  Building2,
  ChevronRight,
  LogOut,
} from "lucide-react";

import { navigationItems } from "@/data/navigation";
import { canAccessView } from "@/lib/permissions";
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
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import type {
  SystemUser,
  View,
} from "@/types";

type AppSidebarProps = {
  activeView: View;
  currentUser: SystemUser;
  onViewChange: (view: View) => void;
  onLogout: () => void;
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

export function AppSidebar({
  activeView,
  currentUser,
  onViewChange,
  onLogout,
}: AppSidebarProps) {
  const { setOpenMobile } = useSidebar();

  const allowedItems = navigationItems.filter(
    (item) =>
      canAccessView(currentUser.role, item.id),
  );

  const mainItems = allowedItems.filter(
    (item) => item.group === "main",
  );

  const systemItems = allowedItems.filter(
    (item) => item.group === "system",
  );

  function handleViewChange(view: View) {
    onViewChange(view);
    setOpenMobile(false);
  }

  function handleLogout() {
    setOpenMobile(false);
    onLogout();
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="EduFacility"
              onClick={() =>
                handleViewChange("dashboard")
              }
            >
              <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Building2 className="size-5" />
              </div>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  EduFacility
                </span>
                <span className="truncate text-xs text-slate-500">
                  Quản lý cơ sở vật chất
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            Điều hành
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  activeView === item.id;

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      tooltip={item.label}
                      isActive={isActive}
                      onClick={() =>
                        handleViewChange(item.id)
                      }
                    >
                      <Icon />
                      <span>{item.label}</span>

                      {isActive && (
                        <ChevronRight className="ml-auto size-4" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {systemItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>
              Hệ thống
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {systemItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    activeView === item.id;

                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        tooltip={item.label}
                        isActive={isActive}
                        onClick={() =>
                          handleViewChange(item.id)
                        }
                      >
                        <Icon />
                        <span>{item.label}</span>

                        {isActive && (
                          <ChevronRight className="ml-auto size-4" />
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip={`${currentUser.name} - ${currentUser.role}`}
            >
              <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-slate-900 text-xs font-semibold text-white">
                {getInitials(currentUser.name)}
              </div>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {currentUser.name}
                </span>
                <span className="truncate text-xs text-slate-500">
                  {currentUser.role}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Đăng xuất"
              onClick={handleLogout}
            >
              <LogOut />
              <span>Đăng xuất</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}