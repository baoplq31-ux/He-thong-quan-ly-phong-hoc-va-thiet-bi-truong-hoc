"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
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

function escapeHtml(value: string | number) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

type ReportPeriod = "day" | "week" | "month" | "semester";

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function initialSemesterRange() {
  const today = new Date();
  const month = today.getMonth();
  if (month >= 8) {
    return {
      start: `${today.getFullYear()}-09-01`,
      end: `${today.getFullYear() + 1}-01-31`,
    };
  }
  if (month <= 0) {
    return {
      start: `${today.getFullYear() - 1}-09-01`,
      end: `${today.getFullYear()}-01-31`,
    };
  }
  if (month >= 6) {
    return {
      start: `${today.getFullYear()}-09-01`,
      end: `${today.getFullYear() + 1}-01-31`,
    };
  }
  return {
    start: `${today.getFullYear()}-02-01`,
    end: `${today.getFullYear()}-06-30`,
  };
}

function parseBookingDate(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
  if (
    date.getFullYear() !== Number(match[3]) ||
    date.getMonth() !== Number(match[2]) - 1 ||
    date.getDate() !== Number(match[1])
  ) {
    return null;
  }
  return date;
}

export function ReportsView({
  rooms,
  equipment,
  bookings,
  incidents,
}: ReportsViewProps) {
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>("month");
  const [referenceDate, setReferenceDate] = useState(() =>
    toDateInputValue(new Date()),
  );
  const [semesterRange, setSemesterRange] = useState(initialSemesterRange);

  const dateRange = useMemo(() => {
    if (reportPeriod === "semester") {
      const start = new Date(`${semesterRange.start}T00:00:00`);
      const end = new Date(`${semesterRange.end}T00:00:00`);
      if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime()) ||
        start > end
      ) {
        return null;
      }
      return { start, end };
    }

    const selected = new Date(`${referenceDate}T00:00:00`);
    if (Number.isNaN(selected.getTime())) return null;
    const start = new Date(selected);
    const end = new Date(selected);

    if (reportPeriod === "week") {
      const weekday = (start.getDay() + 6) % 7;
      start.setDate(start.getDate() - weekday);
      end.setTime(start.getTime());
      end.setDate(start.getDate() + 6);
    } else if (reportPeriod === "month") {
      start.setDate(1);
      end.setMonth(end.getMonth() + 1, 0);
    }
    return { start, end };
  }, [referenceDate, reportPeriod, semesterRange]);

  const filteredBookings = useMemo(() => {
    if (!dateRange) return [];
    return bookings.filter((booking) => {
      const date = parseBookingDate(booking.date);
      return date !== null && date >= dateRange.start && date <= dateRange.end;
    });
  }, [bookings, dateRange]);

  const totalEquipment = equipment.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const availableRooms = rooms.filter(
    (room) => room.status === "Đang trống",
  ).length;

  const goodEquipment = equipment.reduce(
  (total, item) =>
    total + (item.status === "Tốt" ? item.quantity : 0),
  0,
);

const checkingEquipment = equipment.reduce(
  (total, item) =>
    total +
    (item.status === "Cần kiểm tra" ? item.quantity : 0),
  0,
);

