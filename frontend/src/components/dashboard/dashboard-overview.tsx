import { EquipmentHealthCard } from "./equipment-health-card";
import { IncidentsCard } from "./incidents-card";
import { RoomStatusCard } from "./room-status-card";
import { ScheduleCard } from "./schedule-card";
import { SummaryCards } from "./summary-cards";
import type {
  Booking,
  Equipment,
  Incident,
  Room,
  View,
} from "@/types";

type DashboardOverviewProps = {
  rooms: Room[];
  equipment: Equipment[];
  bookings: Booking[];
  incidents: Incident[];
  onViewChange: (view: View) => void;
};

export function DashboardOverview({
  rooms,
  equipment,
  bookings,
  incidents,
  onViewChange,
}: DashboardOverviewProps) {
  return (
    <div className="space-y-5">
      <SummaryCards
        rooms={rooms}
        equipment={equipment}
        bookings={bookings}
        incidents={incidents}
      />

      <div className="grid gap-5 xl:grid-cols-[1.45fr_0.85fr]">
        <RoomStatusCard
          rooms={rooms}
          onOpenRooms={() => onViewChange("rooms")}
        />

        <ScheduleCard
          bookings={bookings}
          onOpenBookings={() =>
            onViewChange("bookings")
          }
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <IncidentsCard
          incidents={incidents}
          onOpenIncidents={() =>
            onViewChange("incidents")
          }
        />

        <EquipmentHealthCard
          equipment={equipment}
          onOpenEquipment={() =>
            onViewChange("equipment")
          }
        />
      </div>
    </div>
  );
}