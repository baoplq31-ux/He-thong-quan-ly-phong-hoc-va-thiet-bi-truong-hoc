
"use client";

import {
  ArrowUpRight,
  CircleCheckBig,
  Clock3,
  MapPin,
  TriangleAlert,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  Incident,
  IncidentSeverity,
} from "@/types";

type IncidentsCardProps = {
  incidents: Incident[];
  onOpenIncidents: () => void;
};

function getSeverityClass(severity: IncidentSeverity) {
  switch (severity) {
    case "Thấp":
      return "border-sky-200 bg-sky-50 text-sky-700";

    case "Trung bình":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "Khẩn cấp":
      return "border-rose-200 bg-rose-50 text-rose-700";
  }
}

export function IncidentsCard({
  incidents,
  onOpenIncidents,
}: IncidentsCardProps) {
  const total = incidents.length;

  const newIncidents = incidents.filter(
    (incident) => incident.status === "Mới báo",
  ).length;

  const processingIncidents = incidents.filter(
    (incident) => incident.status === "Đang xử lý",
  ).length;

  const resolvedIncidents = incidents.filter(
    (incident) => incident.status === "Đã xử lý",
  ).length;

  const urgentIncidents = incidents.filter(
    (incident) => incident.severity === "Khẩn cấp"
      && incident.status !== "Đã xử lý",
  ).length;

  const openIncidents = incidents
    .filter(
      (incident) => incident.status !== "Đã xử lý",
    )
    .slice(0, 3);

  const statistics = [
    {
      label: "Mới báo",
      value: newIncidents,
      icon: TriangleAlert,
      color: "text-rose-600",
      background: "bg-rose-50",
    },
    {
      label: "Đang xử lý",
      value: processingIncidents,
      icon: Clock3,
      color: "text-amber-600",
      background: "bg-amber-50",
    },
    {
      label: "Đã xử lý",
      value: resolvedIncidents,
      icon: CircleCheckBig,
      color: "text-emerald-600",
      background: "bg-emerald-50",
    },
  ];

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Theo dõi xử lý
          </p>
          <CardTitle className="mt-1">
            Sự cố cần xử lý
          </CardTitle>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenIncidents}
        >
          <ArrowUpRight className="size-5" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Tổng quan */}
        <div className="grid grid-cols-3 gap-3">
          {statistics.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-xl border border-slate-200 p-3"
              >
                <div
                  className={`flex size-8 items-center justify-center rounded-lg ${item.background} ${item.color}`}
                >
                  <Icon className="size-4" />
                </div>

                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {item.value}
                </p>

                <p className="text-xs text-slate-500">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Tổng số và sự cố khẩn cấp */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-4 py-3">
          <div>
            <p className="text-xs text-slate-500">
              Tổng số sự cố
            </p>
            <p className="text-xl font-semibold text-slate-950">
              {total}
            </p>
          </div>

          <Badge
            variant="outline"
            className="border-rose-200 bg-rose-50 text-rose-700"
          >
            <TriangleAlert className="mr-1 size-3.5" />
            {urgentIncidents} khẩn cấp chưa xử lý
          </Badge>
        </div>

        {/* Danh sách sự cố */}
        <div>
          <p className="mb-3 text-sm font-semibold text-slate-800">
            Danh sách cần chú ý
          </p>

          <div className="space-y-3">
            {openIncidents.map((incident) => (
              <div
                key={incident.id}
                className="flex gap-3 rounded-xl border border-slate-200 p-4"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <TriangleAlert className="size-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-medium text-slate-950">
                      {incident.title}
                    </p>

                    <Badge
                      variant="outline"
                      className={getSeverityClass(
                        incident.severity,
                      )}
                    >
                      {incident.severity}
                    </Badge>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3.5" />
                      {incident.location}
                    </span>

                    <span className="flex items-center gap-1">
                      <User className="size-3.5" />
                      {incident.reportedBy}
                    </span>
                  </div>

                  <p className="mt-2 text-xs font-medium text-blue-600">
                    {incident.status}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {openIncidents.length === 0 && (
            <div className="py-8 text-center">
              <CircleCheckBig className="mx-auto size-9 text-emerald-500" />
              <p className="mt-2 text-sm text-slate-500">
                Không còn sự cố cần xử lý.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
