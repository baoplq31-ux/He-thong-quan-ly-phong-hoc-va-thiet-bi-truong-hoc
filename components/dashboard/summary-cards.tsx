import {
  CalendarDays,
  CircleAlert,
  DoorOpen,
  Monitor,
} from "lucide-react";

import {
  bookings,
  equipment,
  incidents,
  rooms,
} from "@/data/mock-data";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SummaryCards() {
  const availableRooms = rooms.filter(
    (room) => room.status === "Đang trống"
  ).length;

  const totalEquipment = equipment.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const healthyEquipment = equipment
    .filter((item) => item.status === "Tốt")
    .reduce((total, item) => total + item.quantity, 0);

  const equipmentHealth =
    totalEquipment === 0
      ? 0
      : Math.round(
          (healthyEquipment / totalEquipment) * 100
        );

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "Chờ duyệt"
  ).length;

  const openIncidents = incidents.filter(
    (incident) => incident.status !== "Đã xử lý"
  ).length;

  const urgentIncidents = incidents.filter(
    (incident) => incident.severity === "Khẩn cấp"
  ).length;

  const statistics = [
    {
      title: "Tổng số phòng",
      value: rooms.length,
      description: `${availableRooms} phòng đang trống`,
      icon: DoorOpen,
      color: "bg-sky-50 text-sky-700",
    },
    {
      title: "Thiết bị quản lý",
      value: totalEquipment,
      description: `${equipmentHealth}% hoạt động tốt`,
      icon: Monitor,
      color: "bg-violet-50 text-violet-700",
    },
    {
      title: "Lịch đăng ký",
      value: bookings.length,
      description: `${pendingBookings} yêu cầu chờ duyệt`,
      icon: CalendarDays,
      color: "bg-amber-50 text-amber-700",
    },
    {
      title: "Sự cố đang mở",
      value: openIncidents,
      description: `${urgentIncidents} sự cố khẩn cấp`,
      icon: CircleAlert,
      color: "bg-rose-50 text-rose-700",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-teal-700">
          <span className="size-2 rounded-full bg-teal-500" />

          Hệ thống đang hoạt động ổn định
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
          Chào buổi sáng, anh Quản
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Học kỳ I · Năm học 2026–2027
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((item) => {
          const Icon = item.icon;

          return (
            <Card
              key={item.title}
              className="border-slate-200 bg-white shadow-sm"
            >
              <CardHeader className="grid grid-cols-[1fr_auto] items-start">
                <div>
                  <CardTitle className="text-sm font-medium text-slate-500">
                    {item.title}
                  </CardTitle>

                  <p className="mt-2 text-3xl font-bold text-slate-950">
                    {item.value}
                  </p>
                </div>

                <div
                  className={`grid size-11 place-items-center rounded-xl ${item.color}`}
                >
                  <Icon className="size-5" />
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-slate-500">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}