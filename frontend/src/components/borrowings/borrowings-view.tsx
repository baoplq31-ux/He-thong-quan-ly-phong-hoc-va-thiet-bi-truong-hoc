"use client";

import { useState } from "react";
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
  Check,
  Clock,
  Package,
  Pencil,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { BorrowingEditDialog } from "./borrowing-edit-dialog";
import { BorrowingFormDialog } from "./borrowing-form-dialog";
import { BorrowingReturnDialog } from "./borrowing-return-dialog";
import type {
  BorrowingRequest,
  BorrowingStatus,
  EquipmentBorrowing,
} from "./types";
import type { Equipment } from "@/types";

type BorrowingsViewProps = {
  borrowings: EquipmentBorrowing[];
  equipment: Equipment[];
  currentUserId: number;

  onRefresh: () => void;
  onCreateBorrowing: (request: BorrowingRequest) => Promise<boolean>;
  onUpdateBorrowing: (
    id: number,
    request: BorrowingRequest,
  ) => Promise<boolean>;
  onDeleteBorrowing: (id: number) => Promise<boolean>;

  onApprove?: (id: number) => Promise<boolean>;
  onReject?: (id: number) => Promise<boolean>;
  onStartBorrowing?: (id: number) => Promise<boolean>;
  onReturn?: (
    id: number,
    conditionAfter: string,
    returnNote: string,
  ) => Promise<boolean>;

  canApprove?: boolean;
  canProcess?: boolean;
};

function getStatusVariant(status: BorrowingStatus) {
  switch (status) {
    case "Đã duyệt":
      return "default";

    case "Đang mượn":
      return "default";

    case "Đã trả":
      return "secondary";

    case "Từ chối":
      return "destructive";

    case "Quá hạn":
      return "destructive";

    case "Chờ duyệt":
    default:
      return "outline";
  }
}

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("vi-VN");
}

