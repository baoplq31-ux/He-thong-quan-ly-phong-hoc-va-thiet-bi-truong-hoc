import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { ADMIN_ROLES, requireApiUser } from "@/lib/api-auth";
import { ApiError, apiError, positiveId, readBody, requiredText } from "@/lib/api-write";
import { createSession } from "@/lib/auth";
import { recordAuditSafely } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireApiUser(ADMIN_ROLES);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = await readBody(request);
    const targetUserId = positiveId(body.userId);
    const newPassword = requiredText(body.newPassword, "Mật khẩu mới");
    const confirmPassword = requiredText(
      body.confirmPassword,
      "Xác nhận mật khẩu mới",
    );

    if (newPassword.length < 8 || newPassword.length > 128) {
      throw new ApiError("Mật khẩu mới phải dài từ 8 đến 128 ký tự.");
    }
    if (newPassword !== confirmPassword) {
      throw new ApiError("Xác nhận mật khẩu mới không khớp.");
    }

    const targetUser = await prisma.systemUser.findUnique({
      where: { id: targetUserId },
      select: { id: true, code: true, name: true },
    });
    if (!targetUser) {
      throw new ApiError("Không tìm thấy tài khoản cần đặt lại mật khẩu.", 404);
    }

    const passwordHash = await hash(newPassword, 12);
    await prisma.$transaction([
      prisma.systemUser.update({
        where: { id: targetUserId },
        data: { passwordHash },
      }),
      prisma.session.deleteMany({
        where: { userId: targetUserId },
      }),
    ]);

    if (targetUserId === auth.user.id) {
      await createSession(targetUserId);
    }

    await recordAuditSafely({
      userId: auth.user.id,
      action: "Quản trị đặt lại mật khẩu",
      module: "auth",
      objectId: targetUserId,
      newValue: {
        targetUserCode: targetUser.code,
        targetUserName: targetUser.name,
      },
    });

    return NextResponse.json({
      message: `Đã đặt lại mật khẩu cho tài khoản ${targetUser.code}.`,
    });
  } catch (error) {
    return apiError(error);
  }
}
