"use client";

import {
  Building2,
  CalendarDays,
  Download,
  Monitor,
  TriangleAlert,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type {
  Booking,
  Equipment,
  Incident,
  Room,
} from "@/types";

type ReportsViewProps = {
  rooms: Room[];
  equipment: Equipment[];
  bookings: Booking[];
  incidents: Incident[];
};

function calculatePercent(value: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

function escapeCsv(value: string | number) {
  const safeValue = String(value).replace(/"/g, '""');
  return `"${safeValue}"`;
}

export function ReportsView({
  rooms,
  equipment,
  bookings,
  incidents,
}: ReportsViewProps) {
  const totalEquipment = equipment.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const availableRooms = rooms.filter(
    (room) => room.status === "Đang trống",
  ).length;

  const goodEquipment = equipment.filter(
    (item) => item.status === "Tốt",
  ).length;

  const approvedBookings = bookings.filter(
    (booking) => booking.status === "Đã duyệt",
  ).length;

  const resolvedIncidents = incidents.filter(
    (incident) => incident.status === "Đã xử lý",
  ).length;

  const openIncidents = incidents.filter(
    (incident) => incident.status !== "Đã xử lý",
  ).length;

  const roomData = [
    {
      name: "Đang trống",
      value: availableRooms,
      color: "#10b981",
    },
    {
      name: "Đang sử dụng",
      value: rooms.filter(
        (room) => room.status === "Đang sử dụng",
      ).length,
      color: "#3b82f6",
    },
    {
      name: "Bảo trì",
      value: rooms.filter(
        (room) => room.status === "Bảo trì",
      ).length,
      color: "#f59e0b",
    },
  ];

  const equipmentData = [
    {
      name: "Tốt",
      value: goodEquipment,
      color: "#10b981",
    },
    {
      name: "Cần kiểm tra",
      value: equipment.filter(
        (item) => item.status === "Cần kiểm tra",
      ).length,
      color: "#f59e0b",
    },
    {
      name: "Hỏng",
      value: equipment.filter(
        (item) => item.status === "Hỏng",
      ).length,
      color: "#f43f5e",
    },
  ];

  const bookingData = [
    {
      name: "Đã duyệt",
      value: approvedBookings,
      color: "#10b981",
    },
    {
      name: "Chờ duyệt",
      value: bookings.filter(
        (booking) => booking.status === "Chờ duyệt",
      ).length,
      color: "#f59e0b",
    },
    {
      name: "Từ chối",
      value: bookings.filter(
        (booking) => booking.status === "Từ chối",
      ).length,
      color: "#f43f5e",
    },
  ];

  const incidentData = [
    {
      name: "Thấp",
      value: incidents.filter(
        (incident) => incident.severity === "Thấp",
      ).length,
      color: "#0ea5e9",
    },
    {
      name: "Trung bình",
      value: incidents.filter(
        (incident) =>
          incident.severity === "Trung bình",
      ).length,
      color: "#f59e0b",
    },
    {
      name: "Khẩn cấp",
      value: incidents.filter(
        (incident) =>
          incident.severity === "Khẩn cấp",
      ).length,
      color: "#f43f5e",
    },
  ];

  const indicators = [
    {
      name: "Tỷ lệ phòng đang trống",
      value: calculatePercent(
        availableRooms,
        rooms.length,
      ),
      color: "[&>div]:bg-blue-500",
    },
    {
      name: "Thiết bị hoạt động tốt",
      value: calculatePercent(
        goodEquipment,
        equipment.length,
      ),
      color: "[&>div]:bg-emerald-500",
    },
    {
      name: "Yêu cầu được duyệt",
      value: calculatePercent(
        approvedBookings,
        bookings.length,
      ),
      color: "[&>div]:bg-violet-500",
    },
    {
      name: "Sự cố đã xử lý",
      value: calculatePercent(
        resolvedIncidents,
        incidents.length,
      ),
      color: "[&>div]:bg-amber-500",
    },
  ];

  const summaries = [
    {
      title: "Tổng số phòng",
      value: rooms.length,
      description: `${availableRooms} phòng đang trống`,
      icon: Building2,
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Tổng thiết bị",
      value: totalEquipment,
      description: `${equipment.length} danh mục`,
      icon: Monitor,
      color: "bg-violet-50 text-violet-700",
    },
    {
      title: "Lịch đã duyệt",
      value: approvedBookings,
      description: `${bookings.length} yêu cầu`,
      icon: CalendarDays,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Sự cố đang mở",
      value: openIncidents,
      description: `${resolvedIncidents} đã xử lý`,
      icon: TriangleAlert,
      color: "bg-rose-50 text-rose-700",
    },
  ];

  function handleExportCsv() {
    const rows: Array<Array<string | number>> = [
      ["Nhóm dữ liệu", "Chỉ số", "Giá trị"],

      ...roomData.map((item) => [
        "Phòng học",
        item.name,
        item.value,
      ]),

      ...equipmentData.map((item) => [
        "Thiết bị",
        item.name,
        item.value,
      ]),

      ...bookingData.map((item) => [
        "Lịch đặt phòng",
        item.name,
        item.value,
      ]),

      ...incidentData.map((item) => [
        "Mức độ sự cố",
        item.name,
        item.value,
      ]),

      ...indicators.map((item) => [
        "Chỉ số vận hành",
        item.name,
        `${item.value}%`,
      ]),
    ];

    const csvContent =
      "\uFEFF" +
      rows
        .map((row) =>
          row.map((value) => escapeCsv(value)).join(","),
        )
        .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `bao-cao-edufacility-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    toast.success("Đã xuất báo cáo CSV");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">
            Báo cáo thống kê
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Tổng hợp tình trạng phòng học, thiết bị,
            lịch đặt và sự cố.
          </p>
        </div>

        <Button
          variant="outline"
          className="gap-2"
          onClick={handleExportCsv}
        >
          <Download className="size-4" />
          Xuất báo cáo CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaries.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.title}>
              <CardContent className="flex items-start justify-between p-5">
                <div>
                  <p className="text-sm text-slate-500">
                    {item.title}
                  </p>

                  <p className="mt-2 text-3xl font-semibold text-slate-950">
                    {item.value.toLocaleString("vi-VN")}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {item.description}
                  </p>
                </div>

                <div
                  className={`flex size-11 items-center justify-center rounded-xl ${item.color}`}
                >
                  <Icon className="size-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái phòng học</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="h-72">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart data={roomData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    name="Số phòng"
                    radius={[8, 8, 0, 0]}
                    isAnimationActive={false}
                  >
                    {roomData.map((item) => (
                      <Cell
                        key={item.name}
                        fill={item.color}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tình trạng thiết bị</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="h-72">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={equipmentData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={4}
                    stroke="transparent"
                    isAnimationActive={false}
                  >
                    {equipmentData.map((item) => (
                      <Cell
                        key={item.name}
                        fill={item.color}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Yêu cầu đặt phòng</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="h-72">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart data={bookingData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    name="Số yêu cầu"
                    radius={[8, 8, 0, 0]}
                    isAnimationActive={false}
                  >
                    {bookingData.map((item) => (
                      <Cell
                        key={item.name}
                        fill={item.color}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mức độ sự cố</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="h-72">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={incidentData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={4}
                    stroke="transparent"
                    isAnimationActive={false}
                  >
                    {incidentData.map((item) => (
                      <Cell
                        key={item.name}
                        fill={item.color}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chỉ số vận hành</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-6 md:grid-cols-2">
          {indicators.map((indicator) => (
            <div
              key={indicator.name}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">
                  {indicator.name}
                </span>

                <span className="font-semibold text-slate-950">
                  {indicator.value}%
                </span>
              </div>

              <Progress
                value={indicator.value}
                className={indicator.color}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}