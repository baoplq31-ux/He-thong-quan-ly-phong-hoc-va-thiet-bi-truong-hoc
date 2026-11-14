import { NextResponse } from "next/server";
import {
  FACILITY_MANAGER_ROLES,
  requireApiUser,
} from "@/lib/api-auth";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireApiUser();

if (!auth.ok) {
  return auth.response;
}

    const canManage = FACILITY_MANAGER_ROLES.includes(
      auth.user.role as (typeof FACILITY_MANAGER_ROLES)[number],
    );

    const [
      roomRecords,
      equipmentRecords,
      bookingRecords,
      incidentRecords,
      userRecords,
      activeBorrowings,
      activeMaintenance,
    ] = await Promise.all([
      prisma.room.findMany({
        orderBy: {
          id: "asc",
        },
      }),

      prisma.equipment.findMany({
        include: {
          room: true,
        },
        orderBy: {
          id: "asc",
        },
      }),

      prisma.booking.findMany({
        where: canManage
          ? undefined
          : {
              OR: [
                { userId: auth.user.id },
                { status: { in: ["Đã duyệt", "Đã hoàn thành"] } },
              ],
            },
        include: {
          room: true,
        },
        orderBy: {
          id: "asc",
        },
      }),

      prisma.incident.findMany({
        where: canManage
          ? undefined
          : { reportedById: auth.user.id },
        include: {
          room: true,
        },
        orderBy: {
          id: "asc",
        },
      }),

      prisma.systemUser.findMany({
        where: canManage ? undefined : { id: -1 },
        orderBy: {
          id: "asc",
        },
      }),

      prisma.equipmentBorrowing.groupBy({
        by: ["equipmentId"],
        where: {
          status: {
            in: ["Đã duyệt", "Đang mượn", "Quá hạn"],
          },
        },
        _sum: {
          quantity: true,
        },
      }),
      prisma.maintenance.groupBy({
        by: ["equipmentId"],
        where: {
          status: "Đang xử lý",
        },
        _sum: {
          quantity: true,
        },
      }),
    ]);

    const borrowedQuantityByEquipment = new Map(
      activeBorrowings.map((borrowing) => [
        borrowing.equipmentId,
        borrowing._sum.quantity ?? 0,
      ]),
    );
    const maintenanceQuantityByEquipment = new Map(
      activeMaintenance.map((maintenance) => [
        maintenance.equipmentId,
        maintenance._sum.quantity ?? 0,
      ]),
    );
    const availabilityByEquipment = new Map<number, number>();

    await Promise.all(
      equipmentRecords.map(async (item) => {
        const availableQuantity =
          item.status === "Hỏng"
            ? 0
            : Math.max(
                0,
                item.quantity -
                  (borrowedQuantityByEquipment.get(item.id) ?? 0) -
                  (maintenanceQuantityByEquipment.get(item.id) ?? 0),
              );

        if (availableQuantity !== item.availableQuantity) {
          await prisma.equipment.updateMany({
            where: {
              id: item.id,
              availableQuantity: item.availableQuantity,
            },
            data: { availableQuantity },
          });
        }

        availabilityByEquipment.set(item.id, availableQuantity);
      }),
    );

    const rooms = roomRecords.map((room) => ({
      id: room.id,
      code: room.code,
      name: room.name,
      building: room.building,
      floor: room.floor,
      type: room.type,
      capacity: room.capacity,
      status: room.status,
      equipmentCount: room.equipmentCount,
    }));

    const equipment = equipmentRecords.map(
      (item) => ({
        id: item.id,
        code: item.code,
        name: item.name,
        type: item.type,
        room: item.room.code,
        quantity: item.quantity,
        availableQuantity:
          availabilityByEquipment.get(item.id) ?? item.availableQuantity,
        status: item.status,
        lastChecked: item.lastChecked,
      }),
    );

    const bookings = bookingRecords.map(
      (booking) => ({
        id: booking.id,
        date: booking.date,
        time: booking.time,
        room: booking.room.code,
        course: booking.course,
        person:
          canManage || booking.userId === auth.user.id
            ? booking.person
            : "Đã đăng ký",
        status: booking.status,
        userId:
          canManage || booking.userId === auth.user.id
            ? booking.userId
            : null,
        attendeeCount: booking.attendeeCount,
        note:
          canManage || booking.userId === auth.user.id
            ? booking.note
            : null,
        rejectionReason:
          canManage || booking.userId === auth.user.id
            ? booking.rejectionReason
            : null,
        approvedById: canManage ? booking.approvedById : null,
        approvedAt: booking.approvedAt,
      }),
    );

    const incidents = incidentRecords.map(
      (incident) => ({
        id: incident.id,
        title: incident.title,
        location: incident.room.code,
        reportedBy: incident.reportedBy,
        time: incident.time,
        severity: incident.severity,
        status: incident.status,
      }),
    );

    const users = userRecords.map((user) => ({
      id: user.id,
      code: user.code,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      status: user.status,
      lastLogin:
        user.lastLogin ?? "Chưa đăng nhập",
    }));

    return NextResponse.json({
      rooms,
      equipment,
      bookings,
      incidents,
      users,
    });
  } catch (error) {
    console.error("GET /api/data error:", error);

    return NextResponse.json(
      {
        message:
          "Không thể đọc dữ liệu từ database",
      },
      {
        status: 500,
      },
    );
  }
}