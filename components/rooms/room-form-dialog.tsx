"use client";

import { useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";

import type { Room, RoomStatus } from "@/types";
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

const DEFAULT_ROOM_TYPE = "Phòng lý thuyết";
const ROOM_TYPES = [
  DEFAULT_ROOM_TYPE,
  "Phòng thực hành",
  "Phòng đa năng",
  "Hội trường",
];

interface RoomFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingRooms: Room[];
  onAddRoom: (room: Room) => Promise<boolean>;
  room?: Room | null;
  onUpdateRoom?: (room: Room) => Promise<boolean>;
}

export function RoomFormDialog({
  open,
  onOpenChange,
  existingRooms,
  onAddRoom,
  room = null,
  onUpdateRoom,
}: RoomFormDialogProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [roomType, setRoomType] = useState(room?.type ?? DEFAULT_ROOM_TYPE);
  const [roomStatus, setRoomStatus] = useState<RoomStatus>(
    room?.status ?? "Đang trống",
  );
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = room !== null;

  const roomTypes = ROOM_TYPES.includes(roomType)
    ? ROOM_TYPES
    : [roomType, ...ROOM_TYPES];

  function resetForm() {
    formRef.current?.reset();
    setRoomType(room?.type ?? DEFAULT_ROOM_TYPE);
    setRoomStatus(room?.status ?? "Đang trống");
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isSaving) return;
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;

    const formData = new FormData(event.currentTarget);
    const code = String(formData.get("code") ?? "").trim().toUpperCase();
    const name = String(formData.get("name") ?? "").trim();
    const building = String(formData.get("building") ?? "").trim();
    const floor = String(formData.get("floor") ?? "").trim();
    const capacity = Number(formData.get("capacity"));

    if (!code || !name || !building || !floor) {
      toast.error("Vui lòng nhập đầy đủ thông tin phòng.");
      return;
    }

    if (!Number.isInteger(capacity) || capacity <= 0) {
      toast.error("Sức chứa phải là số nguyên lớn hơn 0.");
      return;
    }

    const duplicatedRoom = existingRooms.some(
      (existingRoom) =>
        existingRoom.id !== room?.id &&
        existingRoom.code.trim().toUpperCase() === code,
    );

    if (duplicatedRoom) {
      toast.error(`Mã phòng ${code} đã tồn tại.`);
      return;
    }

    const fields = { code, name, building, floor, type: roomType, capacity };
    const nextRoom: Room = room
      ? { ...room, ...fields, status: roomStatus }
      : {
          id: Date.now(),
          ...fields,
          status: "Đang trống",
          equipmentCount: 0,
        };

    setIsSaving(true);

    try {
      let saved: boolean;

      if (room) {
        if (!onUpdateRoom) {
          toast.error("Chức năng cập nhật phòng chưa được kết nối.");
          return;
        }
        saved = await onUpdateRoom(nextRoom);
      } else {
        saved = await onAddRoom(nextRoom);
      }

      if (!saved) return;

      resetForm();
      onOpenChange(false);
      toast.success(isEditing ? "Đã cập nhật phòng học" : "Đã thêm phòng mới");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể lưu phòng. Vui lòng thử lại.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-[580px]">
        <form ref={formRef} onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Cập nhật phòng học" : "Thêm phòng học"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Chỉnh sửa thông tin phòng và lưu thay đổi."
                : "Khai báo thông tin của phòng mới. Phòng sẽ có trạng thái mặc định là đang trống."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="room-code">Mã phòng</Label>
                <Input
                  id="room-code"
                  name="code"
                  defaultValue={room?.code ?? ""}
                  placeholder="Ví dụ: A104"
                  className="h-10 rounded-xl"
                  disabled={isSaving}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="room-name">Tên phòng</Label>
                <Input
                  id="room-name"
                  name="name"
                  defaultValue={room?.name ?? ""}
                  placeholder="Phòng lý thuyết 04"
                  className="h-10 rounded-xl"
                  disabled={isSaving}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="room-building">Khu nhà</Label>
                <Input
                  id="room-building"
                  name="building"
                  defaultValue={room?.building ?? ""}
                  placeholder="Khu A"
                  className="h-10 rounded-xl"
                  disabled={isSaving}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="room-floor">Tầng</Label>
                <Input
                  id="room-floor"
                  name="floor"
                  defaultValue={room?.floor ?? ""}
                  placeholder="Tầng 1"
                  className="h-10 rounded-xl"
                  disabled={isSaving}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="room-type">Loại phòng</Label>
                <Select
                  value={roomType}
                  disabled={isSaving}
                  onValueChange={(value) =>
                    setRoomType(value ?? DEFAULT_ROOM_TYPE)
                  }
                >
                  <SelectTrigger id="room-type" className="h-10 w-full rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="room-capacity">Sức chứa</Label>
                <Input
                  id="room-capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  step="1"
                  defaultValue={room?.capacity ?? ""}
                  placeholder="45"
                  className="h-10 rounded-xl"
                  disabled={isSaving}
                  required
                />
              </div>
            </div>

            {isEditing && (
              <div className="grid gap-2">
                <Label htmlFor="room-status">Trạng thái</Label>
                <Select
                  value={roomStatus}
                  disabled={isSaving}
                  onValueChange={(value) => {
                    if (
                      value === "Đang trống" ||
                      value === "Đang sử dụng" ||
                      value === "Bảo trì"
                    ) {
                      setRoomStatus(value);
                    }
                  }}
                >
                  <SelectTrigger id="room-status" className="h-10 w-full rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Đang trống">Đang trống</SelectItem>
                    <SelectItem value="Đang sử dụng">Đang sử dụng</SelectItem>
                    <SelectItem value="Bảo trì">Bảo trì</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => handleOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Đang lưu..." : isEditing ? "Cập nhật phòng" : "Lưu phòng"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
