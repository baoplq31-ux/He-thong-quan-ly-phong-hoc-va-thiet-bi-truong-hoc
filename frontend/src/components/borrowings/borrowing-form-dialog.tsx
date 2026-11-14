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
import type { Equipment } from "@/types";
import type { BorrowingRequest } from "./types";

type BorrowingFormDialogProps = {
  equipment: Equipment[];
  onCreateBorrowing: (request: BorrowingRequest) => Promise<boolean>;
};

type FormState = {
  equipmentId: string;
  quantity: string;
  purpose: string;
  borrowDate: string;
  expectedReturnDate: string;
  note: string;
};

function dateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createInitialForm(): FormState {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return {
    equipmentId: "",
    quantity: "1",
    purpose: "",
    borrowDate: dateInputValue(new Date()),
    expectedReturnDate: dateInputValue(tomorrow),
    note: "",
  };
}

function toApiDate(value: string, endOfDay = false) {
  const time = endOfDay ? "T23:59:59" : "T00:00:00";
  return new Date(`${value}${time}`).toISOString();
}

export function BorrowingFormDialog({
  equipment,
  onCreateBorrowing,
}: BorrowingFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<FormState>(createInitialForm);

  const availableEquipment = equipment.filter(
    (item) =>
      item.status !== "Hỏng" &&
      (item.availableQuantity ?? 0) > 0,
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

  function handleOpenChange(nextOpen: boolean) {
    if (isSaving) {
      return;
    }

    setOpen(nextOpen);
    if (!nextOpen) {
      setForm(createInitialForm());
    }
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
    if (!form.purpose.trim()) {
      toast.error("Vui lòng nhập mục đích mượn.");
      return;
    }
    if (form.expectedReturnDate <= form.borrowDate) {
      toast.error("Ngày dự kiến trả phải sau ngày mượn.");
      return;
    }

    setIsSaving(true);
    try {
      const saved = await onCreateBorrowing({
        equipmentId: selectedEquipment.id,
        quantity,
        purpose: form.purpose.trim(),
        borrowDate: toApiDate(form.borrowDate),
        expectedReturnDate: toApiDate(form.expectedReturnDate, true),
        note: form.note.trim(),
      });

      if (saved) {
        toast.success("Đã gửi yêu cầu mượn thiết bị.");
        setForm(createInitialForm());
        setOpen(false);
      }
    } catch {
      toast.error("Không thể gửi yêu cầu mượn. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            type="button"
            className="gap-2"
          >
            <Plus className="size-4" />
            Đăng ký mượn
          </Button>
        }
      />

      <DialogContent className="sm:max-w-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Đăng ký mượn thiết bị</DialogTitle>
            <DialogDescription>
              Yêu cầu sẽ được gửi đến cán bộ thiết bị để xét duyệt.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="borrow-equipment">Thiết bị</Label>
              <Select
                value={form.equipmentId}
                disabled={isSaving || availableEquipment.length === 0}
                onValueChange={(value) =>
                  updateField("equipmentId", value ?? "")
                }
              >
                <SelectTrigger id="borrow-equipment" className="w-full">
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
              {availableEquipment.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Hiện không có thiết bị khả dụng để đăng ký mượn.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="borrow-quantity">Số lượng</Label>
              <Input
                id="borrow-quantity"
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
              {selectedEquipment && (
                <p className="text-xs text-muted-foreground">
                  Có thể mượn tối đa {selectedEquipment.availableQuantity}.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="borrow-date">Ngày mượn</Label>
              <Input
                id="borrow-date"
                type="date"
                min={dateInputValue(new Date())}
                required
                value={form.borrowDate}
                disabled={isSaving}
                onChange={(event) =>
                  updateField("borrowDate", event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected-return-date">Ngày dự kiến trả</Label>
              <Input
                id="expected-return-date"
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
              <Label htmlFor="borrow-purpose">Mục đích mượn</Label>
              <Textarea
                id="borrow-purpose"
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
              <Label htmlFor="borrow-note">Ghi chú (không bắt buộc)</Label>
              <Textarea
                id="borrow-note"
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
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Đang gửi..." : "Gửi yêu cầu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
