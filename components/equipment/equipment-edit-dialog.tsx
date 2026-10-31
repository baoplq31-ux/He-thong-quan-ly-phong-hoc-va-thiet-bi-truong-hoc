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

import type { Equipment, Room } from "@/types";

type EquipmentEditDialogProps = {
  equipment: Equipment | null;
  rooms: Room[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (equipment: Equipment) => Promise<boolean>;
};

type EquipmentFormState = {
  code: string;
  name: string;
  type: string;
  room: string;
  quantity: number;
  status: Equipment["status"];
  lastChecked: string;
};

const EMPTY_FORM: EquipmentFormState = {
  code: "",
  name: "",
  type: "",
  room: "",
  quantity: 1,
  status: "Tốt",
  lastChecked: "",
};

export function EquipmentEditDialog({
  equipment,
  rooms,
  open,
  onOpenChange,
  onSave,
}: EquipmentEditDialogProps) {
  const [form, setForm] =
    useState<EquipmentFormState>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!equipment) {
      return;
    }

    setForm({
      code: equipment.code,
      name: equipment.name,
      type: equipment.type,
      room: equipment.room,
      quantity: equipment.quantity,
      status: equipment.status,
      lastChecked: equipment.lastChecked,
    });
  }, [equipment]);

  const updateField = <K extends keyof EquipmentFormState>(
    field: K,
    value: EquipmentFormState[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!equipment) {
      return;
    }

    if (
      !form.code.trim() ||
      !form.name.trim() ||
      !form.type.trim() ||
      !form.room.trim() ||
      !form.lastChecked.trim()
    ) {
      toast.error("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (!Number.isInteger(form.quantity) || form.quantity < 1) {
      toast.error("Số lượng phải là số nguyên lớn hơn 0.");
      return;
    }

    setIsSaving(true);

    try {
      const success = await onSave({
        ...equipment,
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        type: form.type.trim(),
        room: form.room.trim().toUpperCase(),
        quantity: form.quantity,
        status: form.status,
        lastChecked: form.lastChecked.trim(),
      });

      if (success) {
        toast.success("Đã cập nhật thiết bị.");
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
          <DialogTitle>Chỉnh sửa thiết bị</DialogTitle>

          <DialogDescription>
            Cập nhật thông tin và vị trí của thiết bị.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-equipment-code">
                Mã thiết bị
              </Label>

              <Input
                id="edit-equipment-code"
                value={form.code}
                onChange={(event) =>
                  updateField(
                    "code",
                    event.target.value.toUpperCase(),
                  )
                }
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-equipment-name">
                Tên thiết bị
              </Label>

              <Input
                id="edit-equipment-name"
                value={form.name}
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-equipment-type">
                Loại thiết bị
              </Label>

              <Input
                id="edit-equipment-type"
                value={form.type}
                onChange={(event) =>
                  updateField("type", event.target.value)
                }
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-equipment-room">
                Phòng
              </Label>

              <select
                id="edit-equipment-room"
                value={form.room}
                onChange={(event) =>
                  updateField("room", event.target.value)
                }
                disabled={isSaving}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Chọn phòng</option>

                {rooms.map((room) => (
                  <option key={room.id} value={room.code}>
                    {room.code} - {room.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-equipment-quantity">
                Số lượng
              </Label>

              <Input
                id="edit-equipment-quantity"
                type="number"
                min={1}
                value={form.quantity}
                onChange={(event) =>
                  updateField(
                    "quantity",
                    Number(event.target.value),
                  )
                }
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-equipment-status">
                Trạng thái
              </Label>

              <select
                id="edit-equipment-status"
                value={form.status}
                onChange={(event) =>
                  updateField(
                    "status",
                    event.target.value as Equipment["status"],
                  )
                }
                disabled={isSaving}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="Tốt">Tốt</option>
                <option value="Cần kiểm tra">
                  Cần kiểm tra
                </option>
                <option value="Hỏng">Hỏng</option>
              </select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="edit-equipment-date">
                Ngày kiểm tra gần nhất
              </Label>

              <Input
                id="edit-equipment-date"
                value={form.lastChecked}
                onChange={(event) =>
                  updateField(
                    "lastChecked",
                    event.target.value,
                  )
                }
                placeholder="Ví dụ: 19/10/2026"
                disabled={isSaving}
              />
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