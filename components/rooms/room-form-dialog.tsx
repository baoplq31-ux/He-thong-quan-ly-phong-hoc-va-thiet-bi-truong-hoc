"use client";

import {
  useState,
  type FormEvent,
} from "react";

import { toast } from "sonner";

import type { Room } from "@/types";

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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RoomFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingRooms: Room[];
  onAddRoom: (room: Room) => void;
}

export function RoomFormDialog({
  open,
  onOpenChange,
  existingRooms,
  onAddRoom,
}: RoomFormDialogProps) {
  const [roomType, setRoomType] =
    useState("Phòng lý thuyết");

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const code = String(
      formData.get("code") || ""
    )
      .trim()
      .toUpperCase();

    const name = String(
      formData.get("name") || ""
    ).trim();

    const building = String(
      formData.get("building") || ""
    ).trim();

    const floor = String(
      formData.get("floor") || ""
    ).trim();

    const capacity = Number(
      formData.get("capacity")
    );

    if (
      !code ||
      !name ||
      !building ||
      !floor
    ) {
      toast.error(
        "Vui lòng nhập đầy đủ thông tin phòng."
      );

      return;
    }

    if (
      Number.isNaN(capacity) ||
      capacity <= 0
    ) {
      toast.error(
        "Sức chứa phải lớn hơn 0."
      );

      return;
    }

    const duplicatedRoom =
      existingRooms.some(
        (room) =>
          room.code.toLowerCase() ===
          code.toLowerCase()
      );

    if (duplicatedRoom) {
      toast.error(
        `Mã phòng ${code} đã tồn tại.`
      );

      return;
    }

    const newRoom: Room = {
      id: Date.now(),
      code,
      name,
      building,
      floor,
      type: roomType,
      capacity,
      status: "Đang trống",
      equipmentCount: 0,
    };

    onAddRoom(newRoom);

    toast.success(
      `Đã thêm phòng ${code}.`
    );

    form.reset();
    setRoomType("Phòng lý thuyết");
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="rounded-2xl sm:max-w-[580px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              Thêm phòng học
            </DialogTitle>

            <DialogDescription>
              Khai báo thông tin của phòng mới.
              Phòng sẽ có trạng thái mặc định là
              đang trống.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="room-code">
                  Mã phòng
                </Label>

                <Input
                  id="room-code"
                  name="code"
                  placeholder="Ví dụ: A104"
                  className="h-10 rounded-xl"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="room-name">
                  Tên phòng
                </Label>

                <Input
                  id="room-name"
                  name="name"
                  placeholder="Phòng lý thuyết 04"
                  className="h-10 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="room-building">
                  Khu nhà
                </Label>

                <Input
                  id="room-building"
                  name="building"
                  placeholder="Khu A"
                  className="h-10 rounded-xl"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="room-floor">
                  Tầng
                </Label>

                <Input
                  id="room-floor"
                  name="floor"
                  placeholder="Tầng 1"
                  className="h-10 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Loại phòng</Label>

                <Select
                  value={roomType}
                  onValueChange={(value) => setRoomType(value ?? "")}
                >
                  <SelectTrigger className="h-10 w-full rounded-xl">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Phòng lý thuyết">
                      Phòng lý thuyết
                    </SelectItem>

                    <SelectItem value="Phòng thực hành">
                      Phòng thực hành
                    </SelectItem>

                    <SelectItem value="Phòng đa năng">
                      Phòng đa năng
                    </SelectItem>

                    <SelectItem value="Hội trường">
                      Hội trường
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="room-capacity">
                  Sức chứa
                </Label>

                <Input
                  id="room-capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  placeholder="45"
                  className="h-10 rounded-xl"
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onOpenChange(false)
              }
              className="rounded-xl"
            >
              Hủy
            </Button>

            <Button
              type="submit"
              className="rounded-xl bg-[#0b6f6b] text-white hover:bg-[#095e5b]"
            >
              Lưu phòng
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}