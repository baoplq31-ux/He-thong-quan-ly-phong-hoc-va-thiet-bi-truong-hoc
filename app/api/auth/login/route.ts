import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type LoginBody = {
  loginName?: unknown;
  password?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;

    if (
      typeof body.loginName !== "string" ||
      typeof body.password !== "string"
    ) {
      return NextResponse.json(
        {
          message:
            "Tài khoản hoặc mật khẩu không hợp lệ",
        },
        {
          status: 400,
        },
      );
    }

    const loginName = body.loginName.trim();
    const password = body.password;

    if (!loginName || !password) {
      return NextResponse.json(
        {
          message:
            "Vui lòng nhập tài khoản và mật khẩu",
        },
        {
          status: 400,
        },
      );
    }

    const account =
      await prisma.systemUser.findFirst({
        where: {
          OR: [
            {
              email: loginName.toLowerCase(),
            },
            {
              code: loginName.toUpperCase(),
            },
          ],
        },
      });

    if (!account) {
      return NextResponse.json(
        {
          message:
            "Tài khoản hoặc mật khẩu không chính xác",
        },
        {
          status: 401,
        },
      );
    }

    if (account.status === "Đã khóa") {
      return NextResponse.json(
        {
          message: "Tài khoản này đã bị khóa",
        },
        {
          status: 403,
        },
      );
    }

    const validPassword = await compare(
      password,
      account.passwordHash,
    );

    if (!validPassword) {
      return NextResponse.json(
        {
          message:
            "Tài khoản hoặc mật khẩu không chính xác",
        },
        {
          status: 401,
        },
      );
    }

    const loginTime = new Intl.DateTimeFormat(
      "vi-VN",
      {
        timeZone: "Asia/Ho_Chi_Minh",
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      },
    ).format(new Date());

    const user =
      await prisma.systemUser.update({
        where: {
          id: account.id,
        },

        data: {
          lastLogin: loginTime,
        },

        select: {
          id: true,
          code: true,
          name: true,
          email: true,
          role: true,
          department: true,
          status: true,
          lastLogin: true,
        },
      });
      
      await createSession(user.id);
      

    return NextResponse.json({
      message: "Đăng nhập thành công",

      user: {
        ...user,
        lastLogin:
          user.lastLogin ?? "Chưa đăng nhập",
      },
    });
  } catch (error) {
    console.error(
      "POST /api/auth/login error:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Máy chủ không thể xử lý yêu cầu đăng nhập",
      },
      {
        status: 500,
      },
    );
  }
}