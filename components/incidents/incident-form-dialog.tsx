"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { TriangleAlert } from "lucide-react";
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
  Incident,
  IncidentSeverity,
  Room,
} from "@/types";

type IncidentFormDialogProps = {
  incidents: Incident[];
  rooms: Room[];
  onAddIncident: (incident: Incident) => void;
};

type FormState = {
  title: string;
  location: string;
  reportedBy: string;
  severity: IncidentSeverity;
};

function createInitialForm(): FormState {
  return {
    title: "",
    location: "",
    reportedBy: "",
    severity: "Trung bình",
  };
}

function getCurrentTime() {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());
}

export function IncidentFormDialog({
  incidents,
  rooms,
  onAddIncident,
}: IncidentFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(
    createInitialForm(),
  );

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
    setForm(createInitialForm());
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !form.title.trim() ||
      !form.location ||
      !form.reportedBy.trim()
    ) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const nextId =
      incidents.length > 0
        ? Math.max(
            ...incidents.map((incident) => incident.id),
          ) + 1
        : 1;

    const newIncident: Incident = {
      id: nextId,
      title: form.title.trim(),
      location: form.location,
      reportedBy: form.reportedBy.trim(),
      time: getCurrentTime(),
      severity: form.severity,
      status: "Mới báo",
    };

    onAddIncident(newIncident);
    toast.success("Đã gửi báo cáo sự cố");

    resetForm();
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);

        if (!value) {
          resetForm();
        }
      }}
    >
      <DialogTrigger
        render={
        <Button className="gap-2">
          <TriangleAlert className="size-4" />
          Báo sự cố
        </Button>
      }
      />

      <DialogContent className="sm:max-w-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Báo cáo sự cố mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin phòng học hoặc thiết bị gặp sự cố.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 grid gap-5">
            <div className="space-y-2">
              <Label htmlFor="incident-title">
                Nội dung sự cố
              </Label>

              <Input
                id="incident-title"
                placeholder="Ví dụ: Máy chiếu không nhận tín hiệu"
                value={form.title}
                onChange={(event) =>
                  updateField("title", event.target.value)
                }
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Vị trí</Label>

                <Select
                  value={form.location}
                  onValueChange={(value) =>
                    updateField("location", value ?? "")
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

              <div className="space-y-2">
                <Label>Mức độ</Label>

                <Select
                  value={form.severity}
                  onValueChange={(value) =>
                    updateField(
                      "severity",
                      value as IncidentSeverity,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Thấp">
                      Thấp
                    </SelectItem>
                    <SelectItem value="Trung bình">
                      Trung bình
                    </SelectItem>
                    <SelectItem value="Khẩn cấp">
                      Khẩn cấp
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reported-by">
                Người báo cáo
              </Label>

              <Input
                id="reported-by"
                placeholder="Nhập họ và tên"
                value={form.reportedBy}
                onChange={(event) =>
                  updateField(
                    "reportedBy",
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
              Gửi báo cáo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}