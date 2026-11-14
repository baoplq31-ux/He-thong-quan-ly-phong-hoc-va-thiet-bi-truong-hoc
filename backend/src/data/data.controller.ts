import { Controller, Get, Req } from "@nestjs/common";
import type { Request } from "express";

import { FACILITY_MANAGER_ROLES, requireUser } from "../common/auth.js";
import { PrismaService } from "../prisma.service.js";

@Controller("api/data")
export class DataController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getData(@Req() request: Request) {
    const user = await requireUser(request, this.prisma);
    const canManage = FACILITY_MANAGER_ROLES.includes(user.role as (typeof FACILITY_MANAGER_ROLES)[number]);
    const [rooms, equipment, bookings, incidents, users, borrowed, maintenance] = await Promise.all([
      this.prisma.room.findMany({ orderBy: { id: "asc" } }),
      this.prisma.equipment.findMany({ include: { room: true }, orderBy: { id: "asc" } }),
      this.prisma.booking.findMany({
        where: canManage
          ? undefined
          : { OR: [{ userId: user.id }, { status: { in: ["Đã duyệt", "Đã hoàn thành"] } }] },
        include: { room: true },
        orderBy: { id: "asc" },
      }),
      this.prisma.incident.findMany({
        where: canManage ? undefined : { reportedById: user.id },
        include: { room: true },
        orderBy: { id: "asc" },
      }),
      this.prisma.systemUser.findMany({
        where: canManage ? undefined : { id: -1 },
        orderBy: { id: "asc" },
      }),
      this.prisma.equipmentBorrowing.groupBy({
        by: ["equipmentId"],
        where: { status: { in: ["Đã duyệt", "Đang mượn", "Quá hạn"] } },
        _sum: { quantity: true },
      }),
      this.prisma.maintenance.groupBy({
        by: ["equipmentId"],
        where: { status: "Đang xử lý" },
        _sum: { quantity: true },
      }),
    ]);

    const borrowedByEquipment = new Map(borrowed.map((row) => [row.equipmentId, row._sum.quantity ?? 0]));
    const maintenanceByEquipment = new Map(maintenance.map((row) => [row.equipmentId, row._sum.quantity ?? 0]));

    return {
      rooms: rooms.map((room) => ({
        id: room.id,
        code: room.code,
        name: room.name,
        building: room.building,
        floor: room.floor,
        type: room.type,
        capacity: room.capacity,
        status: room.status,
        equipmentCount: room.equipmentCount,
      })),
      equipment: equipment.map((item) => ({
        id: item.id,
        code: item.code,
        name: item.name,
        type: item.type,
        room: item.room.code,
        quantity: item.quantity,
        availableQuantity:
          item.status === "Hỏng"
            ? 0
            : Math.max(0, item.quantity - (borrowedByEquipment.get(item.id) ?? 0) - (maintenanceByEquipment.get(item.id) ?? 0)),
        status: item.status,
        lastChecked: item.lastChecked,
      })),
      bookings: bookings.map((booking) => {
        const own = canManage || booking.userId === user.id;
        return {
          id: booking.id,
          date: booking.date,
          time: booking.time,
          room: booking.room.code,
          course: booking.course,
          person: own ? booking.person : "Đã đăng ký",
          status: booking.status,
          userId: own ? booking.userId : null,
          attendeeCount: booking.attendeeCount,
          note: own ? booking.note : null,
          rejectionReason: own ? booking.rejectionReason : null,
          approvedById: canManage ? booking.approvedById : null,
          approvedAt: booking.approvedAt,
        };
      }),
      incidents: incidents.map((incident) => ({
        id: incident.id,
        title: incident.title,
        location: incident.room.code,
        reportedBy: incident.reportedBy,
        time: incident.time,
        severity: incident.severity,
        status: incident.status,
      })),
      users: users.map((item) => ({
        id: item.id,
        code: item.code,
        name: item.name,
        email: item.email,
        role: item.role,
        department: item.department,
        status: item.status,
        lastLogin: item.lastLogin ?? "Chưa đăng nhập",
      })),
    };
  }
}
