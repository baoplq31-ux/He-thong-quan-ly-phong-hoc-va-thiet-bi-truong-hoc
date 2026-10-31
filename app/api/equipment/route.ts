import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { FACILITY_MANAGER_ROLES, requireApiUser } from "@/lib/api-auth";
import {
  ApiError,
  apiError,
  positiveId,
  readBody,
  requiredText,
} from "@/lib/api-write";

export const runtime = "nodejs";

const EQUIPMENT_STATUSES: readonly string[] = [
  "Tốt",
  "Cần kiểm tra",
  "Hỏng",
];

type CreateEquipmentBody = {
  code?: unknown;
  name?: unknown;
  type?: unknown;
  room?: unknown;
  quantity?: unknown;
  status?: unknown;
  lastChecked?: unknown;
};

export async function POST(request: Request) {
  try {

    const auth = await requireApiUser(FACILITY_MANAGER_ROLES);

if (!auth.ok) {
  return auth.response;
}
    const body =
      (await request.json()) as CreateEquipmentBody;

    const code =
      typeof body.code === "string"
        ? body.code.trim().toUpperCase()
        : "";

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const type =
      typeof body.type === "string"
        ? body.type.trim()
        : "";

    const roomCode =
      typeof body.room === "string"
        ? body.room.trim().toUpperCase()
        : "";

    const status =
      typeof body.status === "string"
        ? body.status.trim()
        : "";

    const lastChecked =
      typeof body.lastChecked === "string"
        ? body.lastChecked.trim()
        : "";

    const quantity = Number(body.quantity);

    if (
      !code ||
      !name ||
      !type ||
      !roomCode ||
      !lastChecked ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return NextResponse.json(
        {
          message:
            "Thông tin thiết bị không hợp lệ",
        },
        {
          status: 400,
        },
      );
    }

    if (!EQUIPMENT_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          message:
            "Trạng thái thiết bị không hợp lệ",
        },
        {
          status: 400,
        },
      );
    }

    const room = await prisma.room.findUnique({
      where: {
        code: roomCode,
      },
    });

    if (!room) {
      return NextResponse.json(
        {
          message: `Không tìm thấy phòng ${roomCode}`,
        },
        {
          status: 404,
        },
      );
    }

    const existingEquipment =
      await prisma.equipment.findUnique({
        where: {
          code,
        },
      });

    if (existingEquipment) {
      return NextResponse.json(
        {
          message: `Thiết bị ${code} đã tồn tại`,
        },
        {
          status: 409,
        },
      );
    }

    const equipment =
      await prisma.$transaction(
        async (transaction) => {
          const createdEquipment =
            await transaction.equipment.create({
              data: {
                code,
                name,
                type,
                roomId: room.id,
                quantity,
                status,
                lastChecked,
              },

              include: {
                room: true,
              },
            });

          await transaction.room.update({
            where: {
              id: room.id,
            },

            data: {
              equipmentCount: {
                increment: quantity,
              },
            },
          });

          return createdEquipment;
        },
      );

    return NextResponse.json(
      {
        message: "Thêm thiết bị thành công",

        equipment: {
          id: equipment.id,
          code: equipment.code,
          name: equipment.name,
          type: equipment.type,
          room: equipment.room.code,
          quantity: equipment.quantity,
          status: equipment.status,
          lastChecked: equipment.lastChecked,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "POST /api/equipment error:",
      error,
    );

    return NextResponse.json(
      {
        message: "Không thể thêm thiết bị",
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
    const code = requiredText(body.code, "Mã thiết bị").toUpperCase();
    const name = requiredText(body.name, "Tên thiết bị");
    const type = requiredText(body.type, "Loại thiết bị");
    const roomCode = requiredText(body.room, "Phòng").toUpperCase();
    const status = requiredText(body.status, "Trạng thái");
    const lastChecked = requiredText(
      body.lastChecked,
      "Ngày kiểm tra",
    );
    const quantity = Number(body.quantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new ApiError("Số lượng phải là số nguyên lớn hơn 0.");
    }

    if (!EQUIPMENT_STATUSES.includes(status)) {
      throw new ApiError("Trạng thái thiết bị không hợp lệ.");
    }

    const currentEquipment = await prisma.equipment.findUnique({
      where: { id },
    });

    if (!currentEquipment) {
      throw new ApiError("Không tìm thấy thiết bị.", 404);
    }

    const targetRoom = await prisma.room.findUnique({
      where: {
        code: roomCode,
      },
    });

    if (!targetRoom) {
      throw new ApiError("Không tìm thấy phòng được chọn.", 404);
    }

    const duplicateCode = await prisma.equipment.findFirst({
      where: {
        code,
        NOT: {
          id,
        },
      },
    });

    if (duplicateCode) {
      throw new ApiError("Mã thiết bị đã tồn tại.", 409);
    }

    const equipment = await prisma.$transaction(async (tx) => {
      const updatedEquipment = await tx.equipment.update({
        where: { id },
        data: {
          code,
          name,
          type,
          roomId: targetRoom.id,
          quantity,
          status,
          lastChecked,
        },
        include: {
          room: true,
        },
      });

      if (currentEquipment.roomId !== targetRoom.id) {
        const oldRoomEquipmentCount = await tx.equipment.count({
          where: {
            roomId: currentEquipment.roomId,
          },
        });

        await tx.room.update({
          where: {
            id: currentEquipment.roomId,
          },
          data: {
            equipmentCount: oldRoomEquipmentCount,
          },
        });

        const newRoomEquipmentCount = await tx.equipment.count({
          where: {
            roomId: targetRoom.id,
          },
        });

        await tx.room.update({
          where: {
            id: targetRoom.id,
          },
          data: {
            equipmentCount: newRoomEquipmentCount,
          },
        });
      }

      return updatedEquipment;
    });

    return NextResponse.json({
      message: "Cập nhật thiết bị thành công.",
      equipment: {
        id: String(equipment.id),
        code: equipment.code,
        name: equipment.name,
        type: equipment.type,
        room: equipment.room.code,
        quantity: equipment.quantity,
        status: equipment.status,
        lastChecked: equipment.lastChecked,
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

    const equipment = await prisma.equipment.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        roomId: true,
      },
    });

    if (!equipment) {
      throw new ApiError("Không tìm thấy thiết bị.", 404);
    }

    await prisma.$transaction(async (tx) => {
      await tx.equipment.delete({
        where: { id },
      });

      const remainingEquipmentCount = await tx.equipment.count({
        where: {
          roomId: equipment.roomId,
        },
      });

      await tx.room.update({
        where: {
          id: equipment.roomId,
        },
        data: {
          equipmentCount: remainingEquipmentCount,
        },
      });
    });

    return NextResponse.json({
      message: `Đã xóa thiết bị ${equipment.code}.`,
    });
  } catch (error) {
    return apiError(error);
  }
}