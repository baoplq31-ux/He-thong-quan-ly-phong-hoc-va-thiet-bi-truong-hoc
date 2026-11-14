import { NextResponse } from "next/server";

import { FACILITY_MANAGER_ROLES, requireApiUser } from "@/lib/api-auth";
import { ApiError, apiError, positiveId, readBody, requiredText } from "@/lib/api-write";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const VALID_CONDITIONS = ["Tốt", "Cần kiểm tra", "Hỏng"];

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser(FACILITY_MANAGER_ROLES);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const { id } = await context.params;
    const maintenanceId = positiveId(Number(id));
    const body = await readBody(request);
    const repairResult = requiredText(body.repairResult, "Kết quả xử lý");
    const conditionAfter = requiredText(
      body.conditionAfter,
      "Tình trạng thiết bị sau bảo trì",
    );
    const cost =
      body.cost === undefined || body.cost === null || body.cost === ""
        ? null
        : Number(body.cost);

    if (!VALID_CONDITIONS.includes(conditionAfter)) {
      throw new ApiError("Tình trạng sau bảo trì không hợp lệ.");
    }
    if (cost !== null && (!Number.isFinite(cost) || cost < 0)) {
      throw new ApiError("Chi phí bảo trì phải lớn hơn hoặc bằng 0.");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const maintenance = await tx.maintenance.findUnique({
        where: { id: maintenanceId },
      });
      if (!maintenance) {
        throw new ApiError("Không tìm thấy phiếu bảo trì.", 404);
      }
      if (maintenance.status === "Đã hoàn thành") {
        throw new ApiError("Phiếu bảo trì đã được hoàn thành.", 409);
      }

      const equipment = await tx.equipment.findUnique({
        where: { id: maintenance.equipmentId },
      });
      if (!equipment) {
        throw new ApiError("Không tìm thấy thiết bị.", 404);
      }

      const [activeBorrowings, otherActiveMaintenance] = await Promise.all([
        tx.equipmentBorrowing.aggregate({
          where: {
            equipmentId: equipment.id,
            status: { in: ["Đã duyệt", "Đang mượn", "Quá hạn"] },
          },
          _sum: { quantity: true },
        }),
        tx.maintenance.aggregate({
          where: {
            equipmentId: equipment.id,
            status: "Đang xử lý",
            id: { not: maintenanceId },
          },
          _sum: { quantity: true },
        }),
      ]);
      const availableQuantity =
        conditionAfter === "Hỏng"
          ? 0
          : Math.max(
              0,
              equipment.quantity -
                (activeBorrowings._sum.quantity ?? 0) -
                (otherActiveMaintenance._sum.quantity ?? 0),
            );
      await tx.equipment.update({
        where: { id: equipment.id },
        data: {
          availableQuantity,
          status: conditionAfter,
        },
      });

      const record = await tx.maintenance.update({
        where: { id: maintenanceId },
        data: {
          status: "Đã hoàn thành",
          endDate: new Date(),
          repairResult,
          conditionAfter,
          cost,
        },
        include: {
          equipment: {
            select: { id: true, code: true, name: true, quantity: true },
          },
          createdBy: {
            select: { id: true, code: true, name: true },
          },
        },
      });
      await tx.auditLog.create({
        data: {
          userId: auth.user.id,
          action: "Hoàn thành phiếu bảo trì",
          module: "maintenance",
          objectId: String(maintenanceId),
          oldValue: JSON.stringify({ status: maintenance.status }),
          newValue: JSON.stringify({
            status: record.status,
            conditionAfter,
            availableQuantity,
          }),
        },
      });
      return record;
    });

    return NextResponse.json({
      message: "Đã cập nhật kết quả bảo trì.",
      data: updated,
    });
  } catch (error) {
    return apiError(error);
  }
}