export default function BorrowingsView({
  borrowings,
  equipment,
  currentUserId,
  onRefresh,
  onCreateBorrowing,
  onUpdateBorrowing,
  onDeleteBorrowing,
  onApprove,
  onReject,
  onStartBorrowing,
  onReturn,
  canApprove = false,
  canProcess = false,
}: BorrowingsViewProps) {
  const [editingBorrowing, setEditingBorrowing] =
    useState<EquipmentBorrowing | null>(null);
  const [returningBorrowing, setReturningBorrowing] =
    useState<EquipmentBorrowing | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleDeleteBorrowing(borrowing: EquipmentBorrowing) {
    if (deletingId !== null) {
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa phiếu mượn ${borrowing.code}?`,
    );
    if (!confirmed) {
      return;
    }

    setDeletingId(borrowing.id);
    try {
      const deleted = await onDeleteBorrowing(borrowing.id);
      if (deleted) {
        toast.success(`Đã xóa phiếu mượn ${borrowing.code}.`);
      }
    } finally {
      setDeletingId(null);
    }
  }

  const pendingCount = borrowings.filter(
    (item) => item.status === "Chờ duyệt"
  ).length;

  const borrowingCount = borrowings.filter(
    (item) =>
      item.status === "Đang mượn" ||
      item.status === "Quá hạn"
  ).length;

  const returnedCount = borrowings.filter(
    (item) => item.status === "Đã trả"
  ).length;

  const overdueCount = borrowings.filter(
    (item) => item.status === "Quá hạn"
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Mượn thiết bị
        </h1>

        <p className="text-muted-foreground">
          Quản lý phiếu mượn, duyệt mượn và trả thiết bị.
        </p>
      </div>

      <BorrowingFormDialog
        equipment={equipment}
        onCreateBorrowing={onCreateBorrowing}
      />

      {/* Tổng quan */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Clock className="h-8 w-8" />

            <div>
              <p className="text-sm text-muted-foreground">
                Chờ duyệt
              </p>

              <p className="text-2xl font-bold">
                {pendingCount}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Package className="h-8 w-8" />

            <div>
              <p className="text-sm text-muted-foreground">
                Đang mượn
              </p>

              <p className="text-2xl font-bold">
                {borrowingCount}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <RotateCcw className="h-8 w-8" />

            <div>
              <p className="text-sm text-muted-foreground">
                Đã trả
              </p>

              <p className="text-2xl font-bold">
                {returnedCount}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Clock className="h-8 w-8" />

            <div>
              <p className="text-sm text-muted-foreground">
                Quá hạn
              </p>

              <p className="text-2xl font-bold">
                {overdueCount}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danh sách */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Danh sách phiếu mượn
          </CardTitle>

          <Button
            variant="outline"
            onClick={onRefresh}
          >
            Làm mới
          </Button>
        </CardHeader>

        <CardContent>
          {borrowings.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Chưa có phiếu mượn thiết bị.
            </div>
          ) : (
            <div className="space-y-4">
              {borrowings.map((borrowing) => (
                <div
                  key={borrowing.id}
                  className="rounded-lg border p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">
                          {borrowing.code}
                        </span>

                        <Badge
                          variant={getStatusVariant(
                            borrowing.status
                          )}
                        >
                          {borrowing.status}
                        </Badge>
                      </div>

                      <div>
                        <p className="font-medium">
                          {borrowing.equipment.name}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          Mã thiết bị:{" "}
                          {borrowing.equipment.code}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          Phòng:{" "}
                          {borrowing.equipment.room.name}
                        </p>
                      </div>

                      <div className="grid gap-1 text-sm md:grid-cols-2">
                        <p>
                          <span className="font-medium">
                            Người mượn:
                          </span>{" "}
                          {borrowing.borrower.name}
                        </p>

                        <p>
                          <span className="font-medium">
                            Số lượng:
                          </span>{" "}
                          {borrowing.quantity}
                        </p>

                        <p>
                          <span className="font-medium">
                            Ngày mượn:
                          </span>{" "}
                          {formatDate(
                            borrowing.borrowDate
                          )}
                        </p>

                        <p>
                          <span className="font-medium">
                            Ngày trả dự kiến:
                          </span>{" "}
                          {formatDate(
                            borrowing.expectedReturnDate
                          )}
                        </p>
                      </div>

                      <p className="text-sm">
                        <span className="font-medium">
                          Mục đích:
                        </span>{" "}
                        {borrowing.purpose}
                      </p>
                      {borrowing.note && (
                        <p className="text-sm text-muted-foreground">
                          Ghi chú: {borrowing.note}
                        </p>
                      )}
                      {borrowing.status === "Đã trả" && (
                        <div className="text-sm text-muted-foreground">
                          <p>
                            Đã trả: {formatDate(borrowing.actualReturnDate)}
                            {borrowing.conditionAfter
                              ? ` · Tình trạng: ${borrowing.conditionAfter}`
                              : ""}
                          </p>
                          {borrowing.returnNote && (
                            <p>Ghi chú trả: {borrowing.returnNote}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    <div className="flex flex-wrap gap-2">
                      {borrowing.status === "Chờ duyệt" &&
                        (canApprove ||
                          borrowing.borrowerId === currentUserId) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingBorrowing(borrowing)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </Button>
                        )}

                      {borrowing.status === "Chờ duyệt" &&
                        canApprove && (
                          <>
                            <Button
                              size="sm"
                              onClick={() =>
                                onApprove?.(borrowing.id)
                              }
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Duyệt
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                onReject?.(borrowing.id)
                              }
                            >
                              <X className="mr-2 h-4 w-4" />
                              Từ chối
                            </Button>
                          </>
                        )}

                      {canApprove &&
                        borrowing.status !== "Đang mượn" &&
                        borrowing.status !== "Quá hạn" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive"
                            disabled={deletingId !== null}
                            aria-label={`Xóa phiếu mượn ${borrowing.code}`}
                            onClick={() =>
                              void handleDeleteBorrowing(borrowing)
                            }
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {deletingId === borrowing.id
                              ? "Đang xóa..."
                              : "Xóa phiếu"}
                          </Button>
                        )}

                      {borrowing.status === "Đã duyệt" &&
                        canProcess && (
                          <Button
                            size="sm"
                            onClick={() =>
                              onStartBorrowing?.(
                                borrowing.id
                              )
                            }
                          >
                            <Package className="mr-2 h-4 w-4" />
                            Xác nhận mượn
                          </Button>
                        )}

                      {(borrowing.status === "Đang mượn" ||
                        borrowing.status === "Quá hạn") &&
                        canProcess && (
                          <Button
                            size="sm"
                            onClick={() => setReturningBorrowing(borrowing)}
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Trả thiết bị
                          </Button>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {editingBorrowing && (
        <BorrowingEditDialog
          key={editingBorrowing.id}
          borrowing={editingBorrowing}
          equipment={equipment}
          open
          onOpenChange={(open) => {
            if (!open) {
              setEditingBorrowing(null);
            }
          }}
          onSave={onUpdateBorrowing}
        />
      )}
      {onReturn && (
        <BorrowingReturnDialog
          borrowing={returningBorrowing}
          open={returningBorrowing !== null}
          onOpenChange={(open) => {
            if (!open) {
              setReturningBorrowing(null);
            }
          }}
          onReturn={onReturn}
        />
      )}
    </div>
  );
}