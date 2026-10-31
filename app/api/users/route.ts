import { hash } from "bcryptjs";

import {
  ADMIN_ROLES,
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

const ROLES: readonly string[] = [
  "Quản trị viên",
  "Cán bộ thiết bị",
  "Giảng viên",
  "Sinh viên",
];

const STATUSES: readonly string[] = [
  "Hoạt động",
  "Đã khóa",
];

export async function POST(request: Request) {
  try {
    const auth = await requireApiUser(ADMIN_ROLES);

    if (!auth.ok) {
      return auth.response;
    }

    const body = await readBody(request);

    const code = requiredText(
      body.code,
      "Mã người dùng",
    ).toUpperCase();

    const name = requiredText(body.name, "Họ tên");

    const email = requiredText(
      body.email,
      "Email",
    ).toLowerCase();

    const role = requiredText(body.role, "Vai trò");

    const department = requiredText(
      body.department,
      "Đơn vị",
    );

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ApiError("Email không hợp lệ.");
    }

    if (!ROLES.includes(role)) {
      throw new ApiError("Vai trò không hợp lệ.");
    }

    const passwordHash = await hash("123456", 10);

    await prisma.systemUser.create({
      data: {
        code,
        name,
        email,
        passwordHash,
        role,
        department,
        status: "Hoạt động",
      },
    });

    return Response.json(
      { message: "Đã thêm người dùng." },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/users:", error);
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireApiUser(ADMIN_ROLES);

    if (!auth.ok) {
      return auth.response;
    }

    const body = await readBody(request);

    const id = positiveId(body.id);

    const role =
      body.role !== undefined
        ? requiredText(body.role, "Vai trò")
        : undefined;

    const status =
      body.status !== undefined
        ? requiredText(body.status, "Trạng thái")
        : undefined;

    if (role !== undefined && !ROLES.includes(role)) {
      throw new ApiError("Vai trò không hợp lệ.");
    }

    if (status !== undefined && !STATUSES.includes(status)) {
      throw new ApiError(
        "Trạng thái tài khoản không hợp lệ.",
      );
    }

    if (
      id === auth.user.id &&
      status === "Đã khóa"
    ) {
      throw new ApiError(
        "Bạn không thể khóa tài khoản đang đăng nhập.",
      );
    }

    const data: {
      role?: string;
      status?: string;
    } = {};

    if (role !== undefined) {
      data.role = role;
    }

    if (status !== undefined) {
      data.status = status;
    }

    if (Object.keys(data).length === 0) {
      throw new ApiError(
        "Không có dữ liệu cần cập nhật.",
      );
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.systemUser.update({
        where: { id },
        data,
      });

      if (status === "Đã khóa") {
        await transaction.session.deleteMany({
          where: { userId: id },
        });
      }
    });

    return Response.json({
      message: "Đã cập nhật thông tin tài khoản.",
    });
  } catch (error) {
    console.error("PATCH /api/users:", error);
    return apiError(error);
  }
}
