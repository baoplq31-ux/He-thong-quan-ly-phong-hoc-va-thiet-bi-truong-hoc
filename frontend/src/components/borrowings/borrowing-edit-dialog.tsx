"use client";

import { useState, type FormEvent } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Equipment } from "@/types";
import type { BorrowingRequest, EquipmentBorrowing } from "./types";

type BorrowingEditDialogProps = {
  borrowing: EquipmentBorrowing;
  equipment: Equipment[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: number, request: BorrowingRequest) => Promise<boolean>;
};

type FormState = {
  equipmentId: string;
  quantity: string;
  purpose: string;
  borrowDate: string;
  expectedReturnDate: string;
  note: string;
};

function toInputDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toApiDate(value: string, endOfDay = false) {
  const time = endOfDay ? "T23:59:59" : "T00:00:00";
  return new Date(`${value}${time}`).toISOString();
}

export function BorrowingEditDialog({
  borrowing,
  equipment,
  open,
  onOpenChange,
  onSave,
}: BorrowingEditDialogProps) {
  const [form, setForm] = useState<FormState>(() => ({
    equipmentId: String(borrowing.equipmentId),
    quantity: String(borrowing.quantity),
    purpose: borrowing.purpose,
    borrowDate: toInputDate(borrowing.borrowDate),
    expectedReturnDate: toInputDate(borrowing.expectedReturnDate),
    note: borrowing.note ?? "",
  }));
  const [isSaving, setIsSaving] = useState(false);

  const availableEquipment = equipment.filter(
    (item) =>
      item.status !== "Hỏng" &&
      ((item.availableQuantity ?? 0) > 0 ||
        item.id === borrowing.equipmentId),
  );
  const selectedEquipment = availableEquipment.find(
    (item) => String(item.id) === form.equipmentId,
  );

  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    const quantity = Number(form.quantity);
    if (!selectedEquipment) {
      toast.error("Vui lòng chọn thiết bị còn khả dụng.");
      return;
    }
    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > (selectedEquipment.availableQuantity ?? 0)
    ) {
      toast.error("Số lượng mượn vượt quá số thiết bị hiện có.");
      return;
    }
    if (
      !form.purpose.trim() ||
      !form.borrowDate ||
      !form.expectedReturnDate ||
      form.expectedReturnDate <= form.borrowDate
    ) {
      toast.error("Vui lòng kiểm tra mục đích và thời hạn mượn.");
      return;
    }

    setIsSaving(true);
    try {
      const saved = await onSave(borrowing.id, {
        equipmentId: selectedEquipment.id,
        quantity,
        purpose: form.purpose.trim(),
        borrowDate: toApiDate(form.borrowDate),
        expectedReturnDate: toApiDate(form.expectedReturnDate, true),
        note: form.note.trim(),
      });

      if (saved) {
        toast.success("Đã cập nhật phiếu mượn.");
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
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa phiếu mượn</DialogTitle>
          <DialogDescription>
            Chỉ phiếu đang chờ duyệt mới có thể chỉnh sửa.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="edit-borrow-equipment">Thiết bị</Label>
              <Select
                value={form.equipmentId}
                disabled={isSaving}
                onValueChange={(value) =>
                  updateField("equipmentId", value ?? "")
                }
              >
                <SelectTrigger
                  id="edit-borrow-equipment"
                  className="w-full"
                >
                  <SelectValue placeholder="Chọn thiết bị" />
                </SelectTrigger>
                <SelectContent>
                  {availableEquipment.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.code} - {item.name} (còn {item.availableQuantity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-borrow-quantity">Số lượng</Label>
              <Input
                id="edit-borrow-quantity"
                type="number"
                min={1}
                max={selectedEquipment?.availableQuantity}
                step={1}
                required
                value={form.quantity}
                disabled={isSaving}
                onChange={(event) =>
                  updateField("quantity", event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-borrow-date">Ngày mượn</Label>
              <Input
                id="edit-borrow-date"
                type="date"
                required
                value={form.borrowDate}
                disabled={isSaving}
                onChange={(event) =>
                  updateField("borrowDate", event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-expected-return-date">
                Ngày dự kiến trả
              </Label>
              <Input
                id="edit-expected-return-date"
                type="date"
                min={form.borrowDate}
                required
                value={form.expectedReturnDate}
                disabled={isSaving}
                onChange={(event) =>
                  updateField("expectedReturnDate", event.target.value)
                }
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="edit-borrow-purpose">Mục đích mượn</Label>
              <Textarea
                id="edit-borrow-purpose"
                required
                maxLength={500}
                value={form.purpose}
                disabled={isSaving}
                onChange={(event) =>
                  updateField("purpose", event.target.value)
                }
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="edit-borrow-note">Ghi chú</Label>
              <Textarea
                id="edit-borrow-note"
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
              onClick={() => onOpenChange(false)}
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
