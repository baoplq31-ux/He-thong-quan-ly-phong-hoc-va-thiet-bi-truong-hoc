"use client";

import {
  Bell,
  Plus,
  Search,
} from "lucide-react";

import { toast } from "sonner";

import {
  viewInformation,
} from "@/data/navigation";

import type { View } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface AppHeaderProps {
  activeView: View;
  search: string;
  onSearchChange: (value: string) => void;
}

const actionLabels: Partial<Record<View, string>> = {
  dashboard: "Đăng ký phòng",
  rooms: "Thêm phòng",
  equipment: "Thêm thiết bị",
  bookings: "Tạo đăng ký",
  incidents: "Báo sự cố",
};

export function AppHeader({
  activeView,
  search,
  onSearchChange,
}: AppHeaderProps) {
  const information = viewInformation[activeView];
  const actionLabel = actionLabels[activeView];

  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl md:px-7">
      <SidebarTrigger className="size-9 rounded-xl text-slate-600 md:hidden" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900 md:text-base">
          {information.title}
        </p>

        <p className="hidden truncate text-xs text-slate-500 sm:block">
          {information.description}
        </p>
      </div>

      <div className="relative hidden w-full max-w-[330px] sm:block">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

        <Input
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Tìm phòng, thiết bị..."
          className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9 shadow-none"
        />
      </div>

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="relative size-10 rounded-xl"
        aria-label="Thông báo"
        onClick={() =>
          toast.info("Bạn có 3 thông báo mới")
        }
      >
        <Bell className="size-[18px]" />

        <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-white bg-rose-500" />
      </Button>

      {actionLabel && (
        <Button
          type="button"
          className="h-10 rounded-xl bg-[#0b6f6b] text-white hover:bg-[#095e5b]"
          onClick={() =>
            toast.info(
              "Biểu mẫu sẽ được xây dựng ở bước tiếp theo"
            )
          }
        >
          <Plus className="size-4" />

          <span className="hidden sm:inline">
            {actionLabel}
          </span>
        </Button>
      )}
    </header>
  );
}