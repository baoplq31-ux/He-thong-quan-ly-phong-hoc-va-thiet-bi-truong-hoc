"use client";

import type { View } from "@/types";

import { EquipmentHealthCard } from "./equipment-health-card";
import { IncidentsCard } from "./incidents-card";
import { RoomStatusCard } from "./room-status-card";
import { ScheduleCard } from "./schedule-card";
import { SummaryCards } from "./summary-cards";

interface DashboardOverviewProps {
  onViewChange: (view: View) => void;
}

export function DashboardOverview({
  onViewChange,
}: DashboardOverviewProps) {
  return (
    <div className="space-y-5">
      <SummaryCards />

      <section className="grid gap-5 xl:grid-cols-[1.45fr_0.85fr]">
        <RoomStatusCard
          onOpenRooms={() =>
            onViewChange("rooms")
          }
        />

        <ScheduleCard
          onOpenBookings={() =>
            onViewChange("bookings")
          }
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <IncidentsCard
          onOpenIncidents={() =>
            onViewChange("incidents")
          }
        />

        <EquipmentHealthCard
          onOpenEquipment={() =>
            onViewChange("equipment")
          }
        />
      </section>
    </div>
  );
}