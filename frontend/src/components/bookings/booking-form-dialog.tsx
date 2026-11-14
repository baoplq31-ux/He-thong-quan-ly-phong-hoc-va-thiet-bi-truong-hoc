"use client";

import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import type { Booking, Room } from "@/types";

type BookingFormDialogProps = {
  requesterName: string;
  onAddBooking: (booking: Booking) => Promise<boolean>;
};

type FormState = {
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  course: string;
  attendeeCount: string;
  note: string;
};

function getToday() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createInitialForm(): FormState {
  return {
    date: getToday(),
    startTime: "07:00",
    endTime: "09:00",
    room: "",
    course: "",
    attendeeCount: "1",
    note: "",
  };
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-");

  return `${day}/${month}/${year}`;
}

export function BookingFormDialog({
  requesterName,
  onAddBooking,
}: BookingFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState<FormState>(
    createInitialForm,
  );
  const [availableRooms, setAvailableRooms] = useState<
    Pick<Room, "id" | "code" | "name" | "capacity" | "status">[]
  >([]);
  const [isSearchingRooms, setIsSearchingRooms] = useState(false);

  async function searchAvailableRooms() {
    if (
      !form.date ||
      !form.startTime ||
      !form.endTime ||
      form.startTime >= form.endTime ||
      !Number.isInteger(Number(form.attendeeCount)) ||
      Number(form.attendeeCount) < 1
    ) {
      toast.error("Vui lòng nhập ngày, khung giờ và số người hợp lệ.");
      return;
    }

    setIsSearchingRooms(true);
    setAvailableRooms([]);
    try {
      const params = new URLSearchParams({
        date: formatDate(form.date),
        start: form.startTime,
        end: form.endTime,
        attendeeCount: form.attendeeCount,
      });
      const response = await fetch(`/api/bookings?${params.toString()}`, {
        cache: "no-store",
        credentials: "include",
      });
      const result = (await response.json()) as {
        data?: Pick<Room, "id" | "code" | "name" | "capacity" | "status">[];
        message?: string;
      };

      if (!response.ok) {
        toast.error(result.message ?? "Không thể tìm phòng trống.");
        return;
      }

      setAvailableRooms(result.data ?? []);
      updateField("room", "");
      if (!result.data?.length) {
        toast.info("Không tìm thấy phòng phù hợp trong khung giờ này.");
      }
    } catch (error) {
      console.error("Không thể tìm phòng trống:", error);
      toast.error("Không thể kết nối tới máy chủ.");
    } finally {
      setIsSearchingRooms(false);
    }
  }

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

  function handleOpenChange(value: boolean) {
    if (isSaving) {
      return;
    }

    setOpen(value);

    if (!value) {
      resetForm();
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    if (
      !form.date ||
      !form.startTime ||
      !form.endTime ||
      !form.room ||
      !form.course.trim() ||
      !Number.isInteger(Number(form.attendeeCount)) ||
      Number(form.attendeeCount) < 1 ||
      !availableRooms.some((room) => room.code === form.room)
    ) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (form.startTime >= form.endTime) {
      toast.error("Giờ kết thúc phải sau giờ bắt đầu");
      return;
    }

    const bookingDate = formatDate(form.date);

    const newBooking: Booking = {
      id: 0,
      date: bookingDate,
      time: `${form.startTime}–${form.endTime}`,
      room: form.room,
      course: form.course.trim(),
      person: requesterName,
      attendeeCount: Number(form.attendeeCount),
      note: form.note.trim(),
      status: "Chờ duyệt",
    };

    setIsSaving(true);

    try {
      const saved = await onAddBooking(newBooking);

      if (!saved) {
        return;
      }

      toast.success("Đã gửi yêu cầu đặt phòng");
      resetForm();
      setOpen(false);
    } catch {
      toast.error(
        "Không thể gửi yêu cầu đặt phòng. Vui lòng thử lại.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
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
            <DialogTitle>
              Tạo yêu cầu đặt phòng
            </DialogTitle>

            <DialogDescription>
              Yêu cầu mới sẽ có trạng thái chờ duyệt.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="booking-date">
                Ngày sử dụng
              </Label>

              <Input
                id="booking-date"
                type="date"
                min={getToday()}
                value={form.date}
                disabled={isSaving}
                required
                onChange={(event) => {
                  updateField("date", event.target.value);
                  updateField("room", "");
                  setAvailableRooms([]);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="booking-room">Phòng học</Label>
              <Select
                value={form.room}
                disabled={isSaving || availableRooms.length === 0}
                onValueChange={(value) =>
                  updateField("room", value ?? "")
                }
              >
                <SelectTrigger id="booking-room" className="w-full">
                  <SelectValue placeholder="Tìm phòng theo thời gian và sức chứa" />
                </SelectTrigger>
                <SelectContent>
                  {availableRooms.map((room) => (
                    <SelectItem key={room.id} value={room.code}>
                      {room.code} - {room.name} (sức chứa {room.capacity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                disabled={isSaving || isSearchingRooms}
                onClick={() => void searchAvailableRooms()}
              >
                {isSearchingRooms ? "Đang tìm..." : "Tìm phòng trống"}
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-time">
                Giờ bắt đầu
              </Label>

              <Input
                id="start-time"
                type="time"
                value={form.startTime}
                disabled={isSaving}
                required
                onChange={(event) => {
                  updateField("startTime", event.target.value);
                  updateField("room", "");
                  setAvailableRooms([]);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-time">
                Giờ kết thúc
              </Label>

              <Input
                id="end-time"
                type="time"
                value={form.endTime}
                disabled={isSaving}
                required
                onChange={(event) => {
                  updateField("endTime", event.target.value);
                  updateField("room", "");
                  setAvailableRooms([]);
                }}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="course">
                Môn học/Nội dung
              </Label>

              <Input
                id="course"
                placeholder="Ví dụ: Thiết kế hệ thống thông tin"
                value={form.course}
                disabled={isSaving}
                required
                onChange={(event) =>
                  updateField(
                    "course",
                    event.target.value,
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="booking-attendee-count">
                Số người tham dự
              </Label>
              <Input
                id="booking-attendee-count"
                type="number"
                min={1}
                step={1}
                value={form.attendeeCount}
                disabled={isSaving}
                required
                onChange={(event) => {
                  updateField("attendeeCount", event.target.value);
                  updateField("room", "");
                  setAvailableRooms([]);
                }}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="booking-note">
                Ghi chú (không bắt buộc)
              </Label>
              <Textarea
                id="booking-note"
                maxLength={500}
                value={form.note}
                disabled={isSaving}
                onChange={(event) => updateField("note", event.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => handleOpenChange(false)}
            >
              Hủy
            </Button>

            <Button
              type="submit"
              disabled={isSaving}
            >
              {isSaving
                ? "Đang gửi..."
                : "Gửi yêu cầu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}