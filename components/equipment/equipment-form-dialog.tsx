"use client";

import { useState } from "react";
import type { FormEvent } from "react";
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

import type {
  Equipment,
  EquipmentStatus,
  Room,
} from "@/types";

type EquipmentFormDialogProps = {
  equipment: Equipment[];
  rooms: Room[];
  onAddEquipment: (equipment: Equipment) => void;
};

type FormState = {
  code: string;
  name: string;
  type: string;
  room: string;
  quantity: string;
  status: EquipmentStatus;
  lastChecked: string;
};

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function createEmptyForm(): FormState {
  return {
    code: "",
    name: "",
    type: "",
    room: "",
    quantity: "1",
    status: "Tốt",
    lastChecked: getToday(),
  };
}

function formatDate(date: string) {
  const [year, month, day] = date.split("-");

  return `${day}/${month}/${year}`;
}

export function EquipmentFormDialog({
  equipment,
  rooms,
  onAddEquipment,
}: EquipmentFormDialogProps) {
  const [open, setOpen] = useState(false);

  const [form, setForm] =
    useState<FormState>(createEmptyForm());

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
    setForm(createEmptyForm());
  }

  function handleOpenChange(value: boolean) {
    setOpen(value);

    if (!value) {
      resetForm();
    }
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedCode = form.code
      .trim()
      .toUpperCase();

    const quantity = Number(form.quantity);

    if (
      !normalizedCode ||
      !form.name.trim() ||
      !form.type.trim() ||
      !form.room
    ) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      toast.error(
        "Số lượng phải là số nguyên lớn hơn 0",
      );
      return;
    }

    const duplicatedCode = equipment.some(
      (item) =>
        item.code.toLowerCase() ===
        normalizedCode.toLowerCase(),
    );

    if (duplicatedCode) {
      toast.error("Mã thiết bị đã tồn tại");
      return;
    }

    const nextId =
      equipment.length > 0
        ? Math.max(
            ...equipment.map((item) => item.id),
          ) + 1
        : 1;

    const newEquipment: Equipment = {
      id: nextId,
      code: normalizedCode,
      name: form.name.trim(),
      type: form.type.trim(),
      room: form.room,
      quantity,
      status: form.status,
      lastChecked: formatDate(
        form.lastChecked,
      ),
    };

    onAddEquipment(newEquipment);

    toast.success("Đã thêm thiết bị mới");

    resetForm();
    setOpen(false);
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
            Thêm thiết bị
          </Button>
        }
      />

      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              Thêm thiết bị mới
            </DialogTitle>

            <DialogDescription>
              Nhập thông tin và chọn phòng sử dụng
              thiết bị.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {/* Mã thiết bị */}
            <div className="space-y-2">
              <Label htmlFor="equipment-code">
                Mã thiết bị
              </Label>

              <Input
                id="equipment-code"
                placeholder="Ví dụ: TB-090"
                value={form.code}
                onChange={(event) =>
                  updateField(
                    "code",
                    event.target.value,
                  )
                }
              />
            </div>

            {/* Tên thiết bị */}
            <div className="space-y-2">
              <Label htmlFor="equipment-name">
                Tên thiết bị
              </Label>

              <Input
                id="equipment-name"
                placeholder="Ví dụ: Máy chiếu Epson"
                value={form.name}
                onChange={(event) =>
                  updateField(
                    "name",
                    event.target.value,
                  )
                }
              />
            </div>

            {/* Loại thiết bị */}
            <div className="space-y-2">
              <Label htmlFor="equipment-type">
                Loại thiết bị
              </Label>

              <Input
                id="equipment-type"
                placeholder="Máy chiếu, máy tính..."
                value={form.type}
                onChange={(event) =>
                  updateField(
                    "type",
                    event.target.value,
                  )
                }
              />
            </div>

            {/* Phòng */}
            <div className="space-y-2">
              <Label>Phòng sử dụng</Label>

              <Select
                value={form.room}
                onValueChange={(value) =>
                  updateField(
                    "room",
                    value ?? "",
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phòng" />
                </SelectTrigger>

                <SelectContent>
                  {rooms.map((room) => (
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

            {/* Số lượng */}
            <div className="space-y-2">
              <Label htmlFor="equipment-quantity">
                Số lượng
              </Label>

              <Input
                id="equipment-quantity"
                type="number"
                min={1}
                value={form.quantity}
                onChange={(event) =>
                  updateField(
                    "quantity",
                    event.target.value,
                  )
                }
              />
            </div>

            {/* Trạng thái */}
            <div className="space-y-2">
              <Label>Tình trạng</Label>

              <Select
                value={form.status}
                onValueChange={(value) => {
                  if (value !== null) {
                    updateField(
                      "status",
                      value as EquipmentStatus,
                    );
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Tốt">
                    Tốt
                  </SelectItem>

                  <SelectItem value="Cần kiểm tra">
                    Cần kiểm tra
                  </SelectItem>

                  <SelectItem value="Hỏng">
                    Hỏng
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ngày kiểm tra */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="last-checked">
                Ngày kiểm tra gần nhất
              </Label>

              <Input
                id="last-checked"
                type="date"
                value={form.lastChecked}
                onChange={(event) =>
                  updateField(
                    "lastChecked",
                    event.target.value,
                  )
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

            <Button type="submit">
              Lưu thiết bị
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}