
"use client";

import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  MapPin,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
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

function parseBookingDate(date: string): Date {
  const value = date.trim();

  // Định dạng YYYY-MM-DD hoặc YYYY-MM-DDTHH:mm:ss...
  const isoMatch = value.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})/,
  );

  if (isoMatch) {
    return new Date(
      Number(isoMatch[1]),
      Number(isoMatch[2]) - 1,
      Number(isoMatch[3]),
    );
  }

  // Định dạng DD-MM-YYYY hoặc DD/MM/YYYY
  const dayFirstMatch = value.match(
    /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/,
  );

  if (dayFirstMatch) {
    return new Date(
      Number(dayFirstMatch[3]),
      Number(dayFirstMatch[2]) - 1,
      Number(dayFirstMatch[1]),
    );
  }

  // Định dạng YYYY/MM/DD
  const yearFirstMatch = value.match(
    /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/,
  );

  if (yearFirstMatch) {
    return new Date(
      Number(yearFirstMatch[1]),
      Number(yearFirstMatch[2]) - 1,
      Number(yearFirstMatch[3]),
    );
  }

  return new Date(value);
}

export function ScheduleCard({
  bookings,
  onOpenBookings,
}: ScheduleCardProps) {
  const approvedBookings = bookings
    .filter((booking) => booking.status === "Đã duyệt")
    .map((booking) => ({
      ...booking,
      sortDate: parseBookingDate(booking.date),
    }))
    .filter(
      (booking) => !Number.isNaN(booking.sortDate.getTime()),
    )
    .sort(
      (a, b) =>
        a.sortDate.getTime() - b.sortDate.getTime(),
    );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingBookings = approvedBookings.filter(
    (booking) => booking.sortDate >= today,
  );

  const displayedBookings = upcomingBookings.slice(0, 4);

  const pendingCount = bookings.filter(
    (booking) => booking.status === "Chờ duyệt",
  ).length;

  const approvedCount = bookings.filter(
    (booking) => booking.status === "Đã duyệt",
  ).length;

  const rejectedCount = bookings.filter(
    (booking) => booking.status === "Từ chối",
  ).length;

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Lịch sử dụng
          </p>
          <CardTitle className="mt-1">
            Lịch đặt phòng sắp tới
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

      <CardContent className="space-y-4">
        {/* Thống kê trạng thái */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-amber-50 p-3">
            <p className="text-xl font-semibold text-amber-700">
              {pendingCount}
            </p>
            <p className="text-xs text-amber-700">
              Chờ duyệt
            </p>
          </div>

          <div className="rounded-xl bg-emerald-50 p-3">
            <p className="text-xl font-semibold text-emerald-700">
              {approvedCount}
            </p>
            <p className="text-xs text-emerald-700">
              Đã duyệt
            </p>
          </div>

          <div className="rounded-xl bg-rose-50 p-3">
            <p className="text-xl font-semibold text-rose-700">
              {rejectedCount}
            </p>
            <p className="text-xs text-rose-700">
              Từ chối
            </p>
          </div>
        </div>

        {/* Danh sách lịch sắp tới */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">
              Lịch đã được duyệt
            </p>

            <Badge variant="outline">
              {upcomingBookings.length} lịch sắp tới
            </Badge>
          </div>

          <div className="space-y-3">
            {displayedBookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-xl border border-slate-200 p-4"
              >
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
            ))}
          </div>

          {displayedBookings.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">
              Không có lịch đặt phòng sắp tới.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
