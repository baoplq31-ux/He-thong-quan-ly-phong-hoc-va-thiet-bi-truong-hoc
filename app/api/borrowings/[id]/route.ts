import { NextResponse } from "next/server";

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

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const VALID_STATUSES = [
  "Chờ duyệt",
  "Đã duyệt",
  "Đang mượn",
  "Đã trả",
  "Từ chối",
  "Quá hạn",
] as const;

type BorrowingStatus =
  (typeof VALID_STATUSES)[number];

function positiveQuantity(value: unknown) {
  const quantity = Number(value);
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new ApiError(
      "Số lượng phải là số nguyên lớn hơn 0.",
      400,
    );
  }

  return quantity;
}

function parseDate(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new ApiError(`${label} không hợp lệ.`, 400);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(`${label} không hợp lệ.`, 400);
  }

  return date;
}

/**
 * GET /api/borrowings/:id
 *
 * Lấy chi tiết một phiếu mượn.
 */
export async function GET(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const auth = await requireApiUser();

    if (!auth.ok) {
      return auth.response;
    }

    const { id } = await context.params;

    const borrowingId = positiveId(
      Number(id),
    );

    const borrowing =
      await prisma.equipmentBorrowing.findUnique({
        where: {
          id: borrowingId,
        },

        include: {
          equipment: {
            include: {
              room: true,
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

    if (!borrowing) {
      throw new ApiError(
        "Không tìm thấy phiếu mượn.",
        404,
      );
    }

    const canManage = FACILITY_MANAGER_ROLES.includes(
      auth.user.role as (typeof FACILITY_MANAGER_ROLES)[number],
    );

    if (!canManage && borrowing.borrowerId !== auth.user.id) {
      throw new ApiError(
        "Bạn không có quyền xem phiếu mượn này.",
        403,
      );
    }

    return NextResponse.json({
      success: true,
      data: borrowing,
    });
  } catch (error) {
    return apiError(error);
  }
}

/**
 * PATCH /api/borrowings/:id
 *
 * Duyệt / từ chối / bàn giao /
 * trả / đánh dấu quá hạn.
 */
export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const auth = await requireApiUser();

    if (!auth.ok) {
      return auth.response;
    }

    const currentUser = auth.user;

    const { id } = await context.params;

    const borrowingId = positiveId(
      Number(id),
    );

    const body = await readBody(request);

    const borrowing =
      await prisma.equipmentBorrowing.findUnique({
        where: {
          id: borrowingId,
        },

        include: {
          equipment: true,
        },
      });

    if (!borrowing) {
      throw new ApiError(
        "Không tìm thấy phiếu mượn.",
        404,
      );
    }

    const canManage = FACILITY_MANAGER_ROLES.includes(
      currentUser.role as (typeof FACILITY_MANAGER_ROLES)[number],
    );

    if (body.action === "edit") {
      if (!canManage && borrowing.borrowerId !== currentUser.id) {
        throw new ApiError(
          "Bạn không có quyền chỉnh sửa phiếu mượn này.",
          403,
        );
      }

      if (borrowing.status !== "Chờ duyệt") {
        throw new ApiError(
          "Chỉ phiếu đang chờ duyệt mới có thể chỉnh sửa.",
          409,
        );
      }

      const equipmentId = positiveId(body.equipmentId);
      const quantity = positiveQuantity(body.quantity);
      const purpose = requiredText(body.purpose, "Mục đích mượn");
      const borrowDate = parseDate(body.borrowDate, "Ngày mượn");
      const expectedReturnDate = parseDate(
        body.expectedReturnDate,
        "Ngày dự kiến trả",
      );
      const note =
        typeof body.note === "string" && body.note.trim()
          ? body.note.trim()
          : null;

      if (expectedReturnDate <= borrowDate) {
        throw new ApiError(
          "Ngày dự kiến trả phải sau ngày mượn.",
          400,
        );
      }

      const updated = await prisma.$transaction(async (tx) => {
        const currentBorrowing =
          await tx.equipmentBorrowing.findUnique({
            where: { id: borrowingId },
          });

        if (!currentBorrowing) {
          throw new ApiError("Không tìm thấy phiếu mượn.", 404);
        }
        if (currentBorrowing.status !== "Chờ duyệt") {
          throw new ApiError(
            "Phiếu mượn đã được xử lý trước đó.",
            409,
          );
        }
        if (!canManage && currentBorrowing.borrowerId !== currentUser.id) {
          throw new ApiError(
            "Bạn không có quyền chỉnh sửa phiếu mượn này.",
            403,
          );
        }

        const equipment = await tx.equipment.findUnique({
          where: { id: equipmentId },
        });

        if (!equipment) {
          throw new ApiError("Không tìm thấy thiết bị.", 404);
        }
        if (equipment.status === "Hỏng") {
          throw new ApiError(
            "Thiết bị đang bị hỏng và không thể cho mượn.",
            409,
          );
        }
        if (quantity > equipment.availableQuantity) {
          throw new ApiError(
            `Không đủ thiết bị. Hiện chỉ còn ${equipment.availableQuantity} cái có thể mượn.`,
            409,
          );
        }

        return tx.equipmentBorrowing.update({
          where: { id: borrowingId },
          data: {
            equipmentId,
            quantity,
            purpose,
            borrowDate,
            expectedReturnDate,
            note,
            conditionBefore: equipment.status,
          },
          include: {
            equipment: {
              include: {
                room: true,
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

      return NextResponse.json({
        success: true,
        message: "Đã cập nhật phiếu mượn.",
        data: updated,
      });
    }

    const status = body.status;

    if (
      typeof status !== "string" ||
      !VALID_STATUSES.includes(
        status as BorrowingStatus,
      )
    ) {
      throw new ApiError(
        "Trạng thái mượn-trả không hợp lệ.",
        400,
      );
    }

    /**
     * Kiểm tra quyền quản lý.
     *
     * FACILITY_MANAGER_ROLES:
     * - Quản trị viên
     * - Cán bộ thiết bị
     */
    /**
     * Các thao tác quản lý.
     */
    if (
      [
        "Đã duyệt",
        "Từ chối",
        "Đang mượn",
        "Đã trả",
        "Quá hạn",
      ].includes(status) &&
      !canManage
    ) {
      throw new ApiError(
        "Bạn không có quyền thực hiện thao tác này.",
        403,
      );
    }

    /**
     * =========================================
     * 1. DUYỆT PHIẾU
     * =========================================
     */
    if (status === "Đã duyệt") {
      if (borrowing.status !== "Chờ duyệt") {
        throw new ApiError(
          "Chỉ phiếu đang chờ duyệt mới có thể được duyệt.",
          409,
        );
      }

      const updated =
        await prisma.$transaction(
          async (tx) => {
            const currentBorrowing =
              await tx.equipmentBorrowing.findUnique({
                where: {
                  id: borrowingId,
                },
              });

            if (!currentBorrowing) {
              throw new ApiError(
                "Không tìm thấy phiếu mượn.",
                404,
              );
            }

            if (currentBorrowing.status !== "Chờ duyệt") {
              throw new ApiError(
                "Phiếu mượn đã được xử lý trước đó.",
                409,
              );
            }

            /**
             * Đọc lại thiết bị trong transaction
             * để tránh dùng số lượng đã cũ.
             */
            const equipment =
              await tx.equipment.findUnique({
                where: {
                  id: currentBorrowing.equipmentId,
                },
              });

            if (!equipment) {
              throw new ApiError(
                "Không tìm thấy thiết bị.",
                404,
              );
            }

            if (
              equipment.status === "Hỏng"
            ) {
              throw new ApiError(
                "Thiết bị đang bị hỏng và không thể cho mượn.",
                409,
              );
            }

            if (
              equipment.availableQuantity <
              borrowing.quantity
            ) {
              throw new ApiError(
                `Không đủ thiết bị. Hiện chỉ còn ${equipment.availableQuantity} cái có thể mượn.`,
                409,
              );
            }

            /**
             * Trừ số lượng khả dụng
             * ngay khi phiếu được duyệt.
             */
            await tx.equipment.update({
              where: {
                id: equipment.id,
              },

              data: {
                availableQuantity:
                  equipment.availableQuantity -
                  borrowing.quantity,
              },
            });

            /**
             * Cập nhật phiếu mượn.
             */
            return tx.equipmentBorrowing.update({
              where: {
                id: borrowingId,
              },

              data: {
                status: "Đã duyệt",
                approvedById:
                  currentUser.id,
                approvedAt: new Date(),
                conditionBefore:
                  equipment.status,
              },

              include: {
                equipment: true,
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
              },
            });
          },
        );

      return NextResponse.json({
        success: true,
        message:
          "Đã duyệt yêu cầu mượn thiết bị.",
        data: updated,
      });
    }

    /**
     * =========================================
     * 2. TỪ CHỐI
     * =========================================
     */
    if (status === "Từ chối") {
      if (borrowing.status !== "Chờ duyệt") {
        throw new ApiError(
          "Chỉ phiếu đang chờ duyệt mới có thể từ chối.",
          409,
        );
      }

      const updated =
        await prisma.equipmentBorrowing.update({
          where: {
            id: borrowingId,
          },

          data: {
            status: "Từ chối",
            approvedById:
              currentUser.id,
            approvedAt: new Date(),
          },
        });

      return NextResponse.json({
        success: true,
        message:
          "Đã từ chối yêu cầu mượn thiết bị.",
        data: updated,
      });
    }

    /**
     * =========================================
     * 3. BÀN GIAO THIẾT BỊ
     * =========================================
     */
    if (status === "Đang mượn") {
      if (borrowing.status !== "Đã duyệt") {
        throw new ApiError(
          "Chỉ phiếu đã duyệt mới có thể chuyển sang đang mượn.",
          409,
        );
      }

      const updated =
        await prisma.equipmentBorrowing.update({
          where: {
            id: borrowingId,
          },

          data: {
            status: "Đang mượn",
          },
        });

      return NextResponse.json({
        success: true,
        message:
          "Đã xác nhận giao thiết bị.",
        data: updated,
      });
    }

    /**
     * =========================================
     * 4. TRẢ THIẾT BỊ
     * =========================================
     */
    if (status === "Đã trả") {
      if (
        borrowing.status !== "Đang mượn" &&
        borrowing.status !== "Quá hạn"
      ) {
        throw new ApiError(
          "Phiếu này chưa ở trạng thái đang mượn hoặc quá hạn.",
          409,
        );
      }

      /**
       * Người dùng có thể gửi:
       *
       * conditionAfter:
       * - Tốt
       * - Cần kiểm tra
       * - Hỏng
       *
       * returnNote:
       * ghi chú khi trả.
       */
      const conditionAfter =
        typeof body.conditionAfter ===
        "string"
          ? body.conditionAfter.trim()
          : "";

      const returnNote =
        typeof body.returnNote ===
        "string"
          ? body.returnNote.trim()
          : null;

      if (!conditionAfter) {
        throw new ApiError(
          "Vui lòng nhập tình trạng thiết bị khi trả.",
          400,
        );
      }

      const allowedConditions = [
        "Tốt",
        "Cần kiểm tra",
        "Hỏng",
      ];

      if (
        !allowedConditions.includes(
          conditionAfter,
        )
      ) {
        throw new ApiError(
          "Tình trạng thiết bị khi trả không hợp lệ.",
          400,
        );
      }

      const updated =
        await prisma.$transaction(
          async (tx) => {
            const currentBorrowing =
              await tx.equipmentBorrowing.findUnique({
                where: {
                  id: borrowingId,
                },
              });

            if (!currentBorrowing) {
              throw new ApiError(
                "Không tìm thấy phiếu mượn.",
                404,
              );
            }

            if (
              currentBorrowing.status !== "Đang mượn" &&
              currentBorrowing.status !== "Quá hạn"
            ) {
              throw new ApiError(
                "Phiếu mượn đã được trả trước đó.",
                409,
              );
            }

            const equipment =
              await tx.equipment.findUnique({
                where: {
                  id: currentBorrowing.equipmentId,
                },
              });

            if (!equipment) {
              throw new ApiError(
                "Không tìm thấy thiết bị.",
                404,
              );
            }

            /**
             * Nếu thiết bị vẫn sử dụng được:
             * cộng lại số lượng khả dụng.
             *
             * Nếu Hỏng:
             * không cộng vào availableQuantity.
             */
            const newAvailableQuantity =
              conditionAfter === "Hỏng"
                ? equipment.availableQuantity
                : Math.min(
                    equipment.quantity,
                    equipment.availableQuantity +
                      currentBorrowing.quantity,
                  );

            await tx.equipment.update({
              where: {
                id: equipment.id,
              },

              data: {
                availableQuantity:
                  newAvailableQuantity,

                /**
                 * Nếu trả về Hỏng thì cập nhật
                 * trạng thái thiết bị.
                 */
                ...(conditionAfter ===
                "Hỏng"
                  ? {
                      status: "Hỏng",
                    }
                  : conditionAfter ===
                    "Cần kiểm tra"
                  ? {
                      status:
                        "Cần kiểm tra",
                    }
                  : {
                      status: "Tốt",
                    }),
              },
            });

            return tx.equipmentBorrowing.update({
              where: {
                id: borrowingId,
              },

              data: {
                status: "Đã trả",

                actualReturnDate:
                  new Date(),

                returnedAt:
                  new Date(),

                returnedById:
                  currentUser.id,

                conditionAfter,

                returnNote,
              },

              include: {
                equipment: true,

                borrower: {
                  select: {
                    id: true,
                    code: true,
                    name: true,
                    email: true,
                    role: true,
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
          },
        );

      return NextResponse.json({
        success: true,
        message:
          "Đã xác nhận trả thiết bị.",
        data: updated,
      });
    }

    /**
     * =========================================
     * 5. ĐÁNH DẤU QUÁ HẠN
     * =========================================
     */
    if (status === "Quá hạn") {
      if (borrowing.status !== "Đang mượn") {
        throw new ApiError(
          "Chỉ phiếu đang mượn mới có thể chuyển sang quá hạn.",
          409,
        );
      }

      const updated =
        await prisma.equipmentBorrowing.update({
          where: {
            id: borrowingId,
          },

          data: {
            status: "Quá hạn",
          },
        });

      return NextResponse.json({
        success: true,
        message:
          "Đã đánh dấu phiếu quá hạn.",
        data: updated,
      });
    }

    throw new ApiError(
      "Thao tác không được hỗ trợ.",
      400,
    );
  } catch (error) {
    return apiError(error);
  }
}

/**
 * DELETE /api/borrowings/:id
 */
export async function DELETE(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const auth = await requireApiUser();

    if (!auth.ok) {
      return auth.response;
    }

    const currentUser = auth.user;

    const canManage =
      FACILITY_MANAGER_ROLES.includes(
        currentUser.role as
          (typeof FACILITY_MANAGER_ROLES)[number],
      );

    if (!canManage) {
      throw new ApiError(
        "Bạn không có quyền xóa phiếu mượn.",
        403,
      );
    }

    const { id } = await context.params;

    const borrowingId = positiveId(
      Number(id),
    );

    await prisma.$transaction(async (tx) => {
      const borrowing =
        await tx.equipmentBorrowing.findUnique({
          where: {
            id: borrowingId,
          },
        });

      if (!borrowing) {
        throw new ApiError(
          "Không tìm thấy phiếu mượn.",
          404,
        );
      }

      if (
        borrowing.status === "Đang mượn" ||
        borrowing.status === "Quá hạn"
      ) {
        throw new ApiError(
          "Không thể xóa phiếu khi thiết bị vẫn đang được mượn.",
          409,
        );
      }

      if (borrowing.status === "Đã duyệt") {
        const equipment = await tx.equipment.findUnique({
          where: {
            id: borrowing.equipmentId,
          },
        });

        if (equipment && equipment.status !== "Hỏng") {
          await tx.equipment.update({
            where: {
              id: equipment.id,
            },
            data: {
              availableQuantity: Math.min(
                equipment.quantity,
                equipment.availableQuantity + borrowing.quantity,
              ),
            },
          });
        }
      }

      await tx.equipmentBorrowing.delete({
        where: {
          id: borrowingId,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Đã xóa phiếu mượn.",
    });
  } catch (error) {
    return apiError(error);
  }
}