import {
  Building2,
  CalendarDays,
  DoorOpen,
  Monitor,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const testItems = [
  {
    title: "Phòng học",
    value: "48",
    description: "12 phòng đang trống",
    icon: DoorOpen,
    color: "bg-sky-50 text-sky-700",
  },
  {
    title: "Thiết bị",
    value: "326",
    description: "91% hoạt động tốt",
    icon: Monitor,
    color: "bg-violet-50 text-violet-700",
  },
  {
    title: "Lịch hôm nay",
    value: "18",
    description: "3 yêu cầu chờ duyệt",
    icon: CalendarDays,
    color: "bg-amber-50 text-amber-700",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="rounded-3xl bg-[#071e2e] p-6 text-white shadow-lg md:p-8">
          <div className="flex items-center gap-4">
            <div className="grid size-14 place-items-center rounded-2xl bg-teal-400 text-[#062032]">
              <Building2 className="size-7" />
            </div>

            <div>
              <h1 className="text-2xl font-bold md:text-3xl">
                EduFacility
              </h1>

              <p className="mt-1 text-sm text-slate-300 md:text-base">
                Hệ thống quản lý phòng học và thiết bị
              </p>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {testItems.map((item) => {
            const Icon = item.icon;

            return (
              <Card
                key={item.title}
                className="border-slate-200 bg-white shadow-sm"
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base text-slate-600">
                    {item.title}
                  </CardTitle>

                  <div
                    className={`grid size-11 place-items-center rounded-xl ${item.color}`}
                  >
                    <Icon className="size-5" />
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-3xl font-bold text-slate-950">
                    {item.value}
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <div className="mt-6">
          <Button>
            Kiểm tra màu chính
          </Button>
        </div>
      </div>
    </main>
  );
}