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
import { recordAuditSafely } from "@/lib/audit";

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

    const user = await prisma.systemUser.create({
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

    await recordAuditSafely({
      userId: auth.user.id,
      action: "Tạo tài khoản",
      module: "user",
      objectId: user.id,
      newValue: {
        code: user.code,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status,
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

    const code =
      body.code !== undefined
        ? requiredText(
            body.code,
            "Mã người dùng",
          ).toUpperCase()
        : undefined;

    const name =
      body.name !== undefined
        ? requiredText(body.name, "Họ tên")
        : undefined;

    const email =
      body.email !== undefined
        ? requiredText(
            body.email,
            "Email",
          ).toLowerCase()
        : undefined;

    const role =
      body.role !== undefined
        ? requiredText(body.role, "Vai trò")
        : undefined;

    const department =
      body.department !== undefined
        ? requiredText(
            body.department,
            "Đơn vị",
          )
        : undefined;

    const status =
      body.status !== undefined
        ? requiredText(
            body.status,
            "Trạng thái",
          )
        : undefined;

    if (
      email !== undefined &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      throw new ApiError(
        "Email không hợp lệ.",
      );
    }

    if (
      role !== undefined &&
      !ROLES.includes(role)
    ) {
      throw new ApiError(
        "Vai trò không hợp lệ.",
      );
    }

    if (
      status !== undefined &&
      !STATUSES.includes(status)
    ) {
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
      code?: string;
      name?: string;
      email?: string;
      role?: string;
      department?: string;
      status?: string;
    } = {};

    if (code !== undefined) {
      data.code = code;
    }

    if (name !== undefined) {
      data.name = name;
    }

    if (email !== undefined) {
      data.email = email;
    }

    if (role !== undefined) {
      data.role = role;
    }

    if (department !== undefined) {
      data.department = department;
    }

    if (status !== undefined) {
      data.status = status;
    }

    if (Object.keys(data).length === 0) {
      throw new ApiError(
        "Không có dữ liệu cần cập nhật.",
      );
    }

    const currentUser = await prisma.systemUser.findUnique({
      where: { id },
      select: {
        code: true,
        name: true,
        email: true,
        role: true,
        department: true,
        status: true,
      },
    });
    if (!currentUser) {
      throw new ApiError("Không tìm thấy người dùng.", 404);
    }

    const updatedUser = await prisma.$transaction(
      async (transaction) => {
        const updated = await transaction.systemUser.update({
          where: {
            id,
          },
          data,
        });

        if (status === "Đã khóa") {
          await transaction.session.deleteMany({
            where: {
              userId: id,
            },
          });
        }

        return updated;
      },
    );

    await recordAuditSafely({
      userId: auth.user.id,
      action: "Cập nhật tài khoản",
      module: "user",
      objectId: id,
      oldValue: currentUser,
      newValue: {
        code: updatedUser.code,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        department: updatedUser.department,
        status: updatedUser.status,
      },
    });

    return Response.json({
      message:
        "Đã cập nhật thông tin người dùng.",
    });
  } catch (error) {
    console.error(
      "PATCH /api/users:",
      error,
    );

    return apiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireApiUser(ADMIN_ROLES);

    if (!auth.ok) {
      return auth.response;
    }

    const body = await readBody(request);

    const id = positiveId(body.id);

    if (id === auth.user.id) {
      throw new ApiError(
        "Bạn không thể xóa tài khoản đang đăng nhập.",
      );
    }

    const user = await prisma.systemUser.findUnique({
      where: { id },
      select: {
        code: true,
        name: true,
        email: true,
        role: true,
        department: true,
        status: true,
      },
    });
    if (!user) {
      throw new ApiError("Không tìm thấy người dùng.", 404);
    }

    await prisma.$transaction(
      async (transaction) => {
        await transaction.session.deleteMany({
          where: {
            userId: id,
          },
        });

        await transaction.systemUser.delete({
          where: {
            id,
          },
        });
      },
    );

    await recordAuditSafely({
      userId: auth.user.id,
      action: "Xóa tài khoản",
      module: "user",
      objectId: id,
      oldValue: user,
    });

    return Response.json({
      message: "Đã xóa người dùng.",
    });
  } catch (error) {
    console.error(
      "DELETE /api/users:",
      error,
    );

    return apiError(error);
  }
}