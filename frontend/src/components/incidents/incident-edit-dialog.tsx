"use client";

import { useState } from "react";
import { toast } from "sonner";

import type {
  Incident,
  IncidentSeverity,
  Room,
} from "@/types";

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

type IncidentEditDialogProps = {
  incident: Incident | null;
  rooms: Room[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (incident: Incident) => Promise<boolean>;
};

const SEVERITIES: IncidentSeverity[] = [
  "Thấp",
  "Trung bình",
  "Khẩn cấp",
];

type IncidentFormState = Pick<
  Incident,
  "title" | "location" | "reportedBy" | "severity"
>;

export function IncidentEditDialog({
  incident,
  rooms,
  open,
  onOpenChange,
  onSave,
}: IncidentEditDialogProps) {
  const [form, setForm] = useState<IncidentFormState>(() => ({
    title: incident?.title ?? "",
    location: incident?.location ?? "",
    reportedBy: incident?.reportedBy ?? "",
    severity: incident?.severity ?? "Trung bình",
  }));
  const [saving, setSaving] = useState(false);

  function updateField<K extends keyof IncidentFormState>(
    field: K,
    value: IncidentFormState[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!incident) {
      return;
    }

    if (!form.title.trim()) {
      toast.error(
        "Vui lòng nhập nội dung sự cố.",
      );
      return;
    }

    if (!form.location.trim()) {
      toast.error(
        "Vui lòng chọn phòng xảy ra sự cố.",
      );
      return;
    }

    if (!form.reportedBy.trim()) {
      toast.error(
        "Vui lòng nhập người báo sự cố.",
      );
      return;
    }

    setSaving(true);

    try {
      const saved = await onSave({
        ...incident,

        title: form.title.trim(),

        location: form.location
          .trim()
          .toUpperCase(),

        reportedBy: form.reportedBy.trim(),

        severity: form.severity,
      });

      if (saved) {
        toast.success(
          "Đã cập nhật thông tin sự cố.",
        );

        onOpenChange(false);
      }
    } catch {
      toast.error(
        "Không thể cập nhật sự cố.",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleDialogChange(
    value: boolean,
  ) {
    if (saving) {
      return;
    }

    onOpenChange(value);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleDialogChange}
    >
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>
            Chỉnh sửa sự cố
          </DialogTitle>

          <DialogDescription>
            Cập nhật thông tin sự cố và mức độ
            xử lý.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Nội dung sự cố */}
          <div className="space-y-2">
            <Label htmlFor="incident-edit-title">
              Nội dung sự cố
            </Label>

            <Input
              id="incident-edit-title"
              value={form.title}
              onChange={(event) =>
                updateField("title", event.target.value)
              }
              placeholder="Ví dụ: Máy chiếu không hoạt động"
              disabled={saving}
            />
          </div>

          {/* Phòng */}
          <div className="space-y-2">
            <Label htmlFor="incident-edit-location">
              Phòng xảy ra sự cố
            </Label>

            <Select
              value={form.location}
              onValueChange={(value) =>
                updateField("location", value ?? "")
              }
              disabled={saving}
            >
              <SelectTrigger
                id="incident-edit-location"
                className="w-full"
              >
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

          {/* Người báo */}
          <div className="space-y-2">
            <Label htmlFor="incident-edit-reported-by">
              Người báo sự cố
            </Label>

            <Input
              id="incident-edit-reported-by"
              value={form.reportedBy}
              onChange={(event) =>
                updateField("reportedBy", event.target.value)
              }
              placeholder="Tên người báo sự cố"
              disabled={saving}
            />
          </div>

          {/* Mức độ */}
          <div className="space-y-2">
            <Label htmlFor="incident-edit-severity">
              Mức độ
            </Label>

            <Select
              value={form.severity}
              onValueChange={(value) =>
                updateField("severity", value as IncidentSeverity)
              }
              disabled={saving}
            >
              <SelectTrigger
                id="incident-edit-severity"
                className="w-full"
              >
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {SEVERITIES.map((item) => (
                  <SelectItem
                    key={item}
                    value={item}
                  >
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Thông tin trạng thái */}
          <div className="rounded-lg border bg-slate-50 p-3 text-sm">
            <p className="text-slate-500">
              Trạng thái hiện tại
            </p>

            <p className="mt-1 font-medium text-slate-900">
              {incident?.status ?? "—"}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Trạng thái xử lý không thay đổi khi
              chỉnh sửa thông tin.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() =>
                onOpenChange(false)
              }
            >
              Hủy
            </Button>

            <Button
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Đang lưu..."
                : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}