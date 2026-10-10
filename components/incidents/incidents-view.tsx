"use client";

import { useMemo, useState } from "react";
import {
  CircleCheckBig,
  Clock3,
  SearchX,
  Siren,
  TriangleAlert,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

import { IncidentFormDialog } from "./incident-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Incident,
  IncidentSeverity,
  IncidentStatus,
  Room,
} from "@/types";

type IncidentsViewProps = {
  incidents: Incident[];
  rooms: Room[];
  search: string;
  onAddIncident: (incident: Incident) => void;
  onUpdateStatus: (
    id: number,
    status: IncidentStatus,
  ) => void;
  canProcess: boolean;
};

type StatusFilter = "all" | IncidentStatus;
type SeverityFilter = "all" | IncidentSeverity;

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

function getStatusClass(status: IncidentStatus) {
  switch (status) {
    case "Mới báo":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "Đang xử lý":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "Đã xử lý":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
}

export function IncidentsView({
  incidents,
  rooms,
  search,
  onAddIncident,
  onUpdateStatus,
  canProcess,
}: IncidentsViewProps) {
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [severityFilter, setSeverityFilter] =
    useState<SeverityFilter>("all");

  const filteredIncidents = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return incidents.filter((incident) => {
      const matchesStatus =
        statusFilter === "all" ||
        incident.status === statusFilter;

      const matchesSeverity =
        severityFilter === "all" ||
        incident.severity === severityFilter;

      const matchesSearch =
        !keyword ||
        [
          incident.title,
          incident.location,
          incident.reportedBy,
          incident.time,
          incident.status,
          incident.severity,
        ].some((value) =>
          value.toLowerCase().includes(keyword),
        );

      return (
        matchesStatus &&
        matchesSeverity &&
        matchesSearch
      );
    });
  }, [
    incidents,
    search,
    severityFilter,
    statusFilter,
  ]);

  const newIncidents = incidents.filter(
    (incident) => incident.status === "Mới báo",
  ).length;

  const processingIncidents = incidents.filter(
    (incident) => incident.status === "Đang xử lý",
  ).length;

  const resolvedIncidents = incidents.filter(
    (incident) => incident.status === "Đã xử lý",
  ).length;

  const summaries = [
    {
      title: "Tổng sự cố",
      value: incidents.length,
      icon: TriangleAlert,
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Mới báo",
      value: newIncidents,
      icon: Siren,
      color: "bg-rose-50 text-rose-700",
    },
    {
      title: "Đang xử lý",
      value: processingIncidents,
      icon: Wrench,
      color: "bg-amber-50 text-amber-700",
    },
    {
      title: "Đã xử lý",
      value: resolvedIncidents,
      icon: CircleCheckBig,
      color: "bg-emerald-50 text-emerald-700",
    },
  ];

  function updateStatus(
    id: number,
    status: IncidentStatus,
  ) {
    onUpdateStatus(id, status);

    toast.success(
      status === "Đang xử lý"
        ? "Đã tiếp nhận sự cố"
        : "Đã hoàn tất xử lý sự cố",
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">
            Sự cố và sửa chữa
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Theo dõi và cập nhật tiến độ xử lý sự cố.
          </p>
        </div>

        <IncidentFormDialog
          incidents={incidents}
          rooms={rooms}
          onAddIncident={onAddIncident}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaries.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.title}>
              <CardContent className="flex items-center gap-4 p-5">
                <div
                  className={`flex size-11 items-center justify-center rounded-xl ${item.color}`}
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

      <Card>
        <CardHeader className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <CardTitle>Danh sách sự cố</CardTitle>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Select
              value={severityFilter}
              onValueChange={(value) =>
                setSeverityFilter(
                  value as SeverityFilter,
                )
              }
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  Tất cả mức độ
                </SelectItem>
                <SelectItem value="Thấp">Thấp</SelectItem>
                <SelectItem value="Trung bình">
                  Trung bình
                </SelectItem>
                <SelectItem value="Khẩn cấp">
                  Khẩn cấp
                </SelectItem>
              </SelectContent>
            </Select>

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
                <SelectItem value="all">
                  Tất cả trạng thái
                </SelectItem>
                <SelectItem value="Mới báo">
                  Mới báo
                </SelectItem>
                <SelectItem value="Đang xử lý">
                  Đang xử lý
                </SelectItem>
                <SelectItem value="Đã xử lý">
                  Đã xử lý
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sự cố</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Người báo</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Mức độ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredIncidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell className="min-w-56 font-medium">
                      {incident.title}
                    </TableCell>

                    <TableCell>
                      {incident.location}
                    </TableCell>

                    <TableCell>
                      {incident.reportedBy}
                    </TableCell>

                    <TableCell className="min-w-36 text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock3 className="size-3.5" />
                        {incident.time}
                      </span>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getSeverityClass(
                          incident.severity,
                        )}
                      >
                        {incident.severity}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusClass(
                          incident.status,
                        )}
                      >
                        {incident.status}
                      </Badge>
                    </TableCell>

                    <TableCell>
  {incident.status === "Đã xử lý" ? (
    <span className="text-sm text-slate-400">
      Đã hoàn thành
    </span>
  ) : !canProcess ? (
    <span className="text-sm text-blue-600">
      Đang theo dõi
    </span>
  ) : incident.status === "Mới báo" ? (
    <Button
      size="sm"
      onClick={() =>
        updateStatus(
          incident.id,
          "Đang xử lý",
        )
      }
    >
      Tiếp nhận
    </Button>
  ) : (
    <Button
      size="sm"
      onClick={() =>
        updateStatus(
          incident.id,
          "Đã xử lý",
        )
      }
    >
      Hoàn tất
    </Button>
  )}
</TableCell>
                  </TableRow>
                ))}

                {filteredIncidents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-52">
                      <div className="flex flex-col items-center gap-2 text-slate-500">
                        <SearchX className="size-8" />
                        <p>Không tìm thấy sự cố phù hợp</p>
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