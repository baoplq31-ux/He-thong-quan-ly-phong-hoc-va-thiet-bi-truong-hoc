"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  CircleCheckBig,
  CircleX,
  Clock3,
  SearchX,
} from "lucide-react";
import { toast } from "sonner";

import { BookingFormDialog } from "./booking-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  Booking,
  BookingStatus,
  Room,
} from "@/types";

type BookingsViewProps = {
  bookings: Booking[];
  rooms: Room[];
  search: string;
  onAddBooking: (booking: Booking) => void;
  onUpdateStatus: (
    id: number,
    status: BookingStatus,
  ) => void;
  canApprove: boolean;
};

type StatusFilter = "all" | BookingStatus;

function getStatusClass(status: BookingStatus) {
  switch (status) {
    case "Đã duyệt":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "Chờ duyệt":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "Từ chối":
      return "border-rose-200 bg-rose-50 text-rose-700";
  }
}

export function BookingsView({
  bookings,
  rooms,
  search,
  onAddBooking,
  onUpdateStatus,
  canApprove,
}: BookingsViewProps) {
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const filteredBookings = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesStatus =
        statusFilter === "all" ||
        booking.status === statusFilter;

      const matchesSearch =
        !keyword ||
        [
          booking.room,
          booking.course,
          booking.person,
          booking.date,
          booking.time,
          booking.status,
        ].some((value) =>
          value.toLowerCase().includes(keyword),
        );

      return matchesStatus && matchesSearch;
    });
  }, [bookings, search, statusFilter]);

  const pending = bookings.filter(
    (booking) => booking.status === "Chờ duyệt",
  ).length;

  const approved = bookings.filter(
    (booking) => booking.status === "Đã duyệt",
  ).length;

  const rejected = bookings.filter(
    (booking) => booking.status === "Từ chối",
  ).length;

  const summaries = [
    {
      title: "Tổng yêu cầu",
      value: bookings.length,
      icon: CalendarDays,
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Chờ duyệt",
      value: pending,
      icon: Clock3,
      color: "bg-amber-50 text-amber-700",
    },
    {
      title: "Đã duyệt",
      value: approved,
      icon: CircleCheckBig,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Từ chối",
      value: rejected,
      icon: CircleX,
      color: "bg-rose-50 text-rose-700",
    },
  ];

  function updateStatus(
    id: number,
    status: BookingStatus,
  ) {
    onUpdateStatus(id, status);

    toast.success(
      status === "Đã duyệt"
        ? "Đã duyệt yêu cầu đặt phòng"
        : "Đã từ chối yêu cầu",
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">
            Quản lý lịch đặt phòng
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Tiếp nhận và xử lý các yêu cầu sử dụng phòng.
          </p>
        </div>

        <BookingFormDialog
          bookings={bookings}
          rooms={rooms}
          onAddBooking={onAddBooking}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaries.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.title}>
              <CardContent className="flex items-center gap-4 p-5">
                <div
                  className={`flex size-11 items-center justify-center rounded-xl ${item.color}`}
                >
                  <Icon className="size-5" />
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    {item.title}
                  </p>
                  <p className="text-2xl font-semibold">
                    {item.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Danh sách yêu cầu</CardTitle>

          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as StatusFilter)
            }
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                Tất cả trạng thái
              </SelectItem>
              <SelectItem value="Chờ duyệt">
                Chờ duyệt
              </SelectItem>
              <SelectItem value="Đã duyệt">
                Đã duyệt
              </SelectItem>
              <SelectItem value="Từ chối">
                Từ chối
              </SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Phòng</TableHead>
                  <TableHead>Nội dung</TableHead>
                  <TableHead>Người đăng ký</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <p className="font-medium">
                        {booking.date}
                      </p>
                      <p className="text-xs text-slate-500">
                        {booking.time}
                      </p>
                    </TableCell>

                    <TableCell className="font-medium">
                      {booking.room}
                    </TableCell>

                    <TableCell>{booking.course}</TableCell>

                    <TableCell>{booking.person}</TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusClass(
                          booking.status,
                        )}
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>

                    <TableCell>
                        {booking.status === "Chờ duyệt" ? (
    canApprove ? (
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() =>
            updateStatus(
              booking.id,
              "Đã duyệt",
            )
          }
        >
          Duyệt
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="text-rose-600"
          onClick={() =>
            updateStatus(
              booking.id,
              "Từ chối",
            )
          }
        >
          Từ chối
        </Button>
      </div>
    ) : (
      <span className="text-sm text-amber-600">
        Chờ quản lý duyệt
      </span>
    )
  ) : (
    <span className="text-sm text-slate-400">
      Đã xử lý
    </span>
  )}
</TableCell>
                  </TableRow>
                ))}

                {filteredBookings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-52">
                      <div className="flex flex-col items-center gap-2 text-slate-500">
                        <SearchX className="size-8" />
                        <p>Không tìm thấy yêu cầu phù hợp</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}