
"use client";

import {
  ArrowUpRight,
  CircleAlert,
  CircleCheckBig,
  CircleX,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Equipment } from "@/types";

type EquipmentHealthCardProps = {
  equipment: Equipment[];
  onOpenEquipment: () => void;
};

export function EquipmentHealthCard({
  equipment,
  onOpenEquipment,
}: EquipmentHealthCardProps) {
  // Tổng số lượng thiết bị thực tế
  const total = equipment.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  // Thống kê theo số lượng và tình trạng
  const good = equipment.reduce(
    (sum, item) =>
      sum + (item.status === "Tốt" ? item.quantity : 0),
    0,
  );

  const checking = equipment.reduce(
    (sum, item) =>
      sum +
      (item.status === "Cần kiểm tra" ? item.quantity : 0),
    0,
  );

  const broken = equipment.reduce(
    (sum, item) =>
      sum + (item.status === "Hỏng" ? item.quantity : 0),
    0,
  );

  const healthPercent =
    total === 0 ? 0 : Math.round((good / total) * 100);

  const statuses = [
    {
      label: "Tốt",
      value: good,
      icon: CircleCheckBig,
      color: "text-emerald-400",
      barColor: "bg-emerald-400",
    },
    {
      label: "Cần kiểm tra",
      value: checking,
      icon: CircleAlert,
      color: "text-amber-400",
      barColor: "bg-amber-400",
    },
    {
      label: "Hỏng",
      value: broken,
      icon: CircleX,
      color: "text-rose-400",
      barColor: "bg-rose-400",
    },
  ];

  return (
    <Card className="border-0 bg-slate-950 text-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">
            Tình trạng hệ thống
          </p>
          <CardTitle className="mt-1 text-white">
            Sức khỏe thiết bị
          </CardTitle>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 hover:text-white"
          onClick={onOpenEquipment}
        >
          <ArrowUpRight className="size-5" />
        </Button>
      </CardHeader>

      <CardContent>
        <div className="flex items-end gap-2">
          <p className="text-5xl font-semibold">
            {healthPercent}%
          </p>
          <p className="pb-1 text-sm text-slate-400">
            thiết bị ở trạng thái tốt
          </p>
        </div>

        <div className="mt-5 flex h-3 w-full overflow-hidden rounded-full bg-white/10">
          {statuses.map((status) => (
            <div
              key={status.label}
              className={status.barColor}
              style={{
                width: `${total === 0 ? 0 : (status.value / total) * 100}%`,
              }}
            />
          ))}
        </div>

        <div className="mt-2 flex justify-between text-xs text-slate-400">
          <span>{total} thiết bị</span>
          <span>{good} thiết bị tốt</span>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {statuses.map((status) => {
            const Icon = status.icon;

            return (
              <div
                key={status.label}
                className="rounded-xl bg-white/5 p-3"
              >
                <Icon className={`size-4 ${status.color}`} />

                <p className="mt-3 text-xl font-semibold">
                  {status.value}
                </p>

                <p className="text-xs text-slate-400">
                  {status.label}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
