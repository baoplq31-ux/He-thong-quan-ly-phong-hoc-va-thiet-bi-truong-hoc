"use client";

import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  MapPin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Booking } from "@/types";

type ScheduleCardProps = {
  bookings: Booking[];
  onOpenBookings: () => void;
};

export function ScheduleCard({
  bookings,
  onOpenBookings,
}: ScheduleCardProps) {
  const approvedBookings = bookings
    .filter((booking) => booking.status === "Đã duyệt")
    .slice(0, 4);

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Lịch sử dụng
          </p>
          <CardTitle className="mt-1">
            Lịch đã duyệt
          </CardTitle>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenBookings}
        >
          <ArrowUpRight className="size-5" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {approvedBookings.map((booking) => (
          <div
            key={booking.id}
            className="rounded-xl border border-slate-200 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-slate-950">
                  {booking.course}
                </p>

                <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="size-3.5" />
                    {booking.date}
                  </span>

                  <span className="flex items-center gap-1">
                    <Clock3 className="size-3.5" />
                    {booking.time}
                  </span>

                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {booking.room}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {approvedBookings.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">
            Chưa có lịch nào được duyệt.
          </p>
        )}
      </CardContent>
    </Card>
  );
}