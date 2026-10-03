import type { LucideIcon } from "lucide-react";

import {
  BarChart3,
  CalendarDays,
  DoorOpen,
  LayoutDashboard,
  Monitor,
  Users,
  Wrench,
} from "lucide-react";

import type { View } from "@/types";

export interface NavigationItem {
  id: View;
  label: string;
  icon: LucideIcon;
  group: "main" | "system";
}

export const navigationItems: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Tổng quan",
    icon: LayoutDashboard,
    group: "main",
  },
  {
    id: "rooms",
    label: "Phòng học",
    icon: DoorOpen,
    group: "main",
  },
  {
    id: "equipment",
    label: "Thiết bị",
    icon: Monitor,
    group: "main",
  },
  {
    id: "bookings",
    label: "Lịch đăng ký",
    icon: CalendarDays,
    group: "main",
  },
  {
    id: "incidents",
    label: "Sự cố & sửa chữa",
    icon: Wrench,
    group: "main",
  },
  {
    id: "reports",
    label: "Báo cáo thống kê",
    icon: BarChart3,
    group: "main",
  },
  {
    id: "users",
    label: "Người dùng",
    icon: Users,
    group: "system",
  },
];

export const viewInformation: Record<
  View,
  {
    title: string;
    description: string;
    icon: LucideIcon;
  }
> = {
  dashboard: {
    title: "Tổng quan vận hành",
    description: "Tình hình phòng học và thiết bị trong ngày",
    icon: LayoutDashboard,
  },
  rooms: {
    title: "Quản lý phòng học",
    description: "Theo dõi vị trí, sức chứa và trạng thái phòng",
    icon: DoorOpen,
  },
  equipment: {
    title: "Quản lý thiết bị",
    description: "Theo dõi tài sản và tình trạng thiết bị",
    icon: Monitor,
  },
  bookings: {
    title: "Lịch đăng ký phòng",
    description: "Xếp lịch và xét duyệt yêu cầu sử dụng phòng",
    icon: CalendarDays,
  },
  incidents: {
    title: "Sự cố & sửa chữa",
    description: "Tiếp nhận và theo dõi quá trình xử lý sự cố",
    icon: Wrench,
  },
  reports: {
    title: "Báo cáo thống kê",
    description: "Tổng hợp hiệu suất sử dụng phòng và thiết bị",
    icon: BarChart3,
  },
  users: {
    title: "Quản lý người dùng",
    description: "Quản lý tài khoản, vai trò và quyền hạn",
    icon: Users,
  },
};