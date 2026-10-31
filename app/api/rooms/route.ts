import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  FACILITY_MANAGER_ROLES,
  requireApiUser,
} from "@/lib/api-auth";

import {
  ApiError,
  apiError,
  positiveId,
  readBody,
  requiredText,
} from "@/lib/api-write";

export const runtime = "nodejs";

const ROOM_STATUSES: readonly string[] = [
  "Đang trống",
  "Đang sử dụng",
  "Bảo trì",
];

type CreateRoomBody = {
  code?: unknown;
  name?: unknown;
  building?: unknown;
  floor?: unknown;
  type?: unknown;
  capacity?: unknown;
  status?: unknown;
  equipmentCount?: unknown;
};

export async function POST(request: Request) {
  try {
    const auth = await requireApiUser(FACILITY_MANAGER_ROLES);

if (!auth.ok) {
  return auth.response;
}

    const body =
      (await request.json()) as CreateRoomBody;

    const code =
      typeof body.code === "string"
        ? body.code.trim().toUpperCase()
        : "";

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const building =
      typeof body.building === "string"
        ? body.building.trim()
        : "";

    const floor =
      typeof body.floor === "string"
        ? body.floor.trim()
        : "";

    const type =
      typeof body.type === "string"
        ? body.type.trim()
        : "";

    const status =
      typeof body.status === "string"
        ? body.status.trim()
        : "";

    const capacity = Number(body.capacity);

    const equipmentCount =
      Number.isInteger(Number(body.equipmentCount)) &&
      Number(body.equipmentCount) >= 0
        ? Number(body.equipmentCount)
        : 0;

    if (
      !code ||
      !name ||
      !building ||
      !floor ||
      !type ||
      !Number.isInteger(capacity) ||
      capacity < 1
    ) {
      return NextResponse.json(
        {
          message:
            "Thông tin phòng học không hợp lệ",
        },
        {
          status: 400,
        },
      );
    }

    if (!ROOM_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          message:
            "Trạng thái phòng không hợp lệ",
        },
        {
          status: 400,
        },
      );
    }

    const existingRoom =
      await prisma.room.findUnique({
        where: {
          code,
        },
      });

    if (existingRoom) {
      return NextResponse.json(
        {
          message: `Phòng ${code} đã tồn tại`,
        },
        {
          status: 409,
        },
      );
    }

    const room = await prisma.room.create({
      data: {
        code,
        name,
        building,
        floor,
        type,
        capacity,
        status,
        equipmentCount,
      },
    });

    return NextResponse.json(
      {
        message: "Thêm phòng thành công",

        room: {
          id: room.id,
          code: room.code,
          name: room.name,
          building: room.building,
          floor: room.floor,
          type: room.type,
          capacity: room.capacity,
          status: room.status,
          equipmentCount: room.equipmentCount,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "POST /api/rooms error:",
      error,
    );

    return NextResponse.json(
      {
        message: "Không thể thêm phòng học",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PATCH(request: Request) {
  const auth = await requireApiUser(FACILITY_MANAGER_ROLES);

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = await readBody(request);

    const id = positiveId(body.id);
    const code = requiredText(body.code, "Mã phòng").toUpperCase();
    const name = requiredText(body.name, "Tên phòng");
    const building = requiredText(body.building, "Tòa nhà");
    const floor = requiredText(body.floor, "Tầng");
    const type = requiredText(body.type, "Loại phòng");
    const status = requiredText(body.status, "Trạng thái");
    const capacity = Number(body.capacity);

    if (!Number.isInteger(capacity) || capacity < 1) {
      throw new ApiError("Sức chứa phải là số nguyên lớn hơn 0.");
    }

    if (!ROOM_STATUSES.includes(status)) {
      throw new ApiError("Trạng thái phòng không hợp lệ.");
    }

    const existingRoom = await prisma.room.findUnique({
      where: { id },
    });

    if (!existingRoom) {
      throw new ApiError("Không tìm thấy phòng học.", 404);
    }

    const duplicateCode = await prisma.room.findFirst({
      where: {
        code,
        NOT: {
          id,
        },
      },
    });

    if (duplicateCode) {
      throw new ApiError("Mã phòng đã tồn tại.", 409);
    }

    const room = await prisma.room.update({
      where: { id },
      data: {
        code,
        name,
        building,
        floor,
        type,
        capacity,
        status,
      },
    });

    return NextResponse.json({
      message: "Cập nhật phòng học thành công.",
      room: {
        id: String(room.id),
        code: room.code,
        name: room.name,
        building: room.building,
        floor: room.floor,
        type: room.type,
        capacity: room.capacity,
        status: room.status,
        equipmentCount: room.equipmentCount,
      },
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request) {
  const auth = await requireApiUser(FACILITY_MANAGER_ROLES);

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = await readBody(request);
    const id = positiveId(body.id);

    const room = await prisma.room.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        _count: {
          select: {
            equipments: true,
            bookings: true,
            incidents: true,
          },
        },
      },
    });

    if (!room) {
      throw new ApiError("Không tìm thấy phòng học.", 404);
    }

    const hasRelatedData =
      room._count.equipments > 0 ||
      room._count.bookings > 0 ||
      room._count.incidents > 0;

    if (hasRelatedData) {
      throw new ApiError(
        "Không thể xóa phòng vì đang có thiết bị, lịch đặt hoặc sự cố liên quan.",
        409,
      );
    }

    await prisma.room.delete({
      where: { id },
    });

    return NextResponse.json({
      message: `Đã xóa phòng ${room.code}.`,
    });
  } catch (error) {
    return apiError(error);
  }
}