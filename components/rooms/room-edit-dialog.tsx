"use client";

import { useEffect, useState, type FormEvent } from "react";
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

import type { Room } from "@/types";

type RoomEditDialogProps = {
  room: Room | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (room: Room) => Promise<boolean>;
};

type RoomFormState = {
  code: string;
  name: string;
  building: string;
  floor: string;
  type: string;
  capacity: number;
  status: Room["status"];
};

const EMPTY_FORM: RoomFormState = {
  code: "",
  name: "",
  building: "",
  floor: "",
  type: "",
  capacity: 1,
  status: "Đang trống",
};

export function RoomEditDialog({
  room,
  open,
  onOpenChange,
  onSave,
}: RoomEditDialogProps) {
  const [form, setForm] = useState<RoomFormState>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!room) {
      return;
    }

    setForm({
      code: room.code,
      name: room.name,
      building: room.building,
      floor: room.floor,
      type: room.type,
      capacity: room.capacity,
      status: room.status,
    });
  }, [room]);

  const updateField = <K extends keyof RoomFormState>(
    field: K,
    value: RoomFormState[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!room) {
      return;
    }

    if (
      !form.code.trim() ||
      !form.name.trim() ||
      !form.building.trim() ||
      !form.floor.trim() ||
      !form.type.trim()
    ) {
      toast.error("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (!Number.isInteger(form.capacity) || form.capacity < 1) {
      toast.error("Sức chứa phải là số nguyên lớn hơn 0.");
      return;
    }

    setIsSaving(true);

    try {
      const success = await onSave({
        ...room,
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        building: form.building.trim(),
        floor: form.floor.trim(),
        type: form.type.trim(),
        capacity: form.capacity,
        status: form.status,
      });

      if (success) {
        toast.success("Đã cập nhật phòng học.");
        onOpenChange(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

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
          <DialogTitle>Chỉnh sửa phòng học</DialogTitle>

          <DialogDescription>
            Cập nhật thông tin phòng và nhấn lưu thay đổi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-room-code">Mã phòng</Label>

              <Input
                id="edit-room-code"
                value={form.code}
                onChange={(event) =>
                  updateField("code", event.target.value.toUpperCase())
                }
                placeholder="Ví dụ: A101"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-room-name">Tên phòng</Label>

              <Input
                id="edit-room-name"
                value={form.name}
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
                placeholder="Phòng học lý thuyết"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-room-building">Tòa nhà</Label>

              <Input
                id="edit-room-building"
                value={form.building}
                onChange={(event) =>
                  updateField("building", event.target.value)
                }
                placeholder="Tòa A"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-room-floor">Tầng</Label>

              <Input
                id="edit-room-floor"
                value={form.floor}
                onChange={(event) =>
                  updateField("floor", event.target.value)
                }
                placeholder="Tầng 1"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-room-type">Loại phòng</Label>

              <Input
                id="edit-room-type"
                value={form.type}
                onChange={(event) =>
                  updateField("type", event.target.value)
                }
                placeholder="Phòng lý thuyết"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-room-capacity">Sức chứa</Label>

              <Input
                id="edit-room-capacity"
                type="number"
                min={1}
                value={form.capacity}
                onChange={(event) =>
                  updateField("capacity", Number(event.target.value))
                }
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="edit-room-status">Trạng thái</Label>

              <select
                id="edit-room-status"
                value={form.status}
                onChange={(event) =>
                  updateField(
                    "status",
                    event.target.value as Room["status"],
                  )
                }
                disabled={isSaving}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="Đang trống">Đang trống</option>
                <option value="Đang sử dụng">Đang sử dụng</option>
                <option value="Bảo trì">Bảo trì</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Hủy
            </Button>

            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}