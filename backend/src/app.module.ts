import { Module } from "@nestjs/common";

import { AuditController } from "./audit-logs/audit-logs.controller.js";
import { AuditService } from "./common/audit.js";
import { AuthController } from "./auth/auth.controller.js";
import { BookingsController } from "./bookings/bookings.controller.js";
import { BorrowingsController } from "./borrowings/borrowings.controller.js";
import { DataController } from "./data/data.controller.js";
import { EquipmentController } from "./equipment/equipment.controller.js";
import { IncidentsController } from "./incidents/incidents.controller.js";
import { MaintenanceController } from "./maintenance/maintenance.controller.js";
import { NotificationsController } from "./notifications/notifications.controller.js";
import { PrismaService } from "./prisma.service.js";
import { RoomsController } from "./rooms/rooms.controller.js";
import { UsersController } from "./users/users.controller.js";

@Module({
  controllers: [
    AuthController,
    DataController,
    RoomsController,
    EquipmentController,
    BookingsController,
    BorrowingsController,
    IncidentsController,
    UsersController,
    MaintenanceController,
    NotificationsController,
    AuditController,
  ],
  providers: [PrismaService, AuditService],
})
export class AppModule {}
