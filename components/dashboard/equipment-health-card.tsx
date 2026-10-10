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
import { Progress } from "@/components/ui/progress";
import type { Equipment } from "@/types";

type EquipmentHealthCardProps = {
  equipment: Equipment[];
  onOpenEquipment: () => void;
};

export function EquipmentHealthCard({
  equipment,
  onOpenEquipment,
}: EquipmentHealthCardProps) {
  const good = equipment.filter(
    (item) => item.status === "Tốt",
  ).length;

  const checking = equipment.filter(
    (item) => item.status === "Cần kiểm tra",
  ).length;

  const broken = equipment.filter(
    (item) => item.status === "Hỏng",
  ).length;

  const healthPercent =
    equipment.length === 0
      ? 0
      : Math.round((good / equipment.length) * 100);

  const statuses = [
    {
      label: "Tốt",
      value: good,
      icon: CircleCheckBig,
      color: "text-emerald-400",
    },
    {
      label: "Kiểm tra",
      value: checking,
      icon: CircleAlert,
      color: "text-amber-400",
    },
    {
      label: "Hỏng",
      value: broken,
      icon: CircleX,
      color: "text-rose-400",
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
            hoạt động tốt
          </p>
        </div>

        <Progress
          value={healthPercent}
          className="mt-5 bg-white/10 [&>div]:bg-emerald-400"
        />

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