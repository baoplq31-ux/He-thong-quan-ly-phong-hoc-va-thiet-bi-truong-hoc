import {
  AlertTriangle,
  Building2,
  ClipboardClock,
  MonitorCog,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type {
  Booking,
  Equipment,
  Incident,
  Room,
} from "@/types";

type SummaryCardsProps = {
  rooms: Room[];
  equipment: Equipment[];
  bookings: Booking[];
  incidents: Incident[];
};

export function SummaryCards({
  rooms,
  equipment,
  bookings,
  incidents,
}: SummaryCardsProps) {
  const availableRooms = rooms.filter(
    (room) => room.status === "Đang trống",
  ).length;

  const totalEquipment = equipment.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const healthyEquipment = equipment.filter(
    (item) => item.status === "Tốt",
  ).length;

  const healthRate =
    equipment.length === 0
      ? 0
      : Math.round(
          (healthyEquipment / equipment.length) * 100,
        );

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "Chờ duyệt",
  ).length;

  const openIncidents = incidents.filter(
    (incident) => incident.status !== "Đã xử lý",
  ).length;

  const urgentIncidents = incidents.filter(
    (incident) =>
      incident.status !== "Đã xử lý" &&
      incident.severity === "Khẩn cấp",
  ).length;

  const statistics = [
    {
      title: "Tổng số phòng",
      value: rooms.length,
      description: `${availableRooms} phòng đang trống`,
      icon: Building2,
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Thiết bị quản lý",
      value: totalEquipment,
      description: `${healthRate}% hoạt động tốt`,
      icon: MonitorCog,
      color: "bg-violet-50 text-violet-700",
    },
    {
      title: "Yêu cầu chờ duyệt",
      value: pendingBookings,
      description: "Yêu cầu đặt phòng",
      icon: ClipboardClock,
      color: "bg-amber-50 text-amber-700",
    },
    {
      title: "Sự cố đang mở",
      value: openIncidents,
      description: `${urgentIncidents} sự cố khẩn cấp`,
      icon: AlertTriangle,
      color: "bg-rose-50 text-rose-700",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statistics.map((statistic) => {
        const Icon = statistic.icon;

        return (
          <Card
            key={statistic.title}
            className="border-slate-200 shadow-sm"
          >
            <CardContent className="flex items-start justify-between p-5">
              <div>
                <p className="text-sm text-slate-500">
                  {statistic.title}
                </p>

                <p className="mt-2 text-3xl font-semibold text-slate-950">
                  {statistic.value}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {statistic.description}
                </p>
              </div>

              <div
                className={`flex size-11 items-center justify-center rounded-xl ${statistic.color}`}
              >
                <Icon className="size-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}