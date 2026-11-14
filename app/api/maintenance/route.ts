import { NextResponse } from "next/server";

import { FACILITY_MANAGER_ROLES, requireApiUser } from "@/lib/api-auth";
import { ApiError, apiError, positiveId, readBody, requiredText } from "@/lib/api-write";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseDate(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new ApiError(`${label} không hợp lệ.`);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(`${label} không hợp lệ.`);
  }
  return date;
}

function parseQuantity(value: unknown) {
  const quantity = Number(value);
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new ApiError("Số lượng bảo trì phải là số nguyên lớn hơn 0.");
  }
  return quantity;
}

export async function GET() {
  const auth = await requireApiUser(FACILITY_MANAGER_ROLES);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const data = await prisma.maintenance.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        equipment: {
          select: { id: true, code: true, name: true, quantity: true },
        },
        createdBy: {
          select: { id: true, code: true, name: true },
        },
      },
    });
    return NextResponse.json({ data });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  const auth = await requireApiUser(FACILITY_MANAGER_ROLES);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = await readBody(request);
    const equipmentId = positiveId(body.equipmentId);
    const quantity = parseQuantity(body.quantity);
    const type = requiredText(body.type, "Loại bảo trì");
    const issueDescription = requiredText(
      body.issueDescription,
      "Mô tả lỗi",
    );
    const content = requiredText(body.content, "Nội dung bảo trì");
    const startDate = parseDate(body.startDate, "Ngày bắt đầu");
    const assignedTo =
      typeof body.assignedTo === "string" && body.assignedTo.trim()
        ? body.assignedTo.trim()
        : null;

    const maintenance = await prisma.$transaction(async (tx) => {
      const equipment = await tx.equipment.findUnique({
        where: { id: equipmentId },
      });
      if (!equipment) {
        throw new ApiError("Không tìm thấy thiết bị.", 404);
      }
      const [activeBorrowings, activeMaintenance] = await Promise.all([
        tx.equipmentBorrowing.aggregate({
          where: {
            equipmentId,
            status: { in: ["Đã duyệt", "Đang mượn", "Quá hạn"] },
          },
          _sum: { quantity: true },
        }),
        tx.maintenance.aggregate({
          where: {
            equipmentId,
            status: "Đang xử lý",
          },
          _sum: { quantity: true },
        }),
      ]);
      const reservedQuantity =
        (activeBorrowings._sum.quantity ?? 0) +
        (activeMaintenance._sum.quantity ?? 0);
      const maintainableQuantity = Math.max(
        0,
        equipment.quantity - reservedQuantity,
      );
      if (quantity > maintainableQuantity) {
        throw new ApiError(
          `Chỉ còn ${maintainableQuantity} thiết bị có thể đưa vào bảo trì.`,
          409,
        );
      }

      const updatedEquipment = await tx.equipment.update({
        where: { id: equipmentId },
        data: {
          availableQuantity:
            equipment.status === "Hỏng"
              ? 0
              : Math.max(0, maintainableQuantity - quantity),
          status: "Cần kiểm tra",
        },
      });

      const record = await tx.maintenance.create({
        data: {
          equipmentId,
          createdById: auth.user.id,
          quantity,
          type,
          issueDescription,
          startDate,
          content,
          assignedTo,
          status: "Đang xử lý",
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
          action: "Tạo phiếu bảo trì",
          module: "maintenance",
          objectId: String(record.id),
          oldValue: JSON.stringify({
            availableQuantity: equipment.availableQuantity,
            status: equipment.status,
          }),
          newValue: JSON.stringify({
            availableQuantity: updatedEquipment.availableQuantity,
            status: updatedEquipment.status,
            maintenanceId: record.id,
          }),
        },
      });
      return record;
    });

    return NextResponse.json(
      { message: "Đã tạo phiếu bảo trì.", data: maintenance },
      { status: 201 },
    );
  } catch (error) {
    return apiError(error);
  }
}
