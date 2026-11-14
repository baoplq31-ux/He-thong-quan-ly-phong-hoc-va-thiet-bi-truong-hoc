import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/api-auth";
import { apiError, positiveId, readBody } from "@/lib/api-write";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireApiUser();

    if (!auth.ok) {
      return auth.response;
    }

    const notifications =
      await prisma.notification.findMany({
        where: {
          userId: auth.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          title: true,
          message: true,
          isRead: true,
          createdAt: true,
          referenceType: true,
          referenceId: true,
        },
      });

    const unreadCount =
      await prisma.notification.count({
        where: {
          userId: auth.user.id,
          isRead: false,
        },
      });

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error(
      "GET /api/notifications error:",
      error,
    );

    return NextResponse.json(
      {
        message: "Không thể tải thông báo",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(
  request: Request,
) {
  try {
    const auth = await requireApiUser();

    if (!auth.ok) {
      return auth.response;
    }

    const body = await request.json();

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    const type =
      typeof body.type === "string"
        ? body.type.trim()
        : "";

    const referenceId =
      typeof body.referenceId === "number"
        ? body.referenceId
        : null;

    const referenceType =
      typeof body.referenceType === "string"
        ? body.referenceType.trim()
        : null;

    if (!title || !message || !type) {
      return NextResponse.json(
        {
          message:
            "Thiếu thông tin thông báo",
        },
        {
          status: 400,
        },
      );
    }

    const notification =
      await prisma.notification.create({
        data: {
          userId: auth.user.id,
          title,
          message,
          type,
          referenceId,
          referenceType,
        },
      });

    return NextResponse.json(
      notification,
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "POST /api/notifications error:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Không thể tạo thông báo",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PATCH(
  request: Request,
) {
  try {
    const auth = await requireApiUser();

    if (!auth.ok) {
      return auth.response;
    }

    const body = await request.json();

    if (body.markAll === true) {
      await prisma.notification.updateMany({
        where: {
          userId: auth.user.id,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      return NextResponse.json({
        message:
          "Đã đánh dấu tất cả thông báo là đã đọc",
      });
    }

    const id = Number(body.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          message:
            "ID thông báo không hợp lệ",
        },
        {
          status: 400,
        },
      );
    }

    const notification =
      await prisma.notification.findFirst({
        where: {
          id,
          userId: auth.user.id,
        },
      });

    if (!notification) {
      return NextResponse.json(
        {
          message:
            "Không tìm thấy thông báo",
        },
        {
          status: 404,
        },
      );
    }

    const updated =
      await prisma.notification.update({
        where: {
          id: notification.id,
        },
        data: {
          isRead: true,
        },
      });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(
      "PATCH /api/notifications error:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Không thể cập nhật thông báo",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(request: Request) {
  const auth = await requireApiUser();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = await readBody(request);

    if (body.deleteRead === true) {
      const result = await prisma.notification.deleteMany({
        where: {
          userId: auth.user.id,
          isRead: true,
        },
      });

      return NextResponse.json({
        message: `Đã xóa ${result.count} thông báo đã đọc.`,
        deletedCount: result.count,
      });
    }

    const id = positiveId(body.id);
    const result = await prisma.notification.deleteMany({
      where: {
        id,
        userId: auth.user.id,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { message: "Không tìm thấy thông báo." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Đã xóa thông báo.",
      deletedCount: result.count,
    });
  } catch (error) {
    console.error("DELETE /api/notifications error:", error);
    return apiError(error);
  }
}
