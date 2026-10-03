"use client";

import {
  ArrowUpRight,
  Projector,
} from "lucide-react";

import { equipment } from "@/data/mock-data";

import type { Equipment } from "@/types";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface EquipmentHealthCardProps {
  onOpenEquipment: () => void;
}

export function EquipmentHealthCard({
  onOpenEquipment,
}: EquipmentHealthCardProps) {
  function countQuantityByStatus(
    status: Equipment["status"]
  ) {
    return equipment
      .filter((item) => item.status === status)
      .reduce(
        (total, item) => total + item.quantity,
        0
      );
  }

  const totalEquipment = equipment.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const goodQuantity =
    countQuantityByStatus("Tốt");

  const checkQuantity =
    countQuantityByStatus("Cần kiểm tra");

  const brokenQuantity =
    countQuantityByStatus("Hỏng");

  const healthPercent =
    totalEquipment === 0
      ? 0
      : Math.round(
          (goodQuantity / totalEquipment) * 100
        );

  return (
    <Card className="overflow-hidden border-0 bg-[#09283a] text-white shadow-lg">
      <CardHeader className="grid grid-cols-[1fr_auto] items-start">
        <div>
          <CardTitle className="text-base text-white">
            Sức khỏe thiết bị
          </CardTitle>

          <CardDescription className="mt-1 text-slate-300">
            Tính theo số lượng thiết bị
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onOpenEquipment}
            aria-label="Xem thiết bị"
            className="text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <ArrowUpRight className="size-4" />
          </Button>

          <span className="grid size-10 place-items-center rounded-xl bg-white/10">
            <Projector className="size-5 text-teal-300" />
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-end justify-between">
          <p className="text-4xl font-bold">
            {healthPercent}%
          </p>

          <p className="text-sm text-emerald-300">
            Hoạt động tốt
          </p>
        </div>

        <Progress
          value={healthPercent}
          className="mt-4 h-2.5 bg-white/10 [&>div]:bg-teal-400"
        />

        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-xl font-bold text-emerald-300">
              {goodQuantity}
            </p>

            <p className="mt-1 text-xs text-slate-300">
              Tốt
            </p>
          </div>

          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-xl font-bold text-amber-300">
              {checkQuantity}
            </p>

            <p className="mt-1 text-xs text-slate-300">
              Kiểm tra
            </p>
          </div>

          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-xl font-bold text-rose-300">
              {brokenQuantity}
            </p>

            <p className="mt-1 text-xs text-slate-300">
              Hỏng
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}