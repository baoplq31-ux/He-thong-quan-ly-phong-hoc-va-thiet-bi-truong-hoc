"use client";

import { ChevronRight, DoorOpen } from "lucide-react";

import { rooms } from "@/data/mock-data";

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
  onOpenRooms: () => void;
}

const statusColors: Record<Room["status"], string> = {
  "Đang trống": "bg-emerald-50 text-emerald-700",
  "Đang sử dụng": "bg-amber-50 text-amber-700",
  "Bảo trì": "bg-rose-50 text-rose-700",
};

export function RoomStatusCard({
  onOpenRooms,
}: RoomStatusCardProps) {
  const availableRooms = rooms.filter(
    (room) => room.status === "Đang trống"
  ).length;

  const busyRooms = rooms.filter(
    (room) => room.status === "Đang sử dụng"
  ).length;

  const maintenanceRooms = rooms.filter(
    (room) => room.status === "Bảo trì"
  ).length;

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="grid grid-cols-[1fr_auto] items-start">
        <div>
          <CardTitle className="text-base text-slate-900">
            Tình trạng phòng
          </CardTitle>

          <CardDescription className="mt-1">
            Dữ liệu sử dụng phòng hiện tại
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
        <div className="mb-5 grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-3">
          <div className="rounded-xl bg-white p-3 shadow-sm">
            <p className="text-xs text-slate-500">
              Đang trống
            </p>

            <p className="mt-1 text-xl font-bold text-emerald-700">
              {availableRooms}
            </p>
          </div>

          <div className="rounded-xl bg-white p-3 shadow-sm">
            <p className="text-xs text-slate-500">
              Đang dùng
            </p>

            <p className="mt-1 text-xl font-bold text-amber-700">
              {busyRooms}
            </p>
          </div>

          <div className="rounded-xl bg-white p-3 shadow-sm">
            <p className="text-xs text-slate-500">
              Bảo trì
            </p>

            <p className="mt-1 text-xl font-bold text-rose-700">
              {maintenanceRooms}
            </p>
          </div>
        </div>

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
      </CardContent>
    </Card>
  );
}