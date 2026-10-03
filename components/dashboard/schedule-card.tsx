"use client";

import {
  ArrowUpRight,
  Clock3,
} from "lucide-react";

import { bookings } from "@/data/mock-data";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ScheduleCardProps {
  onOpenBookings: () => void;
}

const scheduleColors = [
  "bg-teal-500",
  "bg-sky-500",
  "bg-violet-500",
];

export function ScheduleCard({
  onOpenBookings,
}: ScheduleCardProps) {
  const approvedBookings = bookings
    .filter((booking) => booking.status === "Đã duyệt")
    .slice(0, 3);

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="grid grid-cols-[1fr_auto] items-start">
        <div>
          <CardTitle className="text-base text-slate-900">
            Lịch sử dụng gần nhất
          </CardTitle>

          <CardDescription className="mt-1">
            {approvedBookings.length} lịch đã được duyệt
          </CardDescription>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onOpenBookings}
          aria-label="Xem lịch đăng ký"
          className="text-slate-500 hover:text-teal-700"
        >
          <ArrowUpRight className="size-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {approvedBookings.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">
            Chưa có lịch được duyệt.
          </div>
        ) : (
          approvedBookings.map((booking, index) => (
            <button
              key={booking.id}
              type="button"
              onClick={onOpenBookings}
              className="flex w-full gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 text-left transition hover:border-teal-200 hover:bg-teal-50/40"
            >
              <span
                className={`mt-1 h-12 w-1 shrink-0 rounded-full ${
                  scheduleColors[index % scheduleColors.length]
                }`}
              />

              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-bold text-slate-900">
                    {booking.course}
                  </span>

                  <Badge
                    variant="outline"
                    className="bg-white text-slate-700"
                  >
                    {booking.room}
                  </Badge>
                </span>

                <span className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock3 className="size-3.5" />
                  {booking.date} · {booking.time}
                </span>

                <span className="mt-1 block truncate text-xs text-slate-500">
                  Giảng viên: {booking.person}
                </span>
              </span>
            </button>
          ))
        )}
      </CardContent>
    </Card>
  );
}