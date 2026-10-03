"use client";

import {
  Building2,
  ChevronRight,
  Settings2,
} from "lucide-react";

import {
  navigationItems,
} from "@/data/navigation";

import type { View } from "@/types";

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

interface AppSidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
}

export function AppSidebar({
  activeView,
  onViewChange,
}: AppSidebarProps) {
  const { setOpenMobile } = useSidebar();

  const mainItems = navigationItems.filter(
    (item) => item.group === "main"
  );

  const systemItems = navigationItems.filter(
    (item) => item.group === "system"
  );

  function handleViewChange(view: View) {
    onViewChange(view);

    // Đóng sidebar sau khi chọn trên điện thoại
    setOpenMobile(false);
  }

  return (
    <Sidebar
      collapsible="offcanvas"
      className="border-r-0"
    >
      <SidebarHeader className="px-5 pb-4 pt-5">
        <button
          type="button"
          onClick={() => handleViewChange("dashboard")}
          className="flex items-center gap-3 rounded-xl text-left"
        >
          <span className="grid size-11 place-items-center rounded-xl bg-teal-400 text-[#062032]">
            <Building2 className="size-6" />
          </span>

          <span>
            <span className="block font-bold text-white">
              EduFacility
            </span>

            <span className="block text-xs text-slate-400">
              Quản lý cơ sở vật chất
            </span>
          </span>
        </button>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-3 text-xs font-bold uppercase tracking-wider text-slate-500">
            Điều hành
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {mainItems.map((item) => {
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      type="button"
                      tooltip={item.label}
                      isActive={activeView === item.id}
                      onClick={() =>
                        handleViewChange(item.id)
                      }
                      className="
                        h-11 rounded-xl px-3 text-[15px]
                        text-slate-300
                        hover:bg-white/10 hover:text-white
                        data-[active=true]:bg-teal-400
                        data-[active=true]:font-bold
                        data-[active=true]:text-[#062032]
                      "
                    >
                      <Icon className="size-[18px]" />

                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4 p-0">
          <SidebarGroupLabel className="px-3 text-xs font-bold uppercase tracking-wider text-slate-500">
            Hệ thống
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {systemItems.map((item) => {
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      type="button"
                      tooltip={item.label}
                      isActive={activeView === item.id}
                      onClick={() =>
                        handleViewChange(item.id)
                      }
                      className="
                        h-11 rounded-xl px-3 text-[15px]
                        text-slate-300
                        hover:bg-white/10 hover:text-white
                        data-[active=true]:bg-teal-400
                        data-[active=true]:font-bold
                        data-[active=true]:text-[#062032]
                      "
                    >
                      <Icon className="size-[18px]" />

                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              <SidebarMenuItem>
                <SidebarMenuButton
                  type="button"
                  tooltip="Cài đặt"
                  className="h-11 rounded-xl px-3 text-[15px] text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  <Settings2 className="size-[18px]" />

                  <span>Cài đặt</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="m-3 rounded-2xl border border-white/10 bg-white/5 p-3">
        <div className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-500 text-sm font-bold text-white">
            LQ
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              Lê Văn Quản
            </p>

            <p className="truncate text-xs text-slate-400">
              Quản trị viên
            </p>
          </div>

          <ChevronRight className="size-4 text-slate-400" />
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}