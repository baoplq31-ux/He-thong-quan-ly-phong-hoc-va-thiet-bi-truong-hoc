
"use client";

import { ChevronRight, DoorOpen } from "lucide-react";

import type { Room } from "@/types";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RoomStatusCardProps {
  rooms: Room[];
  onOpenRooms: () => void;
}

const statusColors: Record<Room["status"], string> = {
  "Đang trống": "bg-emerald-50 text-emerald-700",
  "Đang sử dụng": "bg-amber-50 text-amber-700",
  "Bảo trì": "bg-rose-50 text-rose-700",
  "Tạm khóa": "bg-orange-50 text-orange-700",
  "Ngừng sử dụng": "bg-slate-100 text-slate-700",
};

export function RoomStatusCard({
  rooms,
  onOpenRooms,
}: RoomStatusCardProps) {
  const availableRooms = rooms.filter(
    (room) => room.status === "Đang trống",
  ).length;

  const busyRooms = rooms.filter(
    (room) => room.status === "Đang sử dụng",
  ).length;

  const maintenanceRooms = rooms.filter(
    (room) => room.status === "Bảo trì",
  ).length;
  const lockedRooms = rooms.filter(
    (room) => room.status === "Tạm khóa",
  ).length;
  const retiredRooms = rooms.filter(
    (room) => room.status === "Ngừng sử dụng",
  ).length;

  const totalRooms = rooms.length;

  const getPercentage = (value: number) =>
    totalRooms === 0
      ? 0
      : Math.round((value / totalRooms) * 100);

  const availableRate = getPercentage(availableRooms);
  const busyRate = getPercentage(busyRooms);
  const maintenanceRate = getPercentage(maintenanceRooms);
  const lockedRate = getPercentage(lockedRooms);
  const retiredRate = getPercentage(retiredRooms);

  const statistics = [
    {
      title: "Đang trống",
      value: availableRooms,
      percentage: availableRate,
      color: "bg-emerald-500",
      textColor: "text-emerald-700",
    },
    {
      title: "Đang sử dụng",
      value: busyRooms,
      percentage: busyRate,
      color: "bg-amber-500",
      textColor: "text-amber-700",
    },
    {
      title: "Bảo trì",
      value: maintenanceRooms,
      percentage: maintenanceRate,
      color: "bg-rose-500",
      textColor: "text-rose-700",
    },
    {
      title: "Tạm khóa",
      value: lockedRooms,
      percentage: lockedRate,
      color: "bg-orange-500",
      textColor: "text-orange-700",
    },
    {
      title: "Ngừng sử dụng",
      value: retiredRooms,
      percentage: retiredRate,
      color: "bg-slate-500",
      textColor: "text-slate-700",
    },
  ];

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="grid grid-cols-[1fr_auto] items-start">
        <div>
          <CardTitle className="text-base text-slate-900">
            Tình trạng phòng
          </CardTitle>

          <CardDescription className="mt-1">
            Tổng quan tình trạng sử dụng phòng học
          </CardDescription>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onOpenRooms}
          className="text-teal-700 hover:bg-teal-50 hover:text-teal-800"
        >
          Xem tất cả
          <ChevronRight className="size-4" />
        </Button>
      </CardHeader>

      <CardContent>
        {/* Thống kê số lượng */}
        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-3 md:grid-cols-3">
          {statistics.map((item) => (
            <div
              key={item.title}
              className="rounded-xl bg-white p-3 shadow-sm"
            >
              <p className="text-xs text-slate-500">
                {item.title}
              </p>

              <p className={`mt-1 text-xl font-bold ${item.textColor}`}>
                {item.value}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {item.percentage}%
              </p>
            </div>
          ))}
        </div>

        {/* Biểu đồ tỷ lệ phòng */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">
              Phân bổ phòng học
            </p>

            <p className="text-xs text-slate-500">
              {totalRooms} phòng
            </p>
          </div>

          <div
            className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100"
            aria-label="Tỷ lệ trạng thái phòng học"
          >
            <div
              className="bg-emerald-500 transition-all"
              style={{ width: `${availableRate}%` }}
            />

            <div
              className="bg-amber-500 transition-all"
              style={{ width: `${busyRate}%` }}
            />

            <div
              className="bg-rose-500 transition-all"
              style={{ width: `${maintenanceRate}%` }}
            />
            <div
              className="bg-orange-500 transition-all"
              style={{ width: `${lockedRate}%` }}
            />
            <div
              className="bg-slate-500 transition-all"
              style={{ width: `${retiredRate}%` }}
            />
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {statistics.map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-2"
              >
                <span
                  className={`size-2.5 rounded-full ${item.color}`}
                />

                <span className="text-xs text-slate-500">
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Danh sách phòng */}
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">
              Phòng học gần đây
            </p>

            <span className="text-xs text-slate-400">
              Tối đa 6 phòng
            </span>
          </div>

          {rooms.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.slice(0, 6).map((room) => (
                <button
                  key={room.id}
                  type="button"
                  onClick={onOpenRooms}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
                >
                  <span
                    className={`grid size-11 shrink-0 place-items-center rounded-xl ${statusColors[room.status]}`}
                  >
                    <DoorOpen className="size-5" />
                  </span>

                  <span className="min-w-0">
                    <span className="block font-bold text-slate-900">
                      {room.code}
                    </span>

                    <span className="block truncate text-xs text-slate-500">
                      {room.status} · {room.capacity} chỗ
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-10 text-center">
              <DoorOpen className="size-8 text-slate-300" />

              <p className="mt-2 text-sm font-medium text-slate-600">
                Chưa có phòng học
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Dữ liệu phòng học sẽ xuất hiện tại đây.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
