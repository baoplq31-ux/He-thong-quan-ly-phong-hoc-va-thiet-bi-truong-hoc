import {
  FACILITY_MANAGER_ROLES,
  requireApiUser,
} from "@/lib/api-auth";

import { notifyNewIncident } from "@/lib/notifications";
import { recordAuditSafely } from "@/lib/audit";
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

    const reportedBy = auth.user.name;

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

    const incident = await prisma.incident.create({
    data: {
      title,
      roomId: room.id,
      reportedBy,
      reportedById: auth.user.id,
      time,
      severity,
      status: "Mới báo",
    },
  });

  await recordAuditSafely({
    userId: auth.user.id,
    action: "Tạo báo cáo sự cố",
    module: "incident",
    objectId: incident.id,
    newValue: {
      title: incident.title,
      room: room.code,
      severity: incident.severity,
      status: incident.status,
    },
  });

  try {
    await notifyNewIncident(
      incident.id,
      incident.title,
      room.code,
      incident.severity,
    );
  } catch (notificationError) {
    console.error(
      "Không thể tạo thông báo sự cố:",
      notificationError,
    );
  }

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

      const current = await prisma.incident.findUnique({
        where: { id },
      });
      if (!current) {
        throw new ApiError("Không tìm thấy sự cố.", 404);
      }

      const updated = await prisma.incident.update({
        where: {
          id,
        },
        data: {
          status,
        },
      });

      await recordAuditSafely({
        userId: auth.user.id,
        action: "Cập nhật trạng thái sự cố",
        module: "incident",
        objectId: id,
        oldValue: { status: current.status },
        newValue: { status: updated.status },
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

    const current = await prisma.incident.findUnique({
      where: { id },
    });
    if (!current) {
      throw new ApiError("Không tìm thấy sự cố.", 404);
    }

    const updated = await prisma.incident.update({
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

    await recordAuditSafely({
      userId: auth.user.id,
      action: "Cập nhật sự cố",
      module: "incident",
      objectId: id,
      oldValue: {
        title: current.title,
        roomId: current.roomId,
        severity: current.severity,
      },
      newValue: {
        title: updated.title,
        roomId: updated.roomId,
        severity: updated.severity,
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

    const incident = await prisma.incident.findUnique({
      where: { id },
    });
    if (!incident) {
      throw new ApiError("Không tìm thấy sự cố.", 404);
    }

    await prisma.incident.delete({
      where: {
        id,
      },
    });

    await recordAuditSafely({
      userId: auth.user.id,
      action: "Xóa sự cố",
      module: "incident",
      objectId: id,
      oldValue: {
        title: incident.title,
        reportedBy: incident.reportedBy,
        status: incident.status,
      },
    });

    return Response.json({
      message: "Đã xóa sự cố.",
    });
  } catch (error) {
    return apiError(error);
  }
}