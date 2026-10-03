"use client";

import {
  ChevronRight,
  Wrench,
} from "lucide-react";

import { incidents } from "@/data/mock-data";

import type { Incident } from "@/types";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface IncidentsCardProps {
  onOpenIncidents: () => void;
}

const severityColors: Record<
  Incident["severity"],
  string
> = {
  Thấp: "bg-sky-50 text-sky-700",
  "Trung bình": "bg-amber-50 text-amber-700",
  "Khẩn cấp": "bg-rose-50 text-rose-700",
};

const severityBadgeColors: Record<
  Incident["severity"],
  string
> = {
  Thấp: "bg-sky-100 text-sky-700",
  "Trung bình": "bg-amber-100 text-amber-700",
  "Khẩn cấp": "bg-rose-100 text-rose-700",
};

export function IncidentsCard({
  onOpenIncidents,
}: IncidentsCardProps) {
  const openIncidents = incidents
    .filter((incident) => incident.status !== "Đã xử lý")
    .slice(0, 3);

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="grid grid-cols-[1fr_auto] items-start">
        <div>
          <CardTitle className="text-base text-slate-900">
            Sự cố cần xử lý
          </CardTitle>

          <CardDescription className="mt-1">
            Ưu tiên theo mức độ ảnh hưởng
          </CardDescription>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onOpenIncidents}
          className="text-teal-700 hover:bg-teal-50 hover:text-teal-800"
        >
          Danh sách
          <ChevronRight className="size-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-2">
        {openIncidents.length === 0 ? (
          <div className="rounded-xl bg-emerald-50 p-5 text-center text-sm text-emerald-700">
            Không có sự cố cần xử lý.
          </div>
        ) : (
          openIncidents.map((incident) => (
            <button
              key={incident.id}
              type="button"
              onClick={onOpenIncidents}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-slate-50"
            >
              <span
                className={`grid size-10 shrink-0 place-items-center rounded-xl ${severityColors[incident.severity]}`}
              >
                <Wrench className="size-[18px]" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-900">
                  {incident.title}
                </span>

                <span className="block truncate text-xs text-slate-500">
                  {incident.location}
                </span>
              </span>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${severityBadgeColors[incident.severity]}`}
              >
                {incident.severity}
              </span>
            </button>
          ))
        )}
      </CardContent>
    </Card>
  );
}