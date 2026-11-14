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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { EquipmentBorrowing } from "./types";

type BorrowingReturnDialogProps = {
  borrowing: EquipmentBorrowing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReturn: (
    id: number,
    conditionAfter: string,
    returnNote: string,
  ) => Promise<boolean>;
};

export function BorrowingReturnDialog({
  borrowing,
  open,
  onOpenChange,
  onReturn,
}: BorrowingReturnDialogProps) {
  const [conditionAfter, setConditionAfter] = useState("");
  const [returnNote, setReturnNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    if (isSaving) {
      return;
    }

    onOpenChange(nextOpen);
    if (!nextOpen) {
      setConditionAfter("");
      setReturnNote("");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!borrowing || isSaving) {
      return;
    }
    if (!conditionAfter) {
      toast.error("Vui lòng chọn tình trạng thiết bị khi trả.");
      return;
    }

    setIsSaving(true);
    try {
      const saved = await onReturn(
        borrowing.id,
        conditionAfter,
        returnNote.trim(),
      );
      if (saved) {
        toast.success("Đã xác nhận trả thiết bị.");
        setConditionAfter("");
        setReturnNote("");
        onOpenChange(false);
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Xác nhận trả thiết bị</DialogTitle>
            <DialogDescription>
              {borrowing
                ? `${borrowing.code} · ${borrowing.equipment.name}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="return-condition">Tình trạng khi trả</Label>
              <Select
                value={conditionAfter}
                disabled={isSaving}
                onValueChange={(value) => setConditionAfter(value ?? "")}
              >
                <SelectTrigger id="return-condition" className="w-full">
                  <SelectValue placeholder="Chọn tình trạng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tốt">Tốt</SelectItem>
                  <SelectItem value="Cần kiểm tra">Cần kiểm tra</SelectItem>
                  <SelectItem value="Hỏng">Hỏng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="return-note">Ghi chú (không bắt buộc)</Label>
              <Textarea
                id="return-note"
                maxLength={500}
                value={returnNote}
                disabled={isSaving}
                onChange={(event) => setReturnNote(event.target.value)}
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
            <Button type="submit" disabled={isSaving || !borrowing}>
              {isSaving ? "Đang lưu..." : "Xác nhận trả"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
