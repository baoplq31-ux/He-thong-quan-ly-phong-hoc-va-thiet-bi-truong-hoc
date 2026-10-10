"use client";

import { FormEvent, useState } from "react";
import { CalendarPlus, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Booking, Room } from "@/types";

type BookingFormDialogProps = {
  bookings: Booking[];
  rooms: Room[];
  onAddBooking: (booking: Booking) => void;
};

type FormState = {
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  course: string;
  person: string;
};

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function createInitialForm(): FormState {
  return {
    date: getToday(),
    startTime: "07:00",
    endTime: "09:00",
    room: "",
    course: "",
    person: "",
  };
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function getTimeRange(value: string) {
  const [start, end] = value
    .split(/[–—-]/)
    .map((item) => item.trim());

  return { start, end };
}

export function BookingFormDialog({
  bookings,
  rooms,
  onAddBooking,
}: BookingFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(
    createInitialForm(),
  );

  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(createInitialForm());
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !form.date ||
      !form.room ||
      !form.course.trim() ||
      !form.person.trim()
    ) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (form.startTime >= form.endTime) {
      toast.error("Giờ kết thúc phải sau giờ bắt đầu");
      return;
    }

    const bookingDate = formatDate(form.date);

    const hasConflict = bookings.some((booking) => {
      if (
        booking.room !== form.room ||
        booking.date !== bookingDate ||
        booking.status === "Từ chối"
      ) {
        return false;
      }

      const existingTime = getTimeRange(booking.time);

      if (!existingTime.start || !existingTime.end) {
        return false;
      }

      return (
        form.startTime < existingTime.end &&
        form.endTime > existingTime.start
      );
    });

    if (hasConflict) {
      toast.error("Phòng đã có lịch trong khoảng thời gian này");
      return;
    }

    const nextId =
      bookings.length > 0
        ? Math.max(...bookings.map((booking) => booking.id)) + 1
        : 1;

    const newBooking: Booking = {
      id: nextId,
      date: bookingDate,
      time: `${form.startTime}–${form.endTime}`,
      room: form.room,
      course: form.course.trim(),
      person: form.person.trim(),
      status: "Chờ duyệt",
    };

    onAddBooking(newBooking);
    toast.success("Đã gửi yêu cầu đặt phòng");

    resetForm();
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);

        if (!value) {
          resetForm();
        }
      }}
    >
      <DialogTrigger
        render={
          <Button className="gap-2">
            <Plus className="size-4" />
            Đặt phòng
          </Button>
        }
      />

      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tạo yêu cầu đặt phòng</DialogTitle>
            <DialogDescription>
              Yêu cầu mới sẽ có trạng thái chờ duyệt.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="booking-date">Ngày sử dụng</Label>
              <Input
                id="booking-date"
                type="date"
                min={getToday()}
                value={form.date}
                onChange={(event) =>
                  updateField("date", event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Phòng học</Label>

              <Select
                value={form.room}
                onValueChange={(value) =>
                  updateField("room", value ?? "")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phòng" />
                </SelectTrigger>

                <SelectContent>
                  {rooms
                    .filter(
                      (room) => room.status !== "Bảo trì",
                    )
                    .map((room) => (
                      <SelectItem
                        key={room.id}
                        value={room.code}
                      >
                        {room.code} - {room.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-time">Giờ bắt đầu</Label>
              <Input
                id="start-time"
                type="time"
                value={form.startTime}
                onChange={(event) =>
                  updateField("startTime", event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-time">Giờ kết thúc</Label>
              <Input
                id="end-time"
                type="time"
                value={form.endTime}
                onChange={(event) =>
                  updateField("endTime", event.target.value)
                }
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="course">Môn học/Nội dung</Label>
              <Input
                id="course"
                placeholder="Ví dụ: Thiết kế hệ thống thông tin"
                value={form.course}
                onChange={(event) =>
                  updateField("course", event.target.value)
                }
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="person">Người đăng ký</Label>
              <Input
                id="person"
                placeholder="Nhập họ và tên"
                value={form.person}
                onChange={(event) =>
                  updateField("person", event.target.value)
                }
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>

            <Button type="submit">Gửi yêu cầu</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}