const brokenEquipment = equipment.reduce(
  (total, item) =>
    total + (item.status === "Hỏng" ? item.quantity : 0),
  0,
);

  const approvedBookings = filteredBookings.filter(
    (booking) => booking.status === "Đã duyệt",
  ).length;

  const resolvedIncidents = incidents.filter(
    (incident) => incident.status === "Đã xử lý",
  ).length;

  const openIncidents = incidents.filter(
    (incident) => incident.status !== "Đã xử lý",
  ).length;

  const roomUsageData = useMemo(() => {
    const countByRoom = new Map<string, number>();
    for (const booking of filteredBookings) {
      countByRoom.set(booking.room, (countByRoom.get(booking.room) ?? 0) + 1);
    }
    return Array.from(countByRoom, ([name, value]) => ({ name, value }))
      .sort((first, second) => second.value - first.value)
      .slice(0, 10);
  }, [filteredBookings]);

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
    {
      name: "Tạm khóa",
      value: rooms.filter((room) => room.status === "Tạm khóa").length,
      color: "#f97316",
    },
    {
      name: "Ngừng sử dụng",
      value: rooms.filter((room) => room.status === "Ngừng sử dụng").length,
      color: "#64748b",
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
    value: checkingEquipment,
    color: "#f59e0b",
  },
  {
    name: "Hỏng",
    value: brokenEquipment,
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
      value: filteredBookings.filter(
        (booking) => booking.status === "Chờ duyệt",
      ).length,
      color: "#f59e0b",
    },
    {
      name: "Từ chối",
      value: filteredBookings.filter(
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
        totalEquipment,
      ),
      color: "[&>div]:bg-emerald-500",
    },
    {
      name: "Yêu cầu được duyệt",
      value: calculatePercent(
        approvedBookings,
        filteredBookings.length,
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

  const dateRangeLabel = dateRange
    ? `${dateRange.start.toLocaleDateString("vi-VN")} – ${dateRange.end.toLocaleDateString("vi-VN")}`
    : "Khoảng ngày không hợp lệ";

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
      description: `${filteredBookings.length} yêu cầu trong kỳ`,
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
      ["Kỳ báo cáo", dateRangeLabel],
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

  function handleExportExcel() {
  const workbook = XLSX.utils.book_new();

  const roomSheet = XLSX.utils.json_to_sheet(
    rooms.map((room) => ({
      "Mã phòng": room.code,
      "Tên phòng": room.name,
      "Khu vực": room.building,
      "Tầng": room.floor,
      "Loại phòng": room.type,
      "Sức chứa": room.capacity,
      "Trạng thái": room.status,
    })),
  );

  const equipmentSheet = XLSX.utils.json_to_sheet(
    equipment.map((item) => ({
      "Tên thiết bị": item.name,
      "Mã thiết bị": item.code,
      "Danh mục": item.type,
      "Số lượng": item.quantity,
      "Tình trạng": item.status,
      "Phòng": item.room,
    })),
  );

  const bookingSheet = XLSX.utils.json_to_sheet(
    filteredBookings.map((booking) => ({
      "Ngày đặt": booking.date,
      "Thời gian": booking.time,
      "Phòng": booking.room,
      "Môn học": booking.course,
      "Người đặt": booking.person,
      "Trạng thái": booking.status,
    })),
  );

  const incidentSheet = XLSX.utils.json_to_sheet(
    incidents.map((incident) => ({
      "Nội dung sự cố": incident.title,
      "Địa điểm": incident.location,
      "Người báo": incident.reportedBy,
      "Mức độ": incident.severity,
      "Trạng thái": incident.status,
    })),
  );

  const summarySheet = XLSX.utils.aoa_to_sheet([
    ["BÁO CÁO TỔNG QUAN HỆ THỐNG"],
    ["Kỳ báo cáo", dateRangeLabel],
    ["Chỉ tiêu", "Số lượng"],
    ["Tổng số phòng học", rooms.length],
    ["Phòng đang trống", availableRooms],
    ["Tổng số thiết bị", totalEquipment],
    ["Thiết bị hoạt động tốt", goodEquipment],
    ["Tổng số lịch đặt trong kỳ", filteredBookings.length],
    ["Lịch đặt đã duyệt", approvedBookings],
    ["Tổng số sự cố", incidents.length],
    ["Sự cố đã xử lý", resolvedIncidents],
    ["Sự cố chưa xử lý", openIncidents],
  ]);

  XLSX.utils.book_append_sheet(workbook, summarySheet, "Tổng quan");
  XLSX.utils.book_append_sheet(workbook, roomSheet, "Phòng học");
  XLSX.utils.book_append_sheet(workbook, equipmentSheet, "Thiết bị");
  XLSX.utils.book_append_sheet(workbook, bookingSheet, "Đặt phòng");
  XLSX.utils.book_append_sheet(workbook, incidentSheet, "Sự cố");

  const today = new Date().toISOString().slice(0, 10);

  XLSX.writeFile(
    workbook,
    `bao-cao-edufacility-${today}.xlsx`,
  );

  toast.success("Đã xuất báo cáo Excel thành công");
}

  function handleExportPdf() {
    const printableWindow = window.open("", "_blank");
    if (!printableWindow) {
      toast.error("Trình duyệt đã chặn cửa sổ in. Hãy cho phép cửa sổ bật lên.");
      return;
    }

    const summaryRows = [
      ["Tổng số phòng", rooms.length],
      ["Phòng đang trống", availableRooms],
      ["Tổng số thiết bị", totalEquipment],
      ["Thiết bị hoạt động tốt", goodEquipment],
      ["Tổng số lịch đặt trong kỳ", filteredBookings.length],
      ["Lịch đặt đã duyệt", approvedBookings],
      ["Tổng số sự cố", incidents.length],
      ["Sự cố đã xử lý", resolvedIncidents],
      ["Sự cố chưa xử lý", openIncidents],
    ];
    const tables = [
      {
        title: "Tổng quan",
        headers: ["Chỉ tiêu", "Số lượng"],
        rows: summaryRows,
      },
      {
        title: "Phòng học",
        headers: ["Mã phòng", "Tên phòng", "Tòa nhà", "Tầng", "Sức chứa", "Trạng thái"],
        rows: rooms.map((room) => [
          room.code,
          room.name,
          room.building,
          room.floor,
          room.capacity,
          room.status,
        ]),
      },
      {
        title: "Thiết bị",
        headers: ["Mã", "Tên thiết bị", "Loại", "Phòng", "Số lượng", "Còn khả dụng", "Trạng thái"],
        rows: equipment.map((item) => [
          item.code,
          item.name,
          item.type,
          item.room,
          item.quantity,
          item.availableQuantity ?? item.quantity,
          item.status,
        ]),
      },
      {
        title: "Đặt phòng",
        headers: ["Ngày", "Thời gian", "Phòng", "Nội dung", "Người đăng ký", "Trạng thái"],
        rows: filteredBookings.map((booking) => [
          booking.date,
          booking.time,
          booking.room,
          booking.course,
          booking.person,
          booking.status,
        ]),
      },
      {
        title: "Sự cố",
        headers: ["Nội dung", "Địa điểm", "Người báo", "Mức độ", "Trạng thái"],
        rows: incidents.map((incident) => [
          incident.title,
          incident.location,
          incident.reportedBy,
          incident.severity,
          incident.status,
        ]),
      },
    ];

    const tableMarkup = tables
      .map(
        ({ title, headers, rows }) => `
          <section>
            <h2>${escapeHtml(title)}</h2>
            <table>
              <thead><tr>${headers
                .map((header) => `<th>${escapeHtml(header)}</th>`)
                .join("")}</tr></thead>
              <tbody>${rows
                .map(
                  (row) =>
                    `<tr>${row
                      .map((value) => `<td>${escapeHtml(value)}</td>`)
                      .join("")}</tr>`,
                )
                .join("")}</tbody>
            </table>
          </section>`,
      )
      .join("");

    printableWindow.document.write(`<!doctype html>
      <html lang="vi">
        <head>
          <meta charset="utf-8">
          <title>Báo cáo EduFacility</title>
          <style>
            body { font-family: Arial, sans-serif; color: #172033; margin: 24px; }
            h1 { color: #0b6f6b; font-size: 22px; }
            h2 { margin: 24px 0 8px; font-size: 16px; }
            p { color: #475569; font-size: 12px; }
            table { border-collapse: collapse; width: 100%; font-size: 10px; }
            th, td { border: 1px solid #cbd5e1; padding: 6px; text-align: left; }
            th { background: #f1f5f9; }
            tr { break-inside: avoid; }
            @page { size: landscape; margin: 12mm; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>BÁO CÁO THỐNG KÊ EDUFACILITY</h1>
          <p>Ngày xuất: ${escapeHtml(new Date().toLocaleDateString("vi-VN"))}</p>
          <p>Kỳ báo cáo: ${escapeHtml(dateRangeLabel)}</p>
          ${tableMarkup}
        </body>
      </html>`);
    printableWindow.document.close();
    printableWindow.focus();
    window.setTimeout(() => printableWindow.print(), 250);
    toast.info("Chọn “Lưu thành PDF” trong cửa sổ in để tải báo cáo.");
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

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExportCsv}
          >
            <Download className="size-4" />
            Xuất CSV
          </Button>
          <Button variant="outline" onClick={handleExportPdf}>
            <Download className="mr-2 h-4 w-4" />
            Xuất PDF
          </Button>
          <Button onClick={handleExportExcel}>
            <Download className="mr-2 h-4 w-4" />
            Xuất Excel
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="report-period" className="text-sm font-medium">
                Kỳ thống kê lịch sử dụng phòng
              </label>
              <select
                id="report-period"
                value={reportPeriod}
                onChange={(event) =>
                  setReportPeriod(event.target.value as ReportPeriod)
                }
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="day">Ngày</option>
                <option value="week">Tuần</option>
                <option value="month">Tháng</option>
                <option value="semester">Học kỳ</option>
              </select>
            </div>
            {reportPeriod === "semester" ? (
              <>
                <div className="grid gap-2">
                  <label htmlFor="semester-start" className="text-sm font-medium">
                    Bắt đầu học kỳ
                  </label>
                  <input
                    id="semester-start"
                    type="date"
                    value={semesterRange.start}
                    onChange={(event) =>
                      setSemesterRange((current) => ({
                        ...current,
                        start: event.target.value,
                      }))
                    }
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="semester-end" className="text-sm font-medium">
                    Kết thúc học kỳ
                  </label>
                  <input
                    id="semester-end"
                    type="date"
                    value={semesterRange.end}
                    onChange={(event) =>
                      setSemesterRange((current) => ({
                        ...current,
                        end: event.target.value,
                      }))
                    }
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  />
                </div>
              </>
            ) : (
              <div className="grid gap-2">
                <label htmlFor="report-reference-date" className="text-sm font-medium">
                  Ngày tham chiếu
                </label>
                <input
                  id="report-reference-date"
                  type="date"
                  value={referenceDate}
                  onChange={(event) => setReferenceDate(event.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Khoảng đang xem: <span className="font-medium">{dateRangeLabel}</span>
            {" · "}
            {filteredBookings.length} yêu cầu đặt phòng
          </p>
        </CardContent>
      </Card>

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
            <CardTitle>Lượt đặt theo phòng trong kỳ</CardTitle>
          </CardHeader>
          <CardContent>
            {roomUsageData.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Không có lịch đặt trong khoảng thời gian này.
              </p>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roomUsageData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar
                      dataKey="value"
                      name="Số lượt đặt"
                      fill="#0b6f6b"
                      radius={[8, 8, 0, 0]}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

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