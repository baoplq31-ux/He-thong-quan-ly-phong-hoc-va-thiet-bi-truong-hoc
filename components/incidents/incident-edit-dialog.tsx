"use client";

import { useEffect, useState } from "react";
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

export function IncidentEditDialog({
  incident,
  rooms,
  open,
  onOpenChange,
  onSave,
}: IncidentEditDialogProps) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [reportedBy, setReportedBy] =
    useState("");

  const [severity, setSeverity] =
    useState<IncidentSeverity>("Trung bình");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!incident) {
      return;
    }

    setTitle(incident.title);
    setLocation(incident.location);
    setReportedBy(incident.reportedBy);
    setSeverity(incident.severity);
  }, [incident]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!incident) {
      return;
    }

    if (!title.trim()) {
      toast.error(
        "Vui lòng nhập nội dung sự cố.",
      );
      return;
    }

    if (!location.trim()) {
      toast.error(
        "Vui lòng chọn phòng xảy ra sự cố.",
      );
      return;
    }

    if (!reportedBy.trim()) {
      toast.error(
        "Vui lòng nhập người báo sự cố.",
      );
      return;
    }

    setSaving(true);

    try {
      const saved = await onSave({
        ...incident,

        title: title.trim(),

        location: location
          .trim()
          .toUpperCase(),

        reportedBy: reportedBy.trim(),

        severity,
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
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
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
                value={location}
                onValueChange={(value) =>
                    setLocation(value ?? "")
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
              value={reportedBy}
              onChange={(event) =>
                setReportedBy(event.target.value)
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
              value={severity}
              onValueChange={(value) =>
                setSeverity(
                  value as IncidentSeverity,
                )
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