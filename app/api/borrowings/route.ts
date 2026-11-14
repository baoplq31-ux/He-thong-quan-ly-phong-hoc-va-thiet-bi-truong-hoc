import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import {
  FACILITY_MANAGER_ROLES,
  requireApiUser,
} from "@/lib/api-auth";
import { notifyNewBorrowing } from "@/lib/notifications";

import {
  ApiError,
  apiError,
  positiveId,
  readBody,
  requiredText,
} from "@/lib/api-write";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function isValidDate(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim()) {
    return false;
  }

  const date = new Date(value);

  return !Number.isNaN(date.getTime());
}

function positiveQuantity(value: unknown): number {
  const quantity = Number(value);

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new ApiError(
      "Số lượng phải là số nguyên lớn hơn 0.",
      400,
    );
  }

  return quantity;
}

/**
 * GET /api/borrowings
 *
 * Lấy danh sách phiếu mượn thiết bị.
 */
export async function GET() {
  try {
    const auth = await requireApiUser();

    if (!auth.ok) {
      return auth.response;
    }

    const canManage = FACILITY_MANAGER_ROLES.includes(
      auth.user.role as (typeof FACILITY_MANAGER_ROLES)[number],
    );

    const borrowings =
      await prisma.equipmentBorrowing.findMany({
        where: canManage
          ? undefined
          : { borrowerId: auth.user.id },
        orderBy: {
          createdAt: "desc",
        },

        include: {
          equipment: {
            select: {
              id: true,
              code: true,
              name: true,
              type: true,
              quantity: true,
              availableQuantity: true,
              status: true,

              room: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                },
              },
            },
          },

          borrower: {
            select: {
              id: true,
              code: true,
              name: true,
              email: true,
              role: true,
            },
          },

          approvedBy: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },

          returnedBy: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
      });

    const now = new Date();
    const data = borrowings.map((borrowing) => ({
      ...borrowing,
      status:
        borrowing.status === "Đang mượn" &&
        borrowing.expectedReturnDate < now
          ? "Quá hạn"
          : borrowing.status,
    }));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return apiError(error);
  }
}

/**
 * POST /api/borrowings
 *
 * Tạo phiếu đăng ký mượn thiết bị.
 *
 * Phiếu mới:
 * - Trạng thái: Chờ duyệt
 * - Chưa trừ availableQuantity
 * - Chỉ trừ availableQuantity khi được duyệt
 */
export async function POST(request: Request) {
  try {
    const auth = await requireApiUser();

    if (!auth.ok) {
      return auth.response;
    }

    const currentUser = auth.user;

    const body = await readBody(request);

    const equipmentId = positiveId(body.equipmentId);

    const quantity = positiveQuantity(
      body.quantity,
    );

    const purpose = requiredText(
      body.purpose,
      "Mục đích mượn thiết bị",
    );

    const note =
      typeof body.note === "string" &&
      body.note.trim()
        ? body.note.trim()
        : null;

    const borrowDate = body.borrowDate;

    const expectedReturnDate =
      body.expectedReturnDate;

    if (!isValidDate(borrowDate)) {
      throw new ApiError(
        "Ngày mượn không hợp lệ.",
        400,
      );
    }

    if (!isValidDate(expectedReturnDate)) {
      throw new ApiError(
        "Ngày dự kiến trả không hợp lệ.",
        400,
      );
    }

    const borrowDateValue =
      new Date(borrowDate);

    const expectedReturnDateValue =
      new Date(expectedReturnDate);

    if (
      expectedReturnDateValue <=
      borrowDateValue
    ) {
      throw new ApiError(
        "Ngày dự kiến trả phải sau ngày mượn.",
        400,
      );
    }

    const equipment =
      await prisma.equipment.findUnique({
        where: {
          id: equipmentId,
        },

        select: {
          id: true,
          code: true,
          name: true,
          type: true,
          quantity: true,
          availableQuantity: true,
          status: true,

          room: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
      });

    if (!equipment) {
      throw new ApiError(
        "Không tìm thấy thiết bị.",
        404,
      );
    }

    if (equipment.status === "Hỏng") {
      throw new ApiError(
        "Thiết bị đang ở trạng thái Hỏng và không thể cho mượn.",
        409,
      );
    }

    if (
      quantity >
      equipment.availableQuantity
    ) {
      throw new ApiError(
        `Không đủ thiết bị để mượn. Hiện còn ${equipment.availableQuantity} thiết bị có thể sử dụng.`,
        409,
      );
    }

    const borrowing = await prisma.$transaction(async (tx) => {
      const created = await tx.equipmentBorrowing.create({
        data: {
          code: `TMP-${randomUUID()}`,
          equipmentId: equipment.id,
          borrowerId: currentUser.id,
          quantity,
          purpose,
          borrowDate: borrowDateValue,
          expectedReturnDate: expectedReturnDateValue,
          note,
          conditionBefore: equipment.status,
          status: "Chờ duyệt",
        },
      });

      return tx.equipmentBorrowing.update({
        where: { id: created.id },
        data: {
          code: `MTB-${String(created.id).padStart(4, "0")}`,
        },
        include: {
          equipment: {
            select: {
              id: true,
              code: true,
              name: true,
              type: true,
              quantity: true,
              availableQuantity: true,
              status: true,
              room: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                },
              },
            },
          },
          borrower: {
            select: {
              id: true,
              code: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });
    });

    try {
      await notifyNewBorrowing(
        borrowing.id,
        borrowing.code,
        equipment.code,
        equipment.name,
        borrowing.borrower.name,
        borrowing.quantity,
      );
    } catch (notificationError) {
      console.error(
        "Không thể tạo thông báo phiếu mượn thiết bị:",
        notificationError,
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Tạo phiếu mượn thiết bị thành công.",
        data: borrowing,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    return apiError(error);
  }
}