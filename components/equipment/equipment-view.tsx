"use client";

import { useMemo, useState } from "react";
import {
  Boxes,
  CircleCheckBig,
  SearchX,
  TriangleAlert,
  Wrench,
} from "lucide-react";

import { EquipmentFormDialog } from "./equipment-form-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  Equipment,
  EquipmentStatus,
  Room,
} from "@/types";

type EquipmentViewProps = {
  equipment: Equipment[];
  rooms: Room[];
  search: string;
  canManage: boolean;
  onAddEquipment: (equipment: Equipment) => void;
};

type StatusFilter = "all" | EquipmentStatus;

function getStatusClass(status: EquipmentStatus) {
  switch (status) {
    case "Tốt":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "Cần kiểm tra":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "Hỏng":
      return "border-rose-200 bg-rose-50 text-rose-700";
  }
}

export function EquipmentView({
  equipment,
  rooms,
  search,
  onAddEquipment,
  canManage,
}: EquipmentViewProps) {
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const roomNames = useMemo(
    () => new Map(rooms.map((room) => [room.code, room.name])),
    [rooms],
  );

  const filteredEquipment = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return equipment.filter((item) => {
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      const matchesSearch =
        !keyword ||
        [
          item.code,
          item.name,
          item.type,
          item.room,
          item.status,
        ].some((value) =>
          value.toLowerCase().includes(keyword),
        );

      return matchesStatus && matchesSearch;
    });
  }, [equipment, search, statusFilter]);

  const totalQuantity = equipment.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const goodItems = equipment.filter(
    (item) => item.status === "Tốt",
  ).length;

  const warningItems = equipment.filter(
    (item) => item.status !== "Tốt",
  ).length;

  const summaries = [
    {
      title: "Danh mục thiết bị",
      value: equipment.length,
      icon: Boxes,
      className: "bg-blue-50 text-blue-700",
    },
    {
      title: "Tổng số lượng",
      value: totalQuantity,
      icon: Wrench,
      className: "bg-violet-50 text-violet-700",
    },
    {
      title: "Hoạt động tốt",
      value: goodItems,
      icon: CircleCheckBig,
      className: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Cần xử lý",
      value: warningItems,
      icon: TriangleAlert,
      className: "bg-amber-50 text-amber-700",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">
            Quản lý thiết bị
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi thiết bị và phòng đang sử dụng.
          </p>
        </div>

        {canManage && (
        <EquipmentFormDialog
          equipment={equipment}
          rooms={rooms}
          onAddEquipment={onAddEquipment}
        />
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaries.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.title} className="border-slate-200">
              <CardContent className="flex items-center gap-4 p-5">
                <div
                  className={`flex size-11 items-center justify-center rounded-xl ${item.className}`}
                >
                  <Icon className="size-5" />
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    {item.title}
                  </p>
                  <p className="text-2xl font-semibold text-slate-950">
                    {item.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Danh sách thiết bị</CardTitle>

          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as StatusFilter)
            }
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Tất cả tình trạng</SelectItem>
              <SelectItem value="Tốt">Tốt</SelectItem>
              <SelectItem value="Cần kiểm tra">
                Cần kiểm tra
              </SelectItem>
              <SelectItem value="Hỏng">Hỏng</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã</TableHead>
                  <TableHead>Thiết bị</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Phòng</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Tình trạng</TableHead>
                  <TableHead>Kiểm tra gần nhất</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredEquipment.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.code}
                    </TableCell>

                    <TableCell>{item.name}</TableCell>

                    <TableCell className="text-slate-600">
                      {item.type}
                    </TableCell>

                    <TableCell>
                      <p className="font-medium">{item.room}</p>
                      <p className="text-xs text-slate-500">
                        {roomNames.get(item.room) ??
                          "Chưa cập nhật"}
                      </p>
                    </TableCell>

                    <TableCell>{item.quantity}</TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusClass(item.status)}
                      >
                        {item.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-slate-600">
                      {item.lastChecked}
                    </TableCell>
                  </TableRow>
                ))}

                {filteredEquipment.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-52">
                      <div className="flex flex-col items-center gap-2 text-slate-500">
                        <SearchX className="size-8" />
                        <p>Không tìm thấy thiết bị phù hợp</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}