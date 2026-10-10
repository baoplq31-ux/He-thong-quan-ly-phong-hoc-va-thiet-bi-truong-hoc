"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  DoorOpen,
  Plus,
  Search,
} from "lucide-react";

import { toast } from "sonner";

import type {
  Room,
  RoomStatus,
} from "@/types";

import { Button } from "@/components/ui/button";

import {
  Card,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { RoomFormDialog } from "./room-form-dialog";

interface RoomsViewProps {
  rooms: Room[];
  search: string;
  onAddRoom: (room: Room) => void;
  canManage: boolean;
}

type RoomFilter =
  | "all"
  | RoomStatus;

const statusClasses: Record<
  RoomStatus,
  string
> = {
  "Đang trống":
    "border-emerald-200 bg-emerald-50 text-emerald-700",

  "Đang sử dụng":
    "border-amber-200 bg-amber-50 text-amber-700",

  "Bảo trì":
    "border-rose-200 bg-rose-50 text-rose-700",
};

export function RoomsView({
  rooms,
  search,
  onAddRoom,
  canManage,
}: RoomsViewProps) {
  const [statusFilter, setStatusFilter] =
    useState<RoomFilter>("all");

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const filteredRooms = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    return rooms.filter((room) => {
      const searchableText = [
        room.code,
        room.name,
        room.building,
        room.floor,
        room.type,
        room.status,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        searchableText.includes(keyword);

      const matchesStatus =
        statusFilter === "all" ||
        room.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [rooms, search, statusFilter]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <Tabs
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(
              value as RoomFilter
            )
          }
        >
          <TabsList className="h-auto flex-wrap rounded-xl bg-slate-200/60 p-1">
            <TabsTrigger
              value="all"
              className="rounded-lg"
            >
              Tất cả ({rooms.length})
            </TabsTrigger>

            <TabsTrigger
              value="Đang trống"
              className="rounded-lg"
            >
              Đang trống
            </TabsTrigger>

            <TabsTrigger
              value="Đang sử dụng"
              className="rounded-lg"
            >
              Đang sử dụng
            </TabsTrigger>

            <TabsTrigger
              value="Bảo trì"
              className="rounded-lg"
            >
              Bảo trì
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {canManage && (
        <Button
          type="button"
          onClick={() =>
            setDialogOpen(true)
          }
          className="h-10 rounded-xl bg-[#0b6f6b] text-white hover:bg-[#095e5b]"
        >
          <Plus className="size-4" />
          Thêm phòng học
        </Button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Hiển thị{" "}
          <strong className="text-slate-800">
            {filteredRooms.length}
          </strong>{" "}
          phòng học
        </p>

        {search && (
          <p className="hidden text-sm text-slate-500 sm:block">
            Từ khóa:{" "}
            <strong>{search}</strong>
          </p>
        )}
      </div>

      {filteredRooms.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <Search className="mb-3 size-9 text-slate-300" />

          <h2 className="font-semibold text-slate-800">
            Không tìm thấy phòng học
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Hãy thử từ khóa hoặc bộ lọc khác.
          </p>
        </div>
      ) : (
        <Card className="overflow-hidden border-slate-200 bg-white p-0 shadow-sm">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="h-12 pl-5">
                  Phòng học
                </TableHead>

                <TableHead>Vị trí</TableHead>

                <TableHead>
                  Loại phòng
                </TableHead>

                <TableHead>
                  Sức chứa
                </TableHead>

                <TableHead>
                  Thiết bị
                </TableHead>

                <TableHead>
                  Trạng thái
                </TableHead>

                <TableHead className="pr-5 text-right">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredRooms.map((room) => (
                <TableRow
                  key={room.id}
                  className="h-[72px]"
                >
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
                        <DoorOpen className="size-[18px]" />
                      </span>

                      <div>
                        <p className="font-bold text-slate-900">
                          {room.code}
                        </p>

                        <p className="text-xs text-slate-500">
                          {room.name}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <p className="font-medium text-slate-700">
                      {room.building}
                    </p>

                    <p className="text-xs text-slate-500">
                      {room.floor}
                    </p>
                  </TableCell>

                  <TableCell className="text-slate-600">
                    {room.type}
                  </TableCell>

                  <TableCell className="font-semibold text-slate-700">
                    {room.capacity} chỗ
                  </TableCell>

                  <TableCell className="text-slate-600">
                    {room.equipmentCount} thiết bị
                  </TableCell>

                  <TableCell>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses[room.status]}`}
                    >
                      {room.status}
                    </span>
                  </TableCell>

                  <TableCell className="pr-5 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        toast.info(
                          `${room.code} · ${room.name} · ${room.capacity} chỗ`
                        )
                      }
                      className="text-teal-700"
                    >
                      Chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {canManage && (
      <RoomFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        existingRooms={rooms}
        onAddRoom={onAddRoom}
      />
      )}
    </div>
  );
}