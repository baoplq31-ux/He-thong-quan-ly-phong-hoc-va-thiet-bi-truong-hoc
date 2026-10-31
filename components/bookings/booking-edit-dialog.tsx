"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { Booking, Room } from "@/types";

type BookingEditDialogProps = {
  booking: Booking | null;
  rooms: Room[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (booking: Booking) => Promise<boolean>;
};

type BookingFormState = {
  date: string;
  time: string;
  room: string;
  course: string;
  person: string;
};

const EMPTY_FORM: BookingFormState = {
  date: "",
  time: "",
  room: "",
  course: "",
  person: "",
};

export function BookingEditDialog({
  booking,
  rooms,
  open,
  onOpenChange,
  onSave,
}: BookingEditDialogProps) {
  const [form, setForm] =
    useState<BookingFormState>(EMPTY_FORM);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!booking) {
      return;
    }

    setForm({
      date: booking.date,
      time: booking.time,
      room: booking.room,
      course: booking.course,
      person: booking.person,
    });
  }, [booking]);

  const updateField = <
    K extends keyof BookingFormState,
  >(
    field: K,
    value: BookingFormState[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!booking || isSaving) {
      return;
    }

    if (
      !form.date.trim() ||
      !form.time.trim() ||
      !form.room.trim() ||
      !form.course.trim() ||
      !form.person.trim()
    ) {
      toast.error("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    setIsSaving(true);

    try {
      const saved = await onSave({
        ...booking,
        date: form.date.trim(),
        time: form.time.trim(),
        room: form.room.trim().toUpperCase(),
        course: form.course.trim(),
        person: form.person.trim(),
      });

      if (saved) {
        toast.success(
          "Đã cập nhật lịch đặt. Lịch cần duyệt lại.",
        );
        onOpenChange(false);
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isSaving) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Chỉnh sửa lịch đặt phòng
          </DialogTitle>

          <DialogDescription>
            Lịch sẽ chuyển về trạng thái chờ duyệt sau
            khi chỉnh sửa.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-booking-date">
                Ngày sử dụng
              </Label>

              <Input
                id="edit-booking-date"
                type="date"
                value={form.date}
                onChange={(event) =>
                  updateField("date", event.target.value)
                }
                disabled={isSaving}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-booking-time">
                Khung giờ
              </Label>

              <Input
                id="edit-booking-time"
                value={form.time}
                onChange={(event) =>
                  updateField("time", event.target.value)
                }
                placeholder="07:00 - 09:00"
                disabled={isSaving}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-booking-room">
                Phòng
              </Label>

              <select
                id="edit-booking-room"
                value={form.room}
                onChange={(event) =>
                  updateField("room", event.target.value)
                }
                disabled={isSaving}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                required
              >
                <option value="">Chọn phòng</option>

                {rooms.map((room) => (
                  <option
                    key={room.id}
                    value={room.code}
                    disabled={room.status === "Bảo trì"}
                  >
                    {room.code} - {room.name}
                    {room.status === "Bảo trì"
                      ? " (Bảo trì)"
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-booking-course">
                Môn học hoặc mục đích
              </Label>

              <Input
                id="edit-booking-course"
                value={form.course}
                onChange={(event) =>
                  updateField(
                    "course",
                    event.target.value,
                  )
                }
                disabled={isSaving}
                required
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="edit-booking-person">
                Người đăng ký
              </Label>

              <Input
                id="edit-booking-person"
                value={form.person}
                onChange={(event) =>
                  updateField(
                    "person",
                    event.target.value,
                  )
                }
                disabled={isSaving}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>

            <Button type="submit" disabled={isSaving}>
              {isSaving
                ? "Đang lưu..."
                : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}