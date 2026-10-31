import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireApiUser();

if (!auth.ok) {
  return auth.response;
}

    const [
      roomRecords,
      equipmentRecords,
      bookingRecords,
      incidentRecords,
      userRecords,
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
        include: {
          room: true,
        },
        orderBy: {
          id: "asc",
        },
      }),

      prisma.incident.findMany({
        include: {
          room: true,
        },
        orderBy: {
          id: "asc",
        },
      }),

      prisma.systemUser.findMany({
        orderBy: {
          id: "asc",
        },
      }),
    ]);

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
        person: booking.person,
        status: booking.status,
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