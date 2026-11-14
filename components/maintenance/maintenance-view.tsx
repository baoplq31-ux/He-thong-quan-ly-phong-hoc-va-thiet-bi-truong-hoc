"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import type { MaintenanceRecord } from "./types";

type CreateMaintenance = {
  equipmentId: number;
  quantity: number;
  type: string;
  issueDescription: string;
  startDate: string;
  content: string;
  assignedTo: string;
};

type MaintenanceViewProps = {
  equipment: Equipment[];
  records: MaintenanceRecord[];
  onCreate: (data: CreateMaintenance) => Promise<boolean>;
  onComplete: (
    id: number,
    data: { repairResult: string; conditionAfter: string; cost: number | null },
  ) => Promise<boolean>;
};

function dateValueNow() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function MaintenanceView({
  equipment,
  records,
  onCreate,
  onComplete,
}: MaintenanceViewProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [equipmentId, setEquipmentId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [maintenanceType, setMaintenanceType] = useState("Sửa chữa");
  const [issueDescription, setIssueDescription] = useState("");
  const [startDate, setStartDate] = useState(dateValueNow());
  const [content, setContent] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [completingRecord, setCompletingRecord] =
    useState<MaintenanceRecord | null>(null);
  const [repairResult, setRepairResult] = useState("");
  const [conditionAfter, setConditionAfter] = useState("");
  const [cost, setCost] = useState("");
  const selectedEquipment = equipment.find(
    (item) => String(item.id) === equipmentId,
  );

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) {
      return;
    }

    const parsedQuantity = Number(quantity);
    if (!selectedEquipment) {
      toast.error("Vui lòng chọn thiết bị.");
      return;
    }
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      toast.error("Số lượng cần bảo trì không hợp lệ.");
      return;
    }

    setIsSaving(true);
    try {
      if (
        await onCreate({
          equipmentId: selectedEquipment.id,
          quantity: parsedQuantity,
          type: maintenanceType,
          issueDescription: issueDescription.trim(),
          startDate: new Date(`${startDate}T00:00:00`).toISOString(),
          content: content.trim(),
          assignedTo: assignedTo.trim(),
        })
      ) {
        toast.success("Đã tạo phiếu bảo trì.");
        setFormOpen(false);
        setEquipmentId("");
        setQuantity("1");
        setIssueDescription("");
        setContent("");
        setAssignedTo("");
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleComplete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!completingRecord || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      if (
        await onComplete(completingRecord.id, {
          repairResult: repairResult.trim(),
          conditionAfter,
          cost: cost.trim() ? Number(cost) : null,
        })
      ) {
        toast.success("Đã hoàn thành phiếu bảo trì.");
        setCompletingRecord(null);
        setRepairResult("");
        setConditionAfter("");
        setCost("");
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold">Bảo trì thiết bị</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ghi nhận thiết bị hỏng, phân công và cập nhật kết quả sửa chữa.
          </p>
        </div>
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogTrigger
            render={<Button type="button">Tạo phiếu bảo trì</Button>}
          />
          <DialogContent className="sm:max-w-xl">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Phiếu bảo trì mới</DialogTitle>
                <DialogDescription>
                  Số lượng đưa vào bảo trì sẽ tạm thời không khả dụng để mượn.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="maintenance-equipment">Thiết bị</Label>
                  <Select
                    value={equipmentId}
                    disabled={isSaving}
                    onValueChange={(value) => setEquipmentId(value ?? "")}
                  >
                    <SelectTrigger
                      id="maintenance-equipment"
                      className="w-full"
                    >
                      <SelectValue placeholder="Chọn thiết bị" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipment.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.code} - {item.name} (tổng {item.quantity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenance-quantity">
                    Số lượng hỏng/bảo trì
                  </Label>
                  <Input
                    id="maintenance-quantity"
                    type="number"
                    min={1}
                    max={selectedEquipment?.quantity}
                    value={quantity}
                    disabled={isSaving}
                    onChange={(event) => setQuantity(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenance-type">Loại bảo trì</Label>
                  <Select
                    value={maintenanceType}
                    disabled={isSaving}
                    onValueChange={(value) =>
                      setMaintenanceType(value ?? "Sửa chữa")
                    }
                  >
                    <SelectTrigger id="maintenance-type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sửa chữa">Sửa chữa</SelectItem>
                      <SelectItem value="Bảo dưỡng">Bảo dưỡng</SelectItem>
                      <SelectItem value="Kiểm tra">Kiểm tra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenance-start">Ngày bắt đầu</Label>
                  <Input
                    id="maintenance-start"
                    type="date"
                    value={startDate}
                    disabled={isSaving}
                    onChange={(event) => setStartDate(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenance-assignee">
                    Nhân viên phụ trách
                  </Label>
                  <Input
                    id="maintenance-assignee"
                    value={assignedTo}
                    disabled={isSaving}
                    onChange={(event) => setAssignedTo(event.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="maintenance-issue">Mô tả lỗi</Label>
                  <Textarea
                    id="maintenance-issue"
                    value={issueDescription}
                    disabled={isSaving}
                    onChange={(event) =>
                      setIssueDescription(event.target.value)
                    }
                    required
                    maxLength={1000}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="maintenance-content">Nội dung công việc</Label>
                  <Textarea
                    id="maintenance-content"
                    value={content}
                    disabled={isSaving}
                    onChange={(event) => setContent(event.target.value)}
                    required
                    maxLength={1000}
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSaving}
                  onClick={() => setFormOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Đang lưu..." : "Tạo phiếu"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử bảo trì</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {records.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Chưa có phiếu bảo trì.
            </p>
          ) : (
            records.map((record) => (
              <div
                key={record.id}
                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">
                      {record.equipment.code} · {record.equipment.name}
                    </span>
                    <Badge
                      variant={
                        record.status === "Đã hoàn thành"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {record.status}
                    </Badge>
                  </div>
                  <p className="text-sm">
                    {record.type} · Số lượng: {record.quantity} ·{" "}
                    {record.issueDescription}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Bắt đầu:{" "}
                    {new Date(record.startDate).toLocaleDateString("vi-VN")}
                    {record.endDate
                      ? ` · Hoàn thành: ${new Date(record.endDate).toLocaleDateString("vi-VN")}`
                      : ""}
                    {record.assignedTo ? ` · Phụ trách: ${record.assignedTo}` : ""}
                  </p>
                  {record.repairResult && (
                    <p className="text-sm text-muted-foreground">
                      Kết quả: {record.repairResult} · Tình trạng:{" "}
                      {record.conditionAfter}
                    </p>
                  )}
                </div>
                {record.status === "Đang xử lý" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCompletingRecord(record)}
                  >
                    Hoàn thành
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog
        open={completingRecord !== null}
        onOpenChange={(open) => {
          if (!open && !isSaving) {
            setCompletingRecord(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleComplete}>
            <DialogHeader>
              <DialogTitle>Hoàn thành bảo trì</DialogTitle>
              <DialogDescription>
                {completingRecord?.equipment.code} ·{" "}
                {completingRecord?.equipment.name}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="repair-result">Kết quả xử lý</Label>
                <Textarea
                  id="repair-result"
                  value={repairResult}
                  disabled={isSaving}
                  onChange={(event) => setRepairResult(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maintenance-condition">
                  Tình trạng sau sửa chữa
                </Label>
                <Select
                  value={conditionAfter}
                  disabled={isSaving}
                  onValueChange={(value) => setConditionAfter(value ?? "")}
                >
                  <SelectTrigger
                    id="maintenance-condition"
                    className="w-full"
                  >
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
                <Label htmlFor="maintenance-cost">Chi phí (không bắt buộc)</Label>
                <Input
                  id="maintenance-cost"
                  type="number"
                  min={0}
                  step="any"
                  value={cost}
                  disabled={isSaving}
                  onChange={(event) => setCost(event.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => setCompletingRecord(null)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Đang lưu..." : "Lưu kết quả"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
