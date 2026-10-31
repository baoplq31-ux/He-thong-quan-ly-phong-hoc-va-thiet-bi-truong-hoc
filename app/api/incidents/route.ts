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

const SEVERITIES: readonly string[] = [
  "Thấp",
  "Trung bình",
  "Khẩn cấp",
];

const STATUSES: readonly string[] = [
  "Mới báo",
  "Đang xử lý",
  "Đã xử lý",
];

export async function POST(request: Request) {
  try {
    const auth = await requireApiUser();

    if (!auth.ok) {
      return auth.response;
    }

    const body = await readBody(request);

    const title = requiredText(
      body.title,
      "Nội dung sự cố",
    );

    const roomCode = requiredText(
      body.location,
      "Phòng xảy ra sự cố",
    ).toUpperCase();

    const reportedBy = requiredText(
      body.reportedBy,
      "Người báo sự cố",
    );

    const severity = requiredText(
      body.severity,
      "Mức độ",
    );

    if (!SEVERITIES.includes(severity)) {
      throw new ApiError(
        "Mức độ sự cố không hợp lệ.",
      );
    }

    const room = await prisma.room.findUnique({
      where: {
        code: roomCode,
      },
    });

    if (!room) {
      throw new ApiError(
        `Không tìm thấy phòng ${roomCode}.`,
        404,
      );
    }

    const time = new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Asia/Ho_Chi_Minh",
    }).format(new Date());

    await prisma.incident.create({
      data: {
        title,
        roomId: room.id,
        reportedBy,
        time,
        severity,
        status: "Mới báo",
      },
    });

    return Response.json(
      {
        message: "Đã ghi nhận sự cố.",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    return apiError(error);
  }
}

/*
|--------------------------------------------------------------------------
| PATCH
|--------------------------------------------------------------------------
| Có 2 trường hợp:
|
| 1. Chỉ gửi:
|    { id, status }
|
|    => cập nhật trạng thái
|
| 2. Gửi:
|    {
|      id,
|      title,
|      location,
|      reportedBy,
|      severity
|    }
|
|    => sửa thông tin sự cố
|--------------------------------------------------------------------------
*/

export async function PATCH(request: Request) {
  try {
    const auth = await requireApiUser(
      FACILITY_MANAGER_ROLES,
    );

    if (!auth.ok) {
      return auth.response;
    }

    const body = await readBody(request);

    const id = positiveId(body.id);

    /*
     * ============================
     * Cập nhật trạng thái
     * ============================
     */

    const hasOnlyStatus =
      "status" in body &&
      !("title" in body) &&
      !("location" in body) &&
      !("reportedBy" in body) &&
      !("severity" in body);

    if (hasOnlyStatus) {
      const status = requiredText(
        body.status,
        "Trạng thái",
      );

      if (!STATUSES.includes(status)) {
        throw new ApiError(
          "Trạng thái sự cố không hợp lệ.",
        );
      }

      await prisma.incident.update({
        where: {
          id,
        },
        data: {
          status,
        },
      });

      return Response.json({
        message:
          "Đã cập nhật trạng thái sự cố.",
      });
    }

    /*
     * ============================
     * Sửa thông tin sự cố
     * ============================
     */

    const title = requiredText(
      body.title,
      "Nội dung sự cố",
    );

    const roomCode = requiredText(
      body.location,
      "Phòng xảy ra sự cố",
    ).toUpperCase();

    const reportedBy = requiredText(
      body.reportedBy,
      "Người báo sự cố",
    );

    const severity = requiredText(
      body.severity,
      "Mức độ",
    );

    if (!SEVERITIES.includes(severity)) {
      throw new ApiError(
        "Mức độ sự cố không hợp lệ.",
      );
    }

    const room = await prisma.room.findUnique({
      where: {
        code: roomCode,
      },
    });

    if (!room) {
      throw new ApiError(
        `Không tìm thấy phòng ${roomCode}.`,
        404,
      );
    }

    await prisma.incident.update({
      where: {
        id,
      },
      data: {
        title,
        roomId: room.id,
        reportedBy,
        severity,
      },
    });

    return Response.json({
      message: "Đã cập nhật thông tin sự cố.",
    });
  } catch (error) {
    return apiError(error);
  }
}

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

export async function DELETE(request: Request) {
  try {
    const auth = await requireApiUser(
      FACILITY_MANAGER_ROLES,
    );

    if (!auth.ok) {
      return auth.response;
    }

    const body = await readBody(request);

    const id = positiveId(body.id);

    await prisma.incident.delete({
      where: {
        id,
      },
    });

    return Response.json({
      message: "Đã xóa sự cố.",
    });
  } catch (error) {
    return apiError(error);
  }
